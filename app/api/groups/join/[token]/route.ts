import { query, queryOne, execute } from '@/lib/db'
import { NextRequest } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { randomBytes } from 'crypto'

// GET - Get group info by join token
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ token: string }> }
) {
  try {
    const { token } = await params

    let group
    try {
      group = await queryOne<any>(
        `SELECT g.*, u.name as creatorName, u.email as creatorEmail,
         (SELECT COUNT(*) FROM GroupMember WHERE groupId = g.id) as memberCount
         FROM BookingGroup g
         INNER JOIN User u ON g.createdBy = u.id
         WHERE g.joinToken = ? AND g.status = 'ACTIVE'`,
        [token]
      )
    } catch (err: any) {
      // If joinToken column doesn't exist, return helpful error
      if (err.message?.includes('joinToken') || err.message?.includes('Unknown column')) {
        return Response.json({ 
          error: 'Join links are not available. Please run the database migration first.',
          details: 'The joinToken column needs to be added to the BookingGroup table.'
        }, { status: 503 })
      }
      throw err
    }

    if (!group) {
      return Response.json({ error: 'Invalid or expired join link' }, { status: 404 })
    }

    const members = await query<any>(
      `SELECT m.*, u.name as userName, u.email as userEmail
       FROM GroupMember m
       INNER JOIN User u ON m.userId = u.id
       WHERE m.groupId = ?
       ORDER BY m.joinedAt ASC`,
      [group.id]
    )

    return Response.json({ group, members: members || [] })
  } catch (error: any) {
    console.error('Failed to fetch group by token:', error)
    return Response.json({ error: 'Failed to fetch group', details: error.message }, { status: 500 })
  }
}

// POST - Join group via token
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ token: string }> }
) {
  try {
    const session = await getServerSession()
    if (!session || !session.user) {
      return Response.json({ error: 'Unauthorized. Please log in to join.' }, { status: 401 })
    }

    let userId = (session.user as any)?.id
    if (!userId && session.user?.email) {
      const dbUser = await queryOne<any>('SELECT id FROM User WHERE email = ?', [session.user.email])
      if (dbUser) userId = dbUser.id
    }

    if (!userId) {
      return Response.json({ error: 'User ID not found' }, { status: 401 })
    }

    const { token } = await params

    // Try to find group by joinToken
    let group
    try {
      group = await queryOne<any>(
        'SELECT * FROM BookingGroup WHERE joinToken = ? AND status = ?',
        [token, 'ACTIVE']
      )
    } catch (err: any) {
      // If joinToken column doesn't exist, return error
      if (err.message?.includes('joinToken') || err.message?.includes('Unknown column')) {
        return Response.json({ 
          error: 'Join links are not available. Please run the database migration first.',
          details: 'The joinToken column needs to be added to the BookingGroup table.'
        }, { status: 503 })
      }
      throw err
    }

    if (!group) {
      return Response.json({ error: 'Invalid or expired join link' }, { status: 404 })
    }

    // Check if already a member
    const existingMember = await queryOne<any>(
      'SELECT * FROM GroupMember WHERE groupId = ? AND userId = ?',
      [group.id, userId]
    )

    if (existingMember) {
      return Response.json({ 
        group, 
        message: 'You are already a member of this group',
        alreadyMember: true 
      })
    }

    // Add user as member
    const memberId = randomBytes(16).toString('hex')
    await execute(
      'INSERT INTO GroupMember (id, groupId, userId) VALUES (?, ?, ?)',
      [memberId, group.id, userId]
    )

    return Response.json({ 
      group, 
      message: 'Successfully joined the group!',
      success: true 
    })
  } catch (error: any) {
    console.error('Failed to join group:', error)
    return Response.json({ error: 'Failed to join group', details: error.message }, { status: 500 })
  }
}


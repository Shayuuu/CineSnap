import { queryOne, execute } from '@/lib/db'
import { NextRequest } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { randomBytes } from 'crypto'

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ groupId: string }> }
) {
  try {
    const { groupId } = await params
    const session = await getServerSession()
    
    if (!session || !session.user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 })
    }

    let userId = (session.user as any)?.id
    if (!userId && session.user?.email) {
      const dbUser = await queryOne<any>('SELECT id FROM User WHERE email = ?', [session.user.email])
      if (dbUser) userId = dbUser.id
    }

    if (!userId) {
      return Response.json({ error: 'User ID not found' }, { status: 401 })
    }

    // Check if group exists
    const group = await queryOne<any>('SELECT * FROM BookingGroup WHERE id = ?', [groupId])
    if (!group) {
      return Response.json({ error: 'Group not found' }, { status: 404 })
    }

    // Check if already a member
    const existing = await queryOne<any>(
      'SELECT id FROM GroupMember WHERE groupId = ? AND userId = ?',
      [groupId, userId]
    )

    if (existing) {
      return Response.json({ message: 'Already a member' })
    }

    // Add member
    const memberId = randomBytes(16).toString('hex')
    await execute(
      'INSERT INTO GroupMember (id, groupId, userId) VALUES (?, ?, ?)',
      [memberId, groupId, userId]
    )

    return Response.json({ success: true, message: 'Joined group successfully' })
  } catch (error: any) {
    console.error('Failed to join group:', error)
    return Response.json({ error: 'Failed to join group', details: error.message }, { status: 500 })
  }
}



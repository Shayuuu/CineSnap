import { query, queryOne, execute } from '@/lib/db'
import { NextRequest } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { randomBytes } from 'crypto'

// GET - Fetch messages
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ groupId: string }> }
) {
  try {
    const { groupId } = await params

    const messages = await query<any>(
      `SELECT m.*, u.name as userName, u.email as userEmail
       FROM GroupMessage m
       INNER JOIN User u ON m.userId = u.id
       WHERE m.groupId = ?
       ORDER BY m.createdAt ASC
       LIMIT 100`,
      [groupId]
    )

    return Response.json({ messages })
  } catch (error: any) {
    console.error('Failed to fetch messages:', error)
    return Response.json({ error: 'Failed to fetch messages', details: error.message }, { status: 500 })
  }
}

// POST - Send a message
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

    // Verify user is a member
    const member = await queryOne<any>(
      'SELECT id FROM GroupMember WHERE groupId = ? AND userId = ?',
      [groupId, userId]
    )

    if (!member) {
      return Response.json({ error: 'Not a member of this group' }, { status: 403 })
    }

    const { message } = await req.json()
    if (!message || !message.trim()) {
      return Response.json({ error: 'Message is required' }, { status: 400 })
    }

    const messageId = randomBytes(16).toString('hex')
    await execute(
      'INSERT INTO GroupMessage (id, groupId, userId, message) VALUES (?, ?, ?, ?)',
      [messageId, groupId, userId, message.trim()]
    )

    const newMessage = await queryOne<any>(
      `SELECT m.*, u.name as userName, u.email as userEmail
       FROM GroupMessage m
       INNER JOIN User u ON m.userId = u.id
       WHERE m.id = ?`,
      [messageId]
    )

    return Response.json({ message: newMessage })
  } catch (error: any) {
    console.error('Failed to send message:', error)
    return Response.json({ error: 'Failed to send message', details: error.message }, { status: 500 })
  }
}



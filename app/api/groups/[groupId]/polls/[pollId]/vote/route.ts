import { queryOne, execute } from '@/lib/db'
import { NextRequest } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import { randomBytes } from 'crypto'

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ groupId: string; pollId: string }> }
) {
  try {
    const { groupId, pollId } = await params
    const session = await getServerSession(authOptions)
    
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

    const { optionId } = await req.json()
    if (!optionId) {
      return Response.json({ error: 'optionId is required' }, { status: 400 })
    }

    // Check if already voted
    const existing = await queryOne<any>(
      'SELECT id FROM PollVote WHERE pollId = ? AND userId = ?',
      [pollId, userId]
    )

    if (existing) {
      // Update vote
      await execute(
        'UPDATE PollVote SET optionId = ? WHERE id = ?',
        [optionId, existing.id]
      )
    } else {
      // Create new vote
      const voteId = randomBytes(16).toString('hex')
      await execute(
        'INSERT INTO PollVote (id, pollId, userId, optionId) VALUES (?, ?, ?, ?)',
        [voteId, pollId, userId, optionId]
      )
    }

    return Response.json({ success: true, message: 'Vote recorded' })
  } catch (error: any) {
    console.error('Failed to vote:', error)
    return Response.json({ error: 'Failed to vote', details: error.message }, { status: 500 })
  }
}



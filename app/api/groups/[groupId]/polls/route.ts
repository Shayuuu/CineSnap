import { query, queryOne, execute } from '@/lib/db'
import { NextRequest } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { randomBytes } from 'crypto'

// GET - Fetch polls
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ groupId: string }> }
) {
  try {
    const { groupId } = await params

    const polls = await query<any>(
      `SELECT p.*, u.name as creatorName
       FROM GroupPoll p
       INNER JOIN User u ON p.createdBy = u.id
       WHERE p.groupId = ?
       ORDER BY p.createdAt DESC`,
      [groupId]
    )

    // Get vote counts for each poll
    const pollsWithVotes = await Promise.all(
      polls.map(async (poll: any) => {
        const votes = await query<any>(
          'SELECT optionId, COUNT(*) as count FROM PollVote WHERE pollId = ? GROUP BY optionId',
          [poll.id]
        )

        const options = JSON.parse(poll.options || '[]')
        const voteMap = votes.reduce((acc: any, v: any) => {
          acc[v.optionId] = parseInt(v.count)
          return acc
        }, {})

        return {
          ...poll,
          options: options.map((opt: any) => ({
            ...opt,
            votes: voteMap[opt.id] || 0,
          })),
        }
      })
    )

    return Response.json({ polls: pollsWithVotes })
  } catch (error: any) {
    console.error('Failed to fetch polls:', error)
    return Response.json({ error: 'Failed to fetch polls', details: error.message }, { status: 500 })
  }
}

// POST - Create a poll
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

    const { question, options } = await req.json()
    if (!question || !options || !Array.isArray(options) || options.length < 2) {
      return Response.json({ error: 'Question and at least 2 options are required' }, { status: 400 })
    }

    const pollId = randomBytes(16).toString('hex')
    const optionsWithIds = options.map((opt: string, idx: number) => ({
      id: `opt_${idx}`,
      text: opt,
    }))

    await execute(
      'INSERT INTO GroupPoll (id, groupId, question, options, createdBy) VALUES (?, ?, ?, ?, ?)',
      [pollId, groupId, question, JSON.stringify(optionsWithIds), userId]
    )

    const poll = await queryOne<any>(
      `SELECT p.*, u.name as creatorName
       FROM GroupPoll p
       INNER JOIN User u ON p.createdBy = u.id
       WHERE p.id = ?`,
      [pollId]
    )

    return Response.json({ poll: { ...poll, options: optionsWithIds.map((opt: any) => ({ ...opt, votes: 0 })) } })
  } catch (error: any) {
    console.error('Failed to create poll:', error)
    return Response.json({ error: 'Failed to create poll', details: error.message }, { status: 500 })
  }
}


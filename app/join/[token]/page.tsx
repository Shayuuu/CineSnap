import { queryOne } from '@/lib/db'
import { notFound, redirect } from 'next/navigation'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import JoinGroupClient from '@/components/JoinGroupClient'

type Props = { params: Promise<{ token: string }> }

export default async function JoinGroupPage({ params }: Props) {
  try {
    const { token } = await params
    const session = await getServerSession(authOptions)

    // Fetch group info by token
    const group = await queryOne<any>(
      `SELECT g.*, u.name as creatorName, u.email as creatorEmail,
       s.startTime, s.price,
       m.title as movieTitle, m.posterUrl,
       sc.name as screenName,
       t.name as theaterName, t.location as theaterLocation,
       (SELECT COUNT(*) FROM GroupMember WHERE groupId = g.id) as memberCount
       FROM BookingGroup g
       INNER JOIN User u ON g.createdBy = u.id
       INNER JOIN Showtime s ON g.showtimeId = s.id
       INNER JOIN Movie m ON s.movieId = m.id
       INNER JOIN Screen sc ON s.screenId = sc.id
       INNER JOIN Theater t ON sc.theaterId = t.id
       WHERE g.joinToken = ? AND g.status = 'ACTIVE'`,
      [token]
    )

    if (!group) {
      return notFound()
    }

  // Check if user is already a member
  let isMember = false
  if (session?.user?.email) {
    const dbUser = await queryOne<any>('SELECT id FROM User WHERE email = ?', [session.user.email])
    if (dbUser) {
      const member = await queryOne<any>(
        'SELECT * FROM GroupMember WHERE groupId = ? AND userId = ?',
        [group.id, dbUser.id]
      )
      isMember = !!member
    }
  }

    return (
      <JoinGroupClient
        group={group}
        token={token}
        isAuthenticated={!!session}
        isMember={isMember}
        userEmail={session?.user?.email || null}
      />
    )
  } catch (error: any) {
    console.error('Error loading join page:', error)
    return notFound()
  }
}


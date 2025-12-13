import { query, queryOne } from '@/lib/db'
import { notFound } from 'next/navigation'
import { formatDateTime } from '@/lib/dateUtils'
import GroupBookingClient from '@/components/GroupBookingClient'

type Props = { params: Promise<{ id: string }> }

export default async function GroupBookingPage({ params }: Props) {
  const { id } = await params
  const showtime = await queryOne<any>(
    'SELECT * FROM Showtime WHERE id = ?',
    [id]
  )

  if (!showtime) return notFound()

  const movie = await queryOne<any>(
    'SELECT * FROM Movie WHERE id = ?',
    [showtime.movieId]
  )

  return (
    <GroupBookingClient
      showtimeId={showtime.id}
      movieTitle={movie.title}
      showtime={formatDateTime(showtime.startTime)}
    />
  )
}


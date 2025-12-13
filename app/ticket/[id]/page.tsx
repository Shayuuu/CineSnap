import { queryOne, query } from '@/lib/db'
import { notFound } from 'next/navigation'
import TicketClient from '@/components/TicketClient'

type Props = { params: Promise<{ id: string }> }

export default async function TicketPage({ params }: Props) {
  const { id } = await params
  const booking = await queryOne<any>(
    'SELECT * FROM Booking WHERE id = ?',
    [id]
  )

  if (!booking) return notFound()

  const showtime = await queryOne<any>(
    'SELECT * FROM Showtime WHERE id = ?',
    [booking.showtimeId]
  )

  const movie = await queryOne<any>(
    'SELECT * FROM Movie WHERE id = ?',
    [showtime.movieId]
  )

  const screen = await queryOne<any>(
    'SELECT * FROM Screen WHERE id = ?',
    [showtime.screenId]
  )

  const theater = await queryOne<any>(
    'SELECT * FROM Theater WHERE id = ?',
    [screen.theaterId]
  )

  // Get booked seats
  const bookingSeats = await query<any>(
    `SELECT s.* FROM Seat s
     INNER JOIN \`_BookingSeats\` bs ON s.id = bs.B
     WHERE bs.A = ?`,
    [id]
  )

  const seats = bookingSeats.map((s: any) => `${s.row}${s.number}`)

  return (
    <TicketClient
      bookingId={id}
      movieTitle={movie.title}
      theaterName={theater.name}
      screenName={screen.name}
      showtime={showtime.startTime}
      seats={seats}
      total={booking.totalAmount}
      status={booking.status}
      posterUrl={movie.posterUrl}
    />
  )
}


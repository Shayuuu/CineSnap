import { query, queryOne } from '@/lib/db'
import { notFound } from 'next/navigation'
import { formatDateTime } from '@/lib/dateUtils'
import BookingClient from './BookingClient'

type Props = { params: Promise<{ id: string }> }

export default async function BookingPage({ params }: Props) {
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

  if (!movie) return notFound()

  const screen = await queryOne<any>(
    'SELECT * FROM Screen WHERE id = ?',
    [showtime.screenId]
  )

  if (!screen) return notFound()

  const theater = await queryOne<any>(
    'SELECT * FROM Theater WHERE id = ?',
    [screen.theaterId]
  )

  if (!theater) return notFound()

  const seats = await query<any>(
    'SELECT * FROM Seat WHERE screenId = ? ORDER BY `row`, `number`',
    [screen.id]
  ) || []

  // Fetch temporarily locked seats (from Redis/SeatLock)
  const lockedSeats = await query<any>(
    'SELECT seatId FROM SeatLock WHERE showtimeId = ? AND expiresAt > NOW()',
    [id]
  ) || []

  // Fetch permanently booked seats (from confirmed bookings)
  const bookedSeats = await query<any>(
    `SELECT s.id as seatId 
     FROM Seat s
     INNER JOIN _BookingSeats bs ON s.id = bs.B
     INNER JOIN Booking b ON bs.A = b.id
     WHERE b.showtimeId = ? AND b.status = 'CONFIRMED'`,
    [id]
  ) || []

  const locked = (lockedSeats || []).map((l: any) => l?.seatId).filter(Boolean)
  const booked = (bookedSeats || []).map((b: any) => b?.seatId).filter(Boolean)

  return (
    <BookingClient
      seats={seats}
      lockedSeats={locked}
      bookedSeats={booked}
      showtimeId={showtime.id}
      movieTitle={movie.title}
      theaterName={theater.name}
      screenName={screen.name}
      showtime={formatDateTime(showtime.startTime)}
      pricePerSeat={showtime.price / 100}
    />
  )
}

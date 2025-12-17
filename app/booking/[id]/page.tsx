import { notFound } from 'next/navigation'
import { formatDateTime } from '@/lib/dateUtils'
import BookingClient from './BookingClient'
import { queryOne, query } from '@/lib/db'
import { getTmdbApiKey } from '@/lib/config'

type Props = { params: Promise<{ id: string }> }

export default async function BookingPage({ params }: Props) {
  const { id } = await params
  
  // Get showtime from database
  const showtime = await queryOne<any>(
    `SELECT s.*, sc.name as "screenName", t.name as "theaterName", t.location as "theaterLocation"
     FROM "Showtime" s
     INNER JOIN "Screen" sc ON s."screenId" = sc.id
     INNER JOIN "Theater" t ON sc."theaterId" = t.id
     WHERE s.id = $1`,
    [id]
  )
  
  if (!showtime) return notFound()

  // Fetch movie from TMDb API
  let movie: any = null
  try {
    const apiKey = getTmdbApiKey()
    if (apiKey) {
      const movieRes = await fetch(
        `https://api.themoviedb.org/3/movie/${showtime.movieId}?api_key=${apiKey}&language=en-IN`,
        { cache: 'no-store' }
      )
      if (movieRes.ok) {
        const m = await movieRes.json()
        movie = {
          id: String(m.id),
          title: m.title,
        }
      }
    }
  } catch (err) {
    console.error('Failed to fetch movie:', err)
  }

  if (!movie) return notFound()

  // Get seats, locked seats, and booked seats in parallel for faster loading
  const [seatsResult, lockedSeatsResult, bookedSeatsResult] = await Promise.all([
    query<any>(
      `SELECT id, "row", "number", type
       FROM "Seat"
       WHERE "screenId" = $1
       ORDER BY "row", "number"`,
      [showtime.screenId]
    ),
    query<any>(
      `SELECT "seatId"
       FROM "SeatLock"
       WHERE "showtimeId" = $1 AND "expiresAt" > NOW()`,
      [id]
    ),
    query<any>(
      `SELECT bs."B" as "seatId"
       FROM "_BookingSeats" bs
       INNER JOIN "Booking" b ON bs."A" = b.id
       WHERE b."showtimeId" = $1 AND b.status = 'CONFIRMED'`,
      [id]
    )
  ])
  
  const seats = seatsResult
  const locked = lockedSeatsResult.map((s: any) => s.seatId)
  const booked = bookedSeatsResult.map((s: any) => s.seatId)

  return (
    <BookingClient
      seats={seats}
      lockedSeats={locked}
      bookedSeats={booked}
      showtimeId={showtime.id}
      movieTitle={movie.title}
      theaterName={showtime.theaterName}
      screenName={showtime.screenName}
      showtime={formatDateTime(showtime.startTime)}
      pricePerSeat={showtime.price / 100}
    />
  )
}

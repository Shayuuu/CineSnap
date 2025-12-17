import { notFound } from 'next/navigation'
import TicketClient from '@/components/TicketClient'
import { getTmdbApiKey } from '@/lib/config'
import { queryOne, query } from '@/lib/db'

type Props = { params: Promise<{ id: string }> }

export default async function TicketPage({ params }: Props) {
  const { id } = await params
  
  // Get booking from database (PostgreSQL syntax)
  const booking = await queryOne<any>(
    'SELECT * FROM "Booking" WHERE id = $1',
    [id]
  )
  
  if (!booking) {
    return notFound()
  }

  // Get showtime with theater and screen info (PostgreSQL syntax)
  const showtime = await queryOne<any>(
    `SELECT s.*, sc.name as "screenName", t.name as "theaterName", t.location as "theaterLocation"
     FROM "Showtime" s
     INNER JOIN "Screen" sc ON s."screenId" = sc.id
     INNER JOIN "Theater" t ON sc."theaterId" = t.id
     WHERE s.id = $1`,
    [booking.showtimeId]
  )
  
  if (!showtime) {
    return notFound()
  }

  // Fetch movie from TMDb API (with caching)
  let movie: any = null
  try {
    const apiKey = getTmdbApiKey()
    if (apiKey) {
      const movieRes = await fetch(
        `https://api.themoviedb.org/3/movie/${showtime.movieId}?api_key=${apiKey}&language=en-IN`,
        { 
          next: { revalidate: 3600 }, // Cache for 1 hour
          headers: {
            'Accept': 'application/json',
          }
        }
      )
      if (movieRes.ok) {
        const m = await movieRes.json()
        movie = {
          id: String(m.id),
          title: m.title,
          posterUrl: m.poster_path ? `https://image.tmdb.org/t/p/w500${m.poster_path}` : null,
        }
      } else {
        console.error(`[TicketPage] TMDb API error: ${movieRes.status} ${movieRes.statusText}`)
      }
    }
  } catch (err: any) {
    console.error('[TicketPage] Failed to fetch movie:', err.message || err)
  }

  if (!movie) {
    return notFound()
  }

  // Get booked seats (PostgreSQL syntax)
  const bookingSeats = await query<any>(
    `SELECT s."row", s."number"
     FROM "Seat" s
     INNER JOIN "_BookingSeats" bs ON s.id = bs."B"
     WHERE bs."A" = $1
     ORDER BY s."row", s."number"`,
    [id]
  )
  
  const seats = bookingSeats.map((s: any) => `${s.row}${s.number}`)

  return (
    <TicketClient
      bookingId={id}
      movieTitle={movie.title}
      theaterName={showtime.theaterName}
      screenName={showtime.screenName}
      showtime={showtime.startTime}
      seats={seats}
      total={booking.totalAmount || 0}
      status={booking.status || 'CONFIRMED'}
      posterUrl={movie.posterUrl || undefined}
    />
  )
}

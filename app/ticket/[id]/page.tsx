import { notFound } from 'next/navigation'
import TicketClient from '@/components/TicketClient'
import { MOCK_BOOKINGS, MOCK_BOOKING_SEATS, MOCK_SHOWTIMES, MOCK_THEATERS, getTheaterByScreenId } from '@/lib/mockData'
import { getTmdbApiKey } from '@/lib/config'

type Props = { params: Promise<{ id: string }> }

export default async function TicketPage({ params }: Props) {
  const { id } = await params
  
  // Get booking from mock data
  const booking = MOCK_BOOKINGS.find(b => b.id === id)
  
  if (!booking) {
    console.error('[TicketPage] Booking not found:', id)
    return notFound()
  }

  // Get showtime from mock data
  const showtime = MOCK_SHOWTIMES.find(st => st.id === booking.showtimeId)
  if (!showtime) {
    console.error('[TicketPage] Showtime not found:', booking.showtimeId)
    return notFound()
  }

  // Get theater and screen info
  const theaterData = getTheaterByScreenId(showtime.screenId)
  if (!theaterData) {
    console.error('[TicketPage] Theater not found for screen:', showtime.screenId)
    return notFound()
  }

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
          posterUrl: m.poster_path ? `https://image.tmdb.org/t/p/w500${m.poster_path}` : null,
        }
      }
    }
  } catch (err) {
    console.error('[TicketPage] Failed to fetch movie:', err)
  }

  if (!movie) {
    console.error('[TicketPage] Movie not found:', showtime.movieId)
    return notFound()
  }

  // Get booked seats from mock data
  const seatIds = MOCK_BOOKING_SEATS[id] || []
  const seats: string[] = []
  
  // Parse seat IDs to get row and number (format: screen-1-A-5)
  for (const seatId of seatIds) {
    const parts = seatId.split('-')
    if (parts.length >= 4) {
      const row = parts[parts.length - 2]
      const number = parts[parts.length - 1]
      seats.push(`${row}${number}`)
    }
  }

  return (
    <TicketClient
      bookingId={id}
      movieTitle={movie.title}
      theaterName={theaterData.theater.name}
      screenName={theaterData.screen.name}
      showtime={showtime.startTime}
      seats={seats}
      total={booking.totalAmount || 0}
      status={booking.status || 'CONFIRMED'}
      posterUrl={movie.posterUrl || undefined}
    />
  )
}


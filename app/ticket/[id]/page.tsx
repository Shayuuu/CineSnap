import { notFound } from 'next/navigation'
import TicketClient from '@/components/TicketClient'
import { MOCK_BOOKINGS, MOCK_BOOKING_SEATS, MOCK_SHOWTIMES, MOCK_THEATERS, getTheaterByScreenId } from '@/lib/mockData'
import { getTmdbApiKey } from '@/lib/config'
import { queryOne, query } from '@/lib/db'

type Props = { params: Promise<{ id: string }> }

// Helper function to generate showtime from ID (same as in mockDb)
function generateShowtimeFromId(showtimeId: string) {
  // Format: showtime-{movieId}-{screenIndex}-{slotIndex}
  const parts = showtimeId.split('-')
  if (parts.length < 4 || parts[0] !== 'showtime') return null
  
  const movieId = parts[1]
  const screenIndex = parseInt(parts[2])
  const slotIndex = parseInt(parts[3])
  
  const slots = ['10:00', '13:00', '16:00', '19:00', '22:00']
  const allScreens: Array<{ id: string; name: string; theaterId: string }> = []
  MOCK_THEATERS.forEach(theater => {
    theater.screens.forEach(screen => {
      allScreens.push({
        id: screen.id,
        name: screen.name,
        theaterId: theater.id,
      })
    })
  })
  
  if (screenIndex >= allScreens.length || slotIndex >= slots.length) {
    return null
  }
  
  const screen = allScreens[screenIndex]
  const slot = slots[slotIndex]
  const [hours, minutes] = slot.split(':').map(Number)
  const startTimeDate = new Date()
  startTimeDate.setHours(hours, minutes, 0, 0)
  if (startTimeDate < new Date()) {
    startTimeDate.setDate(startTimeDate.getDate() + 1)
  }
  
  const theaterData = getTheaterByScreenId(screen.id)
  
  return {
    id: showtimeId,
    movieId,
    screenId: screen.id,
    startTime: startTimeDate.toISOString(),
    price: 45000 + Math.floor(Math.random() * 15000),
    screenName: screen.name,
    theaterId: theaterData?.theater.id || MOCK_THEATERS[0].id,
    theaterName: theaterData?.theater.name || MOCK_THEATERS[0].name,
    theaterLocation: theaterData?.theater.location || MOCK_THEATERS[0].location,
  }
}

export default async function TicketPage({ params }: Props) {
  const { id } = await params
  
  console.log('[TicketPage] Looking for booking:', id)
  
  // Get booking from database (works with both real and mock)
  const booking = await queryOne<any>(
    'SELECT * FROM Booking WHERE id = ?',
    [id]
  )
  
  console.log('[TicketPage] Booking query result:', booking ? 'found' : 'not found', 'ID:', id)
  
  if (!booking) {
    console.error('[TicketPage] Booking not found:', id)
    // In showcase mode, return a demo ticket with the booking ID
    const { IS_SHOWCASE_MODE } = await import('@/lib/mockDb')
    if (IS_SHOWCASE_MODE) {
      console.log('[TicketPage] Showcase mode: Creating demo ticket for booking:', id)
      // Create a demo booking for showcase
      const demoBooking = {
        id,
        showtimeId: 'showtime-550-0-0', // Default showtime
        userId: 'demo-user',
        status: 'CONFIRMED',
        totalAmount: 50000,
        createdAt: new Date().toISOString(),
      }
      
      const demoShowtime = generateShowtimeFromId(demoBooking.showtimeId) || {
        id: demoBooking.showtimeId,
        movieId: '550',
        screenId: 'screen-1',
        startTime: new Date(Date.now() + 2 * 60 * 60 * 1000).toISOString(),
        price: 50000,
      }
      
      const demoTheaterData = getTheaterByScreenId(demoShowtime.screenId) || {
        theater: { id: 'theater-1', name: 'PVR Cinemas', location: 'Mumbai' },
        screen: { id: 'screen-1', name: 'Screen 1', seats: [] },
      }
      
      // Fetch movie
      let movie: any = null
      try {
        const apiKey = getTmdbApiKey()
        if (apiKey) {
          const movieRes = await fetch(
            `https://api.themoviedb.org/3/movie/${demoShowtime.movieId}?api_key=${apiKey}&language=en-IN`,
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
      
      if (movie) {
        return renderTicket(id, demoBooking, demoShowtime, demoTheaterData, movie, ['A5', 'A6'])
      }
    }
    
    return notFound()
  }

  // Get showtime - try database query first (works with mock too)
  let showtime = await queryOne<any>(
    'SELECT * FROM Showtime WHERE id = ?',
    [booking.showtimeId]
  )
  
  // If not found, try to generate from ID format
  if (!showtime && booking.showtimeId && booking.showtimeId.startsWith('showtime-')) {
    showtime = generateShowtimeFromId(booking.showtimeId)
  }
  
  if (!showtime) {
    console.error('[TicketPage] Showtime not found:', booking.showtimeId)
    return notFound()
  }

  // Get theater and screen info
  let theaterData = getTheaterByScreenId(showtime.screenId)
  
  // If theater data not found, use data from showtime if available
  if (!theaterData && (showtime as any).theaterName) {
    theaterData = {
      theater: {
        id: (showtime as any).theaterId || 'theater-1',
        name: (showtime as any).theaterName || 'PVR Cinemas',
        location: (showtime as any).theaterLocation || 'Mumbai',
      },
      screen: {
        id: showtime.screenId,
        name: (showtime as any).screenName || 'Screen 1',
        seats: [],
      },
    }
  }
  
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

  // Get booked seats - try database query first, then fallback to mock data
  let seats: string[] = []
  
  try {
    // Try to get seats from database (works with mock too)
    const bookingSeats = await query<any>(
      `SELECT s.* FROM Seat s
       INNER JOIN _BookingSeats bs ON s.id = bs.B
       WHERE bs.A = ?`,
      [id]
    )
    
    if (bookingSeats && Array.isArray(bookingSeats) && bookingSeats.length > 0) {
      seats = bookingSeats.map((s: any) => `${s.row}${s.number}`)
    }
  } catch (err) {
    console.error('[TicketPage] Failed to query seats, trying mock data:', err)
  }
  
  // Fallback to mock data if database query failed
  if (seats.length === 0) {
    const seatIds = MOCK_BOOKING_SEATS[id] || []
    
    // Parse seat IDs to get row and number (format: screen-1-A-5)
    for (const seatId of seatIds) {
      const parts = seatId.split('-')
      if (parts.length >= 4) {
        const row = parts[parts.length - 2]
        const number = parts[parts.length - 1]
        seats.push(`${row}${number}`)
      }
    }
  }

  return renderTicket(id, booking, showtime, theaterData, movie, seats)
}

function renderTicket(
  id: string,
  booking: any,
  showtime: any,
  theaterData: any,
  movie?: any,
  seats?: string[]
) {
  // Fetch movie if not provided
  if (!movie && showtime.movieId) {
    // This will be handled by the caller
    return null
  }
  
  if (!movie) {
    return notFound()
  }
  
  // Get seats if not provided
  if (!seats) {
    seats = []
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


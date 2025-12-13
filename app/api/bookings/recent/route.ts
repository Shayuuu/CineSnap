import { query } from '@/lib/db'
import { NextRequest } from 'next/server'

// GET - Get recent bookings from Mumbai
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const limit = parseInt(searchParams.get('limit') || '10')
    const location = searchParams.get('location') || 'Mumbai'

    // Fetch recent confirmed bookings from Mumbai
    const bookings = await query<any>(
      `SELECT 
        b.id,
        b.createdAt,
        m.title as movieTitle,
        t.location as theaterLocation,
        st.startTime,
        COUNT(bs.B) as seatCount
      FROM Booking b
      INNER JOIN Showtime st ON b.showtimeId = st.id
      INNER JOIN Movie m ON st.movieId = m.id
      INNER JOIN Screen sc ON st.screenId = sc.id
      INNER JOIN Theater t ON sc.theaterId = t.id
      INNER JOIN _BookingSeats bs ON b.id = bs.A
      WHERE b.status = 'CONFIRMED'
        AND t.location LIKE ?
      GROUP BY b.id, b.createdAt, m.title, t.location, st.startTime
      ORDER BY b.createdAt DESC
      LIMIT ?`,
      [`%${location}%`, limit]
    )

    // Format the bookings
    const formatted = bookings.map((booking: any) => {
      const createdAt = new Date(booking.createdAt)
      const now = new Date()
      const secondsAgo = Math.floor((now.getTime() - createdAt.getTime()) / 1000)
      
      let timeAgo = ''
      if (secondsAgo < 60) {
        timeAgo = `${secondsAgo} second${secondsAgo !== 1 ? 's' : ''} ago`
      } else if (secondsAgo < 3600) {
        const minutes = Math.floor(secondsAgo / 60)
        timeAgo = `${minutes} minute${minutes !== 1 ? 's' : ''} ago`
      } else {
        const hours = Math.floor(secondsAgo / 3600)
        timeAgo = `${hours} hour${hours !== 1 ? 's' : ''} ago`
      }

      const showtime = new Date(booking.startTime)
      const timeStr = showtime.toLocaleTimeString('en-US', { 
        hour: 'numeric', 
        minute: '2-digit',
        hour12: true 
      })

      return {
        id: booking.id,
        location: location,
        seats: booking.seatCount,
        movie: booking.movieTitle,
        time: timeStr,
        ago: timeAgo,
        createdAt: booking.createdAt,
      }
    })

    return Response.json({ bookings: formatted })
  } catch (error: any) {
    console.error('Failed to fetch recent bookings:', error)
    return Response.json({ bookings: [] }, { status: 200 })
  }
}


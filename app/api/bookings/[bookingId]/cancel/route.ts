import { query, queryOne, execute, getConnection } from '@/lib/db'
import { NextRequest } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { sendEmail, getCancellationEmail } from '@/lib/email'

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ bookingId: string }> }
) {
  const { bookingId } = await params
  const session = await getServerSession(authOptions)
  
  if (!session?.user?.email) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const { reason } = await req.json()
    
    // Get user ID (PostgreSQL syntax)
    const user = await queryOne<any>(
      'SELECT id FROM "User" WHERE LOWER(email) = $1',
      [session.user.email.toLowerCase()]
    )
    
    if (!user) {
      return Response.json({ error: 'User not found' }, { status: 404 })
    }

    // Get booking details (PostgreSQL syntax)
    // Try to get movie title from Movie table, fallback to fetching from TMDb if needed
    let booking = await queryOne<any>(
      `SELECT b.*, s."startTime", s."movieId", m.title as "movieTitle" 
       FROM "Booking" b
       INNER JOIN "Showtime" s ON b."showtimeId" = s.id
       LEFT JOIN "Movie" m ON s."movieId" = m.id
       WHERE b.id = $1 AND b."userId" = $2`,
      [bookingId, user.id]
    )

    if (!booking) {
      return Response.json({ error: 'Booking not found' }, { status: 404 })
    }

    // If movie title not in database, fetch from TMDb API
    if (!booking.movieTitle && booking.movieId) {
      try {
        const { getTmdbApiKey } = await import('@/lib/config')
        const apiKey = getTmdbApiKey()
        if (apiKey) {
          const movieRes = await fetch(
            `https://api.themoviedb.org/3/movie/${booking.movieId}?api_key=${apiKey}&language=en-IN`,
            { next: { revalidate: 3600 } }
          )
          if (movieRes.ok) {
            const movieData = await movieRes.json()
            booking.movieTitle = movieData.title || 'Movie'
          }
        }
      } catch (err) {
        console.warn('Failed to fetch movie title from TMDb:', err)
        booking.movieTitle = booking.movieTitle || 'Movie'
      }
    }

    // Check if booking is already cancelled
    if (booking.status === 'CANCELLED') {
      return Response.json({ error: 'Booking already cancelled' }, { status: 400 })
    }

    // Allow cancellation of both PENDING and CONFIRMED bookings
    if (booking.status !== 'CONFIRMED' && booking.status !== 'PENDING') {
      return Response.json({ error: 'Only confirmed or pending bookings can be cancelled' }, { status: 400 })
    }

    // Check if showtime has passed (allow cancellation up to 2 hours before showtime)
    const showtime = new Date(booking.startTime)
    const now = new Date()
    const hoursUntilShowtime = (showtime.getTime() - now.getTime()) / (1000 * 60 * 60)
    
    if (hoursUntilShowtime < 2) {
      return Response.json({ 
        error: 'Cancellation not allowed less than 2 hours before showtime' 
      }, { status: 400 })
    }

    // Calculate refund amount (full refund if cancelled more than 24 hours before, 80% if less)
    let refundAmount = booking.totalAmount
    if (hoursUntilShowtime < 24) {
      refundAmount = Math.floor(booking.totalAmount * 0.8) // 80% refund
    }

    const connection = await getConnection()
    
    try {
      await connection.query('BEGIN')

      // Update booking status (PostgreSQL syntax)
      // Try with updatedAt first (it exists in schema)
      try {
        await connection.query(
          `UPDATE "Booking" 
           SET status = 'CANCELLED', "updatedAt" = NOW()
           WHERE id = $1`,
          [bookingId]
        )
      } catch (err: any) {
        // Fallback if updatedAt column doesn't exist
        if (err.message?.includes('updatedAt') || err.message?.includes('updated_at') || err.message?.includes('column')) {
          await connection.query(
            `UPDATE "Booking" 
             SET status = 'CANCELLED'
             WHERE id = $1`,
            [bookingId]
          )
        } else {
          throw err
        }
      }

      // Get seat IDs before deleting (for Redis unlock)
      const seatIdsResult = await connection.query(
        `SELECT "B" as "seatId" FROM "_BookingSeats" WHERE "A" = $1`,
        [bookingId]
      )
      // Handle both result.rows (pg library) and direct array
      const seatIds = Array.isArray(seatIdsResult) 
        ? seatIdsResult.map((row: any) => row.seatId || row.B)
        : (seatIdsResult.rows || []).map((row: any) => row.seatId || row.B)

      // Release seats by removing them from the booking seats junction table
      await connection.query(
        `DELETE FROM "_BookingSeats" WHERE "A" = $1`,
        [bookingId]
      )

      await connection.query('COMMIT')

      // Release Redis locks for these seats (async, don't wait)
      if (seatIds.length > 0) {
        try {
          const { redis } = await import('@/lib/redis')
          const key = `lock:${booking.showtimeId}`
          const pipeline = redis.pipeline()
          seatIds.forEach((seatId: string) => pipeline.hdel(key, seatId))
          await pipeline.exec().catch(() => {
            // Silently fail if Redis is unavailable
          })
        } catch (err) {
          // Silently fail if Redis is unavailable
          console.warn('Failed to release Redis locks:', err)
        }
      }

      // Get user email
      const userEmail = session.user.email

      // Send cancellation email (async, don't wait)
      sendEmail({
        to: userEmail,
        ...getCancellationEmail({
          userName: userEmail?.split('@')[0] || 'User',
          movieTitle: booking.movieTitle,
          refundAmount,
          walletBalance: 0, // Wallet feature not implemented yet
        }),
      }).catch(err => console.error('Failed to send cancellation email:', err))

      return Response.json({
        success: true,
        message: 'Booking cancelled successfully',
        refundAmount,
        refundStatus: 'PROCESSED'
      })

    } catch (error) {
      await connection.query('ROLLBACK')
      throw error
    } finally {
      connection.release()
    }

  } catch (error: any) {
    console.error('Cancellation error:', error)
    console.error('Error details:', {
      message: error.message,
      stack: error.stack,
      bookingId,
      userId: session?.user?.email,
    })
    return Response.json(
      { 
        error: error.message || 'Failed to cancel booking',
        details: process.env.NODE_ENV === 'development' ? error.stack : undefined
      },
      { status: 500 }
    )
  }
}

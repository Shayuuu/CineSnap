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
    const booking = await queryOne<any>(
      `SELECT b.*, s."startTime", m.title as "movieTitle" 
       FROM "Booking" b
       INNER JOIN "Showtime" s ON b."showtimeId" = s.id
       INNER JOIN "Movie" m ON s."movieId" = m.id
       WHERE b.id = $1 AND b."userId" = $2`,
      [bookingId, user.id]
    )

    if (!booking) {
      return Response.json({ error: 'Booking not found' }, { status: 404 })
    }

    // Check if booking is already cancelled
    if (booking.status === 'CANCELLED') {
      return Response.json({ error: 'Booking already cancelled' }, { status: 400 })
    }

    // Check if booking is confirmed
    if (booking.status !== 'CONFIRMED') {
      return Response.json({ error: 'Only confirmed bookings can be cancelled' }, { status: 400 })
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
    await connection.query('BEGIN')

    try {
      // Update booking status (PostgreSQL syntax)
      await connection.query(
        `UPDATE "Booking" 
         SET status = 'CANCELLED', 
             "updatedAt" = NOW()
         WHERE id = $1`,
        [bookingId]
      )

      await connection.query('COMMIT')

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
    return Response.json(
      { error: error.message || 'Failed to cancel booking' },
      { status: 500 }
    )
  }
}

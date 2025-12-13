import { query, queryOne, execute, getPool } from '@/lib/db'
import { NextRequest } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { randomBytes } from 'crypto'
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
    
    // Get user ID
    const user = await queryOne<any>(
      'SELECT id FROM User WHERE email = ?',
      [session.user.email.toLowerCase()]
    )
    
    if (!user) {
      return Response.json({ error: 'User not found' }, { status: 404 })
    }

    // Get booking details
    const booking = await queryOne<any>(
      `SELECT b.*, s.startTime, m.title as movieTitle 
       FROM Booking b
       INNER JOIN Showtime s ON b.showtimeId = s.id
       INNER JOIN Movie m ON s.movieId = m.id
       WHERE b.id = ? AND b.userId = ?`,
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

    const connection = await getPool().getConnection()
    await connection.beginTransaction()

    try {
      // Calculate refund amount (full refund if cancelled more than 24 hours before, 80% if less)
      let refundAmount = booking.totalAmount
      if (hoursUntilShowtime < 24) {
        refundAmount = Math.floor(booking.totalAmount * 0.8) // 80% refund
      }

      // Update booking status
      await connection.query(
        `UPDATE Booking 
         SET status = 'CANCELLED', 
             cancelledAt = NOW(), 
             cancellationReason = ?,
             refundAmount = ?,
             refundStatus = 'PENDING'
         WHERE id = ?`,
        [reason || 'User requested cancellation', refundAmount, bookingId]
      )

      // Create cancellation request
      const cancellationRequestId = randomBytes(12).toString('hex')
      await connection.query(
        `INSERT INTO CancellationRequest 
         (id, bookingId, userId, reason, status) 
         VALUES (?, ?, ?, ?, 'APPROVED')`,
        [cancellationRequestId, bookingId, user.id, reason || 'User requested cancellation']
      )

      // Process refund based on payment method
      let refundTransactionId = null
      
      if (booking.razorpayPaymentId) {
        // Razorpay refund logic would go here
        // For now, we'll add to wallet
        refundTransactionId = `refund_razorpay_${Date.now()}`
      } else if (booking.stripeSessionId) {
        // Stripe refund logic would go here
        // For now, we'll add to wallet
        refundTransactionId = `refund_stripe_${Date.now()}`
      }

      // Add refund to user wallet
      // Check if wallet exists
      let wallet = await connection.query(
        'SELECT id FROM UserWallet WHERE userId = ?',
        [user.id]
      )

      if (wallet.length === 0) {
        const walletId = randomBytes(12).toString('hex')
        await connection.query(
          'INSERT INTO UserWallet (id, userId, balance) VALUES (?, ?, ?)',
          [walletId, user.id, refundAmount]
        )
        wallet = [{ id: walletId }]
      } else {
        await connection.query(
          'UPDATE UserWallet SET balance = balance + ? WHERE userId = ?',
          [refundAmount, user.id]
        )
      }

      // Create wallet transaction
      const walletTransactionId = randomBytes(12).toString('hex')
      await connection.query(
        `INSERT INTO WalletTransaction 
         (id, walletId, userId, amount, type, description, bookingId, refundTransactionId) 
         VALUES (?, ?, ?, ?, 'CREDIT', ?, ?, ?)`,
        [
          walletTransactionId,
          wallet[0].id,
          user.id,
          refundAmount,
          `Refund for cancelled booking: ${booking.movieTitle}`,
          bookingId,
          refundTransactionId
        ]
      )

      // Create refund transaction record
      const refundTransId = randomBytes(12).toString('hex')
      const paymentMethod = booking.razorpayPaymentId ? 'RAZORPAY' : 
                           booking.stripeSessionId ? 'STRIPE' : 'WALLET'
      
      await connection.query(
        `INSERT INTO RefundTransaction 
         (id, bookingId, userId, amount, paymentMethod, status, transactionId) 
         VALUES (?, ?, ?, ?, ?, 'PROCESSED', ?)`,
        [refundTransId, bookingId, user.id, refundAmount, paymentMethod, refundTransactionId]
      )

      // Update booking refund status
      await connection.query(
        `UPDATE Booking 
         SET refundStatus = 'PROCESSED', 
             refundTransactionId = ? 
         WHERE id = ?`,
        [refundTransId, bookingId]
      )

      await connection.commit()

      // Get wallet balance
      const walletBalance = (await queryOne<any>(
        'SELECT balance FROM UserWallet WHERE userId = ?',
        [user.id]
      ))?.balance || 0

      // Get user email
      const userEmail = session.user.email

      // Send cancellation email (async, don't wait)
      sendEmail({
        to: userEmail,
        ...getCancellationEmail({
          userName: userEmail.split('@')[0],
          movieTitle: booking.movieTitle,
          refundAmount,
          walletBalance,
        }),
      }).catch(err => console.error('Failed to send cancellation email:', err))

      return Response.json({
        success: true,
        message: 'Booking cancelled successfully',
        refundAmount,
        refundStatus: 'PROCESSED',
        walletBalance
      })

    } catch (error) {
      await connection.rollback()
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


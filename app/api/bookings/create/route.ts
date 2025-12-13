import { query, queryOne, execute, getPool } from '@/lib/db'
import { razorpay } from '@/lib/razorpay'
import { NextRequest } from 'next/server'
import { randomBytes } from 'crypto'
import { sendEmail, getBookingConfirmationEmail } from '@/lib/email'

export async function POST(req: NextRequest) {
  let connection: any = null
  try {
    const { showtimeId, seatIds, userId } = await req.json()

    const showtime = await queryOne<any>(
      'SELECT * FROM Showtime WHERE id = ?',
      [showtimeId]
    )

    if (!showtime) return Response.json({ error: 'Showtime not found' }, { status: 404 })

    const total = showtime.price * seatIds.length
    
    // Calculate loyalty points (1 point per ₹10 spent)
    const loyaltyPointsEarned = Math.floor(total / 10)

    // In development, create order only if Razorpay is configured
    let orderId = `order_${Date.now()}`
    if (razorpay && process.env.RAZORPAY_KEY && process.env.RAZORPAY_SECRET) {
      try {
        const order = await razorpay.orders.create({
          amount: total,
          currency: 'INR',
          receipt: `show-${showtimeId}-${Date.now()}`,
        })
        orderId = order.id
      } catch (error) {
        console.error('Razorpay order creation failed:', error)
        // Continue with mock order ID for development
      }
    }

    // Ensure user exists (demo or real)
    const demoEmail = `${userId}@demo.cinesnap`
    await execute(
      'INSERT IGNORE INTO User (id, email, name, role) VALUES (?, ?, ?, ?)',
      [userId, demoEmail, 'Demo User', 'USER']
    )

    const bookingId = randomBytes(16).toString('hex')
    const pool = getPool()
    connection = await pool.getConnection()

    await connection.beginTransaction()

    // Create booking (CONFIRMED in dev / mock order)
    await connection.execute(
      'INSERT INTO Booking (id, userId, showtimeId, totalAmount, razorpayOrderId, loyaltyPointsEarned, status, createdAt) VALUES (?, ?, ?, ?, ?, ?, ?, NOW())',
      [bookingId, userId, showtimeId, total, orderId, loyaltyPointsEarned, 'CONFIRMED']
    )

    // Award loyalty points
    if (loyaltyPointsEarned > 0) {
      // Get or create loyalty record
      let loyalty = await queryOne<any>(
        'SELECT * FROM LoyaltyPoints WHERE userId = ?',
        [userId]
      )

      if (!loyalty) {
        const loyaltyId = randomBytes(16).toString('hex')
        await connection.execute(
          'INSERT INTO LoyaltyPoints (id, userId, points, totalEarned, tier) VALUES (?, ?, ?, ?, ?)',
          [loyaltyId, userId, loyaltyPointsEarned, loyaltyPointsEarned, 'BRONZE']
        )
      } else {
        const newTotal = loyalty.totalEarned + loyaltyPointsEarned
        const newPoints = loyalty.points + loyaltyPointsEarned
        
        // Calculate tier
        const tier = newTotal >= 10000
          ? 'PLATINUM'
          : newTotal >= 5000
          ? 'GOLD'
          : newTotal >= 2000
          ? 'SILVER'
          : 'BRONZE'

        await connection.execute(
          'UPDATE LoyaltyPoints SET points = ?, totalEarned = ?, tier = ? WHERE userId = ?',
          [newPoints, newTotal, tier, userId]
        )

        // Add to history
        const historyId = randomBytes(16).toString('hex')
        await connection.execute(
          'INSERT INTO LoyaltyPointsHistory (id, userId, points, type, description, bookingId) VALUES (?, ?, ?, ?, ?, ?)',
          [historyId, userId, loyaltyPointsEarned, 'EARNED', `Earned from booking ${bookingId.slice(0, 8)}`, bookingId]
        )
      }
    }

    // Link seats to booking
    for (const seatId of seatIds) {
      await connection.execute(
        'INSERT INTO _BookingSeats (A, B) VALUES (?, ?)',
        [bookingId, seatId]
      )
    }

    await connection.commit()
    connection.release()

    // Send confirmation email (async, don't wait)
    try {
      const user = await queryOne<any>('SELECT email, name FROM User WHERE id = ?', [userId])
      const showtimeDetails = await queryOne<any>(
        `SELECT s.startTime, m.title as movieTitle, m.posterUrl, 
         t.name as theaterName, sc.name as screenName
         FROM Showtime s
         INNER JOIN Movie m ON s.movieId = m.id
         INNER JOIN Screen sc ON s.screenId = sc.id
         INNER JOIN Theater t ON sc.theaterId = t.id
         WHERE s.id = ?`,
        [showtimeId]
      )
      const seats = await query<any>(
        `SELECT CONCAT(\`row\`, \`number\`) as seat FROM Seat WHERE id IN (${seatIds.map(() => '?').join(',')})`,
        seatIds
      )

      if (user && showtimeDetails) {
        const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'
        sendEmail({
          to: user.email,
          ...getBookingConfirmationEmail({
            userName: user.name || user.email.split('@')[0],
            movieTitle: showtimeDetails.movieTitle,
            theaterName: showtimeDetails.theaterName,
            screenName: showtimeDetails.screenName,
            showtime: showtimeDetails.startTime,
            seats: seats.map((s: any) => s.seat),
            totalAmount: total,
            bookingId,
            ticketUrl: `${baseUrl}/ticket/${bookingId}`,
          }),
        }).catch(err => console.error('Failed to send confirmation email:', err))
      }
    } catch (emailError) {
      console.error('Email sending error:', emailError)
      // Don't fail the booking if email fails
    }

    return Response.json({ orderId, bookingId, amount: total })
  } catch (error: any) {
    console.error('Booking creation error:', error?.message || error)
    if (connection) {
      try {
        await connection.rollback()
      } catch (_) {}
      try {
        connection.release()
      } catch (_) {}
    }
    return Response.json({ error: 'Failed to create booking' }, { status: 500 })
  }
}
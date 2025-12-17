import { query, queryOne, execute, getConnection } from '@/lib/db'
import { razorpay } from '@/lib/razorpay'
import { NextRequest } from 'next/server'
import { randomBytes } from 'crypto'
import { sendEmail, getBookingConfirmationEmail } from '@/lib/email'

export async function POST(req: NextRequest) {
  try {
    const { showtimeId, seatIds, userId, seatPrices } = await req.json()

    const showtime = await queryOne<any>(
      'SELECT * FROM "Showtime" WHERE id = $1',
      [showtimeId]
    )

    if (!showtime) return Response.json({ error: 'Showtime not found' }, { status: 404 })

    // Calculate total based on actual seat prices if provided, otherwise use showtime price
    let total: number
    if (seatPrices && Array.isArray(seatPrices) && seatPrices.length === seatIds.length) {
      // Convert seat prices from rupees to paise and sum them
      total = seatPrices.reduce((sum: number, price: number) => sum + Math.round(price * 100), 0)
    } else {
      // Fallback: use showtime price (already in paise) multiplied by seat count
      total = showtime.price * seatIds.length
    }
    
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
      'INSERT INTO "User" (id, email, name, role) VALUES ($1, $2, $3, $4) ON CONFLICT (id) DO UPDATE SET id = EXCLUDED.id',
      [userId, demoEmail, 'Demo User', 'USER']
    )

    const bookingId = randomBytes(16).toString('hex')
    
    // Use transactions for data consistency
    const connection = await getConnection()

    try {
      await connection.query('BEGIN')

      // Create booking (CONFIRMED in dev / mock order)
      await connection.query(
        'INSERT INTO "Booking" (id, "userId", "showtimeId", "totalAmount", "razorpayOrderId", "loyaltyPointsEarned", status, "createdAt") VALUES ($1, $2, $3, $4, $5, $6, $7, NOW())',
        [bookingId, userId, showtimeId, total, orderId, loyaltyPointsEarned, 'CONFIRMED']
      )

      // Link seats to booking
      for (const seatId of seatIds) {
        await connection.query(
          'INSERT INTO "_BookingSeats" ("A", "B") VALUES ($1, $2)',
          [bookingId, seatId]
        )
      }

      await connection.query('COMMIT')
    } catch (error) {
      await connection.query('ROLLBACK')
      throw error
    } finally {
      connection.release()
    }

    // Send confirmation email (async, don't wait)
    try {
      const user = await queryOne<any>('SELECT email, name FROM "User" WHERE id = $1', [userId])
        const showtimeDetails = await queryOne<any>(
          `SELECT s."startTime", m.title as "movieTitle", m."posterUrl", 
           t.name as "theaterName", sc.name as "screenName"
           FROM "Showtime" s
           INNER JOIN "Movie" m ON s."movieId" = m.id
           INNER JOIN "Screen" sc ON s."screenId" = sc.id
           INNER JOIN "Theater" t ON sc."theaterId" = t.id
           WHERE s.id = $1`,
          [showtimeId]
        )
      // Get formatted seat numbers for email (PostgreSQL syntax)
      const placeholders = seatIds.map((_, i) => `$${i + 1}`).join(',')
      const seats = await query<any>(
        `SELECT "row", "number" FROM "Seat" WHERE id IN (${placeholders}) ORDER BY "row", "number"`,
        seatIds
      )
      const seatNumbers = seats.map((s: any) => `${s.row}${s.number}`)

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
            seats: seatNumbers,
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
    console.error('Error stack:', error?.stack)
    return Response.json({ 
      error: 'Failed to create booking',
      details: error?.message 
    }, { status: 500 })
  }
}
import { NextRequest } from 'next/server'
import { stripe } from '@/lib/stripe'
import { queryOne } from '@/lib/db'

export async function POST(req: NextRequest) {
  try {
    const { showtimeId, seatIds, userId, bookingId } = await req.json()

    if (!stripe) {
      return Response.json(
        { error: 'Stripe is not configured' },
        { status: 500 }
      )
    }

    // Get showtime and movie details
    const showtime = await queryOne<any>(
      'SELECT s.*, m.title as movieTitle FROM Showtime s INNER JOIN Movie m ON s.movieId = m.id WHERE s.id = ?',
      [showtimeId]
    )

    if (!showtime) {
      return Response.json({ error: 'Showtime not found' }, { status: 404 })
    }

    // Calculate total amount (in paise, convert to rupees for Stripe)
    const totalAmount = showtime.price * seatIds.length
    const amountInRupees = Math.round(totalAmount / 100) // Convert paise to rupees

    // Create Stripe Checkout Session
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [
        {
          price_data: {
            currency: 'inr',
            product_data: {
              name: `${showtime.movieTitle} - ${seatIds.length} seat(s)`,
              description: `Movie tickets for ${seatIds.length} seat(s)`,
            },
            unit_amount: amountInRupees * 100, // Stripe expects amount in smallest currency unit (paise for INR)
          },
          quantity: 1,
        },
      ],
      mode: 'payment',
      success_url: `${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/ticket/${bookingId}?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/payment/${showtimeId}?seats=${seatIds.join(',')}&userId=${userId}`,
      metadata: {
        showtimeId,
        bookingId,
        userId,
        seatIds: seatIds.join(','),
      },
    })

    return Response.json({
      sessionId: session.id,
      url: session.url,
    })
  } catch (error: any) {
    console.error('Stripe checkout session creation failed:', error)
    return Response.json(
      { error: 'Failed to create checkout session', details: error.message },
      { status: 500 }
    )
  }
}


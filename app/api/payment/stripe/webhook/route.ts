import { NextRequest } from 'next/server'
import { stripe } from '@/lib/stripe'
import { execute } from '@/lib/db'
import Stripe from 'stripe'

export async function POST(req: NextRequest) {
  const body = await req.text()
  const signature = req.headers.get('stripe-signature')

  if (!stripe || !signature) {
    return new Response('Stripe not configured', { status: 400 })
  }

  let event: Stripe.Event

  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET!
    )
  } catch (err: any) {
    console.error('Webhook signature verification failed:', err.message)
    return new Response(`Webhook Error: ${err.message}`, { status: 400 })
  }

  // Handle the event
  switch (event.type) {
    case 'checkout.session.completed':
      const session = event.data.object as Stripe.Checkout.Session
      const bookingId = session.metadata?.bookingId

      if (bookingId) {
        await execute(
          'UPDATE Booking SET status = ?, stripeSessionId = ? WHERE id = ?',
          ['CONFIRMED', session.id, bookingId]
        )
      }
      break

    case 'checkout.session.async_payment_succeeded':
      const asyncSession = event.data.object as Stripe.Checkout.Session
      const asyncBookingId = asyncSession.metadata?.bookingId

      if (asyncBookingId) {
        await execute(
          'UPDATE Booking SET status = ?, stripeSessionId = ? WHERE id = ?',
          ['CONFIRMED', asyncSession.id, asyncBookingId]
        )
      }
      break

    case 'checkout.session.async_payment_failed':
      const failedSession = event.data.object as Stripe.Checkout.Session
      const failedBookingId = failedSession.metadata?.bookingId

      if (failedBookingId) {
        await execute(
          'UPDATE Booking SET status = ? WHERE id = ?',
          ['CANCELLED', failedBookingId]
        )
      }
      break

    default:
      console.log(`Unhandled event type ${event.type}`)
  }

  return new Response(JSON.stringify({ received: true }), {
    status: 200,
    headers: { 'Content-Type': 'application/json' },
  })
}


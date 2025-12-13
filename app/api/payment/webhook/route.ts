import { execute } from '@/lib/db'
import crypto from 'crypto'
import { NextRequest } from 'next/server'

export async function POST(req: NextRequest) {
  const body = await req.text()
  const signature = req.headers.get('x-razorpay-signature')!

  const expected = crypto
    .createHmac('sha256', process.env.RAZORPAY_WEBHOOK_SECRET!)
    .update(body)
    .digest('hex')

  if (expected !== signature) {
    return new Response('Invalid', { status: 400 })
  }

  const event = JSON.parse(body)

  if (event.event === 'payment.captured') {
    const payment = event.payload.payment.entity
    await execute(
      'UPDATE Booking SET status = ?, razorpayPaymentId = ? WHERE razorpayOrderId = ?',
      ['CONFIRMED', payment.id, payment.order_id]
    )
  }

  return new Response('OK')
}


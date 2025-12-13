'use client'

import { useEffect, useState, useMemo } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { formatDateTime } from '@/lib/dateUtils'
import Script from 'next/script'
import FoodOrdering from '@/components/FoodOrdering'
import { loadStripe } from '@stripe/stripe-js'

declare global {
  interface Window {
    Razorpay: any
  }
}

// Initialize Stripe
const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY || '')

type Props = {
  showtimeId: string
  movieTitle: string
  theaterName: string
  screenName: string
  showtime: string
  pricePerSeat: number
}

export default function PaymentClient({
  showtimeId,
  movieTitle,
  theaterName,
  screenName,
  showtime,
  pricePerSeat,
}: Props) {
  const searchParams = useSearchParams()
  const router = useRouter()
  const seatIds = searchParams.get('seats')?.split(',') || []
  const userId = searchParams.get('userId') || 'demo-user'
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [paymentMethod, setPaymentMethod] = useState<'razorpay' | 'stripe'>('stripe')
  const [foodTotal, setFoodTotal] = useState(0)
  const [bookingId, setBookingId] = useState<string | null>(null)

  const total = pricePerSeat * seatIds.length + foodTotal

  const cardBg = useMemo(
    () => ({
      background: 'linear-gradient(135deg, rgba(255,255,255,0.08), rgba(255,255,255,0.02))',
      border: '1px solid rgba(255,255,255,0.08)',
      boxShadow: '0 20px 50px rgba(0,0,0,0.5)',
    }),
    []
  )

  const handlePayment = async () => {
    if (seatIds.length === 0) {
      setError('No seats selected')
      return
    }

    setLoading(true)
    setError(null)

    try {
      // Create booking first
      const bookingRes = await fetch('/api/bookings/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ showtimeId, seatIds, userId }),
      })

      if (!bookingRes.ok) {
        let message = 'Failed to create booking'
        try {
          const data = await bookingRes.json()
          message = data?.error || message
        } catch (_) {
          // response not json, keep default
        }
        throw new Error(message)
      }

      const { orderId, bookingId: newBookingId, amount } = await bookingRes.json()
      setBookingId(newBookingId)

      if (paymentMethod === 'stripe') {
        await handleStripePayment(newBookingId)
      } else {
        await handleRazorpayPayment(orderId, newBookingId, amount)
      }
    } catch (err: any) {
      console.error('Payment error:', err)
      setError(err.message || 'Payment failed')
      setLoading(false)
    }
  }

  const handleStripePayment = async (bookingId: string) => {
    try {
      const stripeKey = process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY
      if (!stripeKey) {
        // Development mode: Skip payment
        console.log('Development mode: Skipping payment, redirecting to ticket')
        router.push(`/ticket/${bookingId}`)
        return
      }

      // Create checkout session
      const sessionRes = await fetch('/api/payment/stripe/create-intent', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ showtimeId, seatIds, userId, bookingId }),
      })

      if (!sessionRes.ok) {
        const errorData = await sessionRes.json()
        throw new Error(errorData.error || 'Failed to create checkout session')
      }

      const { url } = await sessionRes.json()

      if (url) {
        // Redirect to Stripe Checkout
        window.location.href = url
      } else {
        throw new Error('No checkout URL received')
      }
    } catch (err: any) {
      console.error('Stripe payment error:', err)
      setError(err.message || 'Stripe payment failed')
      setLoading(false)
    }
  }

  const handleRazorpayPayment = async (orderId: string, bookingId: string, amount: number) => {
    try {
      // Development mode: Skip payment if Razorpay key is not set
      const razorpayKey = process.env.NEXT_PUBLIC_RAZORPAY_KEY
      if (!razorpayKey) {
        // In development, directly redirect to ticket page
        console.log('Development mode: Skipping payment, redirecting to ticket')
        router.push(`/ticket/${bookingId}`)
        return
      }

      // Initialize Razorpay
      if (!window.Razorpay) {
        throw new Error('Razorpay SDK not loaded')
      }

      const options = {
        key: razorpayKey,
        amount: amount,
        currency: 'INR',
        name: 'CineSnap',
        description: `${movieTitle} - ${seatIds.length} seat(s)`,
        order_id: orderId,
        handler: async function (response: any) {
          // Payment successful - redirect to ticket page
          router.push(`/ticket/${bookingId}`)
        },
        prefill: {
          email: 'user@example.com',
          name: 'User',
        },
        theme: {
          color: '#000000',
        },
        modal: {
          ondismiss: function () {
            setLoading(false)
          },
        },
      }

      const razorpay = new window.Razorpay(options)
      razorpay.open()
    } catch (err: any) {
      console.error('Razorpay payment error:', err)
      setError(err.message || 'Razorpay payment failed')
      setLoading(false)
    }
  }

  return (
    <>
      <Script
        src="https://checkout.razorpay.com/v1/checkout.js"
        strategy="lazyOnload"
      />
      <div className="min-h-screen pt-24 pb-32 px-6">
        <div className="max-w-3xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-8"
          >
            {/* Header */}
            <div className="text-center">
              <h1 className="text-4xl md:text-5xl font-clash font-bold text-white mb-2">
                Complete Your Booking
              </h1>
              <p className="text-gray-400">Review and proceed to payment</p>
            </div>

            {/* Booking Summary */}
            <div className="glass rounded-2xl p-8 space-y-6">
              <div>
                <h2 className="text-2xl font-clash font-bold text-white mb-4">
                  {movieTitle}
                </h2>
                <div className="space-y-2 text-gray-300">
                  <p>
                    <span className="text-white/70">Theater:</span> {theaterName}
                  </p>
                  <p>
                    <span className="text-white/70">Screen:</span> {screenName}
                  </p>
                  <p>
                    <span className="text-white/70">Showtime:</span>{' '}
                    {formatDateTime(showtime)}
                  </p>
                </div>
              </div>

              <div className="border-t border-white/10 pt-6">
                <h3 className="text-lg font-clash font-semibold text-white mb-4">
                  Selected Seats
                </h3>
                <div className="flex flex-wrap gap-2">
                  {seatIds.map((seatId) => {
                    const parts = seatId.split('-')
                    const row = parts[parts.length - 2]
                    const num = parts[parts.length - 1]
                    return (
                      <span
                        key={seatId}
                        className="px-4 py-2 glass rounded-lg text-white font-semibold"
                      >
                        {row}{num}
                      </span>
                    )
                  })}
                </div>
              </div>

              <div className="border-t border-white/10 pt-6">
                <div className="flex justify-between items-center mb-4">
                  <span className="text-gray-300">Seats ({seatIds.length})</span>
                  <span className="text-white font-semibold">
                    ₹{pricePerSeat / 100} × {seatIds.length}
                  </span>
                </div>
                <div className="flex justify-between items-center pt-4 border-t border-white/10">
                  <span className="text-xl font-clash font-bold text-white">
                    Total Amount
                  </span>
                  <span className="text-3xl font-clash font-bold text-white">
                    ₹{total / 100}
                  </span>
                </div>
              </div>
            </div>

            {/* Payment Method Selection */}
            <div className="glass rounded-2xl p-6">
              <h3 className="text-lg font-clash font-semibold text-white mb-4">
                Choose Payment Method
              </h3>
              <div className="flex gap-4">
                <button
                  onClick={() => setPaymentMethod('stripe')}
                  className={`flex-1 px-6 py-4 rounded-xl border-2 transition-all ${
                    paymentMethod === 'stripe'
                      ? 'border-white bg-white/10'
                      : 'border-white/20 hover:border-white/40'
                  }`}
                >
                  <div className="text-white font-semibold mb-1">💳 Stripe</div>
                  <div className="text-white/60 text-sm">Secure & Fast</div>
                </button>
                <button
                  onClick={() => setPaymentMethod('razorpay')}
                  className={`flex-1 px-6 py-4 rounded-xl border-2 transition-all ${
                    paymentMethod === 'razorpay'
                      ? 'border-white bg-white/10'
                      : 'border-white/20 hover:border-white/40'
                  }`}
                >
                  <div className="text-white font-semibold mb-1">💳 Razorpay</div>
                  <div className="text-white/60 text-sm">UPI & Cards</div>
                </button>
              </div>
            </div>

            {/* 3D Payment Card */}
            <div className="flex flex-col items-center gap-6">
              <motion.div
                whileHover={{ rotateY: 8, rotateX: 2 }}
                transition={{ type: 'spring', stiffness: 150, damping: 15 }}
                className="w-full max-w-md h-64 rounded-3xl relative overflow-hidden"
                style={cardBg as any}
              >
                <div className="absolute inset-0 p-6 flex flex-col justify-between">
                  <div className="flex justify-between items-center text-white/80 text-sm">
                    <span>CineSnap • Premium</span>
                    <span>{seatIds.length} seat{seatIds.length > 1 ? 's' : ''}</span>
                  </div>
                  <div>
                    <p className="text-white text-3xl font-clash mb-2">₹{(total / 100).toFixed(0)}</p>
                    <p className="text-white/70 text-sm">
                      {movieTitle} • {formatDateTime(showtime)}
                    </p>
                    <p className="text-white/60 text-sm mt-2">
                      Seats: {seatIds.map((s) => s.split('-').slice(-2).join('')).join(', ')}
                    </p>
                  </div>
                  <div className="flex items-center justify-between text-white/60 text-xs">
                    <span>Virtual Card</span>
                    <span>Secure • {paymentMethod === 'stripe' ? 'Stripe' : 'Razorpay'}</span>
                  </div>
                </div>
              </motion.div>

              <div className="text-center">
                <motion.button
                  onClick={handlePayment}
                  disabled={loading || seatIds.length === 0}
                  whileHover={{ scale: loading ? 1 : 1.02 }}
                  whileTap={{ scale: loading ? 1 : 0.98 }}
                  className="px-12 py-4 bg-white text-black rounded-full font-clash font-semibold text-lg hover:bg-white/90 transition-colors shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? 'Processing...' : `Pay ₹${total / 100}`}
                </motion.button>
              </div>
            </div>

            {/* Food & Beverages */}
            <FoodOrdering 
              bookingId={bookingId || undefined}
              onOrderComplete={(total) => setFoodTotal(total)}
            />

            {error && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="glass rounded-xl p-4 border border-red-500/50"
              >
                <p className="text-red-400 text-center">{error}</p>
              </motion.div>
            )}
          </motion.div>
        </div>
      </div>
    </>
  )
}


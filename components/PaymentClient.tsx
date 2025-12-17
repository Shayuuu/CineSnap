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

// Initialize Stripe only if key is provided
const stripeKey = process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY
const stripePromise = stripeKey && stripeKey.trim() !== '' 
  ? loadStripe(stripeKey) 
  : null

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
  const seatPricesParam = searchParams.get('prices')
  const userId = searchParams.get('userId') || 'demo-user'
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [paymentMethod, setPaymentMethod] = useState<'razorpay' | 'stripe'>('stripe')
  const [foodTotal, setFoodTotal] = useState(0)
  const [bookingId, setBookingId] = useState<string | null>(null)

  // Calculate total based on actual seat prices if provided, otherwise use pricePerSeat
  const seatPrices = seatPricesParam 
    ? seatPricesParam.split(',').map(p => parseFloat(p) || pricePerSeat)
    : seatIds.map(() => pricePerSeat)
  const seatsTotal = seatPrices.reduce((sum, price) => sum + price, 0)
  const total = seatsTotal + foodTotal

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
      // Create booking first (pass seat prices for accurate calculation)
      const bookingRes = await fetch('/api/bookings/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ showtimeId, seatIds, userId, seatPrices }),
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
      if (!stripePromise) {
        // Stripe not configured: Skip payment
        console.log('Stripe not configured: Skipping payment, redirecting to ticket')
        router.push(`/ticket/${bookingId}`)
        return
      }
      
      const stripe = await stripePromise
      if (!stripe) {
        console.log('Stripe initialization failed: Skipping payment, redirecting to ticket')
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

      // amount from API is in paise (correct for Razorpay)
      // Ensure it matches the displayed total (convert rupees to paise)
      const amountInPaise = Math.round(total * 100)

      const options = {
        key: razorpayKey,
        amount: amountInPaise, // Use calculated amount in paise to match display
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
      <div className="min-h-screen pt-20 sm:pt-24 pb-20 sm:pb-32 px-4 sm:px-6">
        <div className="max-w-3xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-8"
          >
            {/* Header */}
            <div className="text-center">
              <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-clash font-bold text-white mb-2">
                Complete Your Booking
              </h1>
              <p className="text-gray-400 text-sm sm:text-base">Review and proceed to payment</p>
            </div>

            {/* Booking Summary */}
            <div className="glass rounded-xl sm:rounded-2xl p-4 sm:p-6 md:p-8 space-y-4 sm:space-y-6">
              <div>
                <h2 className="text-xl sm:text-2xl font-clash font-bold text-white mb-3 sm:mb-4">
                  {movieTitle}
                </h2>
                <div className="space-y-1.5 sm:space-y-2 text-sm sm:text-base text-gray-300">
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

              <div className="border-t border-white/10 pt-4 sm:pt-6">
                <h3 className="text-base sm:text-lg font-clash font-semibold text-white mb-3 sm:mb-4">
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
                        className="px-3 sm:px-4 py-1.5 sm:py-2 glass rounded-lg text-white font-semibold text-sm sm:text-base"
                      >
                        {row}{num}
                      </span>
                    )
                  })}
                </div>
              </div>

              <div className="border-t border-white/10 pt-4 sm:pt-6">
                <div className="space-y-2 mb-3 sm:mb-4">
                  {seatIds.map((seatId, index) => {
                    const seatPrice = seatPrices[index] || pricePerSeat
                    const parts = seatId.split('-')
                    const row = parts[parts.length - 2]
                    const num = parts[parts.length - 1]
                    return (
                      <div key={seatId} className="flex justify-between items-center text-sm sm:text-base">
                        <span className="text-gray-300">Seat {row}{num}</span>
                        <span className="text-white font-semibold">₹{seatPrice}</span>
                      </div>
                    )
                  })}
                </div>
                <div className="flex justify-between items-center pt-2 border-t border-white/10 text-sm sm:text-base mb-3 sm:mb-4">
                  <span className="text-gray-300">Subtotal ({seatIds.length} seats)</span>
                  <span className="text-white font-semibold">₹{seatsTotal}</span>
                </div>
                {foodTotal > 0 && (
                  <div className="flex justify-between items-center pt-2 border-t border-white/10 text-sm sm:text-base mb-3 sm:mb-4">
                    <span className="text-gray-300">Food & Beverages</span>
                    <span className="text-white font-semibold">₹{foodTotal}</span>
                  </div>
                )}
                <div className="flex justify-between items-center pt-3 sm:pt-4 border-t border-white/10">
                  <span className="text-lg sm:text-xl font-clash font-bold text-white">
                    Total Amount
                  </span>
                  <span className="text-2xl sm:text-3xl font-clash font-bold text-white">
                    ₹{total}
                  </span>
                </div>
              </div>
            </div>

            {/* Payment Method Selection */}
            <div className="glass rounded-xl sm:rounded-2xl p-4 sm:p-6">
              <h3 className="text-base sm:text-lg font-clash font-semibold text-white mb-3 sm:mb-4">
                Choose Payment Method
              </h3>
              <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
                <button
                  onClick={() => setPaymentMethod('stripe')}
                  className={`flex-1 px-4 sm:px-6 py-3 sm:py-4 rounded-xl border-2 transition-all touch-manipulation min-h-[60px] ${
                    paymentMethod === 'stripe'
                      ? 'border-white bg-white/10'
                      : 'border-white/20 hover:border-white/40'
                  }`}
                >
                  <div className="text-white font-semibold mb-1 text-sm sm:text-base">💳 Stripe</div>
                  <div className="text-white/60 text-xs sm:text-sm">Secure & Fast</div>
                </button>
                <button
                  onClick={() => setPaymentMethod('razorpay')}
                  className={`flex-1 px-4 sm:px-6 py-3 sm:py-4 rounded-xl border-2 transition-all touch-manipulation min-h-[60px] ${
                    paymentMethod === 'razorpay'
                      ? 'border-white bg-white/10'
                      : 'border-white/20 hover:border-white/40'
                  }`}
                >
                  <div className="text-white font-semibold mb-1 text-sm sm:text-base">💳 Razorpay</div>
                  <div className="text-white/60 text-xs sm:text-sm">UPI & Cards</div>
                </button>
              </div>
            </div>

            {/* 3D Payment Card */}
            <div className="flex flex-col items-center gap-6">
              <motion.div
                whileHover={{ rotateY: 8, rotateX: 2 }}
                transition={{ type: 'spring', stiffness: 150, damping: 15 }}
                className="w-full max-w-md h-56 sm:h-64 rounded-2xl sm:rounded-3xl relative overflow-hidden"
                style={cardBg as any}
              >
                <div className="absolute inset-0 p-4 sm:p-6 flex flex-col justify-between">
                  <div className="flex justify-between items-center text-white/80 text-xs sm:text-sm">
                    <span>CineSnap • Premium</span>
                    <span>{seatIds.length} seat{seatIds.length > 1 ? 's' : ''}</span>
                  </div>
                  <div>
                    <p className="text-white text-2xl sm:text-3xl font-clash mb-1 sm:mb-2">₹{total.toFixed(0)}</p>
                    <p className="text-white/70 text-xs sm:text-sm line-clamp-1">
                      {movieTitle} • {formatDateTime(showtime)}
                    </p>
                    <p className="text-white/60 text-xs sm:text-sm mt-1 sm:mt-2 line-clamp-1">
                      Seats: {seatIds.map((s) => s.split('-').slice(-2).join('')).join(', ')}
                    </p>
                  </div>
                  <div className="flex items-center justify-between text-white/60 text-[10px] sm:text-xs">
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
                  className="w-full sm:w-auto px-8 sm:px-12 py-3 sm:py-4 bg-white text-black rounded-full font-clash font-semibold text-base sm:text-lg hover:bg-white/90 transition-colors shadow-lg disabled:opacity-50 disabled:cursor-not-allowed touch-manipulation min-h-[48px]"
                >
                  {loading ? (
                    <span className="flex items-center gap-2">
                      <motion.span
                        animate={{ rotate: 360 }}
                        transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                        className="inline-block"
                      >
                        ⚡
                      </motion.span>
                      Processing...
                    </span>
                  ) : (
                    <span className="flex items-center gap-2">
                      Pay ₹{total}
                      <motion.span
                        animate={{ x: [0, 5, 0] }}
                        transition={{ duration: 1.5, repeat: Infinity }}
                      >
                        →
                      </motion.span>
                    </span>
                  )}
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


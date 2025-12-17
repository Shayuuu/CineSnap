'use client'

import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { useSession } from 'next-auth/react'
import Link from 'next/link'
import { formatDateTime, formatCurrency } from '@/lib/dateUtils'
import Image from 'next/image'
import { poster } from '@/lib/api'
import LoyaltyPoints from '@/components/LoyaltyPoints'
import CancelBookingButton from '@/components/CancelBookingButton'

type Booking = {
  id: string
  movieTitle: string
  posterUrl: string | null
  theaterName: string
  screenName: string
  startTime: string
  seats: string[]
  totalAmount: number
  status: string
  createdAt: string
}

export default function MyBookingsPage() {
  const { data: session, status } = useSession()
  const [bookings, setBookings] = useState<Booking[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (status === 'loading') return
    if (!session) {
      window.location.href = '/login'
      return
    }

    const fetchBookings = async () => {
      try {
        const res = await fetch('/api/bookings/my-bookings', {
          credentials: 'include',
          cache: 'no-store',
        })
        if (!res.ok) {
          const errorData = await res.json().catch(() => ({}))
          throw new Error(errorData.error || 'Failed to fetch bookings')
        }
        const data = await res.json()
        setBookings(data.bookings || [])
      } catch (err: any) {
        console.error('Failed to fetch bookings:', err)
        setError(err.message || 'Failed to load bookings')
      } finally {
        setLoading(false)
      }
    }

    fetchBookings()
  }, [session, status])

  if (status === 'loading' || loading) {
    return (
      <div className="min-h-screen pt-24 pb-32 px-6 flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center"
        >
          <div className="glass rounded-2xl p-8">
            <div className="w-12 h-12 border-4 border-white border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-gray-400">Loading your bookings...</p>
          </div>
        </motion.div>
      </div>
    )
  }

  if (!session) {
    return null
  }

  return (
    <div className="min-h-screen pt-20 sm:pt-24 pb-20 sm:pb-32 px-4 sm:px-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-7xl mx-auto"
      >
        <div className="mb-8 sm:mb-12">
          <div className="text-center mb-6 sm:mb-8">
            <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-clash font-bold mb-3 sm:mb-4">
              <span className="text-white">My Bookings</span>
            </h1>
            <p className="text-gray-400 text-sm sm:text-base md:text-lg px-4">
              View all your confirmed movie tickets
            </p>
          </div>
          <div className="max-w-md mx-auto">
            <LoyaltyPoints />
          </div>
        </div>

        {error && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="glass rounded-2xl p-6 mb-8 border border-red-500/50"
          >
            <p className="text-red-400 text-center">{error}</p>
          </motion.div>
        )}

        {bookings.length === 0 && !loading && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="glass rounded-2xl p-12 text-center"
          >
            <p className="text-gray-400 text-lg mb-4">No bookings found</p>
            <Link
              href="/movies"
              className="inline-block px-6 py-3 bg-white text-black rounded-full font-clash font-semibold hover:bg-white/90 transition-colors"
            >
              Browse Movies →
            </Link>
          </motion.div>
        )}

        <div className="grid md:grid-cols-2 gap-4 sm:gap-6">
          {bookings.map((booking, index) => (
            <motion.div
              key={booking.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <Link href={`/ticket/${booking.id}`} className="touch-manipulation">
                <motion.div
                  whileHover={{ scale: 1.02, y: -5 }}
                  className="glass-strong rounded-xl sm:rounded-2xl p-4 sm:p-6 border border-white/10 hover:border-white/30 transition-all cursor-pointer h-full"
                >
                  <div className="flex gap-3 sm:gap-4 mb-3 sm:mb-4">
                    {booking.posterUrl && (
                      <div className="w-20 h-28 sm:w-24 sm:h-32 md:w-32 md:h-48 rounded-lg overflow-hidden relative flex-shrink-0">
                        <Image
                          src={poster(booking.posterUrl)}
                          alt={booking.movieTitle}
                          fill
                          className="object-cover"
                          sizes="128px"
                          unoptimized
                        />
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <h3 className="text-lg sm:text-xl md:text-2xl font-clash font-bold text-white mb-1 sm:mb-2 line-clamp-2">
                        {booking.movieTitle}
                      </h3>
                      <p className="text-gray-400 text-xs sm:text-sm mb-1">
                        {booking.theaterName} • {booking.screenName}
                      </p>
                      <p className="text-gray-400 text-xs sm:text-sm mb-2 sm:mb-3">
                        {formatDateTime(booking.startTime)}
                      </p>
                      <div className="flex flex-wrap gap-1.5 sm:gap-2 mb-2">
                        {booking.seats.map((seat) => (
                          <span
                            key={seat}
                            className="px-1.5 sm:px-2 py-0.5 sm:py-1 bg-white/10 rounded text-[10px] sm:text-xs text-white/80"
                          >
                            {seat}
                          </span>
                        ))}
                      </div>
                      <p className="text-base sm:text-lg font-clash font-bold text-white">
                        {formatCurrency(booking.totalAmount / 100)}
                      </p>
                    </div>
                  </div>
                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 sm:gap-0 pt-3 sm:pt-4 border-t border-white/10">
                    <span className="text-[10px] sm:text-xs text-gray-400">
                      Booking ID: {booking.id.slice(0, 8)}
                    </span>
                    <div className="flex items-center gap-3">
                      {booking.status === 'CONFIRMED' && (
                        <CancelBookingButton
                          bookingId={booking.id}
                          startTime={booking.startTime}
                          onCancelled={() => {
                            // Refresh bookings list after cancellation
                            fetchBookings()
                          }}
                        />
                      )}
                      <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                        booking.status === 'CONFIRMED' 
                          ? 'bg-green-500/20 text-green-400'
                          : booking.status === 'CANCELLED'
                          ? 'bg-red-500/20 text-red-400'
                          : 'bg-yellow-500/20 text-yellow-400'
                      }`}>
                        {booking.status}
                      </span>
                    </div>
                  </div>
                </motion.div>
              </Link>
            </motion.div>
          ))}
        </div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="mt-12 text-center"
        >
          <Link
            href="/movies"
            className="inline-block px-6 py-3 glass rounded-full text-white/70 hover:text-white transition-colors"
          >
            ← Back to Movies
          </Link>
        </motion.div>
      </motion.div>
    </div>
  )
}


'use client'

import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

type Booking = {
  id: string
  location: string
  seats: number
  movie: string
  time: string
  ago: string
}

export default function SocialProofTicker() {
  const [bookings, setBookings] = useState<Booking[]>([])
  const [currentIndex, setCurrentIndex] = useState(0)
  const [nowPlayingMovies, setNowPlayingMovies] = useState<string[]>([])

  // Fetch now-playing movies for fallback
  useEffect(() => {
    const fetchNowPlaying = async () => {
      try {
        const res = await fetch('/api/movies/now-playing')
        if (res.ok) {
          const data = await res.json()
          const titles = (data.results || []).slice(0, 10).map((m: any) => m.title)
          setNowPlayingMovies(titles)
        }
      } catch (err) {
        console.error('Failed to fetch now-playing movies:', err)
      }
    }
    fetchNowPlaying()
  }, [])

  // Fetch recent bookings from Mumbai
  useEffect(() => {
    const fetchBookings = async () => {
      try {
        const res = await fetch('/api/bookings/recent?location=Mumbai&limit=20')
        if (res.ok) {
          const data = await res.json()
          setBookings(data.bookings || [])
        }
      } catch (err) {
        console.error('Failed to fetch bookings:', err)
      }
    }

    fetchBookings()
    const interval = setInterval(fetchBookings, 10000) // Refresh every 10 seconds
    return () => clearInterval(interval)
  }, [])

  // Generate fallback bookings if no real bookings
  useEffect(() => {
    if (bookings.length === 0 && nowPlayingMovies.length > 0) {
      const fallbackBookings: Booking[] = nowPlayingMovies.slice(0, 5).map((movie, idx) => {
        const seats = [1, 2, 3, 4][Math.floor(Math.random() * 4)]
        const times = ['7:15 PM', '9:30 PM', '10:00 PM', '8:45 PM', '6:30 PM']
        const secondsAgo = (idx + 1) * 8
        
        return {
          id: `fallback-${idx}`,
          location: 'Mumbai',
          seats,
          movie,
          time: times[idx % times.length],
          ago: `${secondsAgo} seconds ago`,
        }
      })
      setBookings(fallbackBookings)
    }
  }, [bookings.length, nowPlayingMovies])

  useEffect(() => {
    if (bookings.length === 0) return

    const interval = setInterval(() => {
      setCurrentIndex((prev) => {
        if (bookings.length === 0) return 0
        return (prev + 1) % bookings.length
      })
    }, 8000) // Change every 8 seconds

    return () => clearInterval(interval)
  }, [bookings.length, bookings])

  if (bookings.length === 0) return null

  // Ensure currentIndex is within bounds
  const safeIndex = Math.max(0, Math.min(currentIndex, bookings.length - 1))
  const booking = bookings[safeIndex]
  
  // Safety check - ensure booking exists
  if (!booking) return null

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 glass-strong border-t border-white/10">
      <div className="max-w-7xl mx-auto px-3 sm:px-4 md:px-6 py-2 sm:py-3">
        <AnimatePresence mode="wait">
          <motion.div
            key={safeIndex}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.5 }}
            className="flex items-center justify-center gap-1.5 sm:gap-2 text-xs sm:text-sm"
          >
            <span className="text-white/60 text-sm sm:text-base">✨</span>
            <span className="text-gray-300 text-center">
              <span className="hidden sm:inline">Someone in </span>
              <span className="font-semibold text-white">{booking.location || 'Mumbai'}</span>
              <span className="hidden sm:inline"> just booked </span>
              <span className="sm:hidden"> • </span>
              <span className="font-semibold text-white">{booking.seats || 1} seat{(booking.seats || 1) !== 1 ? 's' : ''}</span>
              <span className="hidden sm:inline"> for </span>
              <span className="font-semibold text-white">{booking.movie || 'a movie'}</span>
              <span className="hidden md:inline"> • </span>
              <span className="hidden md:inline text-gray-400">{booking.time || 'now'}</span>
              <span className="hidden lg:inline"> • </span>
              <span className="hidden lg:inline text-gray-500">{booking.ago || 'just now'}</span>
            </span>
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  )
}


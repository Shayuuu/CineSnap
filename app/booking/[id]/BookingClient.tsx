'use client'

import { useSession } from 'next-auth/react'
import BookMyShowSeatMap from '@/components/BookMyShowSeatMap'
import BookingHeader from '@/components/BookingHeader'
import CommandPalette from '@/components/CommandPalette'
import SeatRecommendationBadge from '@/components/SeatRecommendationBadge'
import { useEffect, useState, useRef } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { BookingIntent } from '@/hooks/useIntentParser'
import { useSeatRecommendations } from '@/hooks/useSeatRecommendations'
import { motion, AnimatePresence } from 'framer-motion'
import Toast from '@/components/Toast'

type Props = {
  seats: any[]
  lockedSeats: string[]
  bookedSeats: string[]
  showtimeId: string
  movieTitle: string
  theaterName: string
  screenName: string
  showtime: string
  pricePerSeat: number
}

export default function BookingClient({
  seats,
  lockedSeats,
  bookedSeats,
  showtimeId,
  movieTitle,
  theaterName,
  screenName,
  showtime,
  pricePerSeat,
}: Props) {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [mounted, setMounted] = useState(false)
  const [selectedSeats, setSelectedSeats] = useState<string[]>([])
  const [isCommandPaletteOpen, setIsCommandPaletteOpen] = useState(false)
  const [bookingIntent, setBookingIntent] = useState<BookingIntent | null>(null)
  const [highlightedSeats, setHighlightedSeats] = useState<string[]>([])
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' | 'info' } | null>(null)
  const [isProcessingRecommendation, setIsProcessingRecommendation] = useState(false)

  // Load booking intent from sessionStorage if available (from movies page)
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const storedIntent = sessionStorage.getItem('bookingIntent')
      if (storedIntent) {
        try {
          const intent = JSON.parse(storedIntent) as BookingIntent
          setBookingIntent(intent)
          // Clear sessionStorage after reading
          sessionStorage.removeItem('bookingIntent')
          setToast({ 
            message: 'AI recommendations applied! Check highlighted seats below.', 
            type: 'success' 
          })
        } catch (error) {
          console.error('[AI Booking Assistant] Failed to parse stored intent:', error)
        }
      }
    }
  }, [])

  // Get seat recommendations based on intent
  const recommendations = useSeatRecommendations(
    seats,
    bookedSeats,
    lockedSeats,
    bookingIntent || {
      movieQuery: '',
      date: null,
      timeRange: null,
      seats: 1,
      budget: null,
      preferences: { center: false, aisle: false, vip: false, premium: false },
    },
    pricePerSeat
  )

  // Use ref to track previous seat IDs to prevent infinite loops
  const prevSeatIdsRef = useRef<string>('')

  // Update highlighted seats when recommendations change
  useEffect(() => {
    if (recommendations.length > 0 && bookingIntent) {
      // Highlight the top recommendation
      const topRecommendationSeats = recommendations[0].seatIds
      const currentSeatIds = topRecommendationSeats.sort().join(',')
      
      // Only update if the seat IDs actually changed
      if (prevSeatIdsRef.current !== currentSeatIds) {
        prevSeatIdsRef.current = currentSeatIds
        setHighlightedSeats(topRecommendationSeats)
      }
    } else {
      // Only clear if there were previously highlighted seats
      if (prevSeatIdsRef.current !== '') {
        prevSeatIdsRef.current = ''
        setHighlightedSeats([])
      }
    }
  }, [recommendations, bookingIntent])

  // Handle Cmd+K / Ctrl+K keyboard shortcut
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault()
        setIsCommandPaletteOpen(true)
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [])

  useEffect(() => {
    setMounted(true)
    if (status === 'loading') return
    if (!session) {
      router.push('/login?callbackUrl=/booking/' + showtimeId)
    }
  }, [session, status, router, showtimeId])

  const handleIntentParsed = (intent: BookingIntent) => {
    try {
      setBookingIntent(intent)
      
      // Telemetry: log intent parsed
      console.log('[AI Booking Assistant] Intent applied:', {
        intent,
        timestamp: new Date().toISOString(),
      })

      // Show success toast
      setToast({ message: 'AI recommendations generated!', type: 'success' })
    } catch (error) {
      console.error('[AI Booking Assistant] Failed to parse intent:', error)
      setToast({ message: 'Failed to process request. Please try again.', type: 'error' })
    }
  }

  const handleLockRecommendedSeats = async (seatIds: string[]) => {
    if (!showtimeId || !userId) {
      setToast({ message: 'Please log in to lock seats', type: 'error' })
      return
    }

    setIsProcessingRecommendation(true)

    // Telemetry: log which recommendation was chosen
    const startTime = performance.now()
    const recommendation = recommendations.find(r => 
      r.seatIds.length === seatIds.length && 
      r.seatIds.every(id => seatIds.includes(id))
    )
    
    console.log('[AI Booking Assistant] Recommendation chosen:', {
      seatIds,
      recommendation: recommendation?.reason,
      score: recommendation?.score,
      timestamp: new Date().toISOString(),
    })

    // Fallback: if AI fails, use deterministic logic
    const availableSeats = seatIds.filter(id => 
      !bookedSeats.includes(id) && !lockedSeats.includes(id)
    )

    if (availableSeats.length === 0) {
      setToast({ message: 'Selected seats are no longer available', type: 'error' })
      setIsProcessingRecommendation(false)
      return
    }

    // Lock seats one by one (user must manually confirm)
    try {
      let lockedCount = 0
      for (const seatId of availableSeats) {
        const res = await fetch('/api/seats/lock', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ showtimeId, seatIds: [seatId], userId }),
        })

        if (res.ok) {
          lockedCount++
          setSelectedSeats((prev) => {
            if (!prev.includes(seatId)) {
              return [...prev, seatId]
            }
            return prev
          })
        } else {
          const errorData = await res.json().catch(() => ({}))
          console.warn(`[AI Booking Assistant] Failed to lock seat ${seatId}:`, errorData.error || 'Unknown error')
        }
      }

      const timeToLock = performance.now() - startTime
      console.log('[AI Booking Assistant] Lock completed:', {
        lockedCount,
        totalSeats: availableSeats.length,
        timeToLock: `${timeToLock.toFixed(2)}ms`,
      })

      if (lockedCount > 0) {
        setToast({ 
          message: `Successfully locked ${lockedCount} seat${lockedCount > 1 ? 's' : ''}!`, 
          type: 'success' 
        })
      } else {
        setToast({ message: 'Could not lock seats. Please try again.', type: 'error' })
      }
    } catch (error: any) {
      // Safely handle errors - ensure we don't pass Event objects
      const errorMessage = error?.message || error?.toString?.() || 'Failed to lock seats'
      console.error('[AI Booking Assistant] Failed to lock recommended seats:', errorMessage)
      setToast({ message: 'Failed to lock seats. Please try again.', type: 'error' })
    } finally {
      setIsProcessingRecommendation(false)
    }
  }

  if (status === 'loading' || !mounted) {
    return (
      <div className="min-h-screen pt-20 sm:pt-24 pb-20 sm:pb-32 px-4 sm:px-6 flex items-center justify-center">
        <div className="glass rounded-xl sm:rounded-2xl p-6 sm:p-8">
          <div className="w-10 h-10 sm:w-12 sm:h-12 border-4 border-white border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-400">Loading...</p>
        </div>
      </div>
    )
  }

  if (!session) {
    return null
  }

  const userId = (session?.user as any)?.id

  return (
    <div className="min-h-screen pt-20 sm:pt-24 pb-24 sm:pb-32 px-3 sm:px-4 md:px-6">
      <div className="max-w-6xl mx-auto">
        <BookingHeader
          movieTitle={movieTitle}
          theaterName={theaterName}
          screenName={screenName}
          showtime={showtime}
          selectedCount={selectedSeats.length}
        />

        {/* AI Assistant Trigger Button */}
        <div className="mb-6 flex justify-center">
          <motion.button
            onClick={() => setIsCommandPaletteOpen(true)}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="px-6 py-3 glass-enhanced rounded-xl border border-cyan-400/30 hover:border-cyan-400/50 transition-all flex items-center gap-2 group"
          >
            <span className="text-xl">✨</span>
            <span className="font-clash font-semibold text-white">AI Booking Assistant</span>
            <kbd className="px-2 py-1 bg-white/10 rounded text-xs text-gray-400 group-hover:text-white transition-colors">
              {navigator.platform.includes('Mac') ? '⌘' : 'Ctrl'}+K
            </kbd>
          </motion.button>
        </div>

        {/* Recommendations Panel */}
        <AnimatePresence>
          {recommendations.length > 0 && bookingIntent && (
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="mb-6"
            >
              <div className="glass-strong rounded-2xl p-6 border border-cyan-400/20">
                <h3 className="text-xl font-clash font-bold text-white mb-4 flex items-center gap-2">
                  <span>🎯</span>
                  Recommended Seats
                </h3>
                <div className="grid md:grid-cols-3 gap-4">
                  {recommendations.map((rec, idx) => (
                    <SeatRecommendationBadge
                      key={idx}
                      seatIds={rec.seatIds}
                      reason={rec.reason}
                      totalPrice={rec.totalPrice}
                      onSelect={handleLockRecommendedSeats}
                      isRecommended={idx === 0}
                    />
                  ))}
                </div>
                <p className="text-xs text-gray-400 mt-4 text-center">
                  💡 AI suggestions are recommendations only. You must manually lock seats to proceed.
                </p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Seat Map - Centered */}
        <div className="flex justify-center">
          <BookMyShowSeatMap
            seats={seats}
            lockedSeats={lockedSeats}
            bookedSeats={bookedSeats}
            showtimeId={showtimeId}
            userId={userId}
            pricePerSeat={pricePerSeat}
            onSelect={setSelectedSeats}
            highlightedSeats={highlightedSeats}
          />
        </div>
      </div>

      {/* Command Palette */}
      <CommandPalette
        isOpen={isCommandPaletteOpen}
        onClose={() => setIsCommandPaletteOpen(false)}
        onIntentParsed={handleIntentParsed}
        movieTitle={movieTitle}
      />

      {/* Toast Notifications */}
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          isOpen={!!toast}
          onClose={() => setToast(null)}
        />
      )}
    </div>
  )
}


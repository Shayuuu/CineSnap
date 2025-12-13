'use client'

import { useState, useEffect } from 'react'
import { motion, useMotionValue, useSpring, useTransform } from 'framer-motion'
import confetti from 'canvas-confetti'

type Seat = {
  id: string
  row: string
  number: number
  type?: 'STANDARD' | 'PREMIUM' | 'VIP'
}

type Props = {
  seats: Seat[]
  lockedSeats: string[]
  bookedSeats?: string[]
  onSelect?: (seatIds: string[]) => void
  showtimeId?: string
  userId?: string
  pricePerSeat?: number
}

export default function PremiumSeatMap({
  seats,
  lockedSeats: initialLockedSeats,
  bookedSeats = [],
  onSelect,
  showtimeId,
  userId,
  pricePerSeat = 500,
}: Props) {
  const [selected, setSelected] = useState<string[]>([])
  const [loading, setLoading] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [totalPrice, setTotalPrice] = useState(0)
  const [currentLockedSeats, setCurrentLockedSeats] = useState<string[]>(initialLockedSeats)

  // 3D tilt effect
  const x = useMotionValue(0)
  const y = useMotionValue(0)
  const rotateX = useSpring(useTransform(y, [-0.5, 0.5], [10, -10]), { stiffness: 300, damping: 30 })
  const rotateY = useSpring(useTransform(x, [-0.5, 0.5], [-10, 10]), { stiffness: 300, damping: 30 })

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect()
    const centerX = rect.left + rect.width / 2
    const centerY = rect.top + rect.height / 2
    x.set((e.clientX - centerX) / rect.width)
    y.set((e.clientY - centerY) / rect.height)
  }

  const handleMouseLeave = () => {
    x.set(0)
    y.set(0)
  }

  const toggleSeat = async (seatId: string) => {
    if (!showtimeId || !userId) return
    
    // Don't allow selection of booked seats
    if (bookedSeats.includes(seatId)) {
      setError('This seat is already booked')
      return
    }

    const isSelected = selected.includes(seatId)
    setLoading(seatId)
    setError(null)

    try {
      if (!isSelected) {
        const res = await fetch('/api/seats/lock', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ showtimeId, seatIds: [seatId], userId }),
        })
        if (!res.ok) {
          const errorData = await res.json().catch(() => ({}))
          throw new Error(errorData.error || 'Seat already locked')
        }
        setSelected((prev) => {
          const next = [...prev, seatId]
          onSelect?.(next)
          return next
        })
        // Remove from locked list since user now owns it
        setCurrentLockedSeats((prev) => prev.filter((id) => id !== seatId))
      } else {
        await fetch('/api/seats/release', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ showtimeId, seatIds: [seatId], userId }),
        })
        setSelected((prev) => {
          const next = prev.filter((id) => id !== seatId)
          onSelect?.(next)
          return next
        })
        // Seat is now released, will be picked up by the periodic refresh
      }
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(null)
    }
  }

  const handleLockSeats = async () => {
    if (selected.length === 0 || !showtimeId || !userId) return
    
    // Confetti explosion
    confetti({
      particleCount: 100,
      spread: 70,
      origin: { y: 0.6 },
      colors: ['#ffffff', '#a0a0a0', '#ffffff'],
    })
    
    // Navigate to payment page with selected seats
    window.location.href = `/payment/${showtimeId}?seats=${selected.join(',')}&userId=${userId}`
  }

  // Fetch locked seats from Redis on mount and periodically
  useEffect(() => {
    if (!showtimeId) return

    const fetchLockedSeats = async () => {
      try {
        const res = await fetch(`/api/seats/locked?showtimeId=${showtimeId}`)
        if (res.ok) {
          const data = await res.json()
          // Merge with initial locked seats
          const redisLocks = data.lockedSeats || []
          const allLocks = [...new Set([...initialLockedSeats, ...redisLocks])]
          // Remove user's selected seats from locked list (they should show as selected, not locked)
          setCurrentLockedSeats((prev) => {
            const filteredLocks = allLocks.filter(seatId => !selected.includes(seatId))
            return filteredLocks
          })
        }
      } catch (err) {
        console.error('Failed to fetch locked seats:', err)
      }
    }

    fetchLockedSeats()
    // Refresh every 2 seconds to get real-time updates
    const interval = setInterval(fetchLockedSeats, 2000)

    return () => clearInterval(interval)
  }, [showtimeId, initialLockedSeats, selected])

  useEffect(() => {
    // Calculate total price
    setTotalPrice(selected.length * pricePerSeat)
  }, [selected, pricePerSeat])

  // Group seats by row
  const seatsByRow = seats.reduce((acc, seat) => {
    if (!acc[seat.row]) acc[seat.row] = []
    acc[seat.row].push(seat)
    return acc
  }, {} as Record<string, Seat[]>)

  const getSeatColor = (seat: Seat, isLocked: boolean, isBooked: boolean, isSelected: boolean) => {
    if (isBooked) return 'bg-gray-800/50 border-gray-600/50 cursor-not-allowed opacity-60'
    if (isLocked && !isSelected) return 'bg-red-500/20 border-red-500/50'
    if (isSelected) return 'bg-white/10 border-white hover:border-white/80'
    if (seat.type === 'VIP') return 'bg-white/5 border-white/20 hover:border-white/40'
    if (seat.type === 'PREMIUM') return 'bg-white/5 border-white/15 hover:border-white/30'
    return 'bg-white/5 border-white/10 hover:border-white/30'
  }

  return (
    <div className="relative space-y-8">
      {/* Screen LED */}
      <div className="px-4">
        <div className="w-full max-w-5xl mx-auto h-12 glass-strong rounded-2xl border border-white/20 flex items-center justify-center text-white font-clash font-bold tracking-[0.6rem] text-xl">
          SCREEN
        </div>
      </div>

      {/* Seat Legend */}
      <div className="flex flex-wrap items-center justify-center gap-6 glass rounded-xl p-4">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg border-2 border-gray-600 bg-gray-700/50"></div>
          <span className="text-sm text-gray-300">Standard</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg border-2 border-purple-500 bg-gradient-to-br from-purple-500/20 to-purple-700/20"></div>
          <span className="text-sm text-gray-300">Premium</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg border-2 border-yellow-400 bg-gradient-to-br from-yellow-400/20 to-yellow-600/20 relative">
            <span className="absolute -top-1 -right-1 text-yellow-400 text-xs">👑</span>
          </div>
          <span className="text-sm text-gray-300">VIP</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg border-2 border-gray-600 bg-gray-800/50"></div>
          <span className="text-sm text-gray-300">Booked</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg border-2 border-red-500 bg-red-600/50"></div>
          <span className="text-sm text-gray-300">Locked</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg border-2 border-white bg-white/10"></div>
          <span className="text-sm text-gray-300">Selected</span>
        </div>
      </div>

      {/* 3D Seat Grid */}
      <motion.div
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
        style={{
          rotateX,
          rotateY,
          transformStyle: 'preserve-3d',
        }}
        className="perspective-1000"
      >
        <div className="space-y-3 max-w-5xl mx-auto px-4">
          {Object.entries(seatsByRow).map(([row, rowSeats]) => (
            <div key={row} className="flex items-center justify-center gap-3">
              <span className="text-white/60 font-clash font-semibold w-10 text-center">{row}</span>
              <div className="flex gap-2 flex-wrap justify-center">
                {rowSeats.map((seat) => {
                  const isBooked = bookedSeats.includes(seat.id)
                  const isLocked = currentLockedSeats.includes(seat.id) && !selected.includes(seat.id) && !isBooked
                  const isSelected = selected.includes(seat.id)
                  return (
                    <motion.button
                      key={seat.id}
                      disabled={isBooked || (isLocked && !isSelected) || !!loading}
                      onClick={() => toggleSeat(seat.id)}
                      whileHover={!isBooked ? { scale: 1.1, z: 20 } : {}}
                      whileTap={!isBooked ? { scale: 0.95 } : {}}
                      className={`
                        w-10 h-10 md:w-12 md:h-12 rounded-lg border-2 font-bold text-xs
                        transition-all duration-300
                        ${!isBooked ? 'cursor-pointer' : 'cursor-not-allowed'}
                        ${getSeatColor(seat, isLocked, isBooked, isSelected)}
                        ${isSelected ? 'glow-subtle' : ''}
                        ${seat.type === 'VIP' ? 'relative' : ''}
                        disabled:opacity-50 disabled:cursor-not-allowed
                        ${!isBooked ? 'hover:scale-110' : ''}
                      `}
                      title={isBooked ? 'Already Booked' : ''}
                    >
                      {seat.type === 'VIP' && (
                        <span className="absolute -top-1 -right-1 text-white/80 text-xs">👑</span>
                      )}
                      {seat.number}
                    </motion.button>
                  )
                })}
              </div>
            </div>
          ))}
        </div>
      </motion.div>

      {/* Floating Badge */}
      {selected.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="fixed bottom-32 md:bottom-24 left-1/2 transform -translate-x-1/2 z-50 glass-strong rounded-full px-6 py-3 border border-white/20 shadow-lg"
        >
          <div className="flex items-center gap-4">
            <span className="text-white font-clash font-semibold text-sm md:text-base">
              {selected.length} seat{selected.length > 1 ? 's' : ''} selected
            </span>
            <span className="text-white font-clash font-bold text-lg md:text-xl">
              ₹{totalPrice}
            </span>
          </div>
        </motion.div>
      )}

      {/* Lock Seats Button */}
      {selected.length > 0 && (
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="mt-12 text-center"
        >
          <motion.button
            onClick={handleLockSeats}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="px-8 py-4 bg-white text-black rounded-full font-clash font-semibold text-base md:text-lg hover:bg-white/90 transition-colors shadow-lg"
          >
            Lock {selected.length} Seat{selected.length > 1 ? 's' : ''} & Continue →
          </motion.button>
        </motion.div>
      )}

      {error && (
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center text-red-400 mt-4"
        >
          {error}
        </motion.p>
      )}

      <style jsx>{`
        .perspective-1000 {
          perspective: 1000px;
        }
      `}</style>
    </div>
  )
}


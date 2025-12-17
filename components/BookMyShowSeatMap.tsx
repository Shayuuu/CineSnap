'use client'

import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
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

// Price mapping based on seat type
const getSeatPrice = (type?: string | null, basePrice: number = 500): number => {
  if (!type) return basePrice < 800 ? 800 : basePrice
  
  const normalizedType = String(type).toUpperCase()
  switch (normalizedType) {
    case 'VIP':
      return 1500
    case 'PREMIUM':
      return 1000
    case 'STANDARD':
      return basePrice < 800 ? 800 : basePrice
    default:
      return basePrice < 800 ? 800 : basePrice
  }
}

// Get price tier label
const getPriceTierLabel = (type?: string | null, basePrice: number = 500): string => {
  if (!type) return basePrice < 900 ? 'NORMAL' : 'EXECUTIVE'
  
  const normalizedType = String(type).toUpperCase()
  switch (normalizedType) {
    case 'VIP':
      return 'VIP'
    case 'PREMIUM':
      return 'PREMIUM'
    case 'STANDARD':
      return basePrice < 900 ? 'NORMAL' : 'EXECUTIVE'
    default:
      return basePrice < 900 ? 'NORMAL' : 'EXECUTIVE'
  }
}

export default function BookMyShowSeatMap({
  seats = [],
  lockedSeats: initialLockedSeats = [],
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
  const [currentLockedSeats, setCurrentLockedSeats] = useState<string[]>(initialLockedSeats || [])

  // Sync selected seats with parent component via useEffect (avoid setState during render)
  useEffect(() => {
    if (onSelect) {
      onSelect(selected)
    }
  }, [selected, onSelect])

  const toggleSeat = async (seatId: string) => {
    if (!showtimeId || !userId) return
    
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
          return next
        })
        setCurrentLockedSeats((prev) => prev.filter((id) => id !== seatId))
      } else {
        await fetch('/api/seats/release', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ showtimeId, seatIds: [seatId], userId }),
        })
        setSelected((prev) => {
          const next = prev.filter((id) => id !== seatId)
          return next
        })
      }
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(null)
    }
  }

  const handleLockSeats = async () => {
    if (selected.length === 0 || !showtimeId || !userId) return
    
    confetti({
      particleCount: 100,
      spread: 70,
      origin: { y: 0.6 },
      colors: ['#ffffff', '#a0a0a0', '#ffffff'],
    })
    
    // Calculate prices for each selected seat
    const seatPrices = selected.map(seatId => {
      const seat = seats.find(s => s && s.id === seatId)
      return seat ? getSeatPrice(seat.type, pricePerSeat) : pricePerSeat
    })
    const pricesParam = seatPrices.join(',')
    
    window.location.href = `/payment/${showtimeId}?seats=${selected.join(',')}&prices=${pricesParam}&userId=${userId}`
  }

  // Fetch locked seats periodically
  useEffect(() => {
    if (!showtimeId) return

    const fetchLockedSeats = async () => {
      try {
        const res = await fetch(`/api/seats/locked?showtimeId=${showtimeId}`)
        if (res.ok) {
          const data = await res.json()
          const redisLocks = data.lockedSeats || []
          const allLocks = [...new Set([...initialLockedSeats, ...redisLocks])]
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
    const interval = setInterval(fetchLockedSeats, 2000)
    return () => clearInterval(interval)
  }, [showtimeId, initialLockedSeats, selected])

  useEffect(() => {
    // Calculate total price based on seat types
    if (!seats || seats.length === 0) {
      setTotalPrice(0)
      return
    }
    
    const total = selected.reduce((sum, seatId) => {
      const seat = seats.find(s => s && s.id === seatId)
      if (!seat) return sum
      return sum + getSeatPrice(seat.type, pricePerSeat)
    }, 0)
    setTotalPrice(total)
  }, [selected, seats, pricePerSeat])

  // Filter out invalid seats
  const validSeats = (seats || []).filter(seat => 
    seat && 
    seat.id && 
    seat.row && 
    typeof seat.number === 'number'
  )

  // Early return if no seats
  if (!validSeats || validSeats.length === 0) {
    return (
      <div className="w-full space-y-6">
        <div className="text-center py-12">
          <p className="text-white/60">No seats available for this showtime.</p>
        </div>
      </div>
    )
  }

  // Organize seats by price tier, then by row
  const seatsByTier = validSeats.reduce((acc, seat) => {
    const price = getSeatPrice(seat.type, pricePerSeat)
    const tier = getPriceTierLabel(seat.type, pricePerSeat)
    const tierKey = `${tier}_${price}`
    
    if (!acc[tierKey]) {
      acc[tierKey] = {
        tier,
        price,
        rows: {} as Record<string, Seat[]>
      }
    }
    
    if (!acc[tierKey].rows[seat.row]) {
      acc[tierKey].rows[seat.row] = []
    }
    
    acc[tierKey].rows[seat.row].push(seat)
    return acc
  }, {} as Record<string, { tier: string; price: number; rows: Record<string, Seat[]> }>)

  // Sort tiers by price (lowest first, so VIP is at bottom)
  const sortedTiers = Object.values(seatsByTier).sort((a, b) => a.price - b.price)

  // Sort rows alphabetically (M to A, like BookMyShow)
  const sortRows = (rows: Record<string, Seat[]>) => {
    return Object.entries(rows).sort(([a], [b]) => {
      // Sort in reverse alphabetical order (M, L, K... A)
      return b.localeCompare(a)
    })
  }

  const getSeatStatus = (seat: Seat, isLocked: boolean, isBooked: boolean, isSelected: boolean) => {
    if (isBooked) {
      return {
        bg: 'bg-gray-600',
        border: 'border-gray-600',
        text: 'text-white',
        label: 'Sold'
      }
    }
    if (isSelected) {
      return {
        bg: 'bg-green-500',
        border: 'border-green-500',
        text: 'text-white font-bold',
        label: 'Selected'
      }
    }
    if (isLocked) {
      return {
        bg: 'bg-red-500/30',
        border: 'border-red-500',
        text: 'text-white',
        label: 'Locked'
      }
    }
    return {
      bg: 'bg-white',
      border: 'border-green-500',
      text: 'text-gray-900 font-semibold',
      label: 'Available'
    }
  }

  return (
    <div className="w-full max-w-6xl mx-auto space-y-6 sm:space-y-8 px-3 sm:px-4">
      {/* Enhanced Screen Bar */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative w-full py-8 bg-gradient-to-b from-gray-900 via-gray-800 to-gray-900 border-y-2 border-gray-700 rounded-xl overflow-hidden"
      >
        {/* Animated background glow */}
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent animate-shimmer"></div>
        
        <div className="relative text-center">
          <div className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-white tracking-[0.2em] sm:tracking-[0.3em] md:tracking-[0.4em] mb-3 sm:mb-4 drop-shadow-lg">
            SCREEN
          </div>
          <div className="h-1 sm:h-1.5 w-32 sm:w-40 md:w-48 mx-auto bg-gradient-to-r from-transparent via-white/60 to-transparent rounded-full shadow-lg shadow-white/20"></div>
          
          {/* Decorative elements */}
          <div className="absolute top-2 left-4 text-2xl opacity-20">🎬</div>
          <div className="absolute top-2 right-4 text-2xl opacity-20">🎬</div>
        </div>
      </motion.div>

      {/* Seat Map by Price Tiers */}
      <div className="space-y-10">
        {sortedTiers.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-white/60 text-lg">No seats available.</p>
          </div>
        ) : (
          sortedTiers.map((tierData, tierIndex) => {
          const sortedRows = sortRows(tierData.rows)
          
          return (
            <motion.div
              key={`${tierData.tier}_${tierData.price}`}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: tierIndex * 0.1 }}
              className="space-y-5"
            >
              {/* Enhanced Price Tier Header */}
              <div className="flex items-center justify-center px-4 mb-4">
                <div className="glass-strong rounded-full px-6 py-3 border border-white/20 shadow-lg">
                  <div className="flex items-center gap-3">
                    <span className="text-lg md:text-xl font-bold text-white">
                      ₹{tierData.price}
                    </span>
                    <div className="h-6 w-px bg-white/30"></div>
                    <span className="text-base md:text-lg font-semibold text-white/90">
                      {tierData.tier}
                    </span>
                  </div>
                </div>
              </div>

              {/* Rows */}
              <div className="space-y-3">
                {sortedRows.map(([row, rowSeats], rowIndex) => {
                  // Sort seats by number
                  const sortedSeats = [...rowSeats].sort((a, b) => a.number - b.number)
                  
                  return (
                    <motion.div
                      key={row}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: (tierIndex * 0.1) + (rowIndex * 0.05) }}
                      className="flex items-center gap-4 justify-center"
                    >
                      {/* Enhanced Row Label */}
                      <div className="w-10 text-center">
                        <div className="glass rounded-lg px-2 py-1 border border-white/10">
                          <span className="text-sm font-bold text-white">{row}</span>
                        </div>
                      </div>
                      
                      {/* Seats with Aisle Markers */}
                      <div className="flex gap-1.5 sm:gap-2 flex-wrap justify-center items-center">
                        {sortedSeats.map((seat, seatIndex) => {
                          const isBooked = bookedSeats.includes(seat.id)
                          const isLocked = currentLockedSeats.includes(seat.id) && !selected.includes(seat.id) && !isBooked
                          const isSelected = selected.includes(seat.id)
                          const status = getSeatStatus(seat, isLocked, isBooked, isSelected)
                          
                          // Determine seat type for 3D design
                          const seatType = seat.type || 'STANDARD'
                          const isVip = seatType === 'VIP'
                          const isPremium = seatType === 'PREMIUM'
                          const isNormal = seatType === 'STANDARD' || !seatType
                          
                          // Add aisle marker every 5 seats
                          const showAisle = seatIndex > 0 && seatIndex % 5 === 0
                          
                          return (
                            <React.Fragment key={seat.id}>
                              {showAisle && (
                                <div className="w-6 text-center">
                                  <div className="h-full w-0.5 bg-white/10 mx-auto"></div>
                                </div>
                              )}
                              <motion.button
                                disabled={isBooked || (isLocked && !isSelected) || !!loading}
                                onClick={() => toggleSeat(seat.id)}
                                whileHover={!isBooked && !isLocked ? { 
                                  scale: 1.15, 
                                  y: -4,
                                  rotateY: 5,
                                  z: 10
                                } : {}}
                                whileTap={!isBooked && !isLocked ? { scale: 0.9 } : {}}
                                className={`
                                  relative transition-all duration-200
                                  ${!isBooked && !isLocked ? 'cursor-pointer' : 'cursor-not-allowed'}
                                  disabled:opacity-50
                                  ${isSelected ? 'shadow-2xl shadow-green-500/60 ring-2 ring-green-400 ring-offset-2 ring-offset-gray-900' : ''}
                                  ${isVip ? 'w-12 h-10 sm:w-14 sm:h-12 md:w-16 md:h-14' : isPremium ? 'w-10 h-9 sm:w-11 sm:h-10 md:w-13 md:h-11' : 'w-9 h-8 sm:w-10 sm:h-9 md:w-12 md:h-10'}
                                  transform-gpu
                                `}
                                title={`${seat.row}${seat.number} - ${isBooked ? 'Sold' : isLocked ? 'Locked' : isSelected ? 'Selected' : 'Available'} - ₹${getSeatPrice(seat.type, pricePerSeat)}`}
                              >
                              {/* Enhanced 3D Seat Design with Glow */}
                              <div className={`
                                relative w-full h-full rounded-lg
                                ${isBooked ? 'opacity-50' : ''}
                                ${isSelected ? 'animate-pulse-glow' : ''}
                                transition-all duration-300
                              `}>
                                {/* Glow effect for selected seats */}
                                {isSelected && (
                                  <div className="absolute inset-0 rounded-lg bg-green-500/30 blur-md -z-10 animate-pulse"></div>
                                )}
                                {isVip ? (
                                  // Enhanced VIP Sofa Seat (Black with Gold accents)
                                  <div className={`
                                    w-full h-full rounded-lg
                                    ${isBooked ? 'bg-gray-600' : isSelected ? 'bg-gradient-to-br from-green-500 to-green-600' : isLocked ? 'bg-red-500/30 border-2 border-red-500' : 'bg-gradient-to-br from-gray-900 to-black border-2 border-gray-700'}
                                    transform perspective-1000
                                    shadow-xl
                                    relative overflow-hidden
                                  `} style={{
                                    transform: 'perspective(500px) rotateX(5deg)',
                                    boxShadow: isBooked ? 'none' : isSelected 
                                      ? '0 6px 20px rgba(34, 197, 94, 0.6), inset 0 2px 4px rgba(0,0,0,0.3), 0 0 15px rgba(34, 197, 94, 0.4)' 
                                      : isLocked
                                      ? '0 4px 12px rgba(239, 68, 68, 0.4), inset 0 2px 4px rgba(0,0,0,0.3)'
                                      : '0 4px 12px rgba(0,0,0,0.5), inset 0 2px 4px rgba(0,0,0,0.3)'
                                  }}>
                                    {/* VIP Badge */}
                                    {!isBooked && !isLocked && (
                                      <div className="absolute top-0 right-0 w-3 h-3 bg-gradient-to-br from-yellow-400 to-yellow-600 rounded-bl-lg"></div>
                                    )}
                                    {/* Sofa back */}
                                    <div className={`
                                      absolute top-0 left-0 right-0 h-3 rounded-t-lg
                                      ${isBooked ? 'bg-gray-700' : isSelected ? 'bg-green-600' : isLocked ? 'bg-red-600/40' : 'bg-black'}
                                      border-b-2 border-gray-800
                                    `}></div>
                                    {/* Sofa seat */}
                                    <div className={`
                                      absolute bottom-0 left-0 right-0 h-5 rounded-b-lg
                                      ${isBooked ? 'bg-gray-600' : isSelected ? 'bg-green-500' : isLocked ? 'bg-red-500/30' : 'bg-gray-900'}
                                    `}></div>
                                    {/* Sofa armrests */}
                                    <div className="absolute left-0 top-0 bottom-0 w-1 bg-gray-800 rounded-l-lg"></div>
                                    <div className="absolute right-0 top-0 bottom-0 w-1 bg-gray-800 rounded-r-lg"></div>
                                  </div>
                                ) : isPremium ? (
                                      // Enhanced Premium Comfy Seat (Red with gradient)
                                      <div className={`
                                        w-full h-full rounded-md
                                        ${isBooked ? 'bg-gray-600' : isSelected ? 'bg-gradient-to-br from-green-500 to-green-600' : isLocked ? 'bg-red-500/30 border-2 border-red-500' : 'bg-gradient-to-br from-red-600 to-red-800 border-2 border-red-700'}
                                        transform perspective-1000
                                        shadow-lg
                                        relative overflow-hidden
                                      `} style={{
                                        transform: 'perspective(400px) rotateX(8deg) translateY(-1px)',
                                        boxShadow: isBooked ? 'none' : isSelected 
                                          ? '0 5px 15px rgba(34, 197, 94, 0.6), inset 0 1px 3px rgba(0,0,0,0.2), 0 0 12px rgba(34, 197, 94, 0.4)' 
                                          : isLocked
                                          ? '0 3px 10px rgba(239, 68, 68, 0.4), inset 0 1px 3px rgba(0,0,0,0.2)'
                                          : '0 3px 10px rgba(220, 38, 38, 0.5), inset 0 1px 3px rgba(0,0,0,0.2)'
                                      }}>
                                    {/* Elevated seat cushion */}
                                    <div className={`
                                      absolute bottom-0 left-0 right-0 h-4 rounded-b-md
                                      ${isBooked ? 'bg-gray-500' : isSelected ? 'bg-green-400' : isLocked ? 'bg-red-400/40' : 'bg-red-500'}
                                    `}></div>
                                    {/* Back support */}
                                    <div className={`
                                      absolute top-0 left-0 right-0 h-2.5 rounded-t-md
                                      ${isBooked ? 'bg-gray-700' : isSelected ? 'bg-green-600' : isLocked ? 'bg-red-700/40' : 'bg-red-700'}
                                    `}></div>
                                  </div>
                                ) : (
                                      // Enhanced Normal Seat (Blue with gradient)
                                      <div className={`
                                        w-full h-full rounded
                                        ${isBooked ? 'bg-gray-600' : isSelected ? 'bg-gradient-to-br from-green-500 to-green-600' : isLocked ? 'bg-red-500/30 border-2 border-red-500' : 'bg-gradient-to-br from-blue-600 to-blue-800 border-2 border-blue-700'}
                                        transform perspective-1000
                                        shadow-md
                                        relative overflow-hidden
                                      `} style={{
                                        transform: 'perspective(300px) rotateX(10deg)',
                                        boxShadow: isBooked ? 'none' : isSelected 
                                          ? '0 4px 12px rgba(34, 197, 94, 0.6), inset 0 1px 2px rgba(0,0,0,0.2), 0 0 10px rgba(34, 197, 94, 0.4)' 
                                          : isLocked
                                          ? '0 2px 8px rgba(239, 68, 68, 0.4), inset 0 1px 2px rgba(0,0,0,0.2)'
                                          : '0 2px 8px rgba(37, 99, 235, 0.4), inset 0 1px 2px rgba(0,0,0,0.2)'
                                      }}>
                                    {/* Simple seat base */}
                                    <div className={`
                                      absolute bottom-0 left-0 right-0 h-3 rounded-b
                                      ${isBooked ? 'bg-gray-500' : isSelected ? 'bg-green-400' : isLocked ? 'bg-red-400/40' : 'bg-blue-500'}
                                    `}></div>
                                    {/* Simple back */}
                                    <div className={`
                                      absolute top-0 left-0 right-0 h-2 rounded-t
                                      ${isBooked ? 'bg-gray-700' : isSelected ? 'bg-green-600' : isLocked ? 'bg-red-700/40' : 'bg-blue-700'}
                                    `}></div>
                                  </div>
                                )}
                              </div>
                            </motion.button>
                            </React.Fragment>
                          )
                        })}
                      </div>
                    </motion.div>
                  )
                })}
              </div>
            </motion.div>
          )
        }))}
      </div>

      {/* Enhanced Legend */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass-strong rounded-2xl p-6 border border-white/20 max-w-4xl mx-auto mt-8"
      >
        <div className="flex flex-wrap items-center justify-center gap-8">
          <div className="flex items-center gap-3 group">
            <motion.div 
              whileHover={{ scale: 1.1 }}
              className="w-8 h-6 rounded bg-gradient-to-br from-blue-600 to-blue-800 border-2 border-blue-700 shadow-md" 
              style={{ transform: 'perspective(300px) rotateX(10deg)' }}
            ></motion.div>
            <span className="text-sm font-semibold text-white/90">Normal</span>
          </div>
          <div className="flex items-center gap-3 group">
            <motion.div 
              whileHover={{ scale: 1.1 }}
              className="w-8 h-6 rounded-md bg-gradient-to-br from-red-600 to-red-800 border-2 border-red-700 shadow-md" 
              style={{ transform: 'perspective(400px) rotateX(8deg)' }}
            ></motion.div>
            <span className="text-sm font-semibold text-white/90">Premium</span>
          </div>
          <div className="flex items-center gap-3 group">
            <motion.div 
              whileHover={{ scale: 1.1 }}
              className="w-10 h-6 rounded-lg bg-gradient-to-br from-gray-900 to-black border-2 border-gray-700 shadow-md" 
              style={{ transform: 'perspective(500px) rotateX(5deg)' }}
            ></motion.div>
            <span className="text-sm font-semibold text-white/90">VIP</span>
          </div>
          <div className="flex items-center gap-3 group">
            <motion.div 
              whileHover={{ scale: 1.1 }}
              className="w-8 h-6 rounded-lg border-2 border-green-500 bg-gradient-to-br from-green-500 to-green-600 shadow-lg shadow-green-500/50"
            ></motion.div>
            <span className="text-sm font-semibold text-white/90">Selected</span>
          </div>
          <div className="flex items-center gap-3 group">
            <motion.div 
              whileHover={{ scale: 1.1 }}
              className="w-8 h-6 rounded-lg border-2 border-gray-600 bg-gray-600 shadow-lg opacity-60"
            ></motion.div>
            <span className="text-sm font-semibold text-white/90">Sold</span>
          </div>
          <div className="flex items-center gap-3 group">
            <motion.div 
              whileHover={{ scale: 1.1 }}
              className="w-8 h-6 rounded-lg border-2 border-red-500 bg-red-500/20 shadow-lg"
            ></motion.div>
            <span className="text-sm font-semibold text-white/90">Locked</span>
          </div>
        </div>
      </motion.div>

      {/* Enhanced Selected Seats Summary */}
      {selected.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 50 }}
          className="fixed bottom-4 sm:bottom-6 left-1/2 transform -translate-x-1/2 z-50 glass-strong rounded-xl sm:rounded-2xl px-4 sm:px-6 md:px-8 py-4 sm:py-5 border-2 border-white/30 shadow-2xl backdrop-blur-xl w-[calc(100%-2rem)] sm:w-auto max-w-[calc(100vw-2rem)]"
        >
          <div className="flex flex-col sm:flex-row items-center gap-4 sm:gap-6 md:gap-8">
            <div className="flex items-center gap-3 sm:gap-4">
              <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-gradient-to-br from-green-500 to-green-600 flex items-center justify-center shadow-lg">
                <span className="text-lg sm:text-xl">🎫</span>
              </div>
              <div>
                <div className="text-xs text-white/60 uppercase tracking-wide">Selected Seats</div>
                <div className="text-lg sm:text-xl font-bold text-white">
                  {selected.length} Ticket{selected.length > 1 ? 's' : ''}
                </div>
              </div>
            </div>
            <div className="hidden sm:block h-14 w-px bg-gradient-to-b from-transparent via-white/30 to-transparent"></div>
            <div className="text-center sm:text-left">
              <div className="text-xs text-white/60 uppercase tracking-wide">Total Amount</div>
              <div className="text-xl sm:text-2xl font-bold text-white">
                ₹{totalPrice}
              </div>
            </div>
            <motion.button
              onClick={handleLockSeats}
              whileHover={{ scale: 1.05, y: -2, boxShadow: '0 10px 30px rgba(220, 38, 38, 0.5)' }}
              whileTap={{ scale: 0.95 }}
              className="ml-6 px-8 py-4 bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white rounded-xl font-bold text-base transition-all shadow-xl shadow-red-600/30 flex items-center gap-2 relative overflow-hidden group"
            >
              {/* Shine effect */}
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700"></div>
              <span className="relative z-10">Proceed</span>
              <motion.svg 
                className="w-5 h-5 relative z-10" 
                fill="none" 
                stroke="currentColor" 
                viewBox="0 0 24 24"
                animate={{ x: [0, 5, 0] }}
                transition={{ duration: 1.5, repeat: Infinity }}
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
              </motion.svg>
            </motion.button>
          </div>
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
    </div>
  )
}


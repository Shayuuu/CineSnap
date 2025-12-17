'use client'

import { useState } from 'react'

type Seat = {
  id: string
  row: string
  number: number
}

type Props = {
  seats: Seat[]
  lockedSeats: string[]
  onSelect?: (seatIds: string[]) => void
  showtimeId?: string
  userId?: string
}

export default function SeatMap({
  seats,
  lockedSeats,
  onSelect,
  showtimeId,
  userId,
}: Props) {
  const [selected, setSelected] = useState<string[]>([])
  const [loading, setLoading] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  const toggleSeat = async (seatId: string) => {
    if (!showtimeId || !userId) return

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
        if (!res.ok) throw new Error('Seat already locked')
        setSelected((prev) => {
          const next = [...prev, seatId]
          onSelect?.(next)
          return next
        })
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
      }
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(null)
    }
  }

  return (
    <div className="space-y-3 sm:space-y-4">
      {error && <p className="text-sm text-red-600 px-2">{error}</p>}
      {/* Screen indicator */}
      <div className="text-center mb-4 sm:mb-6">
        <div className="inline-block px-4 sm:px-6 py-2 sm:py-3 glass rounded-lg border border-white/20">
          <p className="text-white/80 text-xs sm:text-sm font-semibold">SCREEN</p>
        </div>
      </div>
      
      {/* Seat Map - Responsive grid */}
      <div className="grid grid-cols-12 gap-1.5 sm:gap-2 max-w-2xl mx-auto px-2 sm:px-0">
        {seats.map((seat) => {
          const isLocked = lockedSeats.includes(seat.id)
          const isSelected = selected.includes(seat.id)
          return (
            <button
              key={seat.id}
              disabled={(isLocked && !isSelected) || !!loading}
              onClick={() => toggleSeat(seat.id)}
              className={`
                w-7 h-7 sm:w-10 sm:h-10 
                rounded text-[10px] sm:text-xs font-bold transition-all
                touch-manipulation
                active:scale-95
                ${isLocked && !isSelected ? 'bg-red-600 text-white cursor-not-allowed' : ''}
                ${
                  isSelected
                    ? 'bg-green-500 text-white shadow-lg shadow-green-500/50 scale-105'
                    : 'bg-gray-300 hover:bg-blue-400 active:bg-blue-500'
                }
                ${loading === seat.id ? 'opacity-50 cursor-wait' : ''}
              `}
              aria-label={`Seat ${seat.row}${seat.number}${isLocked ? ' - Occupied' : isSelected ? ' - Selected' : ''}`}
            >
              {seat.row}
              {seat.number}
            </button>
          )
        })}
      </div>
      
      {/* Legend */}
      <div className="flex flex-wrap items-center justify-center gap-3 sm:gap-4 mt-4 sm:mt-6 px-2">
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 sm:w-5 sm:h-5 bg-gray-300 rounded"></div>
          <span className="text-white/70 text-xs sm:text-sm">Available</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 sm:w-5 sm:h-5 bg-green-500 rounded"></div>
          <span className="text-white/70 text-xs sm:text-sm">Selected</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 sm:w-5 sm:h-5 bg-red-600 rounded"></div>
          <span className="text-white/70 text-xs sm:text-sm">Occupied</span>
        </div>
      </div>
    </div>
  )
}



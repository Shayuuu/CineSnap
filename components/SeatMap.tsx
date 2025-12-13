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
    <div className="space-y-3">
      {error && <p className="text-sm text-red-600">{error}</p>}
      <div className="grid grid-cols-12 gap-2 max-w-2xl mx-auto">
        {seats.map((seat) => {
          const isLocked = lockedSeats.includes(seat.id)
          const isSelected = selected.includes(seat.id)
          return (
            <button
              key={seat.id}
              disabled={(isLocked && !isSelected) || !!loading}
              onClick={() => toggleSeat(seat.id)}
              className={`w-10 h-10 rounded text-xs font-bold transition
                ${isLocked && !isSelected ? 'bg-red-600 text-white' : ''}
                ${
                  isSelected
                    ? 'bg-green-500 text-white'
                    : 'bg-gray-300 hover:bg-blue-400'
                }`}
            >
              {seat.row}
              {seat.number}
            </button>
          )
        })}
      </div>
    </div>
  )
}


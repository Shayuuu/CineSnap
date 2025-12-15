'use client'

import { useEffect, useRef, useState } from 'react'
import { motion } from 'framer-motion'

type Seat = {
  id: string
  row: string
  number: number
  type: string
}

type Props = {
  seats: Seat[]
  selectedSeats: string[]
  onSeatClick?: (seatId: string) => void
}

export default function ARSeatPreview({ seats, selectedSeats, onSeatClick }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [is3D, setIs3D] = useState(true)
  const [cameraAngle, setCameraAngle] = useState({ x: 0, y: 0 })

  // Organize seats by row
  const seatsByRow = seats.reduce((acc, seat) => {
    if (!acc[seat.row]) acc[seat.row] = []
    acc[seat.row].push(seat)
    return acc
  }, {} as Record<string, Seat[]>)

  const rows = Object.keys(seatsByRow).sort()
  const maxSeatsPerRow = Math.max(...rows.map(row => seatsByRow[row].length))

  useEffect(() => {
    if (!canvasRef.current) return

    const canvas = canvasRef.current
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    // Set canvas size
    canvas.width = canvas.offsetWidth
    canvas.height = canvas.offsetHeight

    const centerX = canvas.width / 2
    const centerY = canvas.height / 2
    const seatSize = Math.min(canvas.width / (maxSeatsPerRow + 2), 20)
    const rowSpacing = seatSize * 1.5

    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height)

    // Draw screen at top
    ctx.fillStyle = 'rgba(255, 255, 255, 0.1)'
    ctx.fillRect(centerX - canvas.width * 0.3, 20, canvas.width * 0.6, 30)
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.3)'
    ctx.lineWidth = 2
    ctx.strokeRect(centerX - canvas.width * 0.3, 20, canvas.width * 0.6, 30)
    ctx.fillStyle = 'rgba(255, 255, 255, 0.8)'
    ctx.font = 'bold 14px sans-serif'
    ctx.textAlign = 'center'
    ctx.fillText('SCREEN', centerX, 42)

    // Draw seats in 3D perspective
    rows.forEach((row, rowIdx) => {
      const rowSeats = seatsByRow[row]
      const startX = centerX - (rowSeats.length * seatSize) / 2
      const y = 80 + rowIdx * rowSpacing

      rowSeats.forEach((seat, seatIdx) => {
        const x = startX + seatIdx * seatSize
        const isSelected = selectedSeats.includes(seat.id)

        // 3D perspective effect
        const perspective = is3D ? 1 + (rowIdx * 0.05) : 1
        const offsetX = is3D ? (rowIdx - rows.length / 2) * 2 : 0

        // Draw seat
        ctx.save()
        ctx.translate(x + offsetX, y)
        ctx.scale(perspective, perspective)

        if (isSelected) {
          ctx.fillStyle = 'rgba(255, 255, 255, 0.9)'
          ctx.strokeStyle = 'rgba(255, 255, 255, 1)'
        } else if (seat.type === 'PREMIUM') {
          ctx.fillStyle = 'rgba(255, 215, 0, 0.6)'
          ctx.strokeStyle = 'rgba(255, 215, 0, 0.8)'
        } else {
          ctx.fillStyle = 'rgba(100, 100, 100, 0.4)'
          ctx.strokeStyle = 'rgba(150, 150, 150, 0.6)'
        }

        ctx.fillRect(-seatSize / 2, -seatSize / 2, seatSize, seatSize)
        ctx.lineWidth = 1
        ctx.strokeRect(-seatSize / 2, -seatSize / 2, seatSize, seatSize)

        // Seat label
        ctx.fillStyle = 'rgba(255, 255, 255, 0.9)'
        ctx.font = '8px sans-serif'
        ctx.textAlign = 'center'
        ctx.fillText(`${seat.row}${seat.number}`, 0, 2)

        ctx.restore()
      })
    })

    // Draw legend
    ctx.fillStyle = 'rgba(255, 255, 255, 0.8)'
    ctx.font = '12px sans-serif'
    ctx.textAlign = 'left'
    ctx.fillText('Selected', 20, canvas.height - 40)
    ctx.fillText('Premium', 20, canvas.height - 25)
    ctx.fillText('Available', 20, canvas.height - 10)

    ctx.fillStyle = 'rgba(255, 255, 255, 0.9)'
    ctx.fillRect(80, canvas.height - 45, 15, 15)
    ctx.fillStyle = 'rgba(255, 215, 0, 0.6)'
    ctx.fillRect(80, canvas.height - 30, 15, 15)
    ctx.fillStyle = 'rgba(100, 100, 100, 0.4)'
    ctx.fillRect(80, canvas.height - 15, 15, 15)
  }, [seats, selectedSeats, is3D, maxSeatsPerRow, rows, seatsByRow])

  return (
    <div className="w-full">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-xl font-clash font-semibold text-white">3D Seat Preview</h3>
        <div className="flex gap-2">
          <motion.button
            onClick={() => setIs3D(!is3D)}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="px-4 py-2 glass rounded-lg border border-white/10 text-white text-sm"
          >
            {is3D ? '2D View' : '3D View'}
          </motion.button>
        </div>
      </div>

      <div className="glass rounded-2xl p-6 border border-white/10">
        <canvas
          ref={canvasRef}
          className="w-full h-96 rounded-lg"
          style={{ background: 'rgba(0, 0, 0, 0.2)' }}
        />
      </div>

      <div className="mt-4 text-sm text-gray-400 text-center">
        <p>Interactive 3D preview of theater seating</p>
        <p className="text-xs mt-1">Click seats to select (if enabled)</p>
      </div>
    </div>
  )
}



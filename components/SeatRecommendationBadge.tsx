'use client'

import { motion } from 'framer-motion'

type Props = {
  seatIds: string[]
  reason: string
  totalPrice: number
  onSelect: (seatIds: string[]) => void
  isRecommended?: boolean
}

export default function SeatRecommendationBadge({
  seatIds,
  reason,
  totalPrice,
  onSelect,
  isRecommended = false,
}: Props) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className={`glass-enhanced rounded-xl p-4 border-2 ${
        isRecommended 
          ? 'border-cyan-400/50 shadow-lg shadow-cyan-400/20' 
          : 'border-white/20'
      }`}
    >
      <div className="flex items-start justify-between gap-4 mb-3">
        <div className="flex-1">
          {isRecommended && (
            <div className="flex items-center gap-2 mb-2">
              <span className="px-2 py-1 bg-gradient-to-r from-cyan-400 to-magenta-400 text-white text-xs font-bold rounded-full">
                ⭐ Recommended
              </span>
            </div>
          )}
          <p className="text-sm text-white/90 mb-1">
            {seatIds.length} {seatIds.length === 1 ? 'seat' : 'seats'}
          </p>
          <p className="text-xs text-gray-400">{reason}</p>
        </div>
        <div className="text-right">
          <p className="text-lg font-clash font-bold text-white">
            ₹{totalPrice / 100}
          </p>
        </div>
      </div>
      
      <button
        onClick={() => onSelect(seatIds)}
        disabled={seatIds.length === 0}
        className="w-full px-4 py-2 bg-gradient-to-r from-cyan-400 to-magenta-400 text-white rounded-lg font-semibold text-sm hover:shadow-lg hover:shadow-cyan-400/30 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
      >
        Lock Seats
      </button>
    </motion.div>
  )
}


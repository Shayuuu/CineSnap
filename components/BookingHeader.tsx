'use client'

import { motion } from 'framer-motion'

type Props = {
  movieTitle: string
  theaterName: string
  screenName: string
  showtime: string
  selectedCount?: number
}

export default function BookingHeader({ movieTitle, theaterName, screenName, showtime, selectedCount = 0 }: Props) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="mb-6"
    >
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <h1 className="text-2xl md:text-3xl font-bold text-white mb-2">
            {movieTitle}
          </h1>
          <p className="text-sm md:text-base text-gray-300">
            {theaterName}
          </p>
          <p className="text-sm text-gray-400">
            {showtime}
          </p>
        </div>
        {selectedCount > 0 && (
          <motion.div
            initial={{ scale: 0.9 }}
            animate={{ scale: 1 }}
            className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg font-semibold text-sm md:text-base transition-colors cursor-pointer"
          >
            {selectedCount} Ticket{selectedCount > 1 ? 's' : ''}
          </motion.div>
        )}
      </div>
    </motion.div>
  )
}


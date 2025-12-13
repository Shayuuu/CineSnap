'use client'

import { motion } from 'framer-motion'
import { formatDateTime } from '@/lib/dateUtils'

type Props = {
  showtimes: Array<{
    id: string
    startTime: string
    price: number
    movieTitle: string
    screenName: string
    theaterName: string
  }>
}

export default function AdminShowtimesClient({ showtimes }: Props) {
  return (
    <div className="min-h-screen pt-24 pb-32 px-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-7xl mx-auto"
      >
        <div className="mb-8">
          <h1 className="text-4xl md:text-5xl font-clash font-bold mb-2">
            <span className="text-white">Showtimes</span>
          </h1>
          <p className="text-gray-400">
            Upcoming screenings and seat maps
          </p>
        </div>

        <div className="space-y-4">
          {showtimes.map((show, index) => (
            <motion.div
              key={show.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.05 }}
              className="glass rounded-xl p-6 border border-white/10 hover:border-white/30 transition-all"
            >
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div>
                  <p className="font-clash font-semibold text-xl text-white mb-1">
                    {show.movieTitle}
                  </p>
                  <p className="text-sm text-gray-400">
                    <span className="text-white/70">{show.theaterName}</span>
                    {' • '}
                    <span>{show.screenName}</span>
                  </p>
                </div>
                <div className="flex items-center gap-4 text-sm">
                  <span className="text-gray-300">
                    {formatDateTime(show.startTime)}
                  </span>
                  <span className="px-3 py-1 glass rounded-full text-white font-semibold">
                    ₹{show.price / 100}
                  </span>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {showtimes.length === 0 && (
          <div className="glass rounded-2xl p-12 text-center">
            <p className="text-gray-400 text-lg">No showtimes scheduled</p>
          </div>
        )}
      </motion.div>
    </div>
  )
}


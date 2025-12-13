'use client'

import { motion } from 'framer-motion'
import { formatDate } from '@/lib/dateUtils'

type Props = {
  movies: Array<{
    id: string
    title: string
    genre: string
    duration: number
    releaseDate: string
  }>
}

export default function AdminMoviesClient({ movies }: Props) {
  return (
    <div className="min-h-screen pt-24 pb-32 px-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-7xl mx-auto"
      >
        <div className="mb-8">
          <h1 className="text-4xl md:text-5xl font-clash font-bold mb-2">
            <span className="text-white">Manage Movies</span>
          </h1>
          <p className="text-gray-400">
            Add, edit or remove movies and associated showtimes
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {movies.map((movie, index) => (
            <motion.div
              key={movie.id}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="glass rounded-xl p-6 border border-white/10 hover:border-white/30 transition-all"
            >
              <h3 className="font-clash font-semibold text-xl mb-3 text-white">
                {movie.title}
              </h3>
              <div className="space-y-2 text-sm">
                <p className="text-gray-400">
                  <span className="text-white/70">{movie.genre}</span>
                  {' • '}
                  <span>{movie.duration} mins</span>
                </p>
                <p className="text-gray-500 text-xs">
                  Release: {formatDate(movie.releaseDate)}
                </p>
              </div>
            </motion.div>
          ))}
        </div>

        {movies.length === 0 && (
          <div className="glass rounded-2xl p-12 text-center">
            <p className="text-gray-400 text-lg">No movies in database</p>
          </div>
        )}
      </motion.div>
    </div>
  )
}


'use client'

import { motion } from 'framer-motion'
import Link from 'next/link'
import Image from 'next/image'
import { formatDate } from '@/lib/dateUtils'
import WishlistButton from '@/components/WishlistButton'

type Movie = {
  id: string
  title: string
  genre?: string
  duration?: number
  releaseDate?: string
  posterUrl?: string
  rating?: number
  language?: string
}

type Props = {
  movies: Movie[]
}

export default function MoviesGrid({ movies }: Props) {
  return (
    <div className="min-h-screen pt-20 sm:pt-24 pb-20 sm:pb-32 px-4 sm:px-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-7xl mx-auto"
      >
        <div className="mb-8 sm:mb-12 text-center">
          <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-7xl font-clash font-bold mb-3 sm:mb-4">
            <span className="text-white">Now Showing</span>
          </h1>
          <p className="text-gray-400 text-sm sm:text-base md:text-lg px-4">
            Pick a movie to view showtimes and book seats
          </p>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4 md:gap-6">
          {movies.map((movie, index) => (
            <motion.div
              key={movie.id}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <Link href={`/movies/${movie.id}`}>
                <motion.div
                  whileHover={{ scale: 1.05, y: -10 }}
                  className="glass rounded-2xl overflow-hidden group cursor-pointer"
                >
                  <div className="aspect-[2/3] bg-white/5 border border-white/10 relative overflow-hidden">
                    {movie.posterUrl ? (
                      <>
                        <Image
                          src={movie.posterUrl}
                          alt={movie.title}
                          fill
                          className="object-cover"
                          sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
                          unoptimized
                        />
                        <div className="absolute top-3 right-3 z-10" onClick={(e) => e.preventDefault()}>
                          <WishlistButton movieId={movie.id} className="bg-black/50 backdrop-blur-sm rounded-full p-2" />
                        </div>
                        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                          <div className="absolute bottom-4 left-4 right-4">
                            <p className="text-white font-clash font-semibold text-lg mb-1">
                              {movie.title}
                            </p>
                            <p className="text-gray-300 text-sm">
                              {movie.genre} • {movie.duration} mins
                            </p>
                          </div>
                        </div>
                      </>
                    ) : (
                      <div className="absolute inset-0 flex items-center justify-center">
                        <span className="text-4xl font-clash font-bold text-white/30">
                          {movie.title?.charAt(0) || 'M'}
                        </span>
                      </div>
                    )}
                  </div>
                  <div className="p-4">
                    <h3 className="font-clash font-semibold text-lg mb-2 group-hover:text-white transition-colors">
                      {movie.title}
                    </h3>
                    <p className="text-xs text-gray-400 mb-1">
                      {movie.genre || 'Feature'} • {movie.duration ? `${movie.duration} mins` : '—'}
                    </p>
                    <p className="text-xs text-gray-500">
                      {movie.releaseDate ? formatDate(movie.releaseDate) : ''}
                    </p>
                    <div className="flex items-center gap-2 text-[11px] text-gray-400 mt-2">
                      {movie.rating !== undefined && (
                        <span className="px-2 py-1 glass rounded text-white/80">⭐ {movie.rating?.toFixed(1)}</span>
                      )}
                      {movie.language && (
                        <span className="px-2 py-1 glass rounded text-white/60 uppercase">{movie.language}</span>
                      )}
                    </div>
                  </div>
                </motion.div>
              </Link>
            </motion.div>
          ))}
        </div>

        {movies.length === 0 && (
          <div className="text-center py-20">
            <p className="text-gray-400 text-lg">No movies available yet</p>
          </div>
        )}
      </motion.div>
    </div>
  )
}


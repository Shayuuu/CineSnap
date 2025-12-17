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
                  whileHover={{ scale: 1.05, y: -10, rotateY: 5 }}
                  whileTap={{ scale: 0.98 }}
                  transition={{ type: "spring", stiffness: 300, damping: 20 }}
                  className="glass-enhanced rounded-2xl overflow-hidden group cursor-pointer hover-lift"
                >
                  <div className="aspect-[2/3] bg-gradient-to-br from-white/10 to-white/5 border border-white/10 relative overflow-hidden">
                    {movie.posterUrl ? (
                      <>
                        <motion.div
                          whileHover={{ scale: 1.1 }}
                          transition={{ duration: 0.5 }}
                          className="absolute inset-0"
                        >
                          <Image
                            src={movie.posterUrl}
                            alt={movie.title}
                            fill
                            className="object-cover"
                            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
                            unoptimized
                          />
                        </motion.div>
                        {/* Animated overlay gradient */}
                        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent opacity-0 group-hover:opacity-100 transition-all duration-500">
                          <div className="absolute inset-0 bg-gradient-to-r from-purple-500/10 via-transparent to-pink-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                        </div>
                        {/* Shine effect */}
                        <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500">
                          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>
                        </div>
                        <motion.div 
                          className="absolute top-3 right-3 z-10"
                          onClick={(e) => e.preventDefault()}
                          whileHover={{ scale: 1.1, rotate: 90 }}
                          whileTap={{ scale: 0.9 }}
                        >
                          <WishlistButton movieId={movie.id} className="bg-black/70 backdrop-blur-md rounded-full p-2 shadow-lg hover-glow" />
                        </motion.div>
                        {/* Rating badge with animation */}
                        {movie.rating !== undefined && (
                          <motion.div
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            transition={{ delay: index * 0.1 + 0.3, type: "spring" }}
                            className="absolute top-3 left-3 z-10 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-full px-2 py-1 shadow-lg"
                          >
                            <span className="text-xs font-bold text-white flex items-center gap-1">
                              ⭐ {movie.rating.toFixed(1)}
                            </span>
                          </motion.div>
                        )}
                        <motion.div 
                          className="absolute bottom-0 left-0 right-0 p-4 transform translate-y-full group-hover:translate-y-0 transition-transform duration-500"
                          initial={{ opacity: 0 }}
                          whileHover={{ opacity: 1 }}
                        >
                          <p className="text-white font-clash font-semibold text-lg mb-1 drop-shadow-lg">
                            {movie.title}
                          </p>
                          <p className="text-gray-300 text-sm">
                            {movie.genre} • {movie.duration} mins
                          </p>
                        </motion.div>
                      </>
                    ) : (
                      <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-purple-900/20 to-pink-900/20">
                        <motion.span 
                          className="text-4xl font-clash font-bold text-white/30"
                          animate={{ scale: [1, 1.1, 1] }}
                          transition={{ duration: 2, repeat: Infinity }}
                        >
                          {movie.title?.charAt(0) || 'M'}
                        </motion.span>
                      </div>
                    )}
                  </div>
                  <div className="p-4 bg-gradient-to-b from-transparent to-black/20">
                    <motion.h3 
                      className="font-clash font-semibold text-lg mb-2 group-hover:text-white transition-colors"
                      whileHover={{ x: 5 }}
                    >
                      {movie.title}
                    </motion.h3>
                    <p className="text-xs text-gray-400 mb-1">
                      {movie.genre || 'Feature'} • {movie.duration ? `${movie.duration} mins` : '—'}
                    </p>
                    <p className="text-xs text-gray-500 mb-2">
                      {movie.releaseDate ? formatDate(movie.releaseDate) : ''}
                    </p>
                    <div className="flex items-center gap-2 text-[11px] mt-2">
                      {movie.language && (
                        <motion.span 
                          className="px-2 py-1 glass rounded text-white/60 uppercase"
                          whileHover={{ scale: 1.1 }}
                        >
                          {movie.language}
                        </motion.span>
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


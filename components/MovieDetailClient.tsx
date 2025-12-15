'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import Link from 'next/link'
import Image from 'next/image'
import { formatDateShort, formatDateTime } from '@/lib/dateUtils'
import ReviewSection from '@/components/ReviewSection'
import WishlistButton from '@/components/WishlistButton'
import TrailerModal from '@/components/TrailerModal'

type Props = {
  movie: {
    id: string
    title: string
    overview?: string
    genres?: string[]
    runtime?: number
    releaseDate?: string
    posterUrl?: string | null
    backdropUrl?: string | null
    rating?: number
    language?: string
    cast?: { id: string; name: string; character: string }[]
    crew?: { id: string; name: string; job: string }[]
  }
  showtimes: Array<{
    id: string
    startTime: string
    price: number
    screenName: string
    theaterName: string
    theaterId?: string
    theaterLocation?: string
  }>
  recommendations?: Array<{
    id: string
    title: string
    posterUrl?: string | null
    rating?: number
    releaseDate?: string
  }>
  trailerUrl?: string | null
}

export default function MovieDetailClient({ movie, showtimes = [], recommendations = [], trailerUrl }: Props) {
  const [trailerOpen, setTrailerOpen] = useState(false)
  
  // Ensure movie exists
  if (!movie) {
    return (
      <div className="min-h-screen pt-20 flex items-center justify-center">
        <p className="text-white/70">Movie not found</p>
      </div>
    )
  }
  
  // Group showtimes by theater
  const showtimesByTheater = (showtimes || []).reduce((acc, show) => {
    if (!show) return acc
    const theaterKey = show.theaterId || show.theaterName || 'unknown'
    if (!acc[theaterKey]) {
      acc[theaterKey] = {
        theaterName: show.theaterName || 'PVR Cinemas',
        theaterLocation: show.theaterLocation || 'Mumbai',
        showtimes: []
      }
    }
    acc[theaterKey].showtimes.push(show)
    return acc
  }, {} as Record<string, { theaterName: string; theaterLocation?: string; showtimes: typeof showtimes }>)

  // Format time helper
  const formatTime = (dateStr: string) => {
    try {
      if (!dateStr) return 'N/A'
      const date = new Date(dateStr)
      if (isNaN(date.getTime())) return 'N/A'
      return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false })
    } catch {
      return 'N/A'
    }
  }

  // Format date helper
  const formatDate = (dateStr: string) => {
    try {
      if (!dateStr) return 'N/A'
      const date = new Date(dateStr)
      if (isNaN(date.getTime())) return 'N/A'
      const today = new Date()
      const tomorrow = new Date(today)
      tomorrow.setDate(tomorrow.getDate() + 1)
      
      if (date.toDateString() === today.toDateString()) {
        return 'Today'
      } else if (date.toDateString() === tomorrow.toDateString()) {
        return 'Tomorrow'
      } else {
        return date.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })
      }
    } catch {
      return 'N/A'
    }
  }

  // Group showtimes by date within each theater
  const groupByDate = (shows: typeof showtimes) => {
    if (!shows || !Array.isArray(shows) || shows.length === 0) return {}
    
    const grouped = shows.reduce((acc, show) => {
      if (!show || !show.startTime) return acc
      try {
        const date = new Date(show.startTime)
        if (isNaN(date.getTime())) return acc
        
        const dateKey = date.toDateString()
        if (!acc[dateKey]) {
          acc[dateKey] = []
        }
        acc[dateKey].push(show)
      } catch (err) {
        // Skip invalid dates
        console.error('Error grouping showtime by date:', err, show)
      }
      return acc
    }, {} as Record<string, typeof showtimes>)
    
    return grouped
  }

  return (
    <div className="min-h-screen pt-20 sm:pt-24 pb-20 sm:pb-32 px-4 sm:px-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-7xl mx-auto"
      >
        {/* Movie Header */}
        <div className="flex flex-col md:flex-row gap-6 sm:gap-8 mb-8 sm:mb-12">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2 }}
            className="w-full md:w-80 h-[400px] sm:h-[480px] glass rounded-xl sm:rounded-2xl overflow-hidden relative group mx-auto md:mx-0"
          >
            {movie.posterUrl ? (
              <Image
                src={movie.posterUrl}
                alt={movie.title}
                fill
                className="object-cover"
                sizes="(max-width: 768px) 100vw, 320px"
                unoptimized
              />
            ) : (
              <div className="w-full h-full bg-white/5 flex items-center justify-center border border-white/10">
                <span className="text-6xl font-clash font-bold text-white/30">
                  {movie.title?.charAt(0) || 'M'}
                </span>
              </div>
            )}
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 }}
            className="flex-1 space-y-4"
          >
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-4">
              <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-6xl font-clash font-bold flex-1">
                <span className="text-white">{movie.title}</span>
              </h1>
              <div className="flex items-center gap-2 sm:gap-3 w-full sm:w-auto">
                {trailerUrl && (
                  <motion.button
                    onClick={() => setTrailerOpen(true)}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="flex items-center gap-2 px-3 sm:px-4 py-2 glass rounded-lg hover:bg-white/10 transition-colors touch-manipulation min-h-[44px]"
                  >
                    <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M8 5v14l11-7z" />
                    </svg>
                    <span className="text-xs sm:text-sm font-semibold text-white">Trailer</span>
                  </motion.button>
                )}
                <WishlistButton movieId={movie.id} />
              </div>
            </div>
            <div className="flex flex-wrap items-center gap-2 sm:gap-3 md:gap-4 text-xs sm:text-sm">
              {movie.genres && movie.genres.length > 0 && (
                <span className="px-3 py-1 glass rounded-full text-white/70">
                  {movie.genres.join(', ')}
                </span>
              )}
              {movie.runtime && <span className="text-gray-400">{movie.runtime} mins</span>}
              {movie.language && <span className="text-gray-400 uppercase">{movie.language}</span>}
              {movie.releaseDate && (
                <span className="text-gray-500">
                  Release: {formatDateShort(movie.releaseDate)}
                </span>
              )}
              {movie.rating !== undefined && (
                <span className="px-3 py-1 glass rounded-full text-white/80">
                  ⭐ {movie.rating?.toFixed(1)}
                </span>
              )}
            </div>
            <p className="text-gray-300 leading-relaxed max-w-2xl text-sm sm:text-base">
              {movie.overview || 'Experience the ultimate cinematic journey with premium seating and state-of-the-art sound.'}
            </p>

            {movie.cast && movie.cast.length > 0 && (
              <div className="pt-3 sm:pt-4">
                <h3 className="text-base sm:text-lg font-clash font-semibold text-white mb-2">Top Cast</h3>
                <div className="flex flex-wrap gap-2 sm:gap-3">
                  {movie.cast.slice(0, 6).map((c, index) => (
                    <span key={`${c.id}-${index}`} className="px-2 sm:px-3 py-1.5 sm:py-2 glass rounded-lg text-xs sm:text-sm text-white/80">
                      {c.name} <span className="text-white/50">as</span> {c.character}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {movie.crew && movie.crew.length > 0 && (
              <div className="pt-2 sm:pt-3">
                <h3 className="text-base sm:text-lg font-clash font-semibold text-white mb-2">Crew</h3>
                <div className="flex flex-wrap gap-2 sm:gap-3">
                  {movie.crew.slice(0, 6).map((c, index) => (
                    <span key={`${c.id}-${c.job}-${index}`} className="px-2 sm:px-3 py-1.5 sm:py-2 glass rounded-lg text-xs sm:text-sm text-white/80">
                      {c.name} <span className="text-white/50">({c.job})</span>
                    </span>
                  ))}
                </div>
              </div>
            )}
          </motion.div>
        </div>

        {/* Recommendations */}
        {recommendations.length > 0 && (
          <div className="mb-12">
            <h3 className="text-2xl font-clash font-bold text-white mb-4">You may also like</h3>
            <div className="flex gap-4 overflow-x-auto pb-2">
              {recommendations.map((rec) => (
                <Link key={rec.id} href={`/movies/${rec.id}`} className="min-w-[160px] max-w-[160px] glass rounded-xl border border-white/10 hover:border-white/30 transition-colors">
                  <div className="aspect-[2/3] relative overflow-hidden rounded-t-xl border-b border-white/10">
                    {rec.posterUrl ? (
                      <Image
                        src={rec.posterUrl}
                        alt={rec.title}
                        fill
                        className="object-cover"
                        sizes="160px"
                        unoptimized
                      />
                    ) : (
                      <div className="absolute inset-0 flex items-center justify-center bg-white/5 text-white/40">
                        {rec.title.slice(0, 1)}
                      </div>
                    )}
                  </div>
                  <div className="p-3 space-y-1">
                    <p className="text-sm font-clash font-semibold text-white line-clamp-2">{rec.title}</p>
                    {rec.rating !== undefined && (
                      <p className="text-xs text-white/70">⭐ {rec.rating?.toFixed(1)}</p>
                    )}
                    {rec.releaseDate && (
                      <p className="text-[11px] text-gray-500">{formatDateShort(rec.releaseDate)}</p>
                    )}
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}

        {/* Showtimes Section - Grouped by Theater */}
        {showtimes && showtimes.length > 0 ? (
          <div>
            <h2 className="text-2xl sm:text-3xl font-clash font-bold mb-4 sm:mb-6">
              <span className="text-white">Available Showtimes</span>
            </h2>
          
            <div className="space-y-4 sm:space-y-6">
              {Object.entries(showtimesByTheater).map(([theaterKey, theaterData], theaterIndex) => {
                const showtimesByDate = groupByDate(theaterData.showtimes || [])
                
                // Debug: log if no showtimes
                if (!theaterData.showtimes || theaterData.showtimes.length === 0) {
                  console.log('[MovieDetailClient] No showtimes for theater:', theaterData.theaterName)
                }
                
                return (
                  <motion.div
                    key={theaterKey}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: theaterIndex * 0.1 }}
                    className="glass-strong rounded-xl sm:rounded-2xl p-4 sm:p-6 border border-white/10"
                  >
                    {/* Theater Header */}
                    <div className="mb-3 sm:mb-4 pb-3 sm:pb-4 border-b border-white/10">
                      <h3 className="text-lg sm:text-xl font-clash font-bold text-white mb-1">
                        {theaterData.theaterName}
                      </h3>
                      {theaterData.theaterLocation && (
                        <p className="text-xs sm:text-sm text-gray-400">{theaterData.theaterLocation}</p>
                      )}
                    </div>

                    {/* Showtimes grouped by date */}
                    <div className="space-y-4 sm:space-y-6">
                      {Object.keys(showtimesByDate).length > 0 ? (
                        Object.entries(showtimesByDate).map(([dateKey, dateShows]) => {
                          if (!dateShows || dateShows.length === 0) return null
                          
                          return (
                            <div key={dateKey}>
                              <h4 className="text-xs sm:text-sm font-clash font-semibold text-white/70 mb-2 sm:mb-3">
                                {dateShows[0]?.startTime ? formatDate(dateShows[0].startTime) : dateKey}
                              </h4>
                              
                              {/* Screen groups */}
                              {Object.entries(
                                (dateShows || []).reduce((acc, show) => {
                                  if (!show || !show.screenName) return acc
                                  if (!acc[show.screenName]) {
                                    acc[show.screenName] = []
                                  }
                                  acc[show.screenName].push(show)
                                  return acc
                                }, {} as Record<string, typeof dateShows>)
                              ).map(([screenName, screenShows]) => (
                                <div key={screenName} className="mb-3 sm:mb-4 last:mb-0">
                                  <p className="text-[10px] sm:text-xs text-gray-500 mb-2">{screenName}</p>
                                  <div className="flex flex-wrap gap-2">
                                    {(screenShows || []).filter(show => show && show.id && show.startTime).map((show) => (
                                      <Link key={show.id} href={`/booking/${show.id}`} className="touch-manipulation">
                                        <motion.button
                                          whileHover={{ scale: 1.05 }}
                                          whileTap={{ scale: 0.95 }}
                                          className="px-3 sm:px-4 py-2 sm:py-2.5 glass rounded-lg border border-white/10 hover:border-white/30 transition-all group min-w-[70px] sm:min-w-[80px]"
                                        >
                                          <div className="text-center">
                                            <p className="text-xs sm:text-sm font-clash font-semibold text-white group-hover:text-white/90">
                                              {formatTime(show.startTime)}
                                            </p>
                                            <p className="text-[10px] sm:text-xs text-gray-400 mt-0.5 sm:mt-1">
                                              ₹{show.price ? (show.price / 100) : 0}
                                            </p>
                                          </div>
                                        </motion.button>
                                      </Link>
                                    ))}
                                  </div>
                                </div>
                              ))}
                            </div>
                          )
                        })
                      ) : theaterData.showtimes && theaterData.showtimes.length > 0 ? (
                        // Fallback: show showtimes without date grouping if grouping fails
                        <div>
                          <p className="text-xs sm:text-sm text-gray-400 mb-3">Today</p>
                          <div className="flex flex-wrap gap-2">
                            {theaterData.showtimes.filter(show => show && show.id && show.startTime).map((show) => (
                              <Link key={show.id} href={`/booking/${show.id}`} className="touch-manipulation">
                                <motion.button
                                  whileHover={{ scale: 1.05 }}
                                  whileTap={{ scale: 0.95 }}
                                  className="px-3 sm:px-4 py-2 sm:py-2.5 glass rounded-lg border border-white/10 hover:border-white/30 transition-all group min-w-[70px] sm:min-w-[80px]"
                                >
                                  <div className="text-center">
                                    <p className="text-xs sm:text-sm font-clash font-semibold text-white group-hover:text-white/90">
                                      {formatTime(show.startTime)}
                                    </p>
                                    <p className="text-[10px] sm:text-xs text-gray-400 mt-0.5 sm:mt-1">
                                      ₹{show.price ? (show.price / 100) : 0}
                                    </p>
                                  </div>
                                </motion.button>
                              </Link>
                            ))}
                          </div>
                        </div>
                      ) : (
                        <p className="text-white/60 text-sm">No showtimes available</p>
                      )}
                    </div>
                  </motion.div>
                )
              })}
            </div>
          </div>
        ) : (() => {
          // Check if movie is old (released more than 3 months ago)
          if (movie.releaseDate) {
            const releaseDate = new Date(movie.releaseDate)
            const today = new Date()
            const threeMonthsAgo = new Date(today)
            threeMonthsAgo.setMonth(threeMonthsAgo.getMonth() - 3)
            
            if (releaseDate < threeMonthsAgo) {
              return (
                <div className="glass rounded-2xl p-12 text-center">
                  <p className="text-gray-400 text-lg mb-2">This movie is no longer playing in theaters</p>
                  <p className="text-gray-500 text-sm">Released on {movie.releaseDate ? new Date(movie.releaseDate).toLocaleDateString('en-IN', { 
                    year: 'numeric', 
                    month: 'long', 
                    day: 'numeric' 
                  }) : 'N/A'}</p>
                </div>
              )
            }
          }
          
          return (
            <div className="glass rounded-2xl p-12 text-center">
              <p className="text-gray-400 text-lg">No showtimes available for this movie</p>
            </div>
          )
        })()}

        {/* Reviews Section */}
        <ReviewSection movieId={movie.id} />
      </motion.div>

      {/* Trailer Modal */}
      <TrailerModal
        isOpen={trailerOpen}
        onClose={() => setTrailerOpen(false)}
        trailerUrl={trailerUrl || null}
        movieTitle={movie.title}
      />
    </div>
  )
}


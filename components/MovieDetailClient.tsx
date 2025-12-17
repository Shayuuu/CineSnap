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
  watchProviders?: {
    flatrate?: Array<{
      provider_id: number
      provider_name: string
      logo_path: string
      display_priority?: number
    }>
    buy?: Array<{
      provider_id: number
      provider_name: string
      logo_path: string
      display_priority?: number
    }>
    rent?: Array<{
      provider_id: number
      provider_name: string
      logo_path: string
      display_priority?: number
    }>
    link?: string
  } | null
  recommendations?: Array<{
    id: string
    title: string
    posterUrl?: string | null
    rating?: number
    releaseDate?: string
  }>
  trailerUrl?: string | null
}

export default function MovieDetailClient({ movie, showtimes = [], watchProviders, recommendations = [], trailerUrl }: Props) {
  const [trailerOpen, setTrailerOpen] = useState(false)
  const [selectedDateTab, setSelectedDateTab] = useState<string | null>(null)
  
  // Ensure movie exists
  if (!movie) {
    return (
      <div className="min-h-screen pt-20 flex items-center justify-center">
        <p className="text-white/70">Movie not found</p>
      </div>
    )
  }

  // Check if movie is old (released more than 3 months ago)
  const isOldMovie = movie.releaseDate ? (() => {
    const releaseDate = new Date(movie.releaseDate)
    const today = new Date()
    const threeMonthsAgo = new Date(today)
    threeMonthsAgo.setMonth(threeMonthsAgo.getMonth() - 3)
    return releaseDate < threeMonthsAgo
  })() : false
  
  // Group showtimes by date first, then by theater, then by screen
  const showtimesByDate = (showtimes || []).reduce((acc, show) => {
    if (!show || !show.startTime) return acc
    try {
      const date = new Date(show.startTime)
      if (isNaN(date.getTime())) return acc
      
      const dateKey = date.toDateString()
      if (!acc[dateKey]) {
        acc[dateKey] = {
          date: date,
          dateKey,
          theaters: {} as Record<string, { 
            theaterName: string
            theaterLocation?: string
            screens: Record<string, typeof showtimes>
          }>
        }
      }
      
      const theaterKey = show.theaterId || show.theaterName || 'unknown'
      if (!acc[dateKey].theaters[theaterKey]) {
        acc[dateKey].theaters[theaterKey] = {
          theaterName: show.theaterName || 'PVR Cinemas',
          theaterLocation: show.theaterLocation || 'Mumbai',
          screens: {}
        }
      }
      
      const screenName = show.screenName || 'Screen 1'
      if (!acc[dateKey].theaters[theaterKey].screens[screenName]) {
        acc[dateKey].theaters[theaterKey].screens[screenName] = []
      }
      
      acc[dateKey].theaters[theaterKey].screens[screenName].push(show)
      return acc
    } catch (err) {
      console.error('Error grouping showtime by date:', err, show)
      return acc
    }
  }, {} as Record<string, { 
    date: Date
    dateKey: string
    theaters: Record<string, { 
      theaterName: string
      theaterLocation?: string
      screens: Record<string, typeof showtimes>
    }>
  }>)
  
  // Sort dates chronologically
  const sortedDates = Object.entries(showtimesByDate || {}).sort(([a], [b]) => {
    try {
      return new Date(a).getTime() - new Date(b).getTime()
    } catch {
      return 0
    }
  }).filter(([_, dateData]) => dateData && dateData.theaters && Object.keys(dateData.theaters).length > 0)
  
  // Group showtimes by theater (for fallback)
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
            initial={{ opacity: 0, scale: 0.9, rotateY: -15 }}
            animate={{ opacity: 1, scale: 1, rotateY: 0 }}
            transition={{ delay: 0.2, duration: 0.6 }}
            whileHover={{ scale: 1.02, rotateY: 5 }}
            className="w-full md:w-80 h-[400px] sm:h-[480px] glass-enhanced rounded-xl sm:rounded-2xl overflow-hidden relative group mx-auto md:mx-0 hover-lift"
          >
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
                    sizes="(max-width: 768px) 100vw, 320px"
                    unoptimized
                  />
                </motion.div>
                {/* Gradient overlay on hover */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                {/* Shine effect */}
                <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500">
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>
                </div>
              </>
            ) : (
              <div className="w-full h-full bg-gradient-to-br from-purple-900/20 to-pink-900/20 flex items-center justify-center border border-white/10">
                <motion.span 
                  className="text-6xl font-clash font-bold text-white/30"
                  animate={{ scale: [1, 1.1, 1] }}
                  transition={{ duration: 2, repeat: Infinity }}
                >
                  {movie.title?.charAt(0) || 'M'}
                </motion.span>
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
              <motion.h1 
                className="text-2xl sm:text-3xl md:text-4xl lg:text-6xl font-clash font-bold flex-1"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.4 }}
              >
                <span className="gradient-text-gold">{movie.title}</span>
              </motion.h1>
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
            <motion.div 
              className="flex flex-wrap items-center gap-2 sm:gap-3 md:gap-4 text-xs sm:text-sm"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
            >
              {movie.genres && movie.genres.length > 0 && (
                <motion.span 
                  className="px-3 py-1 glass-enhanced rounded-full text-white/70"
                  whileHover={{ scale: 1.05 }}
                >
                  {movie.genres.join(', ')}
                </motion.span>
              )}
              {movie.runtime && (
                <motion.span 
                  className="text-gray-400"
                  whileHover={{ scale: 1.05 }}
                >
                  {movie.runtime} mins
                </motion.span>
              )}
              {movie.language && (
                <motion.span 
                  className="text-gray-400 uppercase px-2 py-1 glass rounded-full"
                  whileHover={{ scale: 1.05 }}
                >
                  {movie.language}
                </motion.span>
              )}
              {movie.releaseDate && (
                <motion.span 
                  className="text-gray-500"
                  whileHover={{ scale: 1.05 }}
                >
                  Release: {formatDateShort(movie.releaseDate)}
                </motion.span>
              )}
              {movie.rating !== undefined && (
                <motion.span 
                  className="px-3 py-1 glass-enhanced rounded-full text-white/80 bg-gradient-to-r from-yellow-400/20 to-orange-500/20 border border-yellow-400/30"
                  whileHover={{ scale: 1.1, rotate: 5 }}
                  animate={{ boxShadow: ['0 0 0px rgba(255, 215, 0, 0)', '0 0 10px rgba(255, 215, 0, 0.3)', '0 0 0px rgba(255, 215, 0, 0)'] }}
                  transition={{ duration: 2, repeat: Infinity }}
                >
                  ⭐ {movie.rating?.toFixed(1)}
                </motion.span>
              )}
            </motion.div>
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

        {/* Watch Providers Section (OTT) */}
        {watchProviders && (
          (watchProviders.flatrate && watchProviders.flatrate.length > 0) ||
          (watchProviders.buy && watchProviders.buy.length > 0) ||
          (watchProviders.rent && watchProviders.rent.length > 0)
        ) ? (
          <div>
            <motion.h2 
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6 }}
              className="text-2xl sm:text-3xl font-clash font-bold mb-6 sm:mb-8"
            >
              <span className="gradient-text-gold">Streaming Platforms</span>
            </motion.h2>
            
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 sm:gap-6">
              {[
                ...(watchProviders.flatrate || []),
                ...(watchProviders.buy || []),
                ...(watchProviders.rent || [])
              ].map((provider: any, index: number) => {
                const providerLinks: Record<number, string> = {
                  8: 'https://www.netflix.com',
                  9: 'https://www.primevideo.com',
                  2: 'https://tv.apple.com',
                  337: 'https://www.hotstar.com',
                  350: 'https://www.hotstar.com', // Alternative Hotstar ID
                }
                
                const providerName = provider.provider_name || 'Streaming Platform'
                // Use logo_path from TMDb API - w500 for better quality
                const logoUrl = provider.logo_path 
                  ? `https://image.tmdb.org/t/p/w500${provider.logo_path}`
                  : null
                
                return (
                  <motion.a
                    key={`${provider.provider_id}-${index}`}
                    href={providerLinks[provider.provider_id] || watchProviders.link || '#'}
                    target="_blank"
                    rel="noopener noreferrer"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    whileHover={{ scale: 1.05, y: -5 }}
                    className="glass-enhanced rounded-xl sm:rounded-2xl p-4 sm:p-6 border border-white/10 hover:border-white/30 transition-all cursor-pointer text-center group"
                  >
                    {logoUrl ? (
                      <div className="relative w-full h-20 sm:h-24 mb-3 sm:mb-4 flex items-center justify-center">
                        <Image
                          src={logoUrl}
                          alt={providerName}
                          width={120}
                          height={60}
                          className="object-contain max-w-full max-h-full"
                          sizes="(max-width: 640px) 50vw, 25vw"
                          unoptimized
                        />
                      </div>
                    ) : (
                      <div className="w-full h-20 sm:h-24 mb-3 sm:mb-4 flex items-center justify-center">
                        <span className="text-2xl sm:text-3xl">📺</span>
                      </div>
                    )}
                    <p className="text-white font-clash font-semibold text-sm sm:text-base group-hover:text-yellow-400 transition-colors">
                      {providerName}
                    </p>
                    <p className="text-gray-400 text-xs mt-1">Watch Now →</p>
                  </motion.a>
                )
              })}
            </div>
          </div>
        ) : null}
        
        {/* Showtimes Section - Only show if no watch providers */}
        {!watchProviders && showtimes && showtimes.length > 0 ? (
          <div>
            <motion.h2 
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6 }}
              className="text-2xl sm:text-3xl font-clash font-bold mb-6 sm:mb-8"
            >
              <span className="gradient-text-gold">Available Showtimes</span>
            </motion.h2>
          
            {/* Date Tabs */}
            {sortedDates.length > 0 && (
              <div className="mb-6 sm:mb-8">
                <div className="flex gap-2 sm:gap-3 overflow-x-auto pb-2 scrollbar-hide -mx-4 sm:mx-0 px-4 sm:px-0">
                  {sortedDates.map(([dateKey, dateData], dateIndex) => {
                    if (!dateData || !dateData.theaters) return null
                    
                    const isToday = dateKey === new Date().toDateString()
                    const isSelected = selectedDateTab === dateKey || (!selectedDateTab && dateIndex === 0)
                    const totalShows = Object.values(dateData.theaters || {}).reduce(
                      (sum, t) => {
                        if (!t || !t.screens) return sum
                        return sum + Object.values(t.screens).flat().length
                      }, 
                      0
                    )
                    
                    return (
                      <motion.button
                        key={dateKey}
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: dateIndex * 0.1 }}
                        onClick={() => setSelectedDateTab(dateKey)}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        className={`
                          px-4 sm:px-6 py-3 sm:py-4 rounded-xl border-2 transition-all whitespace-nowrap
                          ${isSelected 
                            ? 'bg-gradient-to-r from-yellow-400/20 to-orange-500/20 border-yellow-400/50 shadow-lg hover:shadow-xl' 
                            : 'bg-white/5 border-white/10 hover:border-white/30 hover:bg-white/10'
                          }
                        `}
                      >
                        <div className="flex items-center gap-2 sm:gap-3">
                          <span className="text-xl sm:text-2xl">{isToday ? '📅' : '📆'}</span>
                          <div className="text-left">
                            <div className={`text-sm sm:text-base font-clash font-bold ${isSelected ? 'text-white' : 'text-white/70'}`}>
                              {isToday ? 'Today' : formatDate(dateData.date.toISOString())}
                            </div>
                            <div className={`text-[10px] sm:text-xs mt-0.5 ${isSelected ? 'text-yellow-300' : 'text-gray-400'}`}>
                              {totalShows} show{totalShows !== 1 ? 's' : ''}
                            </div>
                          </div>
                        </div>
                      </motion.button>
                    )
                  })}
                </div>
              </div>
            )}
          
            {/* Showtimes by Date */}
            <div className="space-y-6 sm:space-y-8">
              {sortedDates.map(([dateKey, dateData], dateIndex) => {
                if (!dateData || !dateData.theaters) return null
                
                const isSelected = selectedDateTab === dateKey || (!selectedDateTab && dateIndex === 0)
                if (!isSelected) return null
                
                return (
                  <motion.div
                    key={dateKey}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: dateIndex * 0.1 }}
                    className="space-y-5 sm:space-y-6"
                  >
                    {/* Theaters Grid */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
                      {Object.entries(dateData.theaters || {}).map(([theaterKey, theaterData], theaterIndex) => {
                        if (!theaterData || !theaterData.screens) return null
                        
                        const totalShows = Object.values(theaterData.screens || {}).flat().length
                        
                        return (
                          <motion.div
                            key={theaterKey}
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ delay: dateIndex * 0.1 + theaterIndex * 0.05 }}
                            className="glass-enhanced rounded-2xl p-5 sm:p-6 border border-white/10 hover:border-white/20 transition-all hover-lift relative overflow-hidden group"
                          >
                            {/* Background gradient effect */}
                            <div className="absolute inset-0 bg-gradient-to-br from-purple-500/5 via-transparent to-pink-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                            
                            {/* Theater Header */}
                            <div className="mb-4 pb-4 border-b border-white/10 relative z-10">
                              <div className="flex items-start justify-between gap-4 mb-2">
                                <div className="flex-1">
                                  <h4 className="text-lg sm:text-xl font-clash font-bold text-white flex items-center gap-2 mb-1">
                                    <motion.span 
                                      className="text-xl"
                                      animate={{ rotate: [0, 10, -10, 0] }}
                                      transition={{ duration: 3, repeat: Infinity }}
                                    >
                                      🎭
                                    </motion.span>
                                    <span className="gradient-text-gold">{theaterData.theaterName}</span>
                                  </h4>
                                  {theaterData.theaterLocation && (
                                    <p className="text-xs sm:text-sm text-gray-400 flex items-center gap-1.5 mt-1">
                                      <span>📍</span>
                                      {theaterData.theaterLocation}
                                    </p>
                                  )}
                                </div>
                                <div className="px-2.5 py-1 glass rounded-lg border border-white/10">
                                  <span className="text-[10px] sm:text-xs font-clash font-semibold text-white/80">
                                    {totalShows} Shows
                                  </span>
                                </div>
                              </div>
                            </div>
                            
                            {/* Screens */}
                            <div className="space-y-4 relative z-10">
                              {Object.entries(theaterData.screens || {}).map(([screenName, screenShows], screenIndex) => {
                                if (!screenShows || !Array.isArray(screenShows)) return null
                                
                                return (
                                <motion.div
                                  key={screenName}
                                  initial={{ opacity: 0, x: -10 }}
                                  animate={{ opacity: 1, x: 0 }}
                                  transition={{ delay: dateIndex * 0.1 + theaterIndex * 0.05 + screenIndex * 0.03 }}
                                  className="space-y-2"
                                >
                                  {/* Screen Label */}
                                  <div className="flex items-center gap-2">
                                    <div className="w-0.5 h-4 bg-gradient-to-b from-purple-400 to-pink-500 rounded-full"></div>
                                    <p className="text-xs sm:text-sm font-clash font-semibold text-white/80 uppercase tracking-wider flex items-center gap-1.5">
                                      <span className="text-sm">🎬</span>
                                      {screenName}
                                    </p>
                                  </div>
                                  
                                  {/* Showtime Buttons */}
                                  <div className="flex flex-wrap gap-2 sm:gap-2.5">
                                    {screenShows.filter(show => show && show.id && show.startTime).map((show, showIndex) => {
                                      const showTime = new Date(show.startTime)
                                      const hours = showTime.getHours()
                                      
                                      // Get gradient colors based on time
                                      const getGradientStyle = () => {
                                        if (hours >= 6 && hours < 12) {
                                          return {
                                            bg: 'bg-gradient-to-br from-yellow-400/10 to-orange-500/10',
                                            bgHover: 'hover:bg-gradient-to-br hover:from-yellow-400/20 hover:to-orange-500/20',
                                            border: 'border-yellow-400/30 hover:border-yellow-400/60',
                                            accent: 'bg-gradient-to-br from-yellow-400 to-orange-500',
                                            icon: '🌅'
                                          }
                                        } else if (hours >= 12 && hours < 17) {
                                          return {
                                            bg: 'bg-gradient-to-br from-orange-400/10 to-red-500/10',
                                            bgHover: 'hover:bg-gradient-to-br hover:from-orange-400/20 hover:to-red-500/20',
                                            border: 'border-orange-400/30 hover:border-orange-400/60',
                                            accent: 'bg-gradient-to-br from-orange-400 to-red-500',
                                            icon: '☀️'
                                          }
                                        } else if (hours >= 17 && hours < 22) {
                                          return {
                                            bg: 'bg-gradient-to-br from-purple-500/10 to-pink-500/10',
                                            bgHover: 'hover:bg-gradient-to-br hover:from-purple-500/20 hover:to-pink-500/20',
                                            border: 'border-purple-500/30 hover:border-purple-500/60',
                                            accent: 'bg-gradient-to-br from-purple-500 to-pink-500',
                                            icon: '🌆'
                                          }
                                        } else {
                                          return {
                                            bg: 'bg-gradient-to-br from-indigo-500/10 to-purple-600/10',
                                            bgHover: 'hover:bg-gradient-to-br hover:from-indigo-500/20 hover:to-purple-600/20',
                                            border: 'border-indigo-500/30 hover:border-indigo-500/60',
                                            accent: 'bg-gradient-to-br from-indigo-500 to-purple-600',
                                            icon: '🌙'
                                          }
                                        }
                                      }
                                      
                                      const gradientStyle = getGradientStyle()
                                      
                                      return (
                                        <Link key={show.id} href={`/booking/${show.id}`} className="touch-manipulation">
                                          <motion.button
                                            initial={{ opacity: 0, scale: 0.8 }}
                                            animate={{ opacity: 1, scale: 1 }}
                                            transition={{ delay: dateIndex * 0.1 + theaterIndex * 0.05 + screenIndex * 0.03 + showIndex * 0.02 }}
                                            whileHover={{ scale: 1.05, y: -3 }}
                                            whileTap={{ scale: 0.95 }}
                                            className="group relative min-w-[85px] sm:min-w-[90px] min-h-[70px] sm:min-h-[80px]"
                                          >
                                            <div className={`
                                              px-3 sm:px-4 py-2.5 sm:py-3 
                                              rounded-xl border-2
                                              ${gradientStyle.bg}
                                              ${gradientStyle.border}
                                              ${gradientStyle.bgHover}
                                              transition-all duration-300
                                              relative overflow-hidden
                                              shadow-lg hover:shadow-xl hover:shadow-purple-500/20
                                              w-full h-full
                                            `}>
                                              <div className={`absolute inset-0 ${gradientStyle.accent} opacity-0 group-hover:opacity-10 transition-opacity duration-300`}></div>
                                              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700"></div>
                                              
                                              <div className="relative z-10 text-center flex flex-col items-center justify-center h-full">
                                                <motion.div 
                                                  className="text-base sm:text-lg mb-1 opacity-70 group-hover:opacity-100 transition-opacity"
                                                  animate={{ scale: [1, 1.1, 1] }}
                                                  transition={{ duration: 2, repeat: Infinity }}
                                                >
                                                  {gradientStyle.icon}
                                                </motion.div>
                                                <p className="text-sm sm:text-base font-clash font-bold text-white group-hover:text-yellow-300 transition-colors mb-0.5">
                                                  {formatTime(show.startTime)}
                                                </p>
                                                <span className="text-[10px] sm:text-xs text-gray-400 group-hover:text-white/90 transition-colors font-medium">
                                                  ₹{show.price ? (show.price / 100) : 0}
                                                </span>
                                              </div>
                                              
                                              <div className={`absolute top-0 right-0 w-1.5 h-1.5 ${gradientStyle.accent} rounded-bl-xl opacity-0 group-hover:opacity-100 transition-opacity`}></div>
                                            </div>
                                          </motion.button>
                                        </Link>
                                      )
                                    })}
                                  </div>
                                </motion.div>
                                )
                              }).filter(Boolean)}
                            </div>
                          </motion.div>
                        )
                      }).filter(Boolean)}
                    </div>
                  </motion.div>
                )
              }).filter(Boolean)}
            </div>
          </div>
        ) : (
          <div className="glass rounded-2xl p-12 text-center">
            {isOldMovie ? (
              <>
                <p className="text-gray-400 text-lg mb-2">This movie is no longer playing in theaters</p>
                <p className="text-gray-500 text-sm">Released on {movie.releaseDate ? new Date(movie.releaseDate).toLocaleDateString('en-IN', { 
                  year: 'numeric', 
                  month: 'long', 
                  day: 'numeric' 
                }) : 'N/A'}</p>
              </>
            ) : (
              <p className="text-gray-400 text-lg">No showtimes available for this movie</p>
            )}
          </div>
        )}

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


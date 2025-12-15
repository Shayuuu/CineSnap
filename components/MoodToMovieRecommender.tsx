'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import Image from 'next/image'
import Link from 'next/link'
import { formatDateShort } from '@/lib/dateUtils'

type Mood = {
  id: string
  label: string
  emoji: string
  genres: number[] // TMDb genre IDs
  keywords: string[]
}

const MOODS: Mood[] = [
  { id: 'happy', label: 'Happy & Uplifting', emoji: '😊', genres: [35, 10402], keywords: ['comedy', 'musical', 'feel-good'] },
  { id: 'adventure', label: 'Adventure & Action', emoji: '🎬', genres: [28, 12], keywords: ['action', 'adventure', 'thriller'] },
  { id: 'romance', label: 'Romantic', emoji: '💕', genres: [10749], keywords: ['romance', 'love', 'romantic'] },
  { id: 'thriller', label: 'Thriller & Suspense', emoji: '🔪', genres: [53, 27], keywords: ['thriller', 'horror', 'suspense'] },
  { id: 'drama', label: 'Deep Drama', emoji: '🎭', genres: [18], keywords: ['drama', 'emotional', 'serious'] },
  { id: 'sci-fi', label: 'Sci-Fi & Fantasy', emoji: '🚀', genres: [878, 14], keywords: ['sci-fi', 'fantasy', 'futuristic'] },
  { id: 'family', label: 'Family Friendly', emoji: '👨‍👩‍👧‍👦', genres: [10751], keywords: ['family', 'kids', 'animated'] },
  { id: 'chill', label: 'Chill & Relaxing', emoji: '🌙', genres: [18, 99], keywords: ['slow', 'calm', 'documentary'] },
]

type Movie = {
  id: string
  title: string
  posterUrl: string | null
  rating: number
  releaseDate: string
  overview?: string
}

export default function MoodToMovieRecommender() {
  const [selectedMood, setSelectedMood] = useState<Mood | null>(null)
  const [customMood, setCustomMood] = useState('')
  const [movies, setMovies] = useState<Movie[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleMoodSelect = async (mood: Mood) => {
    setSelectedMood(mood)
    setLoading(true)
    setError(null)
    setMovies([])

    try {
      const res = await fetch('/api/movies/mood-recommend', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ genres: mood.genres, keywords: mood.keywords }),
      })

      const data = await res.json()
      if (res.ok && data.results) {
        setMovies(data.results)
      } else {
        setError(data.error || 'Failed to fetch recommendations')
      }
    } catch (err: any) {
      setError(err.message || 'Something went wrong')
    } finally {
      setLoading(false)
    }
  }

  const handleCustomSearch = async () => {
    if (!customMood.trim()) return

    setLoading(true)
    setError(null)
    setMovies([])
    setSelectedMood(null)

    try {
      const res = await fetch('/api/movies/mood-recommend', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query: customMood.trim() }),
      })

      const data = await res.json()
      if (res.ok && data.results) {
        setMovies(data.results)
      } else {
        setError(data.error || 'Failed to fetch recommendations')
      }
    } catch (err: any) {
      setError(err.message || 'Something went wrong')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen pt-24 pb-32 px-6">
      <div className="max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <h1 className="text-5xl md:text-6xl font-clash font-bold mb-4">
            <span className="text-white">Mood-to-Movie</span>
          </h1>
          <p className="text-gray-400 text-lg max-w-2xl mx-auto">
            Tell us how you're feeling, and we'll find the perfect movie for you
          </p>
        </motion.div>

        {/* Mood Selection */}
        <div className="mb-8">
          <h2 className="text-2xl font-clash font-semibold text-white mb-6">Select Your Mood</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {MOODS.map((mood) => (
              <motion.button
                key={mood.id}
                onClick={() => handleMoodSelect(mood)}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className={`p-6 glass rounded-2xl border-2 transition-all ${
                  selectedMood?.id === mood.id
                    ? 'border-white/50 bg-white/10'
                    : 'border-white/10 hover:border-white/30'
                }`}
              >
                <div className="text-4xl mb-2">{mood.emoji}</div>
                <div className="text-sm font-clash font-semibold text-white">{mood.label}</div>
              </motion.button>
            ))}
          </div>
        </div>

        {/* Custom Search */}
        <div className="mb-8">
          <h2 className="text-2xl font-clash font-semibold text-white mb-4">Or Describe What You Want</h2>
          <div className="flex gap-3">
            <input
              type="text"
              value={customMood}
              onChange={(e) => setCustomMood(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleCustomSearch()}
              placeholder="e.g., 'a movie that makes me cry' or 'something funny with action'"
              className="flex-1 px-6 py-4 glass rounded-xl border border-white/10 focus:border-white/30 focus:outline-none focus:ring-2 focus:ring-white/20 text-white placeholder-gray-500"
            />
            <motion.button
              onClick={handleCustomSearch}
              disabled={loading || !customMood.trim()}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="px-8 py-4 bg-white text-black rounded-xl font-clash font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Search
            </motion.button>
          </div>
        </div>

        {/* Loading State */}
        {loading && (
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-white"></div>
            <p className="text-gray-400 mt-4">Finding perfect movies for you...</p>
          </div>
        )}

        {/* Error State */}
        {error && (
          <div className="glass rounded-xl p-6 border border-red-500/30 bg-red-500/10">
            <p className="text-red-400">{error}</p>
          </div>
        )}

        {/* Results */}
        <AnimatePresence>
          {movies.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="mt-8"
            >
              <h2 className="text-3xl font-clash font-bold text-white mb-6">
                Perfect Matches for You
              </h2>
              <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
                {movies.map((movie, index) => (
                  <motion.div
                    key={movie.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                  >
                    <Link href={`/movies/${movie.id}`}>
                      <div className="glass rounded-xl border border-white/10 hover:border-white/30 transition-all overflow-hidden group cursor-pointer">
                        <div className="aspect-[2/3] relative overflow-hidden">
                          {movie.posterUrl ? (
                            <Image
                              src={movie.posterUrl}
                              alt={movie.title}
                              fill
                              className="object-cover group-hover:scale-110 transition-transform duration-300"
                              sizes="(max-width: 768px) 50vw, (max-width: 1024px) 25vw, 16vw"
                              unoptimized
                            />
                          ) : (
                            <div className="absolute inset-0 flex items-center justify-center bg-white/5 text-white/40">
                              {movie.title.slice(0, 1)}
                            </div>
                          )}
                          {movie.rating && (
                            <div className="absolute top-2 right-2 px-2 py-1 glass rounded-full text-xs font-semibold text-white">
                              ⭐ {movie.rating.toFixed(1)}
                            </div>
                          )}
                        </div>
                        <div className="p-3">
                          <p className="text-sm font-clash font-semibold text-white line-clamp-2 mb-1">
                            {movie.title}
                          </p>
                          {movie.releaseDate && (
                            <p className="text-xs text-gray-500">{formatDateShort(movie.releaseDate)}</p>
                          )}
                        </div>
                      </div>
                    </Link>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}



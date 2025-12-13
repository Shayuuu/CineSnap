'use client'

import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import Link from 'next/link'
import Image from 'next/image'
import { poster } from '@/lib/api'

type Movie = {
  id: string
  title: string
  posterUrl: string | null
  rating?: number
  releaseDate?: string
}

type Props = {
  onSelect?: (movie: Movie) => void
}

export default function MovieSearch({ onSelect }: Props) {
  const [query, setQuery] = useState('')
  const [movies, setMovies] = useState<Movie[]>([])
  const [loading, setLoading] = useState(false)
  const [showResults, setShowResults] = useState(false)
  const [filters, setFilters] = useState({
    genre: '',
    language: '',
    minRating: '',
    maxPrice: '',
  })
  const searchRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(e.target as Node)) {
        setShowResults(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const searchMovies = async (searchQuery: string) => {
    if (!searchQuery.trim()) {
      setMovies([])
      setShowResults(false)
      return
    }

    setLoading(true)
    try {
      const params = new URLSearchParams({
        q: searchQuery,
        ...(filters.genre && { genre: filters.genre }),
        ...(filters.language && { language: filters.language }),
        ...(filters.minRating && { minRating: filters.minRating }),
      })

      const res = await fetch(`/api/movies/search?${params}`)
      if (!res.ok) throw new Error('Search failed')
      
      const data = await res.json()
      setMovies(data.movies || [])
      setShowResults(true)
    } catch (error) {
      console.error('Search error:', error)
      setMovies([])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      searchMovies(query)
    }, 300) // Debounce

    return () => clearTimeout(timeoutId)
  }, [query, filters])

  return (
    <div ref={searchRef} className="relative w-full">
      {/* Search Input */}
      <div className="relative">
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => setShowResults(true)}
          placeholder="Search movies..."
          className="w-full px-4 py-2 pl-10 glass rounded-full text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-white/30 transition-all text-sm"
        />
        <svg
          className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
        {loading && (
          <div className="absolute right-3 top-1/2 -translate-y-1/2">
            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
          </div>
        )}
      </div>

      {/* Filters */}
      <div className="mt-2 flex flex-wrap gap-2">
        <select
          value={filters.genre}
          onChange={(e) => setFilters({ ...filters, genre: e.target.value })}
          className="px-3 py-1.5 glass rounded-lg text-white text-xs focus:outline-none focus:ring-2 focus:ring-white/30"
        >
          <option value="">All Genres</option>
          <option value="28">Action</option>
          <option value="35">Comedy</option>
          <option value="18">Drama</option>
          <option value="27">Horror</option>
          <option value="10749">Romance</option>
          <option value="53">Thriller</option>
          <option value="878">Sci-Fi</option>
        </select>

        <select
          value={filters.language}
          onChange={(e) => setFilters({ ...filters, language: e.target.value })}
          className="px-3 py-1.5 glass rounded-lg text-white text-xs focus:outline-none focus:ring-2 focus:ring-white/30"
        >
          <option value="">All Languages</option>
          <option value="en">English</option>
          <option value="hi">Hindi</option>
          <option value="ta">Tamil</option>
          <option value="te">Telugu</option>
          <option value="ml">Malayalam</option>
          <option value="kn">Kannada</option>
        </select>

        <input
          type="number"
          value={filters.minRating}
          onChange={(e) => setFilters({ ...filters, minRating: e.target.value })}
          placeholder="Min Rating"
          min="0"
          max="10"
          step="0.1"
          className="px-3 py-1.5 glass rounded-lg text-white text-xs w-24 focus:outline-none focus:ring-2 focus:ring-white/30 placeholder-gray-400"
        />
      </div>

      {/* Search Results */}
      <AnimatePresence>
        {showResults && movies.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="absolute top-full mt-2 w-full glass-strong rounded-2xl border border-white/10 shadow-2xl z-50 max-h-96 overflow-y-auto"
          >
            <div className="p-4 space-y-2">
              {movies.map((movie) => (
                <Link
                  key={movie.id}
                  href={`/movies/${movie.id}`}
                  onClick={() => {
                    setShowResults(false)
                    onSelect?.(movie)
                  }}
                >
                  <motion.div
                    whileHover={{ scale: 1.02, x: 5 }}
                    className="flex gap-3 p-3 rounded-lg hover:bg-white/10 transition-colors cursor-pointer"
                  >
                    {movie.posterUrl && (
                      <div className="w-16 h-24 rounded-lg overflow-hidden relative flex-shrink-0">
                        <Image
                          src={poster(movie.posterUrl)}
                          alt={movie.title}
                          fill
                          className="object-cover"
                          sizes="64px"
                          unoptimized
                        />
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <h4 className="text-white font-semibold truncate">{movie.title}</h4>
                      {movie.rating && (
                        <p className="text-gray-400 text-sm">
                          ⭐ {movie.rating.toFixed(1)}
                        </p>
                      )}
                      {movie.releaseDate && (
                        <p className="text-gray-500 text-xs">
                          {new Date(movie.releaseDate).getFullYear()}
                        </p>
                      )}
                    </div>
                  </motion.div>
                </Link>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {showResults && query && !loading && movies.length === 0 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="absolute top-full mt-2 w-full glass-strong rounded-2xl border border-white/10 p-6 text-center"
        >
          <p className="text-gray-400">No movies found</p>
        </motion.div>
      )}
    </div>
  )
}


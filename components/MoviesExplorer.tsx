'use client'

import { useMemo, useState, useEffect, useRef } from 'react'
import MoviesGrid from './MoviesGrid'
import { motion, AnimatePresence } from 'framer-motion'
import CommandPalette from './CommandPalette'
import Toast from './Toast'
import { BookingIntent } from '@/hooks/useIntentParser'
import { useRouter } from 'next/navigation'

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
  nowPlaying: Movie[]
  upcoming: Movie[]
  popular: Movie[]
}

const tabs = [
  { id: 'now', label: 'Now Showing' },
  { id: 'soon', label: 'Coming Soon' },
  { id: 'pop', label: 'Popular' },
]

export default function MoviesExplorer({ nowPlaying, upcoming, popular }: Props) {
  const [activeTab, setActiveTab] = useState<'now' | 'soon' | 'pop'>('now')
  const [language, setLanguage] = useState<string>('all')
  const [isCommandPaletteOpen, setIsCommandPaletteOpen] = useState(false)
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' | 'info' } | null>(null)
  const router = useRouter()

  const allMovies =
    activeTab === 'now' ? nowPlaying : activeTab === 'soon' ? upcoming : popular

  const languages = useMemo(() => {
    const set = new Set<string>()
    ;[...nowPlaying, ...upcoming, ...popular].forEach((m) => {
      if (m.language) set.add(m.language.toUpperCase())
    })
    return ['all', ...Array.from(set)]
  }, [nowPlaying, upcoming, popular])

  const filtered = useMemo(() => {
    if (language === 'all') return allMovies
    return allMovies.filter((m) => m.language?.toUpperCase() === language)
  }, [allMovies, language])

  // Handle Cmd+K / Ctrl+K keyboard shortcut
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault()
        setIsCommandPaletteOpen(true)
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [])

  const handleIntentParsed = (intent: BookingIntent) => {
    try {
      // Search for matching movie in the current filtered list
      const movieQuery = intent.movieQuery.toLowerCase().trim()
      
      if (!movieQuery) {
        setToast({ message: 'Please specify a movie name in your query', type: 'error' })
        return
      }

      // Find matching movie
      const matchingMovie = filtered.find((movie) => 
        movie.title.toLowerCase().includes(movieQuery) ||
        movieQuery.includes(movie.title.toLowerCase())
      )

      if (!matchingMovie) {
        setToast({ 
          message: `Movie "${intent.movieQuery}" not found. Try browsing the list below.`, 
          type: 'error' 
        })
        return
      }

      // Navigate to movie detail page
      // The booking intent will be preserved via URL params or we can use sessionStorage
      const params = new URLSearchParams()
      if (intent.seats) params.set('seats', intent.seats.toString())
      if (intent.budget) params.set('budget', intent.budget.toString())
      if (intent.preferences.center) params.set('center', 'true')
      if (intent.preferences.aisle) params.set('aisle', 'true')
      if (intent.preferences.vip) params.set('vip', 'true')
      if (intent.preferences.premium) params.set('premium', 'true')
      
      // Store intent in sessionStorage for the booking page to use
      sessionStorage.setItem('bookingIntent', JSON.stringify(intent))
      
      // Add timeRange to params if it exists in intent
      if (intent.timeRange) {
        params.set('timeRange', intent.timeRange)
      }
      
      router.push(`/movies/${matchingMovie.id}${params.toString() ? '?' + params.toString() : ''}`)
      
      setToast({ 
        message: `Found "${matchingMovie.title}"! Redirecting to booking...`, 
        type: 'success' 
      })
    } catch (error: any) {
      // Safely handle errors - ensure we don't pass Event objects
      const errorMessage = error?.message || error?.toString?.() || 'Failed to process request'
      console.error('[AI Booking Assistant] Failed to process intent:', errorMessage)
      setToast({ message: 'Failed to process request. Please try again.', type: 'error' })
    }
  }

  return (
    <div className="min-h-screen pt-20 sm:pt-24 pb-20 sm:pb-32 px-4 sm:px-6 relative">
      {/* Decorative Movie Elements */}
      <div className="absolute top-32 right-10 text-6xl opacity-5 pointer-events-none z-0">
        🎬
      </div>
      <div className="absolute bottom-40 left-10 text-5xl opacity-5 pointer-events-none z-0">
        🎥
      </div>
      <div className="absolute top-1/2 left-5 text-4xl opacity-5 pointer-events-none z-0">
        🍿
      </div>
      
      <div className="max-w-7xl mx-auto space-y-8 relative z-10">
        {/* AI Assistant Trigger Button */}
        <div className="flex justify-center mb-4">
          <motion.button
            onClick={() => setIsCommandPaletteOpen(true)}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="px-6 py-3 glass-enhanced rounded-xl border border-cyan-400/30 hover:border-cyan-400/50 transition-all flex items-center gap-2 group"
          >
            <span className="text-xl">✨</span>
            <span className="font-clash font-semibold text-white">AI Booking Assistant</span>
            <kbd className="px-2 py-1 bg-white/10 rounded text-xs text-gray-400 group-hover:text-white transition-colors">
              {typeof window !== 'undefined' && navigator.platform.includes('Mac') ? '⌘' : 'Ctrl'}+K
            </kbd>
          </motion.button>
        </div>

        {/* Tabs + Filter */}
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div className="flex gap-2 sm:gap-3 overflow-x-auto pb-2 -mx-4 sm:mx-0 px-4 sm:px-0 scrollbar-hide">
            {tabs.map((tab, index) => {
              const active = activeTab === tab.id
              return (
                <motion.button
                  key={tab.id}
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  whileHover={{ scale: 1.05, y: -2 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setActiveTab(tab.id as 'now' | 'soon' | 'pop')}
                  className={`px-3 sm:px-4 py-2 rounded-full border text-sm sm:text-base whitespace-nowrap touch-manipulation relative overflow-hidden transition-all ${
                    active 
                      ? 'bg-gradient-to-r from-white to-gray-100 text-black border-white shadow-lg' 
                      : 'border-white/20 text-white/80 hover:border-white/40 hover:bg-white/5'
                  }`}
                >
                  {active && (
                    <motion.div
                      layoutId="activeTab"
                      className="absolute inset-0 bg-gradient-to-r from-white to-gray-100 rounded-full"
                      initial={false}
                      transition={{ type: "spring", stiffness: 500, damping: 30 }}
                    />
                  )}
                  <span className="relative z-10 font-clash font-semibold">{tab.label}</span>
                </motion.button>
              )
            })}
          </div>

          <div className="flex items-center gap-3">
            <span className="text-sm text-gray-300">Language</span>
            <select
              value={language}
              onChange={(e) => setLanguage(e.target.value)}
              className="glass rounded-lg px-3 py-2 text-sm border border-white/10 bg-black/40"
            >
              {languages.map((lang) => (
                <option key={lang} value={lang}>
                  {lang === 'all' ? 'All' : lang}
                </option>
              ))}
            </select>
          </div>
        </div>

        <MoviesGrid 
          movies={filtered} 
          title={activeTab === 'now' ? 'Now Showing' : activeTab === 'soon' ? 'Coming Soon' : 'Popular'}
          subtitle={
            activeTab === 'now' 
              ? 'Pick a movie to view showtimes and book seats'
              : activeTab === 'soon'
              ? 'Upcoming releases - Book your tickets in advance'
              : 'Trending movies - Most popular right now'
          }
        />
      </div>

      {/* Command Palette */}
      <CommandPalette
        isOpen={isCommandPaletteOpen}
        onClose={() => setIsCommandPaletteOpen(false)}
        onIntentParsed={handleIntentParsed}
      />

      {/* Toast Notifications */}
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          isOpen={!!toast}
          onClose={() => setToast(null)}
        />
      )}
    </div>
  )
}


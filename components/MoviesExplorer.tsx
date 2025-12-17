'use client'

import { useMemo, useState } from 'react'
import MoviesGrid from './MoviesGrid'
import { motion } from 'framer-motion'

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

        <MoviesGrid movies={filtered} />
      </div>
    </div>
  )
}


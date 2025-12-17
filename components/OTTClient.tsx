'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import Image from 'next/image'
import Link from 'next/link'
import { FaStar, FaPlayCircle } from 'react-icons/fa'

type OTTContent = {
  id: number
  title: string
  name?: string
  overview: string
  poster_path: string | null
  backdrop_path: string | null
  release_date?: string
  first_air_date?: string
  vote_average: number
  media_type: 'movie' | 'tv'
  provider_name: string
}

type Props = {
  content: {
    netflix: OTTContent[]
    prime: OTTContent[]
    apple: OTTContent[]
    hotstar: OTTContent[]
  }
}

const providerConfig = {
  netflix: {
    name: 'Netflix',
    color: 'from-red-600 to-red-800',
    icon: '🎬',
    logo: 'https://upload.wikimedia.org/wikipedia/commons/0/08/Netflix_2015_logo.svg',
  },
  prime: {
    name: 'Prime Video',
    color: 'from-blue-600 to-blue-800',
    icon: '📺',
    logo: 'https://upload.wikimedia.org/wikipedia/commons/f/f1/Prime_Video.png',
  },
  apple: {
    name: 'Apple TV+',
    color: 'from-gray-700 to-gray-900',
    icon: '🍎',
    logo: 'https://upload.wikimedia.org/wikipedia/commons/0/0e/Apple_TV_Plus_logo.svg',
  },
  hotstar: {
    name: 'Disney+ Hotstar',
    color: 'from-blue-500 to-indigo-700',
    icon: '⭐',
    logo: 'https://upload.wikimedia.org/wikipedia/commons/1/12/Disney%2B_Hotstar_logo.svg',
  },
}

export default function OTTClient({ content }: Props) {
  const [selectedProvider, setSelectedProvider] = useState<keyof typeof content>('netflix')

  const formatDate = (dateStr?: string) => {
    if (!dateStr) return 'N/A'
    try {
      return new Date(dateStr).toLocaleDateString('en-IN', { 
        year: 'numeric', 
        month: 'short', 
        day: 'numeric' 
      })
    } catch {
      return 'N/A'
    }
  }

  const currentContent = content[selectedProvider] || []
  const provider = providerConfig[selectedProvider]

  return (
    <div className="min-h-screen pt-20 sm:pt-24 pb-20 sm:pb-32 px-4 sm:px-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-7xl mx-auto"
      >
        {/* Header */}
        <div className="text-center mb-8 sm:mb-12">
          <motion.h1
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-clash font-bold mb-3 sm:mb-4"
          >
            <span className="text-white">Top 5 Trending Movies</span>
            <br />
            <span className="bg-gradient-to-r from-red-500 via-orange-500 to-yellow-500 bg-clip-text text-transparent">
              on OTT Platforms
            </span>
          </motion.h1>
          <p className="text-gray-400 text-sm sm:text-base md:text-lg px-4">
            Discover the hottest movies trending right now on your favorite streaming platforms
          </p>
        </div>

        {/* Provider Tabs */}
        <div className="mb-8 sm:mb-12">
          <div className="flex flex-wrap gap-3 sm:gap-4 justify-center">
            {(Object.keys(content) as Array<keyof typeof content>).map((providerKey) => {
              const config = providerConfig[providerKey]
              const isSelected = selectedProvider === providerKey
              return (
                <motion.button
                  key={providerKey}
                  onClick={() => setSelectedProvider(providerKey)}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className={`
                    px-6 sm:px-8 py-3 sm:py-4 rounded-xl border-2 transition-all
                    ${isSelected 
                      ? `bg-gradient-to-r ${config.color} border-white/50 shadow-lg` 
                      : 'glass border-white/10 hover:border-white/30'
                    }
                  `}
                >
                  <div className="flex items-center gap-2 sm:gap-3">
                    <span className="text-2xl sm:text-3xl">{config.icon}</span>
                    <div className="text-left">
                      <div className={`text-sm sm:text-base font-clash font-bold ${isSelected ? 'text-white' : 'text-white/70'}`}>
                        {config.name}
                      </div>
                      <div className={`text-[10px] sm:text-xs mt-0.5 ${isSelected ? 'text-white/90' : 'text-gray-400'}`}>
                        Top {content[providerKey]?.length || 0} Movies
                      </div>
                    </div>
                  </div>
                </motion.button>
              )
            })}
          </div>
        </div>

        {/* Content Grid */}
        {currentContent.length > 0 ? (
          <motion.div
            key={selectedProvider}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 sm:gap-6"
          >
            {currentContent.map((item, index) => (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                whileHover={{ y: -5 }}
                className="group"
              >
                <Link href={`/movies/${item.id}`}>
                  <div className="glass-strong rounded-xl sm:rounded-2xl overflow-hidden border border-white/10 hover:border-white/30 transition-all cursor-pointer h-full">
                    {/* Poster */}
                    <div className="relative aspect-[2/3] overflow-hidden">
                      {item.poster_path ? (
                        <Image
                          src={`https://image.tmdb.org/t/p/w500${item.poster_path}`}
                          alt={item.title}
                          fill
                          className="object-cover group-hover:scale-110 transition-transform duration-300"
                          sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 20vw"
                        />
                      ) : (
                        <div className="absolute inset-0 flex items-center justify-center bg-white/5 text-white/40 text-2xl font-bold">
                          {item.title.slice(0, 1)}
                        </div>
                      )}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
                      
                      {/* Provider Badge */}
                      <div className={`absolute top-2 left-2 px-2 py-1 rounded-lg bg-gradient-to-r ${provider.color} text-white text-[10px] font-bold shadow-lg`}>
                        {provider.icon} {provider.name}
                      </div>

                      {/* Rating */}
                      <div className="absolute top-2 right-2 flex items-center gap-1 px-2 py-1 glass rounded-lg backdrop-blur-sm">
                        <FaStar className="text-yellow-400 text-xs" />
                        <span className="text-white text-xs font-semibold">{item.vote_average.toFixed(1)}</span>
                      </div>

                      {/* View Movie Button Overlay */}
                      <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                        <motion.div
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.9 }}
                          className="px-4 py-2 rounded-full bg-white/90 flex items-center justify-center shadow-xl gap-2"
                        >
                          <FaPlayCircle className="text-black text-lg" />
                          <span className="text-black text-sm font-semibold">View Movie</span>
                        </motion.div>
                      </div>
                    </div>

                    {/* Info */}
                    <div className="p-3 sm:p-4">
                      <h3 className="text-white font-clash font-bold text-sm sm:text-base mb-1 line-clamp-2 group-hover:text-yellow-400 transition-colors">
                        {item.title}
                      </h3>
                      <p className="text-gray-400 text-xs mb-2">
                        {formatDate(item.release_date || item.first_air_date)}
                      </p>
                      <p className="text-gray-500 text-[10px] sm:text-xs line-clamp-2">
                        {item.overview}
                      </p>
                    </div>
                  </div>
                </Link>
              </motion.div>
            ))}
          </motion.div>
        ) : (
          <div className="glass rounded-2xl p-12 text-center">
            <p className="text-gray-400 text-lg mb-2">No content available</p>
            <p className="text-gray-500 text-sm">Try selecting a different provider</p>
          </div>
        )}

        {/* Footer Note */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="mt-12 text-center"
        >
          <p className="text-gray-500 text-xs sm:text-sm">
            Content availability may vary by region. Check your streaming platform for current titles.
          </p>
        </motion.div>
      </motion.div>
    </div>
  )
}


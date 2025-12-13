'use client'

import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import dynamic from 'next/dynamic'
import Image from 'next/image'
import Link from 'next/link'

// Dynamically import Particles to avoid SSR issues
const Particles = dynamic(() => import('@tsparticles/react').then(mod => mod.Particles), {
  ssr: false,
  loading: () => null,
})

// Famous movie dialogues
const movieDialogues = [
  { quote: "May the Force be with you.", movie: "Star Wars" },
  { quote: "Here's looking at you, kid.", movie: "Casablanca" },
  { quote: "I'll be back.", movie: "The Terminator" },
  { quote: "You can't handle the truth!", movie: "A Few Good Men" },
  { quote: "Life is like a box of chocolates.", movie: "Forrest Gump" },
  { quote: "I'm the king of the world!", movie: "Titanic" },
  { quote: "To infinity and beyond!", movie: "Toy Story" },
  { quote: "Why so serious?", movie: "The Dark Knight" },
  { quote: "I see dead people.", movie: "The Sixth Sense" },
  { quote: "Houston, we have a problem.", movie: "Apollo 13" },
  { quote: "There's no place like home.", movie: "The Wizard of Oz" },
  { quote: "I'll have what she's having.", movie: "When Harry Met Sally" },
  { quote: "You talking to me?", movie: "Taxi Driver" },
  { quote: "Keep your friends close, but your enemies closer.", movie: "The Godfather Part II" },
  { quote: "I feel the need... the need for speed!", movie: "Top Gun" },
  { quote: "Carpe diem. Seize the day, boys.", movie: "Dead Poets Society" },
  { quote: "I'm going to make him an offer he can't refuse.", movie: "The Godfather" },
  { quote: "You had me at hello.", movie: "Jerry Maguire" },
  { quote: "Just keep swimming.", movie: "Finding Nemo" },
  { quote: "I am Groot.", movie: "Guardians of the Galaxy" },
]

type Movie = {
  id: string
  title: string
  posterUrl: string | null
  rating?: number
}

export default function HeroSection() {
  const [typedText, setTypedText] = useState('')
  const [mounted, setMounted] = useState(false)
  const [trendingMovies, setTrendingMovies] = useState<Movie[]>([])
  const [currentDialogue, setCurrentDialogue] = useState<{ quote: string; movie: string } | null>(null)

  const tagline = "Book Your Seat Before It's Gone"

  useEffect(() => {
    setMounted(true)
    
    // Select a random dialogue on mount/refresh
    const randomDialogue = movieDialogues[Math.floor(Math.random() * movieDialogues.length)]
    setCurrentDialogue(randomDialogue)
  }, [])

  useEffect(() => {
    // Fetch trending movies from API
    const fetchMovies = async () => {
      try {
        const res = await fetch('/api/movies/popular')
        if (res.ok) {
          const data = await res.json()
          const movies = (data.results || []).slice(0, 8).map((m: any) => ({
            id: m.id,
            title: m.title,
            posterUrl: m.posterUrl,
            rating: m.rating,
          }))
          setTrendingMovies(movies)
        }
      } catch (err) {
        console.error('Failed to fetch trending movies:', err)
      }
    }

    if (mounted) {
      fetchMovies()
    }
  }, [mounted])

  useEffect(() => {
    if (!mounted) return
    
    // Typing effect
    let index = 0
    const timer = setInterval(() => {
      if (index < tagline.length) {
        setTypedText(tagline.slice(0, index + 1))
        index++
      } else {
        clearInterval(timer)
      }
    }, 100)

    return () => clearInterval(timer)
  }, [mounted])

  const particlesInit = async (engine: any) => {
    const { loadSlim } = await import('@tsparticles/slim')
    await loadSlim(engine)
  }

  if (!mounted) {
    return (
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
        <div className="relative z-10 max-w-7xl mx-auto px-6 py-20 text-center">
          <h1 className="text-6xl md:text-8xl lg:text-9xl font-clash font-bold mb-6">
            <span className="text-white">{tagline}</span>
          </h1>
        </div>
      </section>
    )
  }

  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
      {/* Particles Background - Only render on client */}
      {mounted && (
        <Particles
          id="tsparticles"
          init={particlesInit}
          className="absolute inset-0 z-0"
          options={{
            fullScreen: { enable: false },
            background: {
              color: {
                value: 'transparent',
              },
            },
            fpsLimit: 120,
            particles: {
              color: {
                value: '#ffffff',
              },
              links: {
                enable: false,
              },
              move: {
                direction: 'none',
                enable: true,
                outModes: {
                  default: 'bounce',
                },
                random: true,
                speed: 0.5,
                straight: false,
              },
              number: {
                density: {
                  enable: true,
                },
                value: 50,
              },
              opacity: {
                value: 0.15,
              },
              shape: {
                type: 'circle',
              },
              size: {
                value: { min: 1, max: 3 },
              },
            },
            detectRetina: true,
          }}
        />
      )}

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 py-12 sm:py-16 md:py-20 text-center">
        {/* Animated Tagline */}
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-3xl sm:text-4xl md:text-5xl lg:text-7xl xl:text-8xl 2xl:text-9xl font-clash font-bold mb-4 sm:mb-6 px-2 sm:px-4 leading-tight sm:leading-normal"
        >
          <span className="text-white break-words">{typedText}</span>
          {typedText.length < tagline.length && (
            <span className="inline-block w-0.5 sm:w-1 h-12 sm:h-16 md:h-20 lg:h-24 bg-white animate-pulse ml-1 sm:ml-2">|</span>
          )}
        </motion.h1>

        {/* Famous Movie Dialogue */}
        {currentDialogue && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5, duration: 0.6 }}
            className="glass-strong rounded-xl sm:rounded-2xl p-4 sm:p-6 md:p-8 mb-8 sm:mb-12 max-w-3xl mx-auto border border-white/20"
          >
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.7, duration: 0.8 }}
              className="text-lg sm:text-xl md:text-2xl lg:text-3xl xl:text-4xl font-clash font-semibold text-white mb-2 sm:mb-3 text-center italic px-2 break-words"
            >
              &ldquo;{currentDialogue.quote}&rdquo;
            </motion.p>
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.9, duration: 0.8 }}
              className="text-xs sm:text-sm md:text-base text-gray-400 text-center"
            >
              — {currentDialogue.movie}
            </motion.p>
          </motion.div>
        )}

        {/* Trending Movies Marquee */}
        {trendingMovies.length > 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1, duration: 0.8 }}
            className="relative overflow-hidden -mx-4 sm:mx-0 px-4 sm:px-0"
          >
            <div className="flex gap-3 sm:gap-4 md:gap-6 animate-marquee whitespace-nowrap">
              {[...trendingMovies, ...trendingMovies].map((movie, i) => (
                <Link
                  key={`${movie.id}-${i}`}
                  href={`/movies/${movie.id}`}
                  className="glass rounded-lg sm:rounded-xl p-2 sm:p-3 md:p-4 min-w-[120px] sm:min-w-[140px] md:min-w-[180px] hover:border-white/30 transition-all duration-300 group touch-manipulation"
                >
                  <div className="w-full h-40 sm:h-48 md:h-64 bg-white/5 rounded-lg mb-1.5 sm:mb-2 md:mb-3 flex items-center justify-center border border-white/10 overflow-hidden relative">
                    {movie.posterUrl ? (
                      <Image
                        src={movie.posterUrl}
                        alt={movie.title}
                        fill
                        className="object-cover group-hover:scale-110 transition-transform duration-300"
                        sizes="(max-width: 640px) 120px, (max-width: 768px) 140px, 180px"
                        unoptimized
                      />
                    ) : (
                      <span className="text-xs sm:text-sm md:text-base font-clash text-center px-2 text-white/70 line-clamp-2">{movie.title}</span>
                    )}
                    {movie.rating && (
                      <div className="absolute top-1.5 right-1.5 sm:top-2 sm:right-2 bg-black/70 px-1.5 sm:px-2 py-0.5 sm:py-1 rounded-full text-[10px] sm:text-xs font-semibold text-white">
                        ⭐ {movie.rating.toFixed(1)}
                      </div>
                    )}
                  </div>
                  <p className="text-[10px] sm:text-xs md:text-sm font-medium truncate text-white/80 group-hover:text-white transition-colors px-0.5">{movie.title}</p>
                </Link>
              ))}
            </div>
          </motion.div>
        )}

        {/* CTA Buttons */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.2, duration: 0.6 }}
          className="mt-8 sm:mt-12 flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center items-stretch sm:items-center px-4 sm:px-0"
        >
          <motion.a
            href="/movies"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="inline-block w-full sm:w-auto px-6 sm:px-6 md:px-8 py-3 sm:py-3 md:py-4 bg-white text-black rounded-full font-clash font-semibold text-sm sm:text-base md:text-lg hover:bg-white/90 transition-all touch-manipulation min-h-[48px] flex items-center justify-center"
          >
            Explore Movies →
          </motion.a>
          <motion.a
            href="/mood-recommend"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="inline-block w-full sm:w-auto px-6 sm:px-6 md:px-8 py-3 sm:py-3 md:py-4 glass rounded-full border border-white/20 hover:border-white/40 transition-all text-white font-clash font-semibold text-sm sm:text-base md:text-lg touch-manipulation min-h-[48px] flex items-center justify-center"
          >
            🎭 Mood Match
          </motion.a>
        </motion.div>
      </div>

      <style jsx>{`
        @keyframes marquee {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
        .animate-marquee {
          animation: marquee 30s linear infinite;
        }
      `}</style>
    </section>
  )
}


'use client'

import { motion, AnimatePresence } from 'framer-motion'
import { useEffect } from 'react'

type Props = {
  isOpen: boolean
  onClose: () => void
  trailerUrl: string | null
  movieTitle: string
}

export default function TrailerModal({ isOpen, onClose, trailerUrl, movieTitle }: Props) {
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = 'unset'
    }
    return () => {
      document.body.style.overflow = 'unset'
    }
  }, [isOpen])

  if (!trailerUrl) return null

  // Extract YouTube video ID from URL
  const getYouTubeId = (url: string) => {
    if (!url) return null
    
    // Handle direct YouTube embed URLs
    if (url.includes('youtube.com/embed/')) {
      const match = url.match(/youtube\.com\/embed\/([^?#&]+)/)
      return match ? match[1] : null
    }
    
    // Handle youtu.be short URLs
    if (url.includes('youtu.be/')) {
      const match = url.match(/youtu\.be\/([^?#&]+)/)
      return match ? match[1] : null
    }
    
    // Handle watch URLs
    const regExp = /(?:youtube\.com\/watch\?v=|youtube\.com\/v\/|youtube\.com\/.*[?&]v=)([^#&?]+)/
    const match = url.match(regExp)
    return match && match[1].length === 11 ? match[1] : null
  }

  const videoId = getYouTubeId(trailerUrl)
  const embedUrl = videoId ? `https://www.youtube.com/embed/${videoId}?autoplay=1&rel=0&enablejsapi=1` : null

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center p-4"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="relative w-full max-w-5xl aspect-video bg-black rounded-lg overflow-hidden"
            >
              <button
                onClick={onClose}
                className="absolute top-4 right-4 z-10 w-10 h-10 rounded-full bg-black/50 hover:bg-black/70 flex items-center justify-center text-white transition-colors"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
              {embedUrl ? (
                <iframe
                  src={embedUrl}
                  className="w-full h-full"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-white">
                  <p>Trailer not available</p>
                </div>
              )}
            </motion.div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}


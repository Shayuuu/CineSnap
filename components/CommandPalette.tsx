'use client'

import { useEffect, useState, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useIntentParser, BookingIntent } from '@/hooks/useIntentParser'

type Props = {
  isOpen: boolean
  onClose: () => void
  onIntentParsed: (intent: BookingIntent) => void
  movieTitle?: string
}

export default function CommandPalette({ isOpen, onClose, onIntentParsed, movieTitle }: Props) {
  const [query, setQuery] = useState('')
  const [isProcessing, setIsProcessing] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)
  const { parseIntent } = useIntentParser()

  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus()
    }
  }, [isOpen])

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault()
        if (isOpen) {
          onClose()
        } else {
          // This will be handled by parent
        }
      }
      if (e.key === 'Escape' && isOpen) {
        onClose()
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [isOpen, onClose])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!query.trim() || isProcessing) return

    setIsProcessing(true)
    
    // Simulate AI processing delay (in production, this would call an API)
    await new Promise(resolve => setTimeout(resolve, 800))

    try {
      const intent = parseIntent(query)
      
      // Telemetry: log time to suggestion
      const startTime = performance.now()
      const timeToSuggestion = performance.now() - startTime
      console.log('[AI Booking Assistant] Intent parsed:', {
        query,
        intent,
        timeToSuggestion: `${timeToSuggestion.toFixed(2)}ms`,
      })

      onIntentParsed(intent)
      setQuery('')
      onClose()
    } catch (error: any) {
      console.error('[AI Booking Assistant] Parse error:', error?.message || error)
      // Don't throw - just log the error
    } finally {
      setIsProcessing(false)
    }
  }

  const exampleQueries = [
    '2 seats near center tonight under ₹400',
    '3 tickets aisle seats tomorrow evening',
    '1 VIP seat for tonight',
    '4 seats premium tonight under ₹2000',
  ]

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50"
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: -20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: -20 }}
            className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-50 w-full max-w-2xl mx-4"
          >
            <div className="glass-strong rounded-2xl p-6 border border-white/20 shadow-2xl">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-cyan-400 to-magenta-400 flex items-center justify-center">
                  <span className="text-xl">✨</span>
                </div>
                <div>
                  <h2 className="text-xl font-clash font-bold text-white">AI Booking Assistant</h2>
                  <p className="text-sm text-gray-400">Describe what you're looking for</p>
                </div>
              </div>

              <form onSubmit={handleSubmit} className="mb-4">
                <div className="relative">
                  <input
                    ref={inputRef}
                    type="text"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    placeholder={movieTitle ? `e.g., "2 seats near center tonight under ₹400 for ${movieTitle}"` : 'e.g., "2 seats near center tonight under ₹400"'}
                    className="w-full px-4 py-3 pr-12 bg-black/40 border border-white/10 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-cyan-400/50 focus:ring-2 focus:ring-cyan-400/20 transition-all"
                    disabled={isProcessing}
                  />
                  {isProcessing && (
                    <div className="absolute right-4 top-1/2 transform -translate-y-1/2">
                      <div className="w-5 h-5 border-2 border-cyan-400 border-t-transparent rounded-full animate-spin" />
                    </div>
                  )}
                </div>

                <div className="flex items-center justify-between mt-3">
                  <div className="flex items-center gap-2 text-xs text-gray-400">
                    <kbd className="px-2 py-1 bg-white/10 rounded text-xs">Enter</kbd>
                    <span>to search</span>
                    <kbd className="px-2 py-1 bg-white/10 rounded text-xs">Esc</kbd>
                    <span>to close</span>
                  </div>
                  <button
                    type="submit"
                    disabled={!query.trim() || isProcessing}
                    className="px-4 py-2 bg-gradient-to-r from-cyan-400 to-magenta-400 text-white rounded-lg font-semibold text-sm hover:shadow-lg hover:shadow-cyan-400/30 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isProcessing ? 'Processing...' : 'Find Seats'}
                  </button>
                </div>
              </form>

              {/* Example queries */}
              <div className="mt-4 pt-4 border-t border-white/10">
                <p className="text-xs text-gray-400 mb-2">Try these examples:</p>
                <div className="flex flex-wrap gap-2">
                  {exampleQueries.map((example, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => setQuery(example)}
                      className="px-3 py-1.5 text-xs glass rounded-lg text-white/70 hover:text-white hover:bg-white/10 transition-all"
                    >
                      {example}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}


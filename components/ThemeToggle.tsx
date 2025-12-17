'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { FaSun, FaMoon } from 'react-icons/fa'

export default function ThemeToggle() {
  const [isDark, setIsDark] = useState(true)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
    // Always start with dark mode for this premium design
    setIsDark(true)
    document.documentElement.classList.add('dark')
  }, [])

  const toggleTheme = () => {
    const newIsDark = !isDark
    setIsDark(newIsDark)
    
    if (newIsDark) {
      document.documentElement.classList.add('dark')
    } else {
      document.documentElement.classList.remove('dark')
    }
  }

  if (!mounted) return null

  return (
    <motion.button
      onClick={toggleTheme}
      whileHover={{ scale: 1.1 }}
      whileTap={{ scale: 0.9 }}
      className="relative w-12 h-12 rounded-full glass border border-white/20 hover:border-cyan-400/50 transition-all flex items-center justify-center group"
      aria-label="Toggle theme"
    >
      <motion.div
        initial={false}
        animate={{ rotate: isDark ? 0 : 180 }}
        transition={{ duration: 0.5, ease: "easeInOut" }}
        className="relative w-6 h-6"
      >
        {isDark ? (
          <FaMoon className="w-full h-full text-cyan-400" />
        ) : (
          <FaSun className="w-full h-full text-yellow-400" />
        )}
      </motion.div>
      <span className="absolute inset-0 rounded-full bg-gradient-to-r from-cyan-400/20 to-magenta-400/20 opacity-0 group-hover:opacity-100 transition-opacity blur-md" />
    </motion.button>
  )
}


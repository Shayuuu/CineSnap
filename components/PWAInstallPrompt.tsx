'use client'

import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'

export default function PWAInstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null)
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const handler = (e: any) => {
      e.preventDefault()
      setDeferredPrompt(e)
      setVisible(true)
    }
    window.addEventListener('beforeinstallprompt', handler)
    return () => window.removeEventListener('beforeinstallprompt', handler)
  }, [])

  const onInstall = async () => {
    if (!deferredPrompt) return
    deferredPrompt.prompt()
    const { outcome } = await deferredPrompt.userChoice
    setVisible(false)
    setDeferredPrompt(null)
  }

  if (!visible) return null

  return (
    <motion.div
      initial={{ y: 80, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 glass-strong rounded-2xl px-5 py-3 border border-white/10 shadow-lg flex items-center gap-3"
    >
      <div className="text-sm text-white">
        Install CineSnap for a faster experience
      </div>
      <button
        onClick={onInstall}
        className="px-3 py-2 bg-white text-black rounded-full text-sm font-semibold hover:bg-white/90 transition"
      >
        Install
      </button>
      <button
        onClick={() => setVisible(false)}
        className="text-xs text-gray-300 hover:text-white"
      >
        Dismiss
      </button>
    </motion.div>
  )
}


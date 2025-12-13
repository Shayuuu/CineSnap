'use client'

import { useEffect, useState } from 'react'

export default function MovieThemeDecorations() {
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted || typeof window === 'undefined') return null

  return (
    <>
      {/* Film Strip Background Pattern */}
      <div className="fixed inset-0 pointer-events-none z-0 opacity-5">
        <div className="absolute inset-0" style={{
          backgroundImage: `repeating-linear-gradient(
            0deg,
            transparent,
            transparent 20px,
            rgba(255, 255, 255, 0.1) 20px,
            rgba(255, 255, 255, 0.1) 22px
          )`,
        }} />
      </div>

      {/* Floating Movie Icons */}
      <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
        {/* Popcorn */}
        <div className="absolute top-20 left-10 animate-float text-4xl opacity-10" style={{ animationDelay: '0s', animationDuration: '6s' }}>
          🍿
        </div>
        <div className="absolute top-40 right-20 animate-float text-3xl opacity-10" style={{ animationDelay: '2s', animationDuration: '8s' }}>
          🍿
        </div>
        <div className="absolute bottom-32 left-1/4 animate-float text-5xl opacity-10" style={{ animationDelay: '4s', animationDuration: '7s' }}>
          🍿
        </div>

        {/* Movie Tickets */}
        <div className="absolute top-60 right-1/4 animate-float text-3xl opacity-10" style={{ animationDelay: '1s', animationDuration: '9s' }}>
          🎫
        </div>
        <div className="absolute bottom-60 left-20 animate-float text-4xl opacity-10" style={{ animationDelay: '3s', animationDuration: '6.5s' }}>
          🎫
        </div>
        <div className="absolute top-1/3 right-10 animate-float text-2xl opacity-10" style={{ animationDelay: '5s', animationDuration: '8.5s' }}>
          🎫
        </div>

        {/* Clapperboard */}
        <div className="absolute top-1/2 left-16 animate-float text-4xl opacity-10" style={{ animationDelay: '2.5s', animationDuration: '7.5s' }}>
          🎬
        </div>
        <div className="absolute bottom-1/3 right-1/3 animate-float text-3xl opacity-10" style={{ animationDelay: '4.5s', animationDuration: '9.5s' }}>
          🎬
        </div>

        {/* Movie Camera */}
        <div className="absolute top-1/4 left-1/3 animate-float text-3xl opacity-10" style={{ animationDelay: '1.5s', animationDuration: '8s' }}>
          🎥
        </div>
        <div className="absolute bottom-1/4 right-16 animate-float text-4xl opacity-10" style={{ animationDelay: '3.5s', animationDuration: '7s' }}>
          🎥
        </div>

        {/* Stars */}
        <div className="absolute top-32 right-1/2 animate-twinkle text-2xl opacity-20" style={{ animationDelay: '0s' }}>
          ⭐
        </div>
        <div className="absolute top-80 left-1/2 animate-twinkle text-xl opacity-20" style={{ animationDelay: '1s' }}>
          ⭐
        </div>
        <div className="absolute bottom-40 right-1/4 animate-twinkle text-3xl opacity-20" style={{ animationDelay: '2s' }}>
          ⭐
        </div>
        <div className="absolute top-1/2 right-1/5 animate-twinkle text-xl opacity-20" style={{ animationDelay: '3s' }}>
          ⭐
        </div>
      </div>

      {/* Movie Reel Decoration (Top) */}
      <div className="fixed top-0 left-0 right-0 h-2 bg-gradient-to-r from-transparent via-white/5 to-transparent z-0 pointer-events-none">
        <div className="absolute inset-0" style={{
          backgroundImage: `repeating-linear-gradient(
            90deg,
            transparent,
            transparent 40px,
            rgba(255, 255, 255, 0.1) 40px,
            rgba(255, 255, 255, 0.1) 42px
          )`,
        }} />
      </div>

      {/* Movie Reel Decoration (Bottom) */}
      <div className="fixed bottom-0 left-0 right-0 h-2 bg-gradient-to-r from-transparent via-white/5 to-transparent z-0 pointer-events-none">
        <div className="absolute inset-0" style={{
          backgroundImage: `repeating-linear-gradient(
            90deg,
            transparent,
            transparent 40px,
            rgba(255, 255, 255, 0.1) 40px,
            rgba(255, 255, 255, 0.1) 42px
          )`,
        }} />
      </div>
    </>
  )
}


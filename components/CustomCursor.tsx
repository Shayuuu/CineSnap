'use client'

import { useEffect, useState } from 'react'

export default function CustomCursor() {
  const [position, setPosition] = useState({ x: 0, y: 0 })
  const [trail, setTrail] = useState<Array<{ x: number; y: number; id: string }>>([])
  const [mounted, setMounted] = useState(false)
  const [isDesktop, setIsDesktop] = useState(false)

  useEffect(() => {
    setMounted(true)
    setIsDesktop(window.innerWidth >= 768)

    if (window.innerWidth < 768) return

    const updateCursor = (e: MouseEvent) => {
      setPosition({ x: e.clientX, y: e.clientY })
      
      setTrail((prev) => {
        // Use a combination of timestamp and random number to ensure unique IDs
        const newId = `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
        const newTrail = [...prev, { x: e.clientX, y: e.clientY, id: newId }]
        return newTrail.slice(-5) // Keep last 5 trail points
      })
    }

    window.addEventListener('mousemove', updateCursor)
    
    const handleResize = () => {
      setIsDesktop(window.innerWidth >= 768)
    }
    window.addEventListener('resize', handleResize)

    return () => {
      window.removeEventListener('mousemove', updateCursor)
      window.removeEventListener('resize', handleResize)
    }
  }, [])

  // Don't render on server or mobile
  if (!mounted || !isDesktop) return null

  return (
    <>
      <div
        className="custom-cursor"
        style={{
          left: `${position.x}px`,
          top: `${position.y}px`,
          transform: 'translate(-50%, -50%)',
        }}
      />
      {trail.map((point, i) => (
        <div
          key={point.id}
          className="custom-cursor-trail"
          style={{
            left: `${point.x}px`,
            top: `${point.y}px`,
            transform: 'translate(-50%, -50%)',
            opacity: (i + 1) / trail.length * 0.6,
            transition: 'opacity 0.3s ease',
          }}
        />
      ))}
    </>
  )
}


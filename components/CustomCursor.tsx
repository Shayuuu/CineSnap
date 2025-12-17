'use client'

import { useEffect, useState, useRef } from 'react'

export default function CustomCursor() {
  const [position, setPosition] = useState({ x: 0, y: 0 })
  const [trail, setTrail] = useState<Array<{ x: number; y: number; id: string; opacity: number }>>([])
  const [mounted, setMounted] = useState(false)
  const [isDesktop, setIsDesktop] = useState(false)
  const [isHovering, setIsHovering] = useState(false)
  const cursorRef = useRef<HTMLDivElement>(null)
  const trailTimeoutRef = useRef<NodeJS.Timeout>()

  useEffect(() => {
    setMounted(true)
    setIsDesktop(window.innerWidth >= 768)

    if (window.innerWidth < 768) return

    let mouseX = 0
    let mouseY = 0
    let cursorX = 0
    let cursorY = 0

    const updateCursor = (e: MouseEvent) => {
      mouseX = e.clientX
      mouseY = e.clientY

      // Smooth magnetic effect
      const updatePosition = () => {
        const dx = mouseX - cursorX
        const dy = mouseY - cursorY
        cursorX += dx * 0.15
        cursorY += dy * 0.15

        setPosition({ x: cursorX, y: cursorY })

        // Add trail point
        setTrail((prev) => {
          const newId = `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
          const newTrail = [...prev, { x: cursorX, y: cursorY, id: newId, opacity: 0.8 }]
          
          // Fade out trail points
          setTimeout(() => {
            setTrail((current) => 
              current.map((point) => 
                point.id === newId ? { ...point, opacity: 0 } : point
              )
            )
          }, 200)

          return newTrail.slice(-8) // Keep last 8 trail points
        })

        requestAnimationFrame(updatePosition)
      }

      updatePosition()
    }

    // Check for hoverable elements
    const handleMouseEnter = () => setIsHovering(true)
    const handleMouseLeave = () => setIsHovering(false)

    // Add hover listeners to interactive elements
    const interactiveElements = document.querySelectorAll('a, button, [role="button"], input, textarea, select')
    interactiveElements.forEach((el) => {
      el.addEventListener('mouseenter', handleMouseEnter)
      el.addEventListener('mouseleave', handleMouseLeave)
    })

    window.addEventListener('mousemove', updateCursor)
    
    const handleResize = () => {
      setIsDesktop(window.innerWidth >= 768)
    }
    window.addEventListener('resize', handleResize)

    return () => {
      window.removeEventListener('mousemove', updateCursor)
      window.removeEventListener('resize', handleResize)
      interactiveElements.forEach((el) => {
        el.removeEventListener('mouseenter', handleMouseEnter)
        el.removeEventListener('mouseleave', handleMouseLeave)
      })
      if (trailTimeoutRef.current) {
        clearTimeout(trailTimeoutRef.current)
      }
    }
  }, [])

  // Don't render on server or mobile
  if (!mounted || !isDesktop) return null

  return (
    <>
      <div
        ref={cursorRef}
        className={`custom-cursor ${isHovering ? 'hover' : ''}`}
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
            opacity: point.opacity * (0.3 + (i / trail.length) * 0.4),
            transition: 'opacity 0.2s ease',
          }}
        />
      ))}
    </>
  )
}

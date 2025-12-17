import confetti from 'canvas-confetti'

export const triggerConfetti = (type: 'success' | 'celebration' | 'neon' = 'success') => {
  const duration = 3000
  const end = Date.now() + duration

  const colors = {
    success: ['#22c55e', '#10b981', '#059669'],
    celebration: ['#f59e0b', '#ef4444', '#8b5cf6'],
    neon: ['#00f9ff', '#ff2d92', '#ffffff'],
  }

  const confettiColors = colors[type]

  const frame = () => {
    confetti({
      particleCount: 3,
      angle: 60,
      spread: 55,
      origin: { x: 0 },
      colors: confettiColors,
    })
    confetti({
      particleCount: 3,
      angle: 120,
      spread: 55,
      origin: { x: 1 },
      colors: confettiColors,
    })

    if (Date.now() < end) {
      requestAnimationFrame(frame)
    }
  }

  frame()

  // Burst effect
  setTimeout(() => {
    confetti({
      particleCount: 100,
      spread: 70,
      origin: { y: 0.6 },
      colors: confettiColors,
    })
  }, 100)
}


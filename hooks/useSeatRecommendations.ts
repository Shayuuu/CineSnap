'use client'

import { useMemo } from 'react'
import { BookingIntent } from './useIntentParser'

type Seat = {
  id: string
  row: string
  number: number
  type?: 'STANDARD' | 'PREMIUM' | 'VIP'
}

type SeatRecommendation = {
  seatIds: string[]
  score: number
  reason: string
  totalPrice: number
}

const getSeatPrice = (type?: string | null, basePrice: number = 500): number => {
  if (!type) return basePrice < 800 ? 800 : basePrice
  
  const normalizedType = String(type).toUpperCase()
  switch (normalizedType) {
    case 'VIP':
      return 1500
    case 'PREMIUM':
      return 1000
    case 'STANDARD':
      return basePrice < 800 ? 800 : basePrice
    default:
      return basePrice < 800 ? 800 : basePrice
  }
}

/**
 * Recommends seat groups based on booking intent
 */
export function useSeatRecommendations(
  seats: Seat[],
  bookedSeats: string[],
  lockedSeats: string[],
  intent: BookingIntent,
  pricePerSeat: number
) {
  const recommendations = useMemo(() => {
    if (!intent || seats.length === 0) return []

    const availableSeats = seats.filter(
      seat => !bookedSeats.includes(seat.id) && !lockedSeats.includes(seat.id)
    )

    if (availableSeats.length < intent.seats) return []

    // Group seats by row
    const seatsByRow = availableSeats.reduce((acc, seat) => {
      if (!acc[seat.row]) acc[seat.row] = []
      acc[seat.row].push(seat)
      return acc
    }, {} as Record<string, Seat[]>)

    const recommendations: SeatRecommendation[] = []

    // Find seat groups
    Object.entries(seatsByRow).forEach(([row, rowSeats]) => {
      // Sort seats by number
      const sortedSeats = [...rowSeats].sort((a, b) => a.number - b.number)

      // Find consecutive groups of the required size
      for (let i = 0; i <= sortedSeats.length - intent.seats; i++) {
        const group = sortedSeats.slice(i, i + intent.seats)
        const seatIds = group.map(s => s.id)
        
        // Calculate score based on preferences
        let score = 0
        const reasons: string[] = []
        
        // Center preference
        if (intent.preferences.center) {
          const totalSeats = sortedSeats.length
          const centerIndex = Math.floor(totalSeats / 2)
          const groupCenter = i + Math.floor(intent.seats / 2)
          const distanceFromCenter = Math.abs(groupCenter - centerIndex)
          const maxDistance = totalSeats / 2
          const centerScore = (1 - distanceFromCenter / maxDistance) * 30
          score += centerScore
          if (centerScore > 20) reasons.push('near center')
        }

        // Aisle preference
        if (intent.preferences.aisle) {
          const isAtStart = i === 0
          const isAtEnd = i + intent.seats === sortedSeats.length
          if (isAtStart || isAtEnd) {
            score += 25
            reasons.push('aisle seats')
          }
        }

        // VIP/Premium preference
        if (intent.preferences.vip || intent.preferences.premium) {
          const hasVip = group.some(s => s.type === 'VIP')
          const hasPremium = group.some(s => s.type === 'PREMIUM')
          if (hasVip && intent.preferences.vip) {
            score += 30
            reasons.push('VIP seats')
          } else if (hasPremium && intent.preferences.premium) {
            score += 20
            reasons.push('premium seats')
          }
        }

        // Budget constraint
        const totalPrice = group.reduce((sum, seat) => {
          return sum + getSeatPrice(seat.type, pricePerSeat)
        }, 0)
        
        if (intent.budget) {
          if (totalPrice <= intent.budget * 100) { // Convert to paise
            score += 25
            reasons.push('within budget')
          } else {
            // Penalize if over budget
            score -= 50
          }
        }

        // Prefer consecutive seats (bonus)
        const isConsecutive = group.every((seat, idx) => {
      if (idx === 0) return true
      return seat.number === group[idx - 1].number + 1
    })
        if (isConsecutive) {
      score += 15
      reasons.push('consecutive seats')
    }

        recommendations.push({
          seatIds,
          score,
          reason: reasons.length > 0 
            ? `Chosen because ${reasons.join(', ')}`
            : 'Available seats',
          totalPrice,
        })
      }
    })

    // Sort by score (highest first) and return top 3
    return recommendations
      .sort((a, b) => b.score - a.score)
      .slice(0, 3)
      .filter(rec => rec.score > 0) // Only return positive scores
  }, [seats, bookedSeats, lockedSeats, intent, pricePerSeat])

  return recommendations
}


'use client'

import { useMemo } from 'react'

export type BookingIntent = {
  movieQuery: string
  date: string | null
  timeRange: string | null
  seats: number
  budget: number | null
  preferences: {
    center: boolean
    aisle: boolean
    vip: boolean
    premium: boolean
  }
}

/**
 * Parses natural language booking queries into structured intent
 * Example: "2 seats near center tonight under ₹400 for Deadpool"
 */
export function useIntentParser() {
  const parseIntent = (query: string): BookingIntent => {
    const lowerQuery = query.toLowerCase().trim()
    
    // Initialize default intent
    const intent: BookingIntent = {
      movieQuery: '',
      date: null,
      timeRange: null,
      seats: 1,
      budget: null,
      preferences: {
        center: false,
        aisle: false,
        vip: false,
        premium: false,
      },
    }

    // Extract seat count (e.g., "2 seats", "3 tickets", "four seats")
    const seatPatterns = [
      /(\d+)\s*(?:seats?|tickets?|places?)/i,
      /(?:seats?|tickets?|places?)\s*(?:for|of|:)?\s*(\d+)/i,
      /\b(one|two|three|four|five|six|seven|eight|nine|ten)\s*(?:seats?|tickets?)/i,
    ]
    
    for (const pattern of seatPatterns) {
      const match = lowerQuery.match(pattern)
      if (match) {
        const num = match[1]
        if (isNaN(Number(num))) {
          const wordToNum: Record<string, number> = {
            one: 1, two: 2, three: 3, four: 4, five: 5,
            six: 6, seven: 7, eight: 8, nine: 9, ten: 10,
          }
          intent.seats = wordToNum[num.toLowerCase()] || 1
        } else {
          intent.seats = parseInt(num, 10)
        }
        break
      }
    }

    // Extract budget (e.g., "under ₹400", "below 500", "less than 300 rupees")
    const budgetPatterns = [
      /(?:under|below|less than|max|maximum|upto|up to)\s*(?:₹|rs\.?|rupees?)?\s*(\d+)/i,
      /(\d+)\s*(?:₹|rs\.?|rupees?)?\s*(?:or less|maximum|max)/i,
    ]
    
    for (const pattern of budgetPatterns) {
      const match = lowerQuery.match(pattern)
      if (match) {
        intent.budget = parseInt(match[1], 10)
        break
      }
    }

    // Extract date preferences
    const today = new Date()
    const tomorrow = new Date(today)
    tomorrow.setDate(tomorrow.getDate() + 1)
    
    if (lowerQuery.includes('tonight') || lowerQuery.includes('today') || lowerQuery.includes('this evening')) {
      intent.date = today.toISOString().split('T')[0]
    } else if (lowerQuery.includes('tomorrow')) {
      intent.date = tomorrow.toISOString().split('T')[0]
    } else {
      // Try to extract specific dates (e.g., "Dec 25", "25th December")
      const datePatterns = [
        /(?:on|for)\s*(\d{1,2})(?:st|nd|rd|th)?\s*(?:jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec)/i,
        /(jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec)\s*(\d{1,2})/i,
      ]
      // Simplified: if contains a date pattern, set to today for now
      // In production, you'd parse the actual date
    }

    // Extract time preferences
    if (lowerQuery.includes('morning') || lowerQuery.includes('before 12') || lowerQuery.includes('am')) {
      intent.timeRange = 'morning'
    } else if (lowerQuery.includes('afternoon') || lowerQuery.includes('12') || lowerQuery.includes('1pm') || lowerQuery.includes('2pm') || lowerQuery.includes('3pm')) {
      intent.timeRange = 'afternoon'
    } else if (lowerQuery.includes('evening') || lowerQuery.includes('evening show') || lowerQuery.includes('6pm') || lowerQuery.includes('7pm') || lowerQuery.includes('8pm') || lowerQuery.includes('6:00') || lowerQuery.includes('7:00') || lowerQuery.includes('8:00')) {
      intent.timeRange = 'evening'
    } else if (lowerQuery.includes('night') || lowerQuery.includes('9pm') || lowerQuery.includes('10pm') || lowerQuery.includes('11pm')) {
      intent.timeRange = 'night'
    }

    // Extract location preferences
    if (lowerQuery.includes('center') || lowerQuery.includes('centre') || lowerQuery.includes('middle')) {
      intent.preferences.center = true
    }
    if (lowerQuery.includes('aisle') || lowerQuery.includes('side')) {
      intent.preferences.aisle = true
    }
    if (lowerQuery.includes('vip') || lowerQuery.includes('premium')) {
      intent.preferences.vip = lowerQuery.includes('vip')
      intent.preferences.premium = lowerQuery.includes('premium') || lowerQuery.includes('vip')
    }

    // Extract movie name (everything that's not a number, date, or preference keyword)
    // Remove extracted patterns and clean up
    let movieQuery = query
      .replace(/\d+\s*(?:seats?|tickets?|places?)/gi, '')
      .replace(/(?:under|below|less than|max|maximum|upto|up to)\s*(?:₹|rs\.?|rupees?)?\s*\d+/gi, '')
      .replace(/\b(?:tonight|today|tomorrow|morning|afternoon|evening|night)\b/gi, '')
      .replace(/\b(?:center|centre|middle|aisle|side|vip|premium|near|for|under|below)\b/gi, '')
      .trim()
    
    // Remove common stop words but keep movie-related terms
    movieQuery = movieQuery
      .replace(/\b(?:seats?|tickets?|for|of|the|a|an|and|or|in|on|at)\b/gi, ' ')
      .replace(/\s+/g, ' ')
      .trim()
    
    intent.movieQuery = movieQuery || ''

    return intent
  }

  return { parseIntent }
}


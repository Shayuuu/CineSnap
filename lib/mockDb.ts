// Mock database functions for showcase mode (no real database needed)

import {
  MOCK_MOVIES,
  MOCK_THEATERS,
  MOCK_SHOWTIMES,
  MOCK_BOOKINGS,
  MOCK_USERS,
  getTheaterByScreenId,
  getShowtimesForMovie,
  getSeatsForScreen,
} from './mockData'

// Check if we're in showcase mode
export const IS_SHOWCASE_MODE = process.env.SHOWCASE_MODE === 'true' || !process.env.DB_HOST

export async function query<T = any>(sql: string, params?: any[]): Promise<T[]> {
  if (!IS_SHOWCASE_MODE) {
    // Use real database if available
    const { query: realQuery } = await import('./db')
    return realQuery<T>(sql, params)
  }

  // Mock database queries
  return mockQuery<T>(sql, params)
}

export async function queryOne<T = any>(sql: string, params?: any[]): Promise<T | null> {
  const results = await query<T>(sql, params)
  return results[0] || null
}

export async function execute(sql: string, params?: any[]): Promise<any> {
  if (!IS_SHOWCASE_MODE) {
    const { execute: realExecute } = await import('./db')
    return realExecute(sql, params)
  }

  return mockExecute(sql, params)
}

function mockQuery<T = any>(sql: string, params?: any[]): T[] {
  const lowerSql = sql.toLowerCase().trim()

  // Movies queries
  if (lowerSql.includes('select') && lowerSql.includes('movie')) {
    if (lowerSql.includes('where id =') || lowerSql.includes('where id=') || lowerSql.includes('where "id" =')) {
      const movieId = params?.[0]
      const movie = MOCK_MOVIES.find(m => m.id === String(movieId))
      return (movie ? [movie] : []) as T[]
    }
    if (lowerSql.includes('limit')) {
      const limit = params?.[params.length - 1] || 10
      return MOCK_MOVIES.slice(0, Number(limit)) as T[]
    }
    return MOCK_MOVIES as T[]
  }

  // Showtimes queries
  if (lowerSql.includes('select') && lowerSql.includes('showtime')) {
    if (lowerSql.includes('where movieid =') || lowerSql.includes('where movieid=')) {
      const movieId = params?.[0]
      const showtimes = MOCK_SHOWTIMES.filter(st => st.movieId === String(movieId))
      return showtimes.map(st => ({
        ...st,
        screenName: getTheaterByScreenId(st.screenId)?.screen.name || 'Screen 1',
        theaterName: getTheaterByScreenId(st.screenId)?.theater.name || 'Theater',
        theaterLocation: getTheaterByScreenId(st.screenId)?.theater.location || 'Mumbai',
        theaterId: getTheaterByScreenId(st.screenId)?.theater.id,
      })) as T[]
    }
    if (lowerSql.includes('where id =') || lowerSql.includes('where id=')) {
      const showtimeId = params?.[0]
      const showtime = MOCK_SHOWTIMES.find(st => st.id === String(showtimeId))
      if (showtime) {
        const theaterData = getTheaterByScreenId(showtime.screenId)
        return [{
          ...showtime,
          screenName: theaterData?.screen.name || 'Screen 1',
          theaterName: theaterData?.theater.name || 'Theater',
          theaterLocation: theaterData?.theater.location || 'Mumbai',
        }] as T[]
      }
      return []
    }
    return MOCK_SHOWTIMES as T[]
  }

  // Seats queries
  if (lowerSql.includes('select') && lowerSql.includes('seat')) {
    if (lowerSql.includes('where screenid =') || lowerSql.includes('where screenid=')) {
      const screenId = params?.[0]
      return getSeatsForScreen(String(screenId)) as T[]
    }
    return []
  }

  // Bookings queries
  if (lowerSql.includes('select') && lowerSql.includes('booking')) {
    return MOCK_BOOKINGS as T[]
  }

  // Users queries
  if (lowerSql.includes('select') && lowerSql.includes('user')) {
    if (lowerSql.includes('where email =') || lowerSql.includes('where email=') || lowerSql.includes('lower(email)')) {
      const email = params?.[0]
      const user = MOCK_USERS.find(u => u.email.toLowerCase() === String(email).toLowerCase())
      return (user ? [{ ...user, passwordHash: user.password }] : []) as T[]
    }
    if (lowerSql.includes('where id =') || lowerSql.includes('where id=')) {
      const userId = params?.[0]
      const user = MOCK_USERS.find(u => u.id === String(userId))
      return (user ? [{ ...user, passwordHash: user.password }] : []) as T[]
    }
    return MOCK_USERS.map(u => ({ ...u, passwordHash: u.password })) as T[]
  }

  // Loyalty points queries
  if (lowerSql.includes('select') && lowerSql.includes('loyalty')) {
    return [] as T[] // Empty for now
  }

  // Booking seats queries
  if (lowerSql.includes('select') && lowerSql.includes('_bookingseats') || lowerSql.includes('bookingseats')) {
    return [] as T[]
  }

  return []
}

function mockExecute(sql: string, params?: any[]): any {
  const lowerSql = sql.toLowerCase().trim()

  // Insert bookings
  if (lowerSql.includes('insert') && lowerSql.includes('booking')) {
    // Parse parameters based on SQL structure
    // INSERT INTO Booking (id, userId, showtimeId, totalAmount, razorpayOrderId, loyaltyPointsEarned, status, createdAt)
    const bookingId = params?.[0] || `booking-${Date.now()}`
    const userId = params?.[1]
    const showtimeId = params?.[2]
    const totalAmount = params?.[3] || 0
    
    const showtime = MOCK_SHOWTIMES.find(st => st.id === showtimeId)
    const theaterData = showtime ? getTheaterByScreenId(showtime.screenId) : null
    
    MOCK_BOOKINGS.push({
      id: bookingId,
      showtimeId,
      userId,
      status: 'CONFIRMED',
      createdAt: new Date().toISOString(),
      totalAmount,
      movieTitle: MOCK_MOVIES.find(m => m.id === showtime?.movieId)?.title || 'Movie',
      theaterName: theaterData?.theater.name || 'Theater',
      screenName: theaterData?.screen.name || 'Screen 1',
      startTime: showtime?.startTime || new Date().toISOString(),
      seats: [],
      posterUrl: MOCK_MOVIES.find(m => m.id === showtime?.movieId)?.posterUrl || null,
    })
    
    return { insertId: bookingId, affectedRows: 1 }
  }
  
  // Insert booking seats
  if (lowerSql.includes('insert') && (lowerSql.includes('_bookingseats') || lowerSql.includes('bookingseats'))) {
    // Store seat associations
    const bookingId = params?.[0]
    const seatId = params?.[1]
    const booking = MOCK_BOOKINGS.find(b => b.id === bookingId)
    if (booking && seatId) {
      if (!booking.seats) booking.seats = []
      // Format seat ID properly
      const seatStr = String(seatId)
      if (!booking.seats.includes(seatStr)) {
        booking.seats.push(seatStr)
      }
    }
    return { affectedRows: 1 }
  }
  
  // Insert users
  if (lowerSql.includes('insert') && lowerSql.includes('user')) {
    // Handle ON DUPLICATE KEY UPDATE
    if (lowerSql.includes('on duplicate key update')) {
      // User already exists, just return success
      const email = params?.[1]
      const existingUser = MOCK_USERS.find(u => u.email.toLowerCase() === String(email).toLowerCase())
      if (existingUser) {
        return { insertId: existingUser.id, affectedRows: 0 }
      }
    }
    
    const userId = params?.[0] || `user-${Date.now()}`
    const name = params?.[1] || params?.[0] || 'User'
    const email = params?.[2] || params?.[1] || `${userId}@demo.cinesnap`
    const role = params?.[3] || 'USER'
    
    // Check if user already exists
    const existingUser = MOCK_USERS.find(u => u.email.toLowerCase() === email.toLowerCase())
    if (existingUser) {
      return { insertId: existingUser.id, affectedRows: 0 }
    }
    
    MOCK_USERS.push({
      id: userId,
      email,
      name,
      password: 'demo123', // Default password for new users
      role,
    })
    
    return { insertId: userId, affectedRows: 1 }
  }

  // Insert users
  if (lowerSql.includes('insert') && lowerSql.includes('user')) {
    const userId = `user-${Date.now()}`
    const email = params?.[1]
    const name = params?.[0]
    
    MOCK_USERS.push({
      id: userId,
      email,
      name,
      role: 'USER',
    })
    
    return { insertId: userId }
  }

  // Update bookings
  if (lowerSql.includes('update') && lowerSql.includes('booking')) {
    // Handle booking updates
    return { affectedRows: 1 }
  }

  return { affectedRows: 0 }
}


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

  // Showtimes queries (simple, without JOINs)
  if (lowerSql.includes('select') && lowerSql.includes('showtime') && !lowerSql.includes('join')) {
    if (lowerSql.includes('where movieid =') || lowerSql.includes('where movieid=')) {
      const movieId = params?.[0]
      let showtimes = MOCK_SHOWTIMES.filter(st => st.movieId === String(movieId))
      
      // Handle LIMIT clause
      if (lowerSql.includes('limit')) {
        const limitMatch = lowerSql.match(/limit\s+(\d+)/)
        const limit = limitMatch ? parseInt(limitMatch[1]) : 1
        showtimes = showtimes.slice(0, limit)
      }
      
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
  if (lowerSql.includes('select') && (lowerSql.includes('_bookingseats') || lowerSql.includes('bookingseats'))) {
    return [] as T[]
  }

  // Screen queries
  if (lowerSql.includes('select') && lowerSql.includes('screen')) {
    if (lowerSql.includes('where id =') || lowerSql.includes('where id=')) {
      const screenId = params?.[0]
      for (const theater of MOCK_THEATERS) {
        const screen = theater.screens.find(s => s.id === String(screenId))
        if (screen) {
          return [{
            id: screen.id,
            name: screen.name,
            theaterId: theater.id,
          }] as T[]
        }
      }
      return []
    }
    // Return all screens
    const screens: any[] = []
    for (const theater of MOCK_THEATERS) {
      for (const screen of theater.screens) {
        screens.push({
          id: screen.id,
          name: screen.name,
          theaterId: theater.id,
        })
      }
    }
    return screens as T[]
  }

  // Theater queries
  if (lowerSql.includes('select') && lowerSql.includes('theater')) {
    if (lowerSql.includes('where id =') || lowerSql.includes('where id=')) {
      const theaterId = params?.[0]
      const theater = MOCK_THEATERS.find(t => t.id === String(theaterId))
      return (theater ? [theater] : []) as T[]
    }
    return MOCK_THEATERS as T[]
  }

  // Showtimes with JOIN queries (Showtime JOIN Screen JOIN Theater)
  if (lowerSql.includes('select') && lowerSql.includes('showtime') && (lowerSql.includes('join') || lowerSql.includes('screen') || lowerSql.includes('theater'))) {
    const movieId = params?.[0]
    let showtimes = movieId 
      ? MOCK_SHOWTIMES.filter(st => String(st.movieId) === String(movieId))
      : MOCK_SHOWTIMES
    
    // In showcase mode, skip date filtering entirely to show all showtimes
    // Filter by startTime >= NOW() if present in query (but be very lenient)
    if (lowerSql.includes('starttime') && lowerSql.includes('>=') && lowerSql.includes('now()')) {
      // In showcase mode, show ALL showtimes regardless of date
      // This ensures showtimes always appear for demo purposes
      if (IS_SHOWCASE_MODE) {
        // Don't filter anything in showcase mode
        // showtimes = showtimes (no filtering)
      } else {
        // In production mode, filter by date
        const now = new Date()
        now.setHours(0, 0, 0, 0)
        
        showtimes = showtimes.filter(st => {
          try {
            if (!st.startTime) return false
            
            const startTime = new Date(st.startTime)
            if (isNaN(startTime.getTime())) return false
            
            startTime.setHours(0, 0, 0, 0)
            return startTime >= now
          } catch {
            return false
          }
        })
      }
    }

    const results = showtimes.map(st => {
      // Ensure screenId is a string for comparison
      const screenIdStr = String(st.screenId)
      const theaterData = getTheaterByScreenId(screenIdStr)
      
      if (theaterData) {
        return {
          id: st.id,
          startTime: st.startTime,
          price: st.price,
          screenId: st.screenId,
          screenName: theaterData.screen.name || 'Screen 1',
          theaterId: theaterData.theater.id,
          theaterName: theaterData.theater.name || 'PVR Cinemas',
          theaterLocation: theaterData.theater.location || 'Mumbai',
          movieId: st.movieId,
        }
      }
      
      // Fallback: use first theater if screen not found
      const firstTheater = MOCK_THEATERS[0]
      const firstScreen = firstTheater?.screens[0]
      
      return {
        id: st.id,
        startTime: st.startTime,
        price: st.price,
        screenId: st.screenId,
        screenName: firstScreen?.name || 'Screen 1',
        theaterId: firstTheater?.id || 'theater-1',
        theaterName: firstTheater?.name || 'PVR Cinemas',
        theaterLocation: firstTheater?.location || 'Mumbai',
        movieId: st.movieId,
      }
    })

    // Sort by theater name and start time if ORDER BY is present
    if (lowerSql.includes('order by')) {
      results.sort((a: any, b: any) => {
        if (lowerSql.includes('t.name') || lowerSql.includes('theatername')) {
          const nameCompare = (a.theaterName || '').localeCompare(b.theaterName || '')
          if (nameCompare !== 0) return nameCompare
        }
        if (lowerSql.includes('s.starttime') || lowerSql.includes('starttime')) {
          try {
            return new Date(a.startTime).getTime() - new Date(b.startTime).getTime()
          } catch {
            return 0
          }
        }
        return 0
      })
    }

    return results as T[]
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
    const email = params?.[1] || params?.[0]
    const name = params?.[2] || params?.[1] || email?.split('@')[0] || 'User'
    const password = params?.[3] || 'defaultpassword'
    
    MOCK_USERS.push({
      id: userId,
      email: email || `user-${userId}@example.com`,
      name: name || 'User',
      password: password,
      role: params?.[4] || 'USER',
    })
    
    return { insertId: userId }
  }

  // Update bookings
  if (lowerSql.includes('update') && lowerSql.includes('booking')) {
    // Handle booking updates
    return { affectedRows: 1 }
  }

  // Insert showtimes
  if (lowerSql.includes('insert') && lowerSql.includes('showtime')) {
    const showtimeId = params?.[0] || `showtime-${Date.now()}`
    const movieId = params?.[1]
    const screenId = params?.[2]
    const startTime = params?.[3]
    const price = params?.[4] || 50000

    // Check if showtime already exists (for ON DUPLICATE KEY UPDATE)
    if (lowerSql.includes('on duplicate key update')) {
      const existing = MOCK_SHOWTIMES.find(st => st.id === showtimeId || (st.movieId === String(movieId) && st.screenId === String(screenId) && st.startTime === String(startTime)))
      if (existing) {
        return { insertId: existing.id, affectedRows: 0 }
      }
    }

    // Ensure screenId exists in MOCK_THEATERS, if not use first available screen
    let validScreenId = String(screenId)
    const screenExists = MOCK_THEATERS.some(theater => 
      theater.screens.some(screen => String(screen.id) === validScreenId)
    )
    
    if (!screenExists && MOCK_THEATERS.length > 0) {
      // Use first available screen from first theater
      validScreenId = MOCK_THEATERS[0].screens[0]?.id || 'screen-1'
    }

    MOCK_SHOWTIMES.push({
      id: showtimeId,
      movieId: String(movieId),
      screenId: validScreenId,
      startTime: String(startTime),
      price: Number(price),
    })

    return { insertId: showtimeId, affectedRows: 1 }
  }

  return { affectedRows: 0 }
}


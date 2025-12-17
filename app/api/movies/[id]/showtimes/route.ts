import { NextRequest } from 'next/server'
import { query, queryOne, execute } from '@/lib/db'
import { getTmdbApiKey } from '@/lib/config'

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const apiKey = getTmdbApiKey()

    // Fetch movie from TMDb to get title
    let movieTitle = 'Movie'
    if (apiKey) {
      try {
        const movieRes = await fetch(
          `https://api.themoviedb.org/3/movie/${id}?api_key=${apiKey}&language=en-IN`,
          { cache: 'no-store' }
        )
        if (movieRes.ok) {
          const m = await movieRes.json()
          movieTitle = m.title || 'Movie'
        }
      } catch (err) {
        console.error('Failed to fetch movie from TMDb:', err)
      }
    }

    // Check if Movie record exists, create if not
    let movie = await queryOne<any>(
      'SELECT id FROM Movie WHERE id = ?',
      [id]
    )

    if (!movie) {
      // Create Movie record
      await execute(
        `INSERT INTO Movie (id, title, posterUrl, duration, genre, releaseDate)
         VALUES (?, ?, ?, ?, ?, ?)
         ON DUPLICATE KEY UPDATE title = VALUES(title)`,
        [id, movieTitle, '', 120, 'Feature', new Date()]
      )
    }

    // Get all theaters and screens
    const theaters = await query<any>(
      `SELECT t.id as theaterId, t.name as theaterName, t.location as theaterLocation,
              sc.id as screenId, sc.name as screenName
       FROM Theater t
       INNER JOIN Screen sc ON t.id = sc.theaterId
       ORDER BY t.name, sc.name`
    )

    if (theaters.length === 0) {
      return Response.json({ 
        error: 'No theaters found. Please run the database setup scripts first.',
        showtimes: []
      }, { status: 404 })
    }

    // Get existing showtimes for this movie
    const existingShowtimes = await query<any>(
      `SELECT s.*, sc.name as screenName, t.name as theaterName, t.location as theaterLocation
       FROM Showtime s
       INNER JOIN Screen sc ON s.screenId = sc.id
       INNER JOIN Theater t ON sc.theaterId = t.id
       WHERE s.movieId = ? AND s.startTime >= NOW()
       ORDER BY s.startTime ASC`,
      [id]
    )

    // If no showtimes exist, generate them
    if (existingShowtimes.length === 0) {
      const showtimes = []
      const now = new Date()
      const tomorrow = new Date(now)
      tomorrow.setDate(tomorrow.getDate() + 1)
      tomorrow.setHours(10, 0, 0, 0) // Start from 10 AM tomorrow

      // Generate showtimes for next 7 days
      for (let day = 0; day < 7; day++) {
        const date = new Date(tomorrow)
        date.setDate(date.getDate() + day)

        // Generate 4-5 showtimes per day per screen
        const timeSlots = ['10:00', '13:30', '17:00', '20:30', '23:00']
        
        for (const theater of theaters) {
          // Use 2-3 time slots per screen
          const slotsToUse = timeSlots.slice(0, Math.min(3, timeSlots.length))
          
          for (const timeSlot of slotsToUse) {
            const [hours, minutes] = timeSlot.split(':').map(Number)
            const startTime = new Date(date)
            startTime.setHours(hours, minutes, 0, 0)

            // Skip if time is in the past
            if (startTime < now) continue

            // Price: ₹200-500 based on screen type
            const basePrice = 30000 // ₹300 in paise
            const price = basePrice + (Math.random() * 20000) // ₹200-500

            try {
              const showtimeId = `showtime-${id}-${theater.screenId}-${day}-${timeSlot.replace(':', '')}`
              
              await execute(
                `INSERT INTO Showtime (id, movieId, screenId, startTime, price)
                 VALUES (?, ?, ?, ?, ?)
                 ON DUPLICATE KEY UPDATE startTime = VALUES(startTime), price = VALUES(price)`,
                [showtimeId, id, theater.screenId, startTime, Math.floor(price)]
              )

              showtimes.push({
                id: showtimeId,
                startTime: startTime.toISOString(),
                price: Math.floor(price),
                screenName: theater.screenName,
                theaterName: theater.theaterName,
                theaterLocation: theater.theaterLocation,
              })
            } catch (err: any) {
              console.error('Failed to create showtime:', err.message)
            }
          }
        }
      }

      // Fetch the newly created showtimes
      const newShowtimes = await query<any>(
        `SELECT s.*, sc.name as screenName, t.name as theaterName, t.location as theaterLocation
         FROM Showtime s
         INNER JOIN Screen sc ON s.screenId = sc.id
         INNER JOIN Theater t ON sc.theaterId = t.id
         WHERE s.movieId = ? AND s.startTime >= NOW()
         ORDER BY s.startTime ASC`,
        [id]
      )

      return Response.json({ showtimes: newShowtimes.map((st: any) => ({
        id: st.id,
        startTime: st.startTime,
        price: st.price,
        screenName: st.screenName,
        theaterName: st.theaterName,
        theaterLocation: st.theaterLocation,
      })) })
    }

    // Return existing showtimes
    return Response.json({ showtimes: existingShowtimes.map((st: any) => ({
      id: st.id,
      startTime: st.startTime,
      price: st.price,
      screenName: st.screenName,
      theaterName: st.theaterName,
      theaterLocation: st.theaterLocation,
    })) })
  } catch (error: any) {
    console.error('Error fetching showtimes:', error)
    return Response.json(
      { error: error.message || 'Failed to fetch showtimes', showtimes: [] },
      { status: 500 }
    )
  }
}


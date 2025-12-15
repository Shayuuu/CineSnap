import { query, queryOne, execute } from '@/lib/db'
import { notFound } from 'next/navigation'
import MovieDetailClient from '@/components/MovieDetailClient'
import { randomBytes } from 'crypto'

type Props = {
  params: Promise<{ id: string }>
}

async function generateShowtimes(movieId: string) {
  try {
    const existing = await query<any>('SELECT id FROM Showtime WHERE movieId = ? LIMIT 1', [movieId])
    if (existing.length > 0) return

    const screens = await query<any>('SELECT id, name FROM Screen')
    if (screens.length === 0) return

    const slots = ['10:00', '13:00', '16:00', '19:00', '22:00']
    const today = new Date()
    const dateStr = today.toISOString().split('T')[0]

    for (const screen of screens) {
      for (const slot of slots) {
        // Create proper ISO datetime string for better parsing
        const startTime = `${dateStr}T${slot}:00:00.000Z`
        const showId = randomBytes(12).toString('hex')
        const price = 45000 + Math.floor(Math.random() * 15000) // ₹450-₹600
        await execute(
          'INSERT INTO Showtime (id, movieId, screenId, startTime, price) VALUES (?, ?, ?, ?, ?) ON DUPLICATE KEY UPDATE id=id',
          [showId, movieId, screen.id, startTime, price]
        )
      }
    }
  } catch (err) {
    console.error('generateShowtimes error:', err)
  }
}

export default async function MovieDetailPage({ params }: Props) {
  const { id } = await params
  const { getTmdbApiKey, CONFIG } = await import('@/lib/config')
  const apiKey = getTmdbApiKey()
  const base = CONFIG.BASE_URL

  let movie: any = null

  // Try TMDb directly (server-side)
  if (apiKey) {
    try {
      // Create AbortController for timeout
      const controller = new AbortController()
      const timeoutId = setTimeout(() => controller.abort(), 10000) // 10 second timeout

      try {
        // Fetch movie details with credits
        const movieRes = await fetch(
          `https://api.themoviedb.org/3/movie/${id}?api_key=${apiKey}&language=en-IN&append_to_response=credits`,
          { 
            cache: 'no-store',
            signal: controller.signal,
            headers: {
              'Accept': 'application/json',
            }
          }
        )
        
        // Fetch videos separately without language restriction to get all available trailers
        const videosRes = await fetch(
          `https://api.themoviedb.org/3/movie/${id}/videos?api_key=${apiKey}`,
          { 
            cache: 'no-store',
            signal: controller.signal,
            headers: {
              'Accept': 'application/json',
            }
          }
        )
        
        clearTimeout(timeoutId)

        // Check if API key is invalid
        if (movieRes.status === 401) {
          console.error('⚠️  TMDb API Key is invalid or expired. Please check your TMDB_API_KEY in .env.local')
          console.error('📖 Get a new API key from: https://www.themoviedb.org/settings/api')
        } else if (movieRes.status === 404) {
          console.warn(`⚠️  Movie ${id} not found in TMDb`)
        } else if (!movieRes.ok) {
          console.error(`⚠️  TMDb API error: ${movieRes.status} ${movieRes.statusText}`)
        }
        
        if (movieRes.ok && videosRes.ok) {
          const m = await movieRes.json()
          const videosData = await videosRes.json()
          
          // Merge videos into movie object
          m.videos = videosData
          
          const cast = (m.credits?.cast || [])
            .slice(0, 8)
            .map((c: any) => ({ id: c.id, name: c.name, character: c.character }))
          const crew = (m.credits?.crew || [])
            .filter((c: any) => c.job === 'Director' || c.job === 'Producer')
            .slice(0, 4)
            .map((c: any) => ({ id: c.id, name: c.name, job: c.job }))
          // Get trailer URL from videos - try multiple strategies for better coverage
          const videos = m.videos?.results || []
          let trailer: any = null
          
          // Strategy 1: Look for official Trailer on YouTube
          trailer = videos.find((v: any) => v.type === 'Trailer' && v.site === 'YouTube' && v.official)
          
          // Strategy 2: Look for any Trailer on YouTube (if no official found)
          if (!trailer) {
            trailer = videos.find((v: any) => v.type === 'Trailer' && v.site === 'YouTube')
          }
          
          // Strategy 3: Look for Teaser on YouTube (common for Indian movies)
          if (!trailer) {
            trailer = videos.find((v: any) => v.type === 'Teaser' && v.site === 'YouTube')
          }
          
          // Strategy 4: Look for any YouTube video (Trailer, Teaser, Featurette, etc.)
          if (!trailer) {
            trailer = videos.find((v: any) => v.site === 'YouTube' && (v.type === 'Trailer' || v.type === 'Teaser' || v.type === 'Featurette'))
          }
          
          // Strategy 5: Fallback to any YouTube video
          if (!trailer) {
            trailer = videos.find((v: any) => v.site === 'YouTube')
          }
          
          const trailerUrl = trailer ? `https://www.youtube.com/watch?v=${trailer.key}` : null

          movie = {
            id: String(m.id),
            title: m.title,
            overview: m.overview,
            runtime: m.runtime,
            releaseDate: m.release_date,
            rating: m.vote_average,
            language: m.original_language,
            posterUrl: m.poster_path ? `https://image.tmdb.org/t/p/w500${m.poster_path}` : null,
            backdropUrl: m.backdrop_path ? `https://image.tmdb.org/t/p/w1280${m.backdrop_path}` : null,
            genres: (m.genres || []).map((g: any) => g.name),
            cast,
            crew,
            trailerUrl,
          }
        }
      } catch (fetchErr: any) {
        clearTimeout(timeoutId)
        if (fetchErr.name === 'AbortError') {
          console.error('⚠️  TMDb API request timed out after 10 seconds')
        } else if (fetchErr.code === 'ENOTFOUND' || fetchErr.code === 'ECONNREFUSED') {
          console.error('⚠️  Network error: Cannot reach TMDb API. Check your internet connection.')
        } else {
          console.error('⚠️  TMDb fetch failed:', fetchErr.message || fetchErr)
        }
      }
    } catch (err: any) {
      console.error('⚠️  TMDb fetch error:', err?.message || err)
    }
  } else {
    console.warn('⚠️  TMDb API key not available. Check lib/config.ts')
  }

  // Fallback to DB if TMDb not available
  if (!movie) {
    try {
      const dbMovie = await queryOne<any>('SELECT * FROM Movie WHERE id = ?', [id])
      if (!dbMovie) return notFound()
      movie = {
        id: dbMovie.id,
        title: dbMovie.title,
        runtime: dbMovie.duration,
        releaseDate: dbMovie.releaseDate,
        posterUrl: dbMovie.posterUrl,
        genres: [dbMovie.genre].filter(Boolean),
      }
    } catch (dbErr) {
      console.error('⚠️  Database query failed:', dbErr)
      return notFound()
    }
  }

  // If movie is still null after all attempts, return 404
  if (!movie) {
    return notFound()
  }

  // Upsert movie into DB for showtimes
  try {
    await execute(
      'INSERT INTO Movie (id, title, posterUrl, duration, genre, releaseDate) VALUES (?, ?, ?, ?, ?, ?) ON DUPLICATE KEY UPDATE id=id',
      [
        movie.id,
        movie.title,
        movie.posterUrl || '',
        movie.runtime || 120,
        (movie.genres && movie.genres[0]) || 'Feature',
        movie.releaseDate || null,
      ]
    )
  } catch (err) {
    console.error('Upsert movie failed:', err)
  }

  // Recommendations
  let recommendations: any[] = []
  try {
    const recRes = await fetch(`${base}/api/movies/${id}/recommendations`, { cache: 'no-store' })
    if (recRes.ok) {
      const recData = await recRes.json()
      recommendations = recData.results || []
    }
  } catch (err) {
    console.error('Recommendations fetch failed:', err)
  }

  // In showcase mode, always show showtimes for any movie
  // In production, check if movie is still in theaters
  const isShowcaseMode = !process.env.DB_HOST || process.env.SHOWCASE_MODE === 'true'
  const isMovieInTheaters = isShowcaseMode ? true : (() => {
    if (!movie.releaseDate) return true // If no release date, assume it's playing
    
    const releaseDate = new Date(movie.releaseDate)
    const today = new Date()
    const threeMonthsAgo = new Date(today)
    threeMonthsAgo.setMonth(threeMonthsAgo.getMonth() - 3)
    
    // Movie is in theaters if:
    // 1. Release date is in the future (upcoming)
    // 2. Release date is within the last 3 months (currently playing)
    return releaseDate >= threeMonthsAgo
  })()

  // Generate and fetch showtimes
  let showtimes: any[] = []
  if (isMovieInTheaters) {
    // Generate showtimes if missing
    await generateShowtimes(movie.id)

    try {
      showtimes = await query<any>(`
        SELECT 
          s.id, s.startTime, s.price,
          sc.id as screenId, sc.name as screenName,
          t.id as theaterId, t.name as theaterName, t.location as theaterLocation
        FROM Showtime s
        JOIN Screen sc ON s.screenId = sc.id
        JOIN Theater t ON sc.theaterId = t.id
        WHERE s.movieId = ? AND s.startTime >= NOW()
        ORDER BY t.name ASC, s.startTime ASC
      `, [movie.id])
      
      console.log(`[MovieDetailPage] Found ${showtimes.length} showtimes for movie ${movie.id}`)
    } catch (err) {
      console.error('Fetch showtimes failed:', err)
    }
  }

  return (
    <MovieDetailClient 
      movie={movie} 
      showtimes={showtimes || []}
      recommendations={recommendations}
      trailerUrl={movie.trailerUrl || null}
    />
  )
}

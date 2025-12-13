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
        const startTime = `${dateStr} ${slot}:00`
        const showId = randomBytes(12).toString('hex')
        const price = 45000 + Math.floor(Math.random() * 15000) // ₹450-₹600
        await execute(
          'INSERT IGNORE INTO Showtime (id, movieId, screenId, startTime, price) VALUES (?, ?, ?, ?, ?)',
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
  const apiKey = process.env.TMDB_API_KEY
  const base = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'

  let movie: any = null

  // Try TMDb directly (server-side)
  if (apiKey) {
    try {
      // Fetch movie details with credits
      const movieRes = await fetch(
        `https://api.themoviedb.org/3/movie/${id}?api_key=${apiKey}&language=en-IN&append_to_response=credits`,
        { cache: 'no-store' }
      )
      
      // Fetch videos separately without language restriction to get all available trailers
      const videosRes = await fetch(
        `https://api.themoviedb.org/3/movie/${id}/videos?api_key=${apiKey}`,
        { cache: 'no-store' }
      )
      
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
    } catch (err) {
      console.error('TMDb fetch failed:', err)
    }
  }

  // Fallback to DB if TMDb not available
  if (!movie) {
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
  }

  // Upsert movie into DB for showtimes
  try {
    await execute(
      'INSERT IGNORE INTO Movie (id, title, posterUrl, duration, genre, releaseDate) VALUES (?, ?, ?, ?, ?, ?)',
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

  // Check if movie is still in theaters (released within last 3 months)
  const isMovieInTheaters = (() => {
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

  // Only generate and fetch showtimes if movie is still in theaters
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

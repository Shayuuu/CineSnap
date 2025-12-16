import { notFound } from 'next/navigation'
import MovieDetailClient from '@/components/MovieDetailClient'
import { MOCK_THEATERS, getTheaterByScreenId } from '@/lib/mockData'

type Props = {
  params: Promise<{ id: string }>
}

// Generate hardcoded showtimes for any movie
function generateHardcodedShowtimes(movieId: string) {
  const slots = ['10:00', '13:00', '16:00', '19:00', '22:00']
  const today = new Date()
  const dateStr = today.toISOString().split('T')[0]
  const showtimes: any[] = []
  
  // Get all screens from mock theaters
  const allScreens: Array<{ id: string; name: string; theaterId: string }> = []
  MOCK_THEATERS.forEach(theater => {
    theater.screens.forEach(screen => {
      allScreens.push({
        id: screen.id,
        name: screen.name,
        theaterId: theater.id,
      })
    })
  })
  
  // Generate showtimes for each screen
  allScreens.forEach((screen, screenIndex) => {
    slots.forEach((slot, slotIndex) => {
      const startTime = `${dateStr}T${slot}:00:00.000Z`
      const theaterData = getTheaterByScreenId(screen.id)
      
      showtimes.push({
        id: `showtime-${movieId}-${screenIndex}-${slotIndex}`,
        startTime,
        price: 45000 + Math.floor(Math.random() * 15000), // ₹450-₹600
        screenId: screen.id,
        screenName: screen.name,
        theaterId: theaterData?.theater.id || MOCK_THEATERS[0].id,
        theaterName: theaterData?.theater.name || MOCK_THEATERS[0].name,
        theaterLocation: theaterData?.theater.location || MOCK_THEATERS[0].location,
        movieId,
      })
    })
  })
  
  return showtimes
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

  // If movie is still null after all attempts, return 404
  if (!movie) {
    return notFound()
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

  // Generate hardcoded showtimes for this movie (always show showtimes)
  const showtimes = generateHardcodedShowtimes(movie.id)
  
  // Sort showtimes by theater name and start time
  showtimes.sort((a, b) => {
    const theaterCompare = (a.theaterName || '').localeCompare(b.theaterName || '')
    if (theaterCompare !== 0) return theaterCompare
    return new Date(a.startTime).getTime() - new Date(b.startTime).getTime()
  })
  
  console.log(`[MovieDetailPage] Generated ${showtimes.length} hardcoded showtimes for movie ${movie.id}`)

  return (
    <MovieDetailClient 
      movie={movie} 
      showtimes={showtimes || []}
      recommendations={recommendations}
      trailerUrl={movie.trailerUrl || null}
    />
  )
}

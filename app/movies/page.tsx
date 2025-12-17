import MoviesExplorer from '@/components/MoviesExplorer'
import type { Metadata } from 'next'
import { getTmdbApiKey } from '@/lib/config'

export const metadata: Metadata = {
  title: 'Movies - CineSnap',
  description: 'Browse now showing, upcoming, and popular movies',
}

// Force dynamic rendering since we're fetching from external API
export const dynamic = 'force-dynamic'

type TMDBMovie = {
  id: string
  title: string
  overview?: string
  posterUrl?: string | null
  releaseDate?: string
  rating?: number
  language?: string
  genres?: string[]
}

function mapMovie(m: TMDBMovie) {
  return {
    id: m.id,
    title: m.title,
    genre: (m.genres && m.genres[0]) || 'Feature',
    duration: 120,
    releaseDate: m.releaseDate || '',
    posterUrl: m.posterUrl || undefined,
    rating: m.rating,
    language: m.language,
  }
}

const TMDB_BASE = 'https://api.themoviedb.org/3'

async function fetchMovies(endpoint: string, apiKey: string) {
  try {
    const url = `${TMDB_BASE}${endpoint}&api_key=${apiKey}&language=en-US&page=1`
    console.log(`[MoviesPage] Fetching from TMDb: ${endpoint}`)
    
    const res = await fetch(url, { 
      next: { revalidate: 3600 }, // Revalidate every hour
      headers: {
        'Accept': 'application/json',
      }
    })
    
    if (!res.ok) {
      const errorText = await res.text().catch(() => 'Unable to read error response')
      console.error(`[MoviesPage] TMDb API error for ${endpoint}:`, {
        status: res.status,
        statusText: res.statusText,
        error: errorText
      })
      return []
    }
    
    const data = await res.json()
    const results = data.results || []
    console.log(`[MoviesPage] Successfully fetched ${results.length} movies from ${endpoint}`)
    return results
  } catch (error: any) {
    console.error(`[MoviesPage] Error fetching ${endpoint}:`, {
      message: error?.message,
      stack: error?.stack,
      cause: error?.cause
    })
    return []
  }
}

export default async function MoviesPage() {
  try {
    const apiKey = getTmdbApiKey()
    
    if (!apiKey) {
      console.error('[MoviesPage] No TMDb API key found')
      return (
        <div className="min-h-screen pt-20 sm:pt-24 pb-20 sm:pb-32 px-4 sm:px-6 flex items-center justify-center">
          <div className="max-w-md mx-auto text-center glass rounded-2xl p-8 border border-white/10">
            <div className="text-6xl mb-4">🎬</div>
            <h2 className="text-2xl font-clash font-bold text-white mb-4">Movies Not Available</h2>
            <p className="text-gray-400 mb-6">
              TMDb API key is not configured. Please add <code className="bg-white/10 px-2 py-1 rounded">TMDB_API_KEY</code> to your environment variables.
            </p>
            <p className="text-sm text-gray-500">
              Get your free API key from{' '}
              <a href="https://www.themoviedb.org/settings/api" target="_blank" rel="noopener noreferrer" className="text-yellow-400 hover:text-yellow-300 underline">
                TMDb
              </a>
            </p>
          </div>
        </div>
      )
    }

    // Fetch directly from TMDb API instead of going through our API routes
    const [nowPlayingData, upcomingData, popularData] = await Promise.all([
      fetchMovies('/movie/now_playing?region=US', apiKey),
      fetchMovies('/movie/upcoming?region=US', apiKey),
      fetchMovies('/movie/popular?region=US', apiKey),
    ])

    const today = new Date()
    today.setHours(0, 0, 0, 0)
    
    // Map and filter movies
    const now = nowPlayingData
      .filter((m: any) => {
        if (!m.release_date) return true
        const releaseDate = new Date(m.release_date)
        releaseDate.setHours(0, 0, 0, 0)
        const twelveMonthsAgo = new Date(today)
        twelveMonthsAgo.setMonth(twelveMonthsAgo.getMonth() - 12)
        return releaseDate <= today && releaseDate >= twelveMonthsAgo
      })
      .map((m: any) => ({
        id: String(m.id),
        title: m.title,
        overview: m.overview,
        posterUrl: m.poster_path ? `https://image.tmdb.org/t/p/w500${m.poster_path}` : null,
        releaseDate: m.release_date,
        rating: m.vote_average,
        language: m.original_language,
        genres: m.genre_ids || [],
      }))
      .map(mapMovie)

    const soon = upcomingData
      .filter((m: any) => {
        if (!m.release_date) return true
        const releaseDate = new Date(m.release_date)
        releaseDate.setHours(0, 0, 0, 0)
        const sevenDaysAgo = new Date(today)
        sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7)
        return releaseDate > sevenDaysAgo
      })
      .map((m: any) => ({
        id: String(m.id),
        title: m.title,
        overview: m.overview,
        posterUrl: m.poster_path ? `https://image.tmdb.org/t/p/w500${m.poster_path}` : null,
        releaseDate: m.release_date,
        rating: m.vote_average,
        language: m.original_language,
        genres: m.genre_ids || [],
      }))
      .map(mapMovie)

    const popular = popularData
      .filter((m: any) => {
        if (!m.release_date) return true
        const releaseDate = new Date(m.release_date)
        releaseDate.setHours(0, 0, 0, 0)
        const fiveYearsAgo = new Date(today)
        fiveYearsAgo.setFullYear(fiveYearsAgo.getFullYear() - 5)
        return releaseDate >= fiveYearsAgo && releaseDate <= today
      })
      .map((m: any) => ({
        id: String(m.id),
        title: m.title,
        overview: m.overview,
        posterUrl: m.poster_path ? `https://image.tmdb.org/t/p/w500${m.poster_path}` : null,
        releaseDate: m.release_date,
        rating: m.vote_average,
        language: m.original_language,
        genres: m.genre_ids || [],
      }))
      .map(mapMovie)

    console.log(`[MoviesPage] Fetched ${now.length} now playing, ${soon.length} upcoming, ${popular.length} popular movies`)

    // Check if all arrays are empty (likely API issue)
    if (now.length === 0 && soon.length === 0 && popular.length === 0) {
      return (
        <div className="min-h-screen pt-20 sm:pt-24 pb-20 sm:pb-32 px-4 sm:px-6 flex items-center justify-center">
          <div className="max-w-md mx-auto text-center glass rounded-2xl p-8 border border-white/10">
            <div className="text-6xl mb-4">🎬</div>
            <h2 className="text-2xl font-clash font-bold text-white mb-4">No Movies Found</h2>
            <p className="text-gray-400 mb-6">
              Unable to fetch movies from TMDb API. This could be due to:
            </p>
            <ul className="text-left text-sm text-gray-500 space-y-2 mb-6">
              <li>• Invalid or missing TMDB_API_KEY</li>
              <li>• Network connectivity issues</li>
              <li>• TMDb API rate limiting</li>
            </ul>
            <p className="text-sm text-gray-500">
              Check your server logs for more details.
            </p>
          </div>
        </div>
      )
    }

    return <MoviesExplorer nowPlaying={now} upcoming={soon} popular={popular} />
  } catch (error: any) {
    console.error('Error loading movies page:', error)
    return (
      <div className="min-h-screen pt-20 sm:pt-24 pb-20 sm:pb-32 px-4 sm:px-6 flex items-center justify-center">
        <div className="max-w-md mx-auto text-center glass rounded-2xl p-8 border border-white/10">
          <div className="text-6xl mb-4">⚠️</div>
          <h2 className="text-2xl font-clash font-bold text-white mb-4">Error Loading Movies</h2>
          <p className="text-gray-400 mb-6">
            {error?.message || 'An unexpected error occurred while fetching movies.'}
          </p>
          <p className="text-sm text-gray-500">
            Please try refreshing the page or contact support if the issue persists.
          </p>
        </div>
      </div>
    )
  }
}

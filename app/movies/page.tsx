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

// Streaming platform provider IDs (Netflix, Prime, Apple TV+, Jio Hotstar)
const STREAMING_PROVIDER_IDS = [8, 9, 2, 337, 350] // Netflix, Prime Video, Apple TV+, Disney+ Hotstar (old & new)

// Check if a movie is streaming-only (has only streaming platforms, no cinema showtimes)
async function isStreamingOnly(movieId: string, apiKey: string): Promise<boolean> {
  try {
    // Add timeout and abort controller for fetch
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), 5000) // 5 second timeout
    
    const providersRes = await fetch(
      `https://api.themoviedb.org/3/movie/${movieId}/watch/providers?api_key=${apiKey}`,
      { 
        next: { revalidate: 3600 },
        headers: { 'Accept': 'application/json' },
        signal: controller.signal
      }
    )
    
    clearTimeout(timeoutId)
    
    if (!providersRes.ok) {
      console.warn(`[MoviesPage] TMDb API error for watch providers (${movieId}): ${providersRes.status}`)
      return false // Default to showing in cinemas if API fails
    }
    
    const providersData = await providersRes.json()
    const providers = providersData.results?.IN || providersData.results?.US || null
    
    if (!providers) return false
    
    // Check if movie has streaming providers
    const hasStreaming = (
      (providers.flatrate && providers.flatrate.some((p: any) => STREAMING_PROVIDER_IDS.includes(p.provider_id))) ||
      (providers.buy && providers.buy.some((p: any) => STREAMING_PROVIDER_IDS.includes(p.provider_id))) ||
      (providers.rent && providers.rent.some((p: any) => STREAMING_PROVIDER_IDS.includes(p.provider_id)))
    )
    
    // If it has streaming providers, check if it ONLY has streaming (no other providers)
    if (hasStreaming) {
      const allProviders = [
        ...(providers.flatrate || []),
        ...(providers.buy || []),
        ...(providers.rent || [])
      ]
      // If all providers are streaming-only, it's streaming-only
      return allProviders.every((p: any) => STREAMING_PROVIDER_IDS.includes(p.provider_id))
    }
    
    return false
  } catch (error: any) {
    // Handle abort errors and network errors gracefully
    if (error.name === 'AbortError') {
      console.warn(`[MoviesPage] Timeout checking streaming status for ${movieId}`)
    } else {
      console.error(`[MoviesPage] Error checking streaming status for ${movieId}:`, error?.message || error)
    }
    return false // Default to showing in cinemas if check fails
  }
}

async function fetchMovies(endpoint: string, apiKey: string) {
  try {
    // Construct URL properly - check if endpoint already has query params
    const separator = endpoint.includes('?') ? '&' : '?'
    const url = `${TMDB_BASE}${endpoint}${separator}api_key=${apiKey}&language=en-US&page=1`
    
    console.log(`[MoviesPage] Fetching from TMDb: ${url.substring(0, 80)}...`)
    
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), 10000) // 10 second timeout
    
    const res = await fetch(url, { 
      next: { revalidate: 3600 }, // Revalidate every hour
      headers: {
        'Accept': 'application/json',
      },
      signal: controller.signal
    })
    
    clearTimeout(timeoutId)
    
    if (!res.ok) {
      const errorText = await res.text().catch(() => 'Unable to read error response')
      console.error(`[MoviesPage] TMDb API error for ${endpoint}:`, {
        status: res.status,
        statusText: res.statusText,
        error: errorText.substring(0, 200) // Limit error text length
      })
      return []
    }
    
    const data = await res.json()
    const results = data.results || []
    console.log(`[MoviesPage] Successfully fetched ${results.length} movies from ${endpoint}`)
    
    // Log first movie for debugging
    if (results.length > 0) {
      console.log(`[MoviesPage] Sample movie: ${results[0].title} (ID: ${results[0].id})`)
    }
    
    return results
  } catch (error: any) {
    console.error(`[MoviesPage] Error fetching ${endpoint}:`, {
      message: error?.message,
      name: error?.name,
      cause: error?.cause
    })
    return []
  }
}

export default async function MoviesPage() {
  try {
    const apiKey = getTmdbApiKey()
    
    // Log API key status (without exposing the actual key)
    console.log(`[MoviesPage] API key present: ${!!apiKey}, length: ${apiKey?.length || 0}`)
    
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
            <p className="text-sm text-gray-500 mb-4">
              Get your free API key from{' '}
              <a href="https://www.themoviedb.org/settings/api" target="_blank" rel="noopener noreferrer" className="text-yellow-400 hover:text-yellow-300 underline">
                TMDb
              </a>
            </p>
            <p className="text-xs text-gray-600">
              Environment: {process.env.NODE_ENV || 'unknown'}
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
    
    console.log(`[MoviesPage] Raw data: ${nowPlayingData.length} now playing, ${upcomingData.length} upcoming, ${popularData.length} popular`)
    
    // Map movies first, then filter (less restrictive filters)
    // Filter out streaming-only movies from "Now Showing"
    const nowMapped = nowPlayingData.map((m: any) => ({
      id: String(m.id),
      title: m.title,
      overview: m.overview,
      posterUrl: m.poster_path ? `https://image.tmdb.org/t/p/w500${m.poster_path}` : null,
      releaseDate: m.release_date,
      rating: m.vote_average,
      language: m.original_language,
      genres: m.genre_ids || [],
    }))
    
    // Check which movies are streaming-only (check first 15 to reduce API calls and avoid timeouts)
    // This is a non-critical check - if it fails, we'll just show all movies
    const moviesToCheck = nowMapped.slice(0, 15)
    let streamingChecks: PromiseSettledResult<boolean>[] = []
    
    try {
      streamingChecks = await Promise.allSettled(
        moviesToCheck.map(m => isStreamingOnly(m.id, apiKey))
      )
    } catch (error) {
      console.warn('[MoviesPage] Streaming check failed, showing all movies:', error)
      // If streaming check fails entirely, just show all movies
      streamingChecks = []
    }
    
    const now = nowMapped
      .filter((m: any, index: number) => {
        // Skip streaming-only movies (only check first 30)
        if (index < streamingChecks.length) {
          const check = streamingChecks[index]
          if (check.status === 'fulfilled' && check.value === true) {
            return false // Exclude streaming-only movies
          }
        }
        
        // Less restrictive: just check if release date exists and is reasonable
        if (!m.releaseDate) return true
        try {
          const releaseDate = new Date(m.releaseDate)
          if (isNaN(releaseDate.getTime())) return true
          // Include movies from last 2 years to future
          const twoYearsAgo = new Date(today)
          twoYearsAgo.setFullYear(twoYearsAgo.getFullYear() - 2)
          const oneYearFuture = new Date(today)
          oneYearFuture.setFullYear(oneYearFuture.getFullYear() + 1)
          return releaseDate >= twoYearsAgo && releaseDate <= oneYearFuture
        } catch {
          return true // Include if date parsing fails
        }
      })
      .map(mapMovie)
      .slice(0, 20) // Limit to 20 movies

    const soon = upcomingData
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
      .filter((m: any) => {
        // Less restrictive: include upcoming movies
        if (!m.releaseDate) return true
        try {
          const releaseDate = new Date(m.releaseDate)
          if (isNaN(releaseDate.getTime())) return true
          // Include movies from today to 6 months in future
          const sixMonthsFuture = new Date(today)
          sixMonthsFuture.setMonth(sixMonthsFuture.getMonth() + 6)
          return releaseDate >= today && releaseDate <= sixMonthsFuture
        } catch {
          return true
        }
      })
      .map(mapMovie)
      .slice(0, 20) // Limit to 20 movies

    const popular = popularData
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
      .filter((m: any) => {
        // Less restrictive: include popular movies from last 10 years
        if (!m.releaseDate) return true
        try {
          const releaseDate = new Date(m.releaseDate)
          if (isNaN(releaseDate.getTime())) return true
          const tenYearsAgo = new Date(today)
          tenYearsAgo.setFullYear(tenYearsAgo.getFullYear() - 10)
          return releaseDate >= tenYearsAgo && releaseDate <= today
        } catch {
          return true
        }
      })
      .map(mapMovie)
      .slice(0, 20) // Limit to 20 movies

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

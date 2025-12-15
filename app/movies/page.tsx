import MoviesExplorer from '@/components/MoviesExplorer'
import type { Metadata } from 'next'
import { getTmdbApiKey } from '@/lib/config'

export const metadata: Metadata = {
  title: 'Movies - CineSnap',
  description: 'Browse now showing, upcoming, and popular movies',
}

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
    const res = await fetch(url, { 
      cache: 'no-store',
      headers: {
        'Accept': 'application/json',
      }
    })
    
    if (!res.ok) {
      console.error(`TMDb API error for ${endpoint}:`, res.status, res.statusText)
      return []
    }
    
    const data = await res.json()
    return data.results || []
  } catch (error) {
    console.error(`Error fetching ${endpoint}:`, error)
    return []
  }
}

export default async function MoviesPage() {
  try {
    const apiKey = getTmdbApiKey()
    
    if (!apiKey) {
      console.error('[MoviesPage] No TMDb API key found')
      return <MoviesExplorer nowPlaying={[]} upcoming={[]} popular={[]} />
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

    return <MoviesExplorer nowPlaying={now} upcoming={soon} popular={popular} />
  } catch (error) {
    console.error('Error loading movies page:', error)
    // Return empty data on error
    return <MoviesExplorer nowPlaying={[]} upcoming={[]} popular={[]} />
  }
}

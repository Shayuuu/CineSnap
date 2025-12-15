import { NextRequest } from 'next/server'
import { getTmdbApiKey } from '@/lib/config'

const TMDB_BASE = 'https://api.themoviedb.org/3'

export async function GET(req: NextRequest) {
  const apiKey = getTmdbApiKey()

  const url = `${TMDB_BASE}/movie/now_playing?api_key=${apiKey}&language=en-IN&region=IN&page=1`

  try {
    const res = await fetch(url, { next: { revalidate: 3600 } })
    if (!res.ok) {
      console.error('TMDb API error:', res.status, res.statusText)
      // Return empty results instead of error to prevent page crash
      return Response.json({ results: [] })
    }

    const data = await res.json()
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    
    // Show movies released in the last 12 months (more lenient for showcase)
    const twelveMonthsAgo = new Date(today)
    twelveMonthsAgo.setMonth(twelveMonthsAgo.getMonth() - 12)
    
    const mapped = (data.results || [])
      .filter((m: any) => {
        // If no release date, include it (some movies might not have dates)
        if (!m.release_date) return true
        const releaseDate = new Date(m.release_date)
        releaseDate.setHours(0, 0, 0, 0)
        // Must be released and not older than 12 months (more lenient)
        return releaseDate <= today && releaseDate >= twelveMonthsAgo
      })
      .map((m: any) => ({
      id: String(m.id),
      title: m.title,
      overview: m.overview,
      posterUrl: m.poster_path ? `https://image.tmdb.org/t/p/w500${m.poster_path}` : null,
      backdropUrl: m.backdrop_path ? `https://image.tmdb.org/t/p/w780${m.backdrop_path}` : null,
      releaseDate: m.release_date,
      rating: m.vote_average,
      language: m.original_language,
      genres: m.genre_ids || [],
    }))

    return Response.json({ results: mapped })
  } catch (error: any) {
    console.error('Error fetching now playing movies:', error)
    // Return empty results instead of error
    return Response.json({ results: [] })
  }
}


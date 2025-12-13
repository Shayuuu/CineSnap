import { NextRequest } from 'next/server'
import { getTmdbApiKey } from '@/lib/config'

const TMDB_BASE = 'https://api.themoviedb.org/3'

export async function GET(req: NextRequest) {
  const apiKey = getTmdbApiKey()

  const url = `${TMDB_BASE}/movie/popular?api_key=${apiKey}&language=en-IN&region=IN&page=1`

  const res = await fetch(url, { next: { revalidate: 3600 } })
  if (!res.ok) {
    return Response.json({ error: 'Failed to fetch TMDb popular' }, { status: 500 })
  }

  const data = await res.json()
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  
  // Only show movies from the last 2 years (recent popular movies)
  const twoYearsAgo = new Date(today)
  twoYearsAgo.setFullYear(twoYearsAgo.getFullYear() - 2)
  
  const mapped = (data.results || [])
    .filter((m: any) => {
      if (!m.release_date) return false
      const releaseDate = new Date(m.release_date)
      releaseDate.setHours(0, 0, 0, 0)
      // Must be released within the last 2 years (not too old)
      return releaseDate >= twoYearsAgo && releaseDate <= today
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
}


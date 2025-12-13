import { NextRequest } from 'next/server'

const TMDB_BASE = 'https://api.themoviedb.org/3'

export async function GET(req: NextRequest) {
  const apiKey = process.env.TMDB_API_KEY
  if (!apiKey) {
    return Response.json({ error: 'TMDB_API_KEY is missing' }, { status: 500 })
  }

  const url = `${TMDB_BASE}/movie/now_playing?api_key=${apiKey}&language=en-IN&region=IN&page=1`

  const res = await fetch(url, { next: { revalidate: 3600 } })
  if (!res.ok) {
    return Response.json({ error: 'Failed to fetch TMDb now playing' }, { status: 500 })
  }

  const data = await res.json()
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  
  // Only show movies released in the last 6 months (still in cinemas)
  const sixMonthsAgo = new Date(today)
  sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6)
  
  const mapped = (data.results || [])
    .filter((m: any) => {
      if (!m.release_date) return false
      const releaseDate = new Date(m.release_date)
      releaseDate.setHours(0, 0, 0, 0)
      // Must be released and not older than 6 months
      return releaseDate <= today && releaseDate >= sixMonthsAgo
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


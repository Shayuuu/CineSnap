import { NextRequest } from 'next/server'

const TMDB_BASE = 'https://api.themoviedb.org/3'

export async function POST(req: NextRequest) {
  const apiKey = process.env.TMDB_API_KEY
  if (!apiKey) {
    return Response.json({ error: 'TMDB_API_KEY is missing' }, { status: 500 })
  }

  try {
    const body = await req.json()
    const { genres, keywords, query } = body

    let url: string

    if (query) {
      // Custom text search - use search API
      url = `${TMDB_BASE}/search/movie?api_key=${apiKey}&language=en-IN&query=${encodeURIComponent(query)}&page=1&sort_by=popularity.desc`
    } else if (genres && genres.length > 0) {
      // Mood-based search - use discover API with genres
      const genreIds = genres.join(',')
      url = `${TMDB_BASE}/discover/movie?api_key=${apiKey}&language=en-IN&with_genres=${genreIds}&sort_by=popularity.desc&page=1`
    } else {
      return Response.json({ error: 'Either genres or query is required' }, { status: 400 })
    }

    const res = await fetch(url, { next: { revalidate: 3600 } })
    if (!res.ok) {
      return Response.json({ error: 'Failed to fetch TMDb recommendations' }, { status: res.status })
    }

    const data = await res.json()
    
    // Map and filter results
    const mapped = (data.results || [])
      .filter((m: any) => m.poster_path && m.vote_average > 0) // Only movies with posters and ratings
      .slice(0, 12)
      .map((m: any) => ({
        id: String(m.id),
        title: m.title,
        posterUrl: m.poster_path ? `https://image.tmdb.org/t/p/w500${m.poster_path}` : null,
        rating: m.vote_average,
        releaseDate: m.release_date,
        overview: m.overview,
      }))

    return Response.json({ results: mapped })
  } catch (error: any) {
    console.error('Error fetching mood recommendations:', error)
    return Response.json({ error: 'Internal server error', details: error.message }, { status: 500 })
  }
}


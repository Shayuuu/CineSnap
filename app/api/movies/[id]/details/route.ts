import { NextRequest } from 'next/server'

const TMDB_BASE = 'https://api.themoviedb.org/3'

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const apiKey = process.env.TMDB_API_KEY
  if (!apiKey) {
    return Response.json({ error: 'TMDB_API_KEY is missing' }, { status: 500 })
  }

  const id = params.id
  const url = `${TMDB_BASE}/movie/${id}?api_key=${apiKey}&language=en-IN&append_to_response=credits`

  const res = await fetch(url, { next: { revalidate: 3600 } })
  if (!res.ok) {
    return Response.json({ error: 'Failed to fetch movie details' }, { status: 500 })
  }

  const m = await res.json()

  const cast = (m.credits?.cast || [])
    .slice(0, 8)
    .map((c: any) => ({ id: c.id, name: c.name, character: c.character }))

  const crew = (m.credits?.crew || [])
    .filter((c: any) => c.job === 'Director' || c.job === 'Producer')
    .slice(0, 4)
    .map((c: any) => ({ id: c.id, name: c.name, job: c.job }))

  const genres = (m.genres || []).map((g: any) => g.name)

  const details = {
    id: String(m.id),
    title: m.title,
    overview: m.overview,
    runtime: m.runtime,
    releaseDate: m.release_date,
    rating: m.vote_average,
    language: m.original_language,
    posterUrl: m.poster_path ? `https://image.tmdb.org/t/p/w500${m.poster_path}` : null,
    backdropUrl: m.backdrop_path ? `https://image.tmdb.org/t/p/w1280${m.backdrop_path}` : null,
    genres,
    cast,
    crew,
  }

  return Response.json(details)
}


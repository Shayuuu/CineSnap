import { NextRequest } from 'next/server'

const TMDB_BASE = 'https://api.themoviedb.org/3'

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const { getTmdbApiKey } = await import('@/lib/config')
  const apiKey = getTmdbApiKey()

  const url = `${TMDB_BASE}/movie/${id}/recommendations?api_key=${apiKey}&language=en-IN&page=1`

  const res = await fetch(url, { next: { revalidate: 3600 } })
  if (!res.ok) {
    return Response.json({ error: 'Failed to fetch recommendations' }, { status: 500 })
  }

  const data = await res.json()
  const mapped = (data.results || []).slice(0, 12).map((m: any) => ({
    id: String(m.id),
    title: m.title,
    posterUrl: m.poster_path ? `https://image.tmdb.org/t/p/w500${m.poster_path}` : null,
    rating: m.vote_average,
    releaseDate: m.release_date,
  }))

  return Response.json({ results: mapped })
}


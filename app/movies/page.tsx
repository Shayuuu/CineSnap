import MoviesExplorer from '@/components/MoviesExplorer'
import type { Metadata } from 'next'

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

export default async function MoviesPage() {
  const base = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'

  const [nowRes, upRes, popRes] = await Promise.all([
    fetch(`${base}/api/movies/now-playing`, { cache: 'no-store' }),
    fetch(`${base}/api/movies/upcoming`, { cache: 'no-store' }),
    fetch(`${base}/api/movies/popular`, { cache: 'no-store' }),
  ])

  const nowData = nowRes.ok ? await nowRes.json() : { results: [] }
  const upData = upRes.ok ? await upRes.json() : { results: [] }
  const popData = popRes.ok ? await popRes.json() : { results: [] }

  const now = (nowData.results || []).map(mapMovie)
  const soon = (upData.results || []).map(mapMovie)
  const popular = (popData.results || []).map(mapMovie)

  return <MoviesExplorer nowPlaying={now} upcoming={soon} popular={popular} />
}

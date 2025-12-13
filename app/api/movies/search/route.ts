import { NextRequest } from 'next/server'
import { getTmdbApiKey } from '@/lib/config'

export async function GET(req: NextRequest) {
  const apiKey = getTmdbApiKey()

  const searchParams = req.nextUrl.searchParams
  const query = searchParams.get('q') || ''
  const genre = searchParams.get('genre')
  const language = searchParams.get('language')
  const minRating = searchParams.get('minRating')
  const maxPrice = searchParams.get('maxPrice')
  const page = searchParams.get('page') || '1'

  if (!query) {
    return Response.json({ error: 'Search query is required' }, { status: 400 })
  }

  try {
    // Build TMDb search URL
    const tmdbUrl = new URL(`https://api.themoviedb.org/3/search/movie`)
    tmdbUrl.searchParams.set('api_key', apiKey)
    tmdbUrl.searchParams.set('query', query)
    tmdbUrl.searchParams.set('page', page)
    tmdbUrl.searchParams.set('language', 'en-IN')
    if (language) {
      tmdbUrl.searchParams.set('language', language)
    }

    const res = await fetch(tmdbUrl.toString(), { cache: 'no-store' })
    if (!res.ok) {
      throw new Error('TMDb API error')
    }

    const data = await res.json()
    
    // Filter results
    let results = data.results || []
    
    // Filter by genre
    if (genre) {
      results = results.filter((movie: any) => 
        movie.genre_ids && movie.genre_ids.includes(parseInt(genre))
      )
    }
    
    // Filter by minimum rating
    if (minRating) {
      const minRatingNum = parseFloat(minRating)
      results = results.filter((movie: any) => 
        movie.vote_average >= minRatingNum
      )
    }

    // Map results
    const movies = results.map((m: any) => ({
      id: String(m.id),
      title: m.title,
      overview: m.overview,
      posterUrl: m.poster_path ? `https://image.tmdb.org/t/p/w500${m.poster_path}` : null,
      releaseDate: m.release_date,
      rating: m.vote_average,
      language: m.original_language,
      genres: m.genre_ids || [],
    }))

    return Response.json({
      movies,
      page: data.page,
      totalPages: data.total_pages,
      totalResults: data.total_results,
    })
  } catch (error: any) {
    console.error('Search error:', error)
    return Response.json(
      { error: error.message || 'Failed to search movies' },
      { status: 500 }
    )
  }
}


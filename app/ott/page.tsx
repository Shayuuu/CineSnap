import { getTmdbApiKey } from '@/lib/config'
import OTTClient from '@/components/OTTClient'

export const metadata = {
  title: 'Top 5 Trending Movies on OTT - CineSnap',
  description: 'Discover top 5 trending movies on Netflix, Prime Video, Apple TV+, and Disney+ Hotstar',
}

export const dynamic = 'force-dynamic'

type OTTContent = {
  id: number
  title: string
  name?: string
  overview: string
  poster_path: string | null
  backdrop_path: string | null
  release_date?: string
  first_air_date?: string
  vote_average: number
  media_type: 'movie' | 'tv'
  provider_name: string
}

export default async function OTTPage() {
  const apiKey = getTmdbApiKey()
  
  if (!apiKey) {
    return (
      <div className="min-h-screen pt-24 pb-32 px-6 flex items-center justify-center">
        <div className="glass rounded-2xl p-8 text-center">
          <p className="text-gray-400">TMDb API key is required to load OTT content</p>
        </div>
      </div>
    )
  }

  // OTT Provider IDs from TMDb (verified IDs)
  const providers = {
    netflix: 8,      // Netflix
    prime: 9,        // Amazon Prime Video
    apple: 2,        // Apple TV+
    hotstar: 350,    // Disney+ Hotstar (correct ID for India region)
  }

  const ottContent: {
    netflix: OTTContent[]
    prime: OTTContent[]
    apple: OTTContent[]
    hotstar: OTTContent[]
  } = {
    netflix: [],
    prime: [],
    apple: [],
    hotstar: [],
  }

  try {
    // Helper function to fetch top 5 trending movies only
    const fetchProviderContent = async (providerId: number, providerName: string): Promise<OTTContent[]> => {
      try {
        // Fetch only trending movies (top 5) - matching pattern from other TMDb calls
        const moviesRes = await fetch(
          `https://api.themoviedb.org/3/discover/movie?api_key=${apiKey}&language=en-IN&sort_by=popularity.desc&with_watch_providers=${providerId}&watch_region=IN&page=1`,
          { 
            next: { revalidate: 3600 },
            headers: {
              'Accept': 'application/json',
            }
          }
        )

        if (!moviesRes.ok) {
          console.error(`Failed to fetch ${providerName} movies: ${moviesRes.status} ${moviesRes.statusText}`)
          return []
        }

        const data = await moviesRes.json()

        if (!data.results || !Array.isArray(data.results)) {
          console.warn(`${providerName}: Invalid response format or no results`)
          return []
        }

        const movies = data.results.slice(0, 5).map((item: any) => ({
          id: item.id,
          title: item.title || item.name || 'Unknown Title',
          name: item.name,
          overview: item.overview || '',
          poster_path: item.poster_path,
          backdrop_path: item.backdrop_path,
          release_date: item.release_date,
          first_air_date: item.first_air_date,
          vote_average: item.vote_average || 0,
          media_type: 'movie' as const,
          provider_name: providerName,
        }))

        return movies // Return top 5 movies only
      } catch (err: any) {
        // Log errors in development only
        if (process.env.NODE_ENV === 'development') {
          console.error(`Failed to fetch ${providerName} content:`, err.message || err)
        }
        return []
      }
    }

    // Fetch content for all providers in parallel with error handling
    const [netflix, prime, apple, hotstar] = await Promise.allSettled([
      fetchProviderContent(providers.netflix, 'Netflix'),
      fetchProviderContent(providers.prime, 'Prime Video'),
      fetchProviderContent(providers.apple, 'Apple TV+'),
      fetchProviderContent(providers.hotstar, 'Disney+ Hotstar'),
    ]).then((results) => {
      return results.map((result) => {
        if (result.status === 'fulfilled') {
          return result.value
        } else {
          console.error('Provider fetch failed:', result.reason)
          return []
        }
      })
    })

    ottContent.netflix = netflix
    ottContent.prime = prime
    ottContent.apple = apple
    ottContent.hotstar = hotstar
  } catch (error: any) {
    console.error('Failed to fetch OTT content:', error.message)
  }

  return <OTTClient content={ottContent} />
}

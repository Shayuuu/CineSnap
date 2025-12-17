import { notFound } from 'next/navigation'
import MovieDetailClient from '@/components/MovieDetailClient'
import { query, queryOne, execute, getConnection } from '@/lib/db'
import { getTmdbApiKey } from '@/lib/config'

type Props = {
  params: Promise<{ id: string }>
}

export default async function MovieDetailPage({ params }: Props) {
  const { id } = await params
  const { CONFIG } = await import('@/lib/config')
  const apiKey = getTmdbApiKey()
  
  // Get base URL for API calls (server-side)
  const base = process.env.NEXT_PUBLIC_BASE_URL || 
               process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : 
               'http://localhost:3000'

  let movie: any = null

  // Fetch movie details from TMDb API (with caching and parallel requests)
  let watchProviders: any = null
  if (apiKey) {
    try {
      // Fetch movie details, videos, and watch providers in parallel
      const [movieRes, videosRes, providersRes] = await Promise.allSettled([
        fetch(
          `https://api.themoviedb.org/3/movie/${id}?api_key=${apiKey}&language=en-IN&append_to_response=credits`,
          { 
            next: { revalidate: 3600 }, // Cache for 1 hour (ISR)
            headers: {
              'Accept': 'application/json',
            }
          }
        ),
        fetch(
          `https://api.themoviedb.org/3/movie/${id}/videos?api_key=${apiKey}`,
          { 
            next: { revalidate: 3600 }, // Cache for 1 hour
            headers: {
              'Accept': 'application/json',
            }
          }
        ),
        fetch(
          `https://api.themoviedb.org/3/movie/${id}/watch/providers?api_key=${apiKey}`,
          { 
            next: { revalidate: 3600 }, // Cache for 1 hour
            headers: {
              'Accept': 'application/json',
            }
          }
        )
      ])

      // Process movie details
      if (movieRes.status === 'fulfilled' && movieRes.value.ok) {
        try {
          const m = await movieRes.value.json()
          
          // Process videos (non-critical)
          let videos = { results: [] }
          if (videosRes.status === 'fulfilled' && videosRes.value.ok) {
            try {
              videos = await videosRes.value.json()
            } catch (e) {
              // Ignore video parsing errors
              if (process.env.NODE_ENV === 'development') {
                console.warn('[TMDb] Failed to parse videos:', e)
              }
            }
          }

          // Process watch providers (for OTT links)
          if (providersRes.status === 'fulfilled' && providersRes.value.ok) {
            try {
              const providersData = await providersRes.value.json()
              // Get IN (India) providers, fallback to US if not available
              watchProviders = providersData.results?.IN || providersData.results?.US || null
            } catch (e) {
              if (process.env.NODE_ENV === 'development') {
                console.warn('[TMDb] Failed to parse watch providers:', e)
              }
            }
          }
            
          movie = {
            id: String(m.id),
            title: m.title,
            overview: m.overview || '',
            posterUrl: m.poster_path ? `https://image.tmdb.org/t/p/w500${m.poster_path}` : null,
            backdropUrl: m.backdrop_path ? `https://image.tmdb.org/t/p/original${m.backdrop_path}` : null,
            releaseDate: m.release_date || '',
            duration: m.runtime || 120,
            rating: m.vote_average || 0,
            genre: m.genres?.[0]?.name || 'Feature',
            language: m.original_language || 'en',
            cast: m.credits?.cast?.slice(0, 10).map((actor: any) => ({
              name: actor.name,
              character: actor.character,
              profileUrl: actor.profile_path ? `https://image.tmdb.org/t/p/w185${actor.profile_path}` : null,
            })) || [],
            crew: m.credits?.crew?.slice(0, 10).map((member: any) => ({
              name: member.name,
              role: member.job,
            })) || [],
            trailer: videos.results?.find((v: any) => v.type === 'Trailer' && v.site === 'YouTube')?.key || null,
          }
        } catch (parseErr: any) {
          console.error('[TMDb] Failed to parse movie response:', parseErr.message)
        }
      } else if (movieRes.status === 'rejected') {
        // Network error or fetch failed
        const errorMsg = movieRes.reason?.message || 'Unknown error'
        if (process.env.NODE_ENV === 'development') {
          console.error('[TMDb] Failed to fetch movie:', errorMsg)
          console.error('[TMDb] Error details:', movieRes.reason)
        }
        // Don't throw - let the page continue with notFound() below
      } else if (movieRes.status === 'fulfilled' && !movieRes.value.ok) {
        // HTTP error response
        const statusText = movieRes.value.statusText || 'Unknown error'
        if (process.env.NODE_ENV === 'development') {
          console.error(`[TMDb] API error: ${movieRes.value.status} ${statusText}`)
        }
        // If 404, movie doesn't exist - will show notFound() below
        // For other errors, log but continue
      }
    } catch (err: any) {
      // Catch any unexpected errors
      if (process.env.NODE_ENV === 'development') {
        console.error('[TMDb] Movie fetch error:', err.message || err)
      }
      // Don't throw - let the page continue
    }
  } else {
    // No API key - log warning but don't crash
    if (process.env.NODE_ENV === 'development') {
      console.warn('[TMDb] API key not available - movie details will not be fetched')
    }
  }

      if (!movie) {
        return notFound()
      }

      // Streaming platform provider IDs (Netflix, Prime, Apple TV+, Jio Hotstar)
      const STREAMING_PROVIDER_IDS = [8, 9, 2, 337, 350] // Netflix, Prime Video, Apple TV+, Disney+ Hotstar (old & new)
      
      // Check if movie is streaming-only (has ONLY Netflix, Prime, Apple TV+, or Jio Hotstar)
      // A movie is OTT-only if:
      // 1. It has watch providers
      // 2. It has at least one of the 4 streaming platforms
      // 3. ALL providers are from the 4 streaming platforms (no other providers)
      const isOTTMovie = watchProviders && (() => {
        const allProviders = [
          ...(watchProviders.flatrate || []),
          ...(watchProviders.buy || []),
          ...(watchProviders.rent || [])
        ]
        
        // If no providers at all, it's not OTT-only (show showtimes)
        if (allProviders.length === 0) {
          return false
        }
        
        // Check if it has at least one of the 4 streaming platforms
        const hasStreaming = allProviders.some((p: any) => STREAMING_PROVIDER_IDS.includes(p.provider_id))
        
        // If it doesn't have any of the 4 streaming platforms, it's not OTT-only (show showtimes)
        if (!hasStreaming) {
          return false
        }
        
        // If it has streaming platforms, check if ALL providers are from streaming platforms
        // If there are any non-streaming providers, it's not OTT-only (show showtimes)
        const allAreStreaming = allProviders.every((p: any) => STREAMING_PROVIDER_IDS.includes(p.provider_id))
        
        return allAreStreaming
      })()

  // Debug log
  if (process.env.NODE_ENV === 'development') {
    console.log('[Movie Detail] Watch Providers:', watchProviders)
    console.log('[Movie Detail] Is OTT Movie:', isOTTMovie)
  }

  // Get showtimes from database (only if not an OTT movie)
  let showtimes: any[] = []
  if (!isOTTMovie) {
    try {
      // Check if Movie record exists, create if not
    let movieRecord = await queryOne<any>(
      'SELECT id FROM "Movie" WHERE id = $1',
      [id]
    )

    if (!movieRecord) {
      // Create Movie record
      try {
        await execute(
          `INSERT INTO "Movie" (id, title, "posterUrl", duration, genre, "releaseDate")
           VALUES ($1, $2, $3, $4, $5, $6)
           ON CONFLICT (id) DO UPDATE SET title = EXCLUDED.title`,
          [id, movie?.title || 'Movie', '', 120, 'Feature', new Date()]
        )
      } catch (insertErr: any) {
        // Ignore duplicate key errors
        if (!insertErr.message?.includes('duplicate') && insertErr.code !== '23505') {
          console.error('Failed to create Movie record:', insertErr)
        }
      }
    }

    // Get existing showtimes (optimized query with LIMIT)
    showtimes = await query<any>(
      `SELECT s.*, sc.name as "screenName", t.name as "theaterName", t.location as "theaterLocation"
       FROM "Showtime" s
       INNER JOIN "Screen" sc ON s."screenId" = sc.id
       INNER JOIN "Theater" t ON sc."theaterId" = t.id
       WHERE s."movieId" = $1 AND s."startTime" >= NOW()
       ORDER BY s."startTime" ASC
       LIMIT 100`,
      [id]
    )

    // If no showtimes exist, generate them (optimized batch insert)
    if (showtimes.length === 0) {
      try {
        // Get all theaters and screens (cached query)
        const theaters = await query<any>(
          `SELECT t.id as "theaterId", t.name as "theaterName", t.location as "theaterLocation",
                  sc.id as "screenId", sc.name as "screenName"
           FROM "Theater" t
           INNER JOIN "Screen" sc ON t.id = sc."theaterId"
           ORDER BY t.name, sc.name
           LIMIT 50`,
          []
        )

        if (theaters.length > 0) {
          const now = new Date()
          const tomorrow = new Date(now)
          tomorrow.setDate(tomorrow.getDate() + 1)
          tomorrow.setHours(10, 0, 0, 0)

          // Generate showtimes for next 7 days (optimized batch insert)
          const timeSlots = ['10:00', '13:30', '17:00', '20:30', '23:00']
          const showtimesToInsert: Array<[string, string, string, Date, number]> = []
          
          for (let day = 0; day < 7; day++) {
            const date = new Date(tomorrow)
            date.setDate(date.getDate() + day)
            
            for (const theater of theaters) {
              const slotsToUse = timeSlots.slice(0, Math.min(3, timeSlots.length))
              
              for (const timeSlot of slotsToUse) {
                const [hours, minutes] = timeSlot.split(':').map(Number)
                const startTime = new Date(date)
                startTime.setHours(hours, minutes, 0, 0)

                if (startTime < now) continue

                const basePrice = 30000
                const price = basePrice + Math.floor(Math.random() * 20000)
                const showtimeId = `showtime-${id}-${theater.screenId}-${day}-${timeSlot.replace(':', '')}`
                
                showtimesToInsert.push([showtimeId, id, theater.screenId, startTime, price])
              }
            }
          }

          // Batch insert showtimes (much faster than individual inserts)
          if (showtimesToInsert.length > 0) {
            try {
              const { getConnection } = await import('@/lib/db')
              const connection = await getConnection()
              try {
                await connection.query('BEGIN')
                
                // Use batch insert with VALUES clause (limit to 100 per batch to avoid query size limits)
                const batchSize = 50
                for (let i = 0; i < showtimesToInsert.length; i += batchSize) {
                  const batch = showtimesToInsert.slice(i, i + batchSize)
                  const values = batch.map((_, idx) => {
                    const base = idx * 5
                    return `($${base + 1}, $${base + 2}, $${base + 3}, $${base + 4}, $${base + 5})`
                  }).join(', ')
                  
                  const params = batch.flat()
                  
                  await connection.query(
                    `INSERT INTO "Showtime" (id, "movieId", "screenId", "startTime", price)
                     VALUES ${values}
                     ON CONFLICT (id) DO UPDATE SET "startTime" = EXCLUDED."startTime", price = EXCLUDED.price`,
                    params
                  )
                }
                
                await connection.query('COMMIT')
              } catch (batchErr: any) {
                await connection.query('ROLLBACK')
                console.error('Batch insert failed, trying individual inserts:', batchErr.message)
                // Fallback to individual inserts if batch fails
                for (const [showtimeId, movieId, screenId, startTime, price] of showtimesToInsert) {
                  try {
                    await execute(
                      `INSERT INTO "Showtime" (id, "movieId", "screenId", "startTime", price)
                       VALUES ($1, $2, $3, $4, $5)
                       ON CONFLICT (id) DO UPDATE SET "startTime" = EXCLUDED."startTime", price = EXCLUDED.price`,
                      [showtimeId, movieId, screenId, startTime, price]
                    )
                  } catch (showtimeErr: any) {
                    // Ignore duplicate errors
                    if (!showtimeErr.message?.includes('duplicate') && showtimeErr.code !== '23505') {
                      console.error('Failed to create showtime:', showtimeErr)
                    }
                  }
                }
              } finally {
                connection.release()
              }
            } catch (err: any) {
              console.error('Failed to batch insert showtimes:', err.message)
            }
          }

          // Fetch the newly created showtimes
          showtimes = await query<any>(
            `SELECT s.*, sc.name as "screenName", t.name as "theaterName", t.location as "theaterLocation"
             FROM "Showtime" s
             INNER JOIN "Screen" sc ON s."screenId" = sc.id
             INNER JOIN "Theater" t ON sc."theaterId" = t.id
             WHERE s."movieId" = $1 AND s."startTime" >= NOW()
             ORDER BY s."startTime" ASC
             LIMIT 100`,
            [id]
          )
        }
      } catch (genErr: any) {
        console.error('Failed to generate showtimes:', genErr.message || genErr)
        // Continue with empty showtimes array
      }
    }
    } catch (err: any) {
      console.error('Failed to fetch showtimes:', err.message || err)
      showtimes = []
    }
  }

      return (
        <MovieDetailClient
          movie={movie}
          showtimes={isOTTMovie ? [] : showtimes.map((st: any) => ({
            id: st.id,
            startTime: st.startTime,
            price: st.price,
            screenName: st.screenName,
            theaterName: st.theaterName,
            theaterLocation: st.theaterLocation,
          }))}
          watchProviders={watchProviders}
        />
      )
}

import { notFound } from 'next/navigation'
import PaymentClient from '@/components/PaymentClient'
import { getTmdbApiKey } from '@/lib/config'
import { formatDateTime } from '@/lib/dateUtils'
import { queryOne } from '@/lib/db'

type Props = { params: Promise<{ id: string }> }

export default async function PaymentPage({ params }: Props) {
  const { id } = await params
  
  // Get showtime from database (PostgreSQL syntax)
  const showtime = await queryOne<any>(
    `SELECT s.*, sc.name as "screenName", t.name as "theaterName", t.location as "theaterLocation"
     FROM "Showtime" s
     INNER JOIN "Screen" sc ON s."screenId" = sc.id
     INNER JOIN "Theater" t ON sc."theaterId" = t.id
     WHERE s.id = $1`,
    [id]
  )
  
  if (!showtime) return notFound()

  // Fetch movie from TMDb API (with caching)
  let movie: any = null
  try {
    const apiKey = getTmdbApiKey()
    if (apiKey) {
      const movieRes = await fetch(
        `https://api.themoviedb.org/3/movie/${showtime.movieId}?api_key=${apiKey}&language=en-IN`,
        { 
          next: { revalidate: 3600 }, // Cache for 1 hour
          headers: {
            'Accept': 'application/json',
          }
        }
      )
      if (movieRes.ok) {
        const m = await movieRes.json()
        movie = {
          id: String(m.id),
          title: m.title,
        }
      } else {
        console.error(`[Payment] TMDb API error: ${movieRes.status} ${movieRes.statusText}`)
      }
    }
  } catch (err: any) {
    console.error('[Payment] Failed to fetch movie:', err.message || err)
  }

  if (!movie) return notFound()

  return (
    <PaymentClient
      showtimeId={showtime.id}
      movieTitle={movie.title}
      theaterName={showtime.theaterName}
      screenName={showtime.screenName}
      showtime={formatDateTime(showtime.startTime)}
      pricePerSeat={showtime.price / 100}
    />
  )
}

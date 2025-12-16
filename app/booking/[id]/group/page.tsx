import { notFound } from 'next/navigation'
import { formatDateTime } from '@/lib/dateUtils'
import GroupBookingClient from '@/components/GroupBookingClient'
import { MOCK_THEATERS, getTheaterByScreenId } from '@/lib/mockData'
import { getTmdbApiKey } from '@/lib/config'

type Props = { params: Promise<{ id: string }> }

// Parse showtime ID to extract movie ID, screen index, and slot index
function parseShowtimeId(showtimeId: string) {
  // Format: showtime-{movieId}-{screenIndex}-{slotIndex}
  const parts = showtimeId.split('-')
  if (parts.length < 4) return null
  
  return {
    movieId: parts[1],
    screenIndex: parseInt(parts[2]),
    slotIndex: parseInt(parts[3]),
  }
}

// Generate showtime data from ID
function getShowtimeFromId(showtimeId: string) {
  const parsed = parseShowtimeId(showtimeId)
  if (!parsed) return null
  
  const slots = ['10:00', '13:00', '16:00', '19:00', '22:00']
  const allScreens: Array<{ id: string; name: string; theaterId: string }> = []
  MOCK_THEATERS.forEach(theater => {
    theater.screens.forEach(screen => {
      allScreens.push({
        id: screen.id,
        name: screen.name,
        theaterId: theater.id,
      })
    })
  })
  
  if (parsed.screenIndex >= allScreens.length || parsed.slotIndex >= slots.length) {
    return null
  }
  
  const screen = allScreens[parsed.screenIndex]
  const slot = slots[parsed.slotIndex]
  const [hours, minutes] = slot.split(':')
  const startTimeDate = new Date()
  startTimeDate.setHours(parseInt(hours), parseInt(minutes), 0, 0)
  if (startTimeDate < new Date()) {
    startTimeDate.setDate(startTimeDate.getDate() + 1)
  }
  
  const theaterData = getTheaterByScreenId(screen.id)
  
  return {
    id: showtimeId,
    movieId: parsed.movieId,
    screenId: screen.id,
    startTime: startTimeDate.toISOString(),
    price: 45000 + Math.floor(Math.random() * 15000),
    screenName: screen.name,
    theaterId: theaterData?.theater.id || MOCK_THEATERS[0].id,
    theaterName: theaterData?.theater.name || MOCK_THEATERS[0].name,
  }
}

export default async function GroupBookingPage({ params }: Props) {
  const { id } = await params
  
  // Get showtime from hardcoded data
  const showtime = getShowtimeFromId(id)
  if (!showtime) return notFound()

  // Fetch movie from TMDb API
  let movie: any = null
  try {
    const apiKey = getTmdbApiKey()
    if (apiKey) {
      const movieRes = await fetch(
        `https://api.themoviedb.org/3/movie/${showtime.movieId}?api_key=${apiKey}&language=en-IN`,
        { cache: 'no-store' }
      )
      if (movieRes.ok) {
        const m = await movieRes.json()
        movie = {
          id: String(m.id),
          title: m.title,
        }
      }
    }
  } catch (err) {
    console.error('Failed to fetch movie:', err)
  }

  if (!movie) return notFound()

  return (
    <GroupBookingClient
      showtimeId={showtime.id}
      movieTitle={movie.title}
      showtime={formatDateTime(showtime.startTime)}
    />
  )
}


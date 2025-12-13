import { queryOne } from '@/lib/db'
import { notFound } from 'next/navigation'
import PaymentClient from '@/components/PaymentClient'

type Props = { params: Promise<{ id: string }> }

export default async function PaymentPage({ params }: Props) {
  const { id } = await params
  const showtime = await queryOne<any>(
    'SELECT * FROM Showtime WHERE id = ?',
    [id]
  )

  if (!showtime) return notFound()

  const movie = await queryOne<any>(
    'SELECT * FROM Movie WHERE id = ?',
    [showtime.movieId]
  )

  const screen = await queryOne<any>(
    'SELECT * FROM Screen WHERE id = ?',
    [showtime.screenId]
  )

  const theater = await queryOne<any>(
    'SELECT * FROM Theater WHERE id = ?',
    [screen.theaterId]
  )

  return (
    <PaymentClient
      showtimeId={id}
      movieTitle={movie.title}
      theaterName={theater.name}
      screenName={screen.name}
      showtime={showtime.startTime}
      pricePerSeat={showtime.price}
    />
  )
}


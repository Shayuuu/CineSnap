'use client'

import { useSession } from 'next-auth/react'
import BookMyShowSeatMap from '@/components/BookMyShowSeatMap'
import BookingHeader from '@/components/BookingHeader'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

type Props = {
  seats: any[]
  lockedSeats: string[]
  bookedSeats: string[]
  showtimeId: string
  movieTitle: string
  theaterName: string
  screenName: string
  showtime: string
  pricePerSeat: number
}

export default function BookingClient({
  seats,
  lockedSeats,
  bookedSeats,
  showtimeId,
  movieTitle,
  theaterName,
  screenName,
  showtime,
  pricePerSeat,
}: Props) {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [mounted, setMounted] = useState(false)
  const [selectedSeats, setSelectedSeats] = useState<string[]>([])

  useEffect(() => {
    setMounted(true)
    if (status === 'loading') return
    if (!session) {
      router.push('/login?callbackUrl=/booking/' + showtimeId)
    }
  }, [session, status, router, showtimeId])

  if (status === 'loading' || !mounted) {
    return (
      <div className="min-h-screen pt-24 pb-32 px-6 flex items-center justify-center">
        <div className="glass rounded-2xl p-8">
          <div className="w-12 h-12 border-4 border-white border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-400">Loading...</p>
        </div>
      </div>
    )
  }

  if (!session) {
    return null
  }

  const userId = (session.user as any)?.id || 'demo-user'

  return (
    <div className="min-h-screen pt-24 pb-32 px-4 md:px-6">
      <div className="max-w-6xl mx-auto">
        <BookingHeader
          movieTitle={movieTitle}
          theaterName={theaterName}
          screenName={screenName}
          showtime={showtime}
          selectedCount={selectedSeats.length}
        />

        <div className="mb-6 flex gap-4 justify-center">
          <Link
            href={`/booking/${showtimeId}/group`}
            className="px-6 py-3 glass rounded-xl border border-white/10 hover:border-white/30 transition-all text-white font-clash font-semibold"
          >
            👥 Group Booking
          </Link>
        </div>

        {/* Seat Map - Centered */}
        <div className="flex justify-center">
          <BookMyShowSeatMap
            seats={seats}
            lockedSeats={lockedSeats}
            bookedSeats={bookedSeats}
            showtimeId={showtimeId}
            userId={userId}
            pricePerSeat={pricePerSeat}
            onSelect={setSelectedSeats}
          />
        </div>
      </div>
    </div>
  )
}


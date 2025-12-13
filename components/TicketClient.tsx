'use client'

import { motion } from 'framer-motion'
import { formatDateTime } from '@/lib/dateUtils'
import TicketPDF from './TicketPDF'
import QRCode from './QRCode'

type Props = {
  bookingId: string
  movieTitle: string
  theaterName: string
  screenName: string
  showtime: string
  seats: string[]
  total: number
  status: string
  posterUrl?: string
}

export default function TicketClient({
  bookingId,
  movieTitle,
  theaterName,
  screenName,
  showtime,
  seats,
  total,
  status,
  posterUrl,
}: Props) {
  const qrData = JSON.stringify({
    bookingId,
    movie: movieTitle,
    showtime,
    seats,
  })

  return (
    <div className="min-h-screen pt-24 pb-32 px-6">
      <div className="max-w-4xl mx-auto">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="space-y-8"
        >
          {/* Success Message */}
          <div className="text-center">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, type: 'spring' }}
              className="inline-block mb-4"
            >
              <div className="w-20 h-20 rounded-full bg-white/10 border-4 border-white flex items-center justify-center">
                <span className="text-4xl">✓</span>
              </div>
            </motion.div>
            <h1 className="text-4xl md:text-5xl font-clash font-bold text-white mb-2">
              Booking Confirmed!
            </h1>
            <p className="text-gray-400">Your tickets are ready</p>
          </div>

          {/* Ticket Card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="glass-strong rounded-3xl p-8 md:p-12 border border-white/20"
          >
            <div className="grid md:grid-cols-3 gap-8">
              {/* Left: Movie Info */}
              <div className="md:col-span-2 space-y-6">
                <div>
                  <h2 className="text-3xl md:text-4xl font-clash font-bold text-white mb-4">
                    {movieTitle}
                  </h2>
                  <div className="space-y-2 text-gray-300">
                    <p>
                      <span className="text-white/70">Theater:</span> {theaterName}
                    </p>
                    <p>
                      <span className="text-white/70">Screen:</span> {screenName}
                    </p>
                    <p>
                      <span className="text-white/70">Showtime:</span>{' '}
                      {formatDateTime(showtime)}
                    </p>
                    <p>
                      <span className="text-white/70">Booking ID:</span>{' '}
                      <span className="font-mono text-white">{bookingId.slice(0, 8)}</span>
                    </p>
                  </div>
                </div>

                <div className="border-t border-white/10 pt-6">
                  <h3 className="text-lg font-clash font-semibold text-white mb-4">
                    Seats
                  </h3>
                  <div className="flex flex-wrap gap-3">
                    {seats.map((seat) => (
                      <span
                        key={seat}
                        className="px-4 py-2 bg-white/10 rounded-lg text-white font-semibold border border-white/20"
                      >
                        {seat}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="border-t border-white/10 pt-6">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-300">Total Paid</span>
                    <span className="text-3xl font-clash font-bold text-white">
                      ₹{total / 100}
                    </span>
                  </div>
                </div>
              </div>

              {/* Right: QR Code */}
              <div className="flex flex-col items-center justify-center space-y-4">
                <div className="glass rounded-2xl p-6 bg-white">
                  <QRCode value={qrData} size={200} />
                </div>
                <p className="text-xs text-gray-400 text-center">
                  Scan at theater entrance
                </p>
              </div>
            </div>
          </motion.div>

          {/* Actions */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <TicketPDF
              bookingId={bookingId}
              movieTitle={movieTitle}
              showtime={formatDateTime(showtime)}
              seats={seats}
              total={total}
              qrData={qrData}
              posterUrl={posterUrl}
              theaterName={theaterName}
              screenName={screenName}
            />
            <motion.a
              href="/movies"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="px-8 py-4 glass rounded-full text-white font-clash font-semibold text-center hover:bg-white/10 transition-colors"
            >
              Book More Movies →
            </motion.a>
          </div>
        </motion.div>
      </div>
    </div>
  )
}


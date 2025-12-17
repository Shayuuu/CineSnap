'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'

type Props = {
  bookingId: string
  startTime: string
  onCancelled: () => void
}

export default function CancelBookingButton({ bookingId, startTime, onCancelled }: Props) {
  const [isOpen, setIsOpen] = useState(false)
  const [reason, setReason] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Check if cancellation is allowed (at least 2 hours before showtime)
  const showtime = new Date(startTime)
  const now = new Date()
  const hoursUntilShowtime = (showtime.getTime() - now.getTime()) / (1000 * 60 * 60)
  const canCancel = hoursUntilShowtime >= 2

  const handleCancel = async () => {
    if (!reason.trim()) {
      setError('Please provide a reason for cancellation')
      return
    }

    setLoading(true)
    setError(null)

    try {
      const res = await fetch(`/api/bookings/${bookingId}/cancel`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ reason }),
      })

      const data = await res.json()

      if (!res.ok) {
        throw new Error(data.error || 'Failed to cancel booking')
      }

      setIsOpen(false)
      setReason('')
      
      // Show success message
      alert(`Booking cancelled successfully! Refund of ${data.refundAmount ? `₹${(data.refundAmount / 100).toFixed(2)}` : 'full amount'} will be processed.`)
      
      // Call the callback to refresh the bookings list
      onCancelled()
    } catch (err: any) {
      setError(err.message || 'Failed to cancel booking')
    } finally {
      setLoading(false)
    }
  }

  if (!canCancel) {
    return (
      <span className="text-xs text-gray-500">
        Cancellation not available (less than 2 hours before showtime)
      </span>
    )
  }

  return (
    <>
      <motion.button
        onClick={() => setIsOpen(true)}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        className="px-4 py-2 bg-red-500/20 hover:bg-red-500/30 text-red-400 rounded-lg text-sm font-semibold transition-colors"
      >
        Cancel Booking
      </motion.button>

      {isOpen && (
        <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4">
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="glass-strong rounded-2xl p-6 max-w-md w-full border border-white/20"
          >
            <h3 className="text-xl font-clash font-bold text-white mb-4">
              Cancel Booking
            </h3>
            <p className="text-gray-400 text-sm mb-4">
              Are you sure you want to cancel this booking? Refund will be processed to your wallet.
            </p>
            
            <div className="mb-4">
              <label className="block text-sm text-gray-300 mb-2">
                Reason for cancellation (optional)
              </label>
              <textarea
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                placeholder="E.g., Change of plans, scheduling conflict..."
                className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-white/30 resize-none"
                rows={3}
              />
            </div>

            {error && (
              <div className="mb-4 p-3 bg-red-500/20 border border-red-500/50 rounded-lg">
                <p className="text-red-400 text-sm">{error}</p>
              </div>
            )}

            <div className="flex gap-3">
              <motion.button
                onClick={() => {
                  setIsOpen(false)
                  setReason('')
                  setError(null)
                }}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="flex-1 px-4 py-2 bg-white/10 hover:bg-white/20 text-white rounded-lg font-semibold transition-colors"
              >
                Keep Booking
              </motion.button>
              <motion.button
                onClick={handleCancel}
                disabled={loading}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="flex-1 px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg font-semibold transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'Cancelling...' : 'Cancel Booking'}
              </motion.button>
            </div>
          </motion.div>
        </div>
      )}
    </>
  )
}



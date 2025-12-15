'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useSession } from 'next-auth/react'
import { formatDateTime } from '@/lib/dateUtils'

type Review = {
  id: string
  rating: number
  reviewText: string | null
  createdAt: string
  updatedAt: string
  userId: string
  userName: string | null
  userEmail: string
}

type Props = {
  movieId: string
}

export default function ReviewSection({ movieId }: Props) {
  const { data: session, status: sessionStatus } = useSession()
  const [reviews, setReviews] = useState<Review[]>([])
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [showForm, setShowForm] = useState(false)
  const [rating, setRating] = useState(0)
  const [hoverRating, setHoverRating] = useState(0)
  const [reviewText, setReviewText] = useState('')
  const [userReview, setUserReview] = useState<Review | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (sessionStatus !== 'loading') {
      fetchReviews()
    }
  }, [movieId, sessionStatus])

  const fetchReviews = async () => {
    try {
      const res = await fetch(`/api/reviews?movieId=${movieId}`)
      const data = await res.json()
      
      // Always set reviews, even if empty (handles case where Review table doesn't exist)
      setReviews(data.reviews || [])
      
      // Find user's review if logged in
      if (session?.user && data.reviews) {
        const userId = (session.user as any)?.id
        const userRev = data.reviews.find((r: Review) => r.userId === userId)
        if (userRev) {
          setUserReview(userRev)
          setRating(userRev.rating)
          setReviewText(userRev.reviewText || '')
        }
      }
    } catch (err) {
      console.error('Failed to fetch reviews:', err)
      // Set empty array on error to prevent UI issues
      setReviews([])
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!session || !session.user) {
      setError('Please log in to write a review')
      // Redirect to login
      window.location.href = `/login?callbackUrl=${encodeURIComponent(window.location.pathname)}`
      return
    }

    const userId = (session.user as any)?.id
    if (!userId) {
      setError('User session invalid. Please log in again.')
      return
    }

    if (rating === 0) {
      setError('Please select a rating')
      return
    }

    setSubmitting(true)
    setError(null)

    try {
      const res = await fetch('/api/reviews', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
        },
        credentials: 'include', // Include cookies for session
        body: JSON.stringify({
          movieId,
          rating,
          reviewText: reviewText.trim() || null,
        }),
      })

      const data = await res.json()

      if (!res.ok) {
        if (res.status === 401) {
          setError('Please log in to write a review')
          window.location.href = `/login?callbackUrl=${encodeURIComponent(window.location.pathname)}`
        } else {
          throw new Error(data.error || 'Failed to save review')
        }
        return
      }

      setShowForm(false)
      await fetchReviews()
      setError(null)
    } catch (err: any) {
      console.error('Review submission error:', err)
      setError(err.message || 'Failed to save review')
    } finally {
      setSubmitting(false)
    }
  }

  const handleDelete = async (reviewId: string) => {
    if (!confirm('Are you sure you want to delete your review?')) return

    try {
      const res = await fetch(`/api/reviews?reviewId=${reviewId}`, {
        method: 'DELETE',
      })

      if (!res.ok) {
        throw new Error('Failed to delete review')
      }

      setUserReview(null)
      setRating(0)
      setReviewText('')
      await fetchReviews()
    } catch (err: any) {
      setError(err.message || 'Failed to delete review')
    }
  }

  const averageRating = reviews.length > 0
    ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length
    : 0

  return (
    <div className="mt-8 sm:mt-12">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 sm:gap-0 mb-4 sm:mb-6">
        <div className="flex-1">
          <h2 className="text-2xl sm:text-3xl font-clash font-bold text-white mb-2">
            Reviews
          </h2>
          {reviews.length > 0 && (
            <div className="flex flex-wrap items-center gap-2">
              <div className="flex items-center gap-0.5 sm:gap-1">
                {[1, 2, 3, 4, 5].map((star) => (
                  <span
                    key={star}
                    className={`text-lg sm:text-xl ${
                      star <= Math.round(averageRating)
                        ? 'text-yellow-400'
                        : 'text-gray-600'
                    }`}
                  >
                    ★
                  </span>
                ))}
              </div>
              <span className="text-gray-400 text-xs sm:text-sm">
                {averageRating.toFixed(1)} ({reviews.length} {reviews.length === 1 ? 'review' : 'reviews'})
              </span>
            </div>
          )}
        </div>
        {sessionStatus !== 'loading' && session && !userReview && (
          <motion.button
            onClick={() => {
              if (!session) {
                window.location.href = `/login?callbackUrl=${encodeURIComponent(window.location.pathname)}`
                return
              }
              setShowForm(true)
            }}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="px-3 sm:px-4 py-2 bg-white text-black rounded-full font-clash font-semibold text-xs sm:text-sm hover:bg-white/90 transition-colors touch-manipulation min-h-[36px] sm:min-h-[40px] whitespace-nowrap"
          >
            Write Review
          </motion.button>
        )}
      </div>

      {/* Review Form */}
      <AnimatePresence>
        {showForm && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="mb-6 glass-strong rounded-2xl p-6 border border-white/10"
          >
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Your Rating
                </label>
                <div className="flex items-center gap-2">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setRating(star)}
                      onMouseEnter={() => setHoverRating(star)}
                      onMouseLeave={() => setHoverRating(0)}
                      className={`text-3xl transition-all ${
                        star <= (hoverRating || rating)
                          ? 'text-yellow-400 scale-110'
                          : 'text-gray-600 hover:text-gray-400'
                      }`}
                    >
                      ★
                    </button>
                  ))}
                  {rating > 0 && (
                    <span className="text-white/70 text-sm ml-2">
                      {rating} {rating === 1 ? 'star' : 'stars'}
                    </span>
                  )}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Your Review (optional)
                </label>
                <textarea
                  value={reviewText}
                  onChange={(e) => setReviewText(e.target.value)}
                  placeholder="Share your thoughts about this movie..."
                  rows={4}
                  className="w-full px-4 py-3 rounded-lg glass border border-white/10 focus:border-white/30 focus:outline-none focus:ring-2 focus:ring-white/20 transition-all bg-black/20 text-white resize-none"
                  disabled={submitting}
                />
              </div>

              <div className="flex gap-3">
                <motion.button
                  type="submit"
                  disabled={submitting || rating === 0}
                  whileHover={{ scale: submitting ? 1 : 1.02 }}
                  whileTap={{ scale: submitting ? 1 : 0.98 }}
                  className="w-full sm:w-auto px-4 sm:px-6 py-2 bg-white text-black rounded-full font-clash font-semibold text-xs sm:text-sm hover:bg-white/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed touch-manipulation min-h-[40px]"
                >
                  {submitting ? 'Saving...' : userReview ? 'Update Review' : 'Submit Review'}
                </motion.button>
                <motion.button
                  type="button"
                  onClick={() => {
                    setShowForm(false)
                    setError(null)
                  }}
                  disabled={submitting}
                  className="px-6 py-2 glass rounded-full font-clash font-semibold text-sm text-white/70 hover:text-white transition-colors disabled:opacity-50"
                >
                  Cancel
                </motion.button>
                {userReview && (
                  <motion.button
                    type="button"
                    onClick={() => handleDelete(userReview.id)}
                    disabled={submitting}
                    className="px-6 py-2 glass rounded-full font-clash font-semibold text-sm text-red-400 hover:text-red-300 transition-colors disabled:opacity-50"
                  >
                    Delete
                  </motion.button>
                )}
              </div>

              {error && (
                <motion.p
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="text-red-400 text-sm"
                >
                  {error}
                </motion.p>
              )}
            </form>
          </motion.div>
        )}
      </AnimatePresence>

      {/* User's Review (if exists and form is closed) */}
      {userReview && !showForm && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6 glass-strong rounded-2xl p-6 border border-white/20"
        >
          <div className="flex items-start justify-between mb-4">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <span className="font-clash font-semibold text-white">
                  Your Review
                </span>
                <div className="flex items-center gap-1">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <span
                      key={star}
                      className={`text-lg ${
                        star <= userReview.rating ? 'text-yellow-400' : 'text-gray-600'
                      }`}
                    >
                      ★
                    </span>
                  ))}
                </div>
              </div>
              {userReview.reviewText && (
                <p className="text-gray-300 text-sm leading-relaxed">{userReview.reviewText}</p>
              )}
              <p className="text-xs text-gray-500 mt-2">
                {formatDateTime(userReview.createdAt)}
                {userReview.updatedAt !== userReview.createdAt && ' (edited)'}
              </p>
            </div>
            <div className="flex gap-2">
              <motion.button
                onClick={() => setShowForm(true)}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="px-3 py-1 glass rounded-lg text-xs font-clash font-semibold text-white/70 hover:text-white transition-colors"
              >
                Edit
              </motion.button>
            </div>
          </div>
        </motion.div>
      )}

      {/* Reviews List */}
      {loading ? (
        <div className="glass rounded-2xl p-12 text-center">
          <div className="w-12 h-12 border-4 border-white border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-400">Loading reviews...</p>
        </div>
      ) : reviews.length === 0 ? (
        <div className="glass rounded-2xl p-12 text-center">
          <p className="text-gray-400 text-lg mb-4">No reviews yet</p>
          {session && (
            <motion.button
              onClick={() => setShowForm(true)}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="px-6 py-3 bg-white text-black rounded-full font-clash font-semibold hover:bg-white/90 transition-colors"
            >
              Be the first to review
            </motion.button>
          )}
        </div>
      ) : (
        <div className="space-y-4">
          {reviews
            .filter((r) => !userReview || r.id !== userReview.id) // Don't show user's review in list if it's shown above
            .map((review, index) => (
              <motion.div
                key={review.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                className="glass rounded-xl p-6 border border-white/10"
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center">
                      <span className="text-white/70 font-clash font-semibold text-sm">
                        {review.userName?.charAt(0)?.toUpperCase() || review.userEmail?.charAt(0)?.toUpperCase() || 'U'}
                      </span>
                    </div>
                    <div>
                      <p className="font-clash font-semibold text-white">
                        {review.userName || review.userEmail?.split('@')[0] || 'Anonymous'}
                      </p>
                      <p className="text-xs text-gray-500">
                        {formatDateTime(review.createdAt)}
                        {review.updatedAt !== review.createdAt && ' (edited)'}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-1">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <span
                        key={star}
                        className={`text-lg ${
                          star <= review.rating ? 'text-yellow-400' : 'text-gray-600'
                        }`}
                      >
                        ★
                      </span>
                    ))}
                  </div>
                </div>
                {review.reviewText && (
                  <p className="text-gray-300 text-sm leading-relaxed mt-3">
                    {review.reviewText}
                  </p>
                )}
              </motion.div>
            ))}
        </div>
      )}
    </div>
  )
}


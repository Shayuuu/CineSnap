'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { motion } from 'framer-motion'

type Props = {
  movieId: string
  className?: string
}

export default function WishlistButton({ movieId, className = '' }: Props) {
  const { data: session } = useSession()
  const [inWishlist, setInWishlist] = useState(false)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (session && movieId) {
      checkWishlist()
    }
  }, [session, movieId])

  const checkWishlist = async () => {
    try {
      const res = await fetch(`/api/wishlist/check?movieId=${movieId}`)
      if (res.ok) {
        const data = await res.json()
        setInWishlist(data.inWishlist)
      }
    } catch (err) {
      console.error('Failed to check wishlist:', err)
    }
  }

  const toggleWishlist = async () => {
    if (!session) {
      window.location.href = '/login'
      return
    }

    setLoading(true)
    try {
      if (inWishlist) {
        const res = await fetch(`/api/wishlist?movieId=${movieId}`, {
          method: 'DELETE',
        })
        if (res.ok) {
          setInWishlist(false)
        }
      } else {
        const res = await fetch('/api/wishlist', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ movieId }),
        })
        if (res.ok) {
          setInWishlist(true)
        }
      }
    } catch (err) {
      console.error('Failed to toggle wishlist:', err)
    } finally {
      setLoading(false)
    }
  }

  if (!session) {
    return null
  }

  return (
    <motion.button
      onClick={toggleWishlist}
      disabled={loading}
      whileHover={{ scale: 1.1 }}
      whileTap={{ scale: 0.9 }}
      className={`${className} ${inWishlist ? 'text-red-500' : 'text-white/60 hover:text-red-500'} transition-colors disabled:opacity-50`}
      title={inWishlist ? 'Remove from wishlist' : 'Add to wishlist'}
    >
      <svg
        className="w-6 h-6"
        fill={inWishlist ? 'currentColor' : 'none'}
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
        />
      </svg>
    </motion.button>
  )
}



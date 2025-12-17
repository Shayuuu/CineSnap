'use client'

import { useEffect, useState } from 'react'
import { useSession } from 'next-auth/react'
import { motion } from 'framer-motion'
import Link from 'next/link'
import Image from 'next/image'
import WishlistButton from '@/components/WishlistButton'
import { formatDateShort } from '@/lib/dateUtils'

type WishlistItem = {
  id: string
  movieId: string
  movieTitle: string
  posterUrl: string | null
  releaseDate: string | null
  createdAt: string
}

export default function WishlistPage() {
  const { data: session, status } = useSession()
  const [wishlist, setWishlist] = useState<WishlistItem[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (status === 'loading') return
    if (!session) {
      window.location.href = '/login'
      return
    }

    fetchWishlist()
  }, [session, status])

  const fetchWishlist = async () => {
    try {
      const res = await fetch('/api/wishlist', {
        credentials: 'include',
      })
      const data = await res.json()
      // Always set wishlist, even if empty or error occurred
      setWishlist(data.wishlist || [])
    } catch (err) {
      console.error('Failed to fetch wishlist:', err)
      // On error, show empty array to prevent UI issues
      setWishlist([])
    } finally {
      setLoading(false)
    }
  }

  const handleRemove = async (movieId: string) => {
    try {
      const res = await fetch(`/api/wishlist?movieId=${movieId}`, {
        method: 'DELETE',
      })
      if (res.ok) {
        setWishlist((prev) => prev.filter((item) => item.movieId !== movieId))
      }
    } catch (err) {
      console.error('Failed to remove from wishlist:', err)
    }
  }

  if (status === 'loading' || loading) {
    return (
      <div className="min-h-screen pt-24 pb-32 px-6 flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-white border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-400">Loading wishlist...</p>
        </div>
      </div>
    )
  }

  if (!session) return null

  return (
    <div className="min-h-screen pt-24 pb-32 px-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-7xl mx-auto"
      >
        <div className="mb-12 text-center">
          <h1 className="text-4xl md:text-6xl font-clash font-bold mb-4">
            <span className="text-white">My Wishlist</span>
          </h1>
          <p className="text-gray-400 text-lg">
            Movies you want to watch
          </p>
        </div>

        {wishlist.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="glass rounded-2xl p-12 text-center"
          >
            <p className="text-gray-400 text-lg mb-4">Your wishlist is empty</p>
            <Link
              href="/movies"
              className="inline-block px-6 py-3 bg-white text-black rounded-full font-clash font-semibold hover:bg-white/90 transition-colors"
            >
              Browse Movies →
            </Link>
          </motion.div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {wishlist.map((item, index) => (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="glass-strong rounded-2xl overflow-hidden border border-white/10 hover:border-white/30 transition-all group"
              >
                <Link href={`/movies/${item.movieId}`}>
                  <div className="relative aspect-[2/3] bg-white/5">
                    {item.posterUrl ? (
                      <Image
                        src={item.posterUrl}
                        alt={item.movieTitle}
                        fill
                        className="object-cover group-hover:scale-105 transition-transform duration-300"
                        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                        unoptimized
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <span className="text-6xl font-clash font-bold text-white/30">
                          {item.movieTitle?.charAt(0) || 'M'}
                        </span>
                      </div>
                    )}
                    <div className="absolute top-4 right-4" onClick={(e) => e.preventDefault()}>
                      <WishlistButton movieId={item.movieId} />
                    </div>
                  </div>
                </Link>
                <div className="p-4">
                  <h3 className="text-lg font-clash font-bold text-white mb-2 line-clamp-2">
                    {item.movieTitle}
                  </h3>
                  {item.releaseDate && (
                    <p className="text-sm text-gray-400 mb-4">
                      {formatDateShort(item.releaseDate)}
                    </p>
                  )}
                  <Link
                    href={`/movies/${item.movieId}`}
                    className="block w-full py-2 text-center bg-white text-black rounded-lg font-clash font-semibold hover:bg-white/90 transition-colors"
                  >
                    View Details
                  </Link>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </motion.div>
    </div>
  )
}



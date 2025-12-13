'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import dynamic from 'next/dynamic'
import { formatDateTime } from '@/lib/dateUtils'

// Dynamically import QRCode component (client-side only)
const QRCode = dynamic(() => import('./QRCode'), { ssr: false })

type Props = {
  group: any
  token: string
  isAuthenticated: boolean
  isMember: boolean
  userEmail: string | null
}

export default function JoinGroupClient({ group, token, isAuthenticated, isMember, userEmail }: Props) {
  const { data: session } = useSession()
  const router = useRouter()
  const [joining, setJoining] = useState(false)
  const [copied, setCopied] = useState(false)

  // Safety check
  if (!group) {
    return (
      <div className="min-h-screen pt-24 pb-32 px-6 flex items-center justify-center">
        <div className="text-white">Group not found</div>
      </div>
    )
  }

  const joinLink = typeof window !== 'undefined' ? `${window.location.origin}/join/${token}` : ''

  const handleJoin = async () => {
    if (!isAuthenticated) {
      router.push(`/login?callback=/join/${token}`)
      return
    }

    if (isMember && group?.showtimeId) {
      router.push(`/booking/${group.showtimeId}/group`)
      return
    }

    setJoining(true)
    try {
      const res = await fetch(`/api/groups/join/${token}`, {
        method: 'POST',
      })

      if (res.ok) {
        const data = await res.json()
        if (data.success && group?.showtimeId) {
          router.push(`/booking/${group.showtimeId}/group`)
        }
      } else {
        const error = await res.json()
        alert(error.error || 'Failed to join group')
      }
    } catch (err) {
      console.error('Failed to join:', err)
      alert('Failed to join group. Please try again.')
    } finally {
      setJoining(false)
    }
  }

  const copyLink = async () => {
    if (!joinLink) return
    try {
      await navigator.clipboard.writeText(joinLink)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch (err) {
      console.error('Failed to copy:', err)
    }
  }

  const shareToWhatsApp = () => {
    const text = `Join me for ${group?.movieTitle || 'this movie'}!\n\n${joinLink}`
    window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, '_blank')
  }

  const shareToTwitter = () => {
    const text = `Join me for ${group?.movieTitle || 'this movie'}! 🎬`
    window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(joinLink)}`, '_blank')
  }

  return (
    <div className="min-h-screen pt-24 pb-32 px-6 bg-gradient-to-b from-gray-900 via-black to-gray-900">
      <div className="max-w-4xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass rounded-3xl p-8 md:p-12"
        >
          {/* Movie Poster Header */}
          {group.posterUrl && (
            <div className="flex items-center gap-6 mb-8">
              <img
                src={group.posterUrl}
                alt={group.movieTitle}
                className="w-24 h-36 object-cover rounded-lg shadow-lg"
              />
              <div>
                <h1 className="text-3xl md:text-4xl font-clash font-bold text-white mb-2">
                  {group.movieTitle}
                </h1>
                <p className="text-gray-400 mb-1">{group.theaterName}</p>
                <p className="text-gray-400 text-sm">{group.startTime ? formatDateTime(group.startTime) : 'TBA'}</p>
              </div>
            </div>
          )}

          {/* Group Info Card */}
          <div className="glass-strong rounded-2xl p-6 mb-6 border border-white/10">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-2xl font-clash font-bold text-white mb-2">
                  {group.name}
                </h2>
                <p className="text-gray-400 text-sm">
                  Created by <span className="text-white font-semibold">{group.creatorName}</span>
                </p>
              </div>
              <div className="text-right">
                <div className="text-3xl font-bold text-white">{group.memberCount || 0}</div>
                <div className="text-xs text-gray-400">Members</div>
              </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-4 pt-4 border-t border-white/10">
              <div className="text-center">
                <div className="text-xl font-bold text-white">{group.memberCount || 0}</div>
                <div className="text-xs text-gray-400">Members</div>
              </div>
              <div className="text-center">
                <div className="text-xl font-bold text-white">{group.price || 0}₹</div>
                <div className="text-xs text-gray-400">Per Ticket</div>
              </div>
              <div className="text-center">
                <div className="text-xl font-bold text-white">
                  {group.memberCount ? Math.floor((group.memberCount * (group.price || 0)) / 100) : 0}
                </div>
                <div className="text-xs text-gray-400">Total Value</div>
              </div>
            </div>
          </div>

          {/* Join Button */}
          {!isMember ? (
            <motion.button
              onClick={handleJoin}
              disabled={joining}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="w-full py-4 bg-white text-black rounded-xl font-clash font-bold text-lg mb-6 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg"
            >
              {joining ? 'Joining...' : isAuthenticated ? 'Join Group' : 'Login to Join'}
            </motion.button>
          ) : (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="w-full py-4 bg-green-500/20 border border-green-500 text-green-400 rounded-xl font-clash font-bold text-lg mb-6 text-center"
            >
              ✓ You're already a member!
            </motion.div>
          )}

          {/* Share Section */}
          <div className="glass-strong rounded-2xl p-6 border border-white/10">
            <h3 className="text-xl font-clash font-semibold text-white mb-4">Share This Group</h3>
            
            {/* QR Code */}
            {joinLink && (
              <div className="flex flex-col md:flex-row items-center gap-6 mb-6">
                <div className="p-4 bg-white rounded-lg">
                  <QRCode value={joinLink} size={128} />
                </div>
                <div className="flex-1">
                  <p className="text-gray-400 text-sm mb-3">
                    Scan this QR code or share the link below to invite friends
                  </p>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={joinLink}
                      readOnly
                      className="flex-1 px-4 py-2 glass rounded-lg border border-white/10 text-white text-sm"
                    />
                    <motion.button
                      onClick={copyLink}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      className="px-4 py-2 bg-white text-black rounded-lg font-clash font-semibold text-sm"
                    >
                      {copied ? '✓ Copied!' : 'Copy'}
                    </motion.button>
                  </div>
                </div>
              </div>
            )}

            {/* Social Share Buttons */}
            <div className="flex flex-wrap gap-3">
              <motion.button
                onClick={shareToWhatsApp}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="flex-1 px-4 py-3 bg-green-500 hover:bg-green-600 text-white rounded-lg font-clash font-semibold flex items-center justify-center gap-2"
              >
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/>
                </svg>
                WhatsApp
              </motion.button>
              <motion.button
                onClick={shareToTwitter}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="flex-1 px-4 py-3 bg-blue-400 hover:bg-blue-500 text-white rounded-lg font-clash font-semibold flex items-center justify-center gap-2"
              >
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z"/>
                </svg>
                Twitter
              </motion.button>
            </div>
          </div>

          {/* Features Highlight */}
          <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="glass rounded-xl p-4 text-center">
              <div className="text-2xl mb-2">💬</div>
              <div className="text-sm font-semibold text-white mb-1">Live Chat</div>
              <div className="text-xs text-gray-400">Discuss with group members</div>
            </div>
            <div className="glass rounded-xl p-4 text-center">
              <div className="text-2xl mb-2">📊</div>
              <div className="text-sm font-semibold text-white mb-1">Group Polls</div>
              <div className="text-xs text-gray-400">Vote on decisions together</div>
            </div>
            <div className="glass rounded-xl p-4 text-center">
              <div className="text-2xl mb-2">🎫</div>
              <div className="text-sm font-semibold text-white mb-1">Book Together</div>
              <div className="text-xs text-gray-400">Coordinate seat selection</div>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  )
}


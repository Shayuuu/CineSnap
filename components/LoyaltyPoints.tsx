'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { motion } from 'framer-motion'

type LoyaltyData = {
  points: number
  totalEarned: number
  totalRedeemed: number
  tier: 'BRONZE' | 'SILVER' | 'GOLD' | 'PLATINUM'
}

export default function LoyaltyPoints() {
  const { data: session } = useSession()
  const [loyalty, setLoyalty] = useState<LoyaltyData | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (session) {
      fetchLoyalty()
    }
  }, [session])

  const fetchLoyalty = async () => {
    try {
      const res = await fetch('/api/loyalty')
      if (res.ok) {
        const data = await res.json()
        setLoyalty(data.loyalty)
      }
    } catch (err) {
      console.error('Failed to fetch loyalty points:', err)
    } finally {
      setLoading(false)
    }
  }

  if (!session || loading || !loyalty) return null

  const tierColors = {
    BRONZE: 'from-amber-600 to-amber-800',
    SILVER: 'from-gray-400 to-gray-600',
    GOLD: 'from-yellow-400 to-yellow-600',
    PLATINUM: 'from-purple-400 to-purple-600',
  }

  const tierNames = {
    BRONZE: 'Bronze',
    SILVER: 'Silver',
    GOLD: 'Gold',
    PLATINUM: 'Platinum',
  }

  const nextTierPoints = {
    BRONZE: 2000,
    SILVER: 5000,
    GOLD: 10000,
    PLATINUM: Infinity,
  }

  const progress = loyalty.tier === 'PLATINUM'
    ? 100
    : ((loyalty.totalEarned / nextTierPoints[loyalty.tier]) * 100)

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="glass rounded-2xl p-6 border border-white/10"
    >
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-xl font-clash font-bold text-white">Loyalty Points</h3>
        <div className={`px-4 py-2 rounded-full bg-gradient-to-r ${tierColors[loyalty.tier]} text-white font-bold text-sm`}>
          {tierNames[loyalty.tier]}
        </div>
      </div>

      <div className="space-y-4">
        <div>
          <div className="flex items-center justify-between mb-2">
            <span className="text-gray-400 text-sm">Available Points</span>
            <span className="text-2xl font-clash font-bold text-white">{loyalty.points.toLocaleString()}</span>
          </div>
          <div className="h-2 bg-white/10 rounded-full overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${progress}%` }}
              className={`h-full bg-gradient-to-r ${tierColors[loyalty.tier]}`}
            />
          </div>
          {loyalty.tier !== 'PLATINUM' && (
            <p className="text-xs text-gray-400 mt-2">
              {nextTierPoints[loyalty.tier] - loyalty.totalEarned} points to {tierNames[nextTierPoints[loyalty.tier] === 2000 ? 'SILVER' : nextTierPoints[loyalty.tier] === 5000 ? 'GOLD' : 'PLATINUM']}
            </p>
          )}
        </div>

        <div className="grid grid-cols-2 gap-4 pt-4 border-t border-white/10">
          <div>
            <p className="text-xs text-gray-400 mb-1">Total Earned</p>
            <p className="text-lg font-semibold text-white">{loyalty.totalEarned.toLocaleString()}</p>
          </div>
          <div>
            <p className="text-xs text-gray-400 mb-1">Total Redeemed</p>
            <p className="text-lg font-semibold text-white">{loyalty.totalRedeemed.toLocaleString()}</p>
          </div>
        </div>
      </div>
    </motion.div>
  )
}


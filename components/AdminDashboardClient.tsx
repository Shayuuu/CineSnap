'use client'

import { motion } from 'framer-motion'
import Link from 'next/link'
import { useSession } from 'next-auth/react'

export default function AdminDashboardClient() {
  const { data: session } = useSession()

  const adminCards = [
    {
      title: 'Movies',
      description: 'Manage movies, add new releases, and update movie information',
      href: '/admin/movies',
      icon: '🎬',
    },
    {
      title: 'Showtimes',
      description: 'Create and manage showtimes for all movies across theaters',
      href: '/admin/showtimes',
      icon: '⏰',
    },
  ]

  return (
    <div className="min-h-screen pt-24 pb-32 px-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-7xl mx-auto"
      >
        <div className="mb-12 text-center">
          <h1 className="text-4xl md:text-6xl font-clash font-bold mb-4">
            <span className="text-white">Admin Dashboard</span>
          </h1>
          <p className="text-gray-400 text-lg">
            Manage your cinema operations
            {session?.user?.email && (
              <span className="block mt-2 text-sm">
                Logged in as: <span className="text-white">{session.user.email}</span>
              </span>
            )}
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-6 max-w-4xl mx-auto">
          {adminCards.map((card, index) => (
            <motion.div
              key={card.href}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <Link href={card.href}>
                <motion.div
                  whileHover={{ scale: 1.02, y: -5 }}
                  className="glass-strong rounded-2xl p-8 border border-white/10 hover:border-white/30 transition-all cursor-pointer h-full"
                >
                  <div className="text-5xl mb-4">{card.icon}</div>
                  <h2 className="text-2xl font-clash font-bold text-white mb-3">
                    {card.title}
                  </h2>
                  <p className="text-gray-400 mb-4">{card.description}</p>
                  <div className="flex items-center gap-2 text-white/70 hover:text-white transition-colors">
                    <span className="font-semibold">Manage →</span>
                  </div>
                </motion.div>
              </Link>
            </motion.div>
          ))}
        </div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="mt-12 text-center"
        >
          <Link
            href="/movies"
            className="inline-block px-6 py-3 glass rounded-full text-white/70 hover:text-white transition-colors"
          >
            ← Back to Movies
          </Link>
        </motion.div>
      </motion.div>
    </div>
  )
}



'use client'

import { useSession, signOut } from 'next-auth/react'
import Link from 'next/link'
import { motion } from 'framer-motion'
import MovieSearch from './MovieSearch'

export default function HeaderNav() {
  const { data: session } = useSession()

  return (
    <nav className="hidden md:flex items-center gap-4 lg:gap-6 text-sm flex-1 justify-end">
      <motion.div whileHover={{ y: -2 }} whileTap={{ y: 0 }}>
        <Link href="/movies" className="text-white/70 hover:text-white transition-colors whitespace-nowrap relative group">
          Movies
          <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-gradient-to-r from-yellow-400 to-orange-500 group-hover:w-full transition-all duration-300"></span>
        </Link>
      </motion.div>
      <motion.div whileHover={{ y: -2 }} whileTap={{ y: 0 }}>
        <Link href="/portfolio" className="text-white/70 hover:text-white transition-colors whitespace-nowrap relative group">
          Portfolio
          <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-gradient-to-r from-purple-400 to-pink-500 group-hover:w-full transition-all duration-300"></span>
        </Link>
      </motion.div>
      <div className="hidden lg:block flex-1 max-w-md mx-4">
        <MovieSearch />
      </div>
      {session ? (
        <>
          <motion.div whileHover={{ y: -2 }} whileTap={{ y: 0 }}>
            <Link href="/ott" className="text-white/70 hover:text-white transition-colors whitespace-nowrap relative group">
              OTT Shows
              <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-gradient-to-r from-red-500 to-orange-500 group-hover:w-full transition-all duration-300"></span>
            </Link>
          </motion.div>
          <motion.div whileHover={{ y: -2 }} whileTap={{ y: 0 }}>
            <Link href="/wishlist" className="text-white/70 hover:text-white transition-colors whitespace-nowrap relative group">
              Wishlist
              <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-gradient-to-r from-pink-400 to-purple-500 group-hover:w-full transition-all duration-300"></span>
            </Link>
          </motion.div>
          <motion.div whileHover={{ y: -2 }} whileTap={{ y: 0 }}>
            <Link href="/bookings" className="text-white/70 hover:text-white transition-colors whitespace-nowrap relative group">
              My Bookings
              <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-gradient-to-r from-blue-400 to-cyan-500 group-hover:w-full transition-all duration-300"></span>
            </Link>
          </motion.div>
          {(session.user as any)?.role === 'ADMIN' && (
            <motion.div whileHover={{ y: -2 }} whileTap={{ y: 0 }}>
              <Link href="/admin" className="text-white/70 hover:text-yellow-400 transition-colors whitespace-nowrap relative group">
                Admin
                <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-gradient-to-r from-yellow-400 to-orange-500 group-hover:w-full transition-all duration-300"></span>
              </Link>
            </motion.div>
          )}
          <motion.button
            onClick={() => signOut({ callbackUrl: '/movies' })}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="text-white/70 hover:text-white transition-colors whitespace-nowrap px-3 py-1 rounded-lg hover:bg-white/10"
          >
            Sign Out
          </motion.button>
        </>
      ) : (
        <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
          <Link href="/login" className="text-white/70 hover:text-white transition-colors whitespace-nowrap px-4 py-2 glass rounded-lg hover:border-white/30 border border-white/10">
            Login
          </Link>
        </motion.div>
      )}
    </nav>
  )
}


'use client'

import { useState } from 'react'
import { useSession, signOut } from 'next-auth/react'
import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'

export default function MobileMenu() {
  const [isOpen, setIsOpen] = useState(false)
  const { data: session } = useSession()

  return (
    <>
      {/* Hamburger Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="md:hidden flex flex-col gap-1.5 p-2 z-50 relative"
        aria-label="Toggle menu"
      >
        <motion.span
          animate={isOpen ? { rotate: 45, y: 8 } : { rotate: 0, y: 0 }}
          className="w-6 h-0.5 bg-white transition-all"
        />
        <motion.span
          animate={isOpen ? { opacity: 0 } : { opacity: 1 }}
          className="w-6 h-0.5 bg-white transition-all"
        />
        <motion.span
          animate={isOpen ? { rotate: -45, y: -8 } : { rotate: 0, y: 0 }}
          className="w-6 h-0.5 bg-white transition-all"
        />
      </button>

      {/* Mobile Menu Overlay */}
      <AnimatePresence>
        {isOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsOpen(false)}
              className="fixed inset-0 bg-black/80 backdrop-blur-sm z-40 md:hidden"
            />

            {/* Menu Panel */}
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="fixed top-0 right-0 h-full w-80 max-w-[85vw] bg-black/95 backdrop-blur-xl border-l border-white/10 z-50 md:hidden overflow-y-auto"
            >
              <div className="p-6 space-y-6 pt-20">
                {/* Close Button */}
                <button
                  onClick={() => setIsOpen(false)}
                  className="absolute top-4 right-4 text-white/70 hover:text-white text-2xl"
                  aria-label="Close menu"
                >
                  ×
                </button>

                {/* Navigation Links */}
                <nav className="space-y-4">
                  <Link
                    href="/movies"
                    onClick={() => setIsOpen(false)}
                    className="block text-lg text-white/80 hover:text-white transition-colors py-2 border-b border-white/10"
                  >
                    Movies
                  </Link>

                  {session ? (
                    <>
                      <Link
                        href="/wishlist"
                        onClick={() => setIsOpen(false)}
                        className="block text-lg text-white/80 hover:text-white transition-colors py-2 border-b border-white/10"
                      >
                        Wishlist
                      </Link>
                      <Link
                        href="/bookings"
                        onClick={() => setIsOpen(false)}
                        className="block text-lg text-white/80 hover:text-white transition-colors py-2 border-b border-white/10"
                      >
                        My Bookings
                      </Link>
                      {session.user?.role === 'ADMIN' && (
                        <Link
                          href="/admin"
                          onClick={() => setIsOpen(false)}
                          className="block text-lg text-white/80 hover:text-white transition-colors py-2 border-b border-white/10"
                        >
                          Admin
                        </Link>
                      )}
                      <button
                        onClick={() => {
                          setIsOpen(false)
                          signOut({ callbackUrl: '/movies' })
                        }}
                        className="block w-full text-left text-lg text-white/80 hover:text-white transition-colors py-2 border-b border-white/10"
                      >
                        Sign Out
                      </button>
                    </>
                  ) : (
                    <Link
                      href="/login"
                      onClick={() => setIsOpen(false)}
                      className="block text-lg text-white/80 hover:text-white transition-colors py-2 border-b border-white/10"
                    >
                      Login
                    </Link>
                  )}
                </nav>

                {/* User Info */}
                {session && (
                  <div className="pt-4 border-t border-white/10">
                    <p className="text-white/60 text-sm">Logged in as</p>
                    <p className="text-white font-medium mt-1">{session.user?.email}</p>
                  </div>
                )}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  )
}



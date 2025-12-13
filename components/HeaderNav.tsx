'use client'

import { useSession, signOut } from 'next-auth/react'
import Link from 'next/link'
import MovieSearch from './MovieSearch'

export default function HeaderNav() {
  const { data: session } = useSession()

  return (
    <nav className="hidden md:flex items-center gap-4 lg:gap-6 text-sm flex-1 justify-end">
      <Link href="/movies" className="text-white/70 hover:text-white transition-colors whitespace-nowrap">
        Movies
      </Link>
      <div className="hidden lg:block flex-1 max-w-md mx-4">
        <MovieSearch />
      </div>
      {session ? (
        <>
          <Link href="/wishlist" className="text-white/70 hover:text-white transition-colors whitespace-nowrap">
            Wishlist
          </Link>
          <Link href="/bookings" className="text-white/70 hover:text-white transition-colors whitespace-nowrap">
            My Bookings
          </Link>
          {session.user?.role === 'ADMIN' && (
            <Link href="/admin" className="text-white/70 hover:text-white transition-colors whitespace-nowrap">
              Admin
            </Link>
          )}
          <button
            onClick={() => signOut({ callbackUrl: '/movies' })}
            className="text-white/70 hover:text-white transition-colors whitespace-nowrap"
          >
            Sign Out
          </button>
        </>
      ) : (
        <Link href="/login" className="text-white/70 hover:text-white transition-colors whitespace-nowrap">
          Login
        </Link>
      )}
      <div className="hidden xl:flex items-center gap-2 text-xs ml-2">
        <span className="px-2 py-1 glass rounded-full text-white/60">Real-time</span>
        <span className="px-2 py-1 glass rounded-full text-white/60">TypeScript</span>
      </div>
    </nav>
  )
}


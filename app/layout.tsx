import type { Metadata } from 'next'
import './globals.css'
import CustomCursor from '@/components/CustomCursor'
import SocialProofTicker from '@/components/SocialProofTicker'
import PWAInstallPrompt from '@/components/PWAInstallPrompt'
import Providers from '@/components/Providers'
import HeaderNav from '@/components/HeaderNav'
import MovieThemeDecorations from '@/components/MovieThemeDecorations'
import Footer from '@/components/Footer'

export const metadata: Metadata = {
  title: 'CineSnap - Premium Movie Booking Experience',
  description: 'Book your movie tickets with real-time seat locking. Premium cinema-grade experience.',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="dark">
      <head>
        <link rel="icon" href="/favicon.ico" />
      </head>
      <body className="min-h-screen relative">
        <Providers>
          <CustomCursor />
          <MovieThemeDecorations />
          <link rel="manifest" href="/manifest.json" />
          <meta name="theme-color" content="#0a0a0a" />
          <div className="relative z-10">
            <header className="fixed top-0 left-0 right-0 z-50 glass-strong border-b border-white/10 backdrop-blur-xl">
              <div className="max-w-7xl mx-auto px-4 md:px-6 py-3 md:py-4 flex items-center justify-between gap-4">
                <a href="/" className="text-xl md:text-2xl font-clash font-bold text-white flex items-center gap-2 flex-shrink-0">
                  <span className="text-2xl">🎬</span>
                  <span className="hidden sm:inline">CineSnap</span>
                </a>
                <HeaderNav />
                <nav className="md:hidden flex items-center gap-3 flex-shrink-0">
                  <a href="/movies" className="text-sm hover:text-white transition-colors">
                    Movies
                  </a>
                </nav>
              </div>
            </header>
            <main className="relative z-10 min-h-screen">{children}</main>
            <Footer />
            <SocialProofTicker />
          </div>
          <PWAInstallPrompt />
        </Providers>
      </body>
    </html>
  )
}


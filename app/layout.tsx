import type { Metadata, Viewport } from 'next'
import './globals.css'
import CustomCursor from '@/components/CustomCursor'
import SocialProofTicker from '@/components/SocialProofTicker'
import PWAInstallPrompt from '@/components/PWAInstallPrompt'
import Providers from '@/components/Providers'
import HeaderNav from '@/components/HeaderNav'
import MobileMenu from '@/components/MobileMenu'
import MovieThemeDecorations from '@/components/MovieThemeDecorations'
import Footer from '@/components/Footer'
import { ErrorBoundary } from '@/components/ErrorBoundary'
import ThemeToggle from '@/components/ThemeToggle'

export const metadata: Metadata = {
  title: 'CineSnap - Premium Movie Booking Experience',
  description: 'Book your movie tickets with real-time seat locking. Premium cinema-grade experience.',
  manifest: '/manifest.json',
}

export const viewport: Viewport = {
  themeColor: '#0a0a0a',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="dark">
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=5" />
        <link rel="icon" href="/favicon.ico" />
      </head>
      <body className="min-h-screen relative">
        <ErrorBoundary>
          <Providers>
            <CustomCursor />
            <MovieThemeDecorations />
            <div className="relative z-10">
              <header className="fixed top-0 left-0 right-0 z-50 glass-strong border-b border-white/10 backdrop-blur-xl">
                <div className="max-w-7xl mx-auto px-4 md:px-6 py-3 md:py-4 flex items-center justify-between gap-4">
                  <a href="/" className="text-lg sm:text-xl md:text-2xl font-clash font-bold text-white flex items-center gap-2 flex-shrink-0 group">
                    <span className="text-xl sm:text-2xl group-hover:scale-110 transition-transform duration-300">
                      🎬
                    </span>
                    <span className="hidden sm:inline bg-gradient-to-r from-cyan-400 to-magenta-400 bg-clip-text text-transparent group-hover:from-cyan-300 group-hover:to-magenta-300 transition-all">
                      CineSnap
                    </span>
                  </a>
                  <HeaderNav />
                  <div className="flex items-center gap-3">
                    <ThemeToggle />
                    <MobileMenu />
                  </div>
                </div>
              </header>
              <main className="relative z-10 min-h-screen page-transition">{children}</main>
              <Footer />
              <SocialProofTicker />
            </div>
            <PWAInstallPrompt />
          </Providers>
        </ErrorBoundary>
      </body>
    </html>
  )
}


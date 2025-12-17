// Configuration - all values must come from environment variables

export const CONFIG = {
  // Base URL
  BASE_URL: process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000',
  
  // Stripe (optional - for payments)
  STRIPE_PUBLISHABLE_KEY: process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY || '',
  STRIPE_SECRET_KEY: process.env.STRIPE_SECRET_KEY || '',
  
  // Razorpay (optional - for payments)
  RAZORPAY_KEY_ID: process.env.RAZORPAY_KEY_ID || '',
  RAZORPAY_KEY_SECRET: process.env.RAZORPAY_KEY_SECRET || '',
}

// Get TMDb API key (must be set in environment variables)
export function getTmdbApiKey(): string | null {
  const key = process.env.TMDB_API_KEY
  if (!key || key === 'your-tmdb-api-key' || key.trim() === '') {
    console.warn('⚠️  TMDB_API_KEY environment variable is not set or invalid!')
    console.warn('📝 Please add TMDB_API_KEY to your .env.local file')
    console.warn('📖 Get your free API key from: https://www.themoviedb.org/settings/api')
    console.warn('💡 After adding, restart your dev server')
    return null
  }
  return key.trim()
}

// Get TMDb API key (throws if not set - for critical paths)
export function requireTmdbApiKey(): string {
  const key = getTmdbApiKey()
  if (!key) {
    throw new Error('TMDB_API_KEY environment variable is not set. Add it to .env.local and restart the server.')
  }
  return key
}

// Note: getNextAuthSecret() is defined in lib/auth.ts to avoid circular dependencies

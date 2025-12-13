// Hardcoded configuration for showcase mode (no environment variables needed)

export const CONFIG = {
  // TMDb API Key (hardcoded for showcase)
  TMDB_API_KEY: 'c45a857c193f6302f2b5061c3b85e743',
  
  // NextAuth Configuration
  NEXTAUTH_SECRET: 'cinesnap-showcase-secret-key-2024-change-in-production',
  NEXTAUTH_URL: process.env.NEXTAUTH_URL || 'http://localhost:3000',
  
  // Base URL
  BASE_URL: process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000',
  
  // Stripe (optional - for payments)
  STRIPE_PUBLISHABLE_KEY: process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY || '',
  STRIPE_SECRET_KEY: process.env.STRIPE_SECRET_KEY || '',
  
  // Razorpay (optional - for payments)
  RAZORPAY_KEY_ID: process.env.RAZORPAY_KEY_ID || '',
  RAZORPAY_KEY_SECRET: process.env.RAZORPAY_KEY_SECRET || '',
  
  // Showcase Mode
  SHOWCASE_MODE: true, // Always true - no database needed
}

// Get TMDb API key (use hardcoded if env not set)
export function getTmdbApiKey(): string {
  return process.env.TMDB_API_KEY || CONFIG.TMDB_API_KEY
}

// Get NextAuth secret (use hardcoded if env not set)
export function getNextAuthSecret(): string {
  return process.env.NEXTAUTH_SECRET || CONFIG.NEXTAUTH_SECRET
}

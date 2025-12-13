'use client'

import { signIn } from 'next-auth/react'
import { FormEvent, useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import Link from 'next/link'
import { useSearchParams, useRouter } from 'next/navigation'

export default function LoginPage() {
  const [isSignup, setIsSignup] = useState(false)
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [successMessage, setSuccessMessage] = useState<string | null>(null)
  const searchParams = useSearchParams()
  const router = useRouter()

  useEffect(() => {
    const message = searchParams.get('message')
    if (message) {
      setSuccessMessage(message)
    }
  }, [searchParams])

  const handleSignup = async (e: FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    // Validation
    if (password !== confirmPassword) {
      setError('Passwords do not match')
      setLoading(false)
      return
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters')
      setLoading(false)
      return
    }

    try {
      const res = await fetch('/api/auth/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, password }),
      })

      const data = await res.json()

      if (!res.ok) {
        throw new Error(data.error || 'Failed to create account')
      }

      setSuccessMessage('Account created successfully! You can now sign in.')
      setIsSignup(false)
      setPassword('')
      setConfirmPassword('')
    } catch (err: any) {
      setError(err.message || 'An error occurred')
    } finally {
      setLoading(false)
    }
  }

  const handleLogin = async (e: FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)
    setSuccessMessage(null)
    
    try {
      // Normalize email to lowercase
      const normalizedEmail = email.trim().toLowerCase()
      
      if (!normalizedEmail || !password) {
        setError('Please enter both email and password')
        setLoading(false)
        return
      }
      
      const res = await signIn('credentials', {
        email: normalizedEmail,
        password,
        redirect: false,
      })
      
      console.log('Login response:', res)
      
      // NextAuth can return ok: true but still have an error field
      if (res?.error) {
        let errorMessage = 'Invalid email or password'
        if (res.error === 'CredentialsSignin') {
          errorMessage = 'Invalid email or password. Please check your credentials or create an account first.'
        } else {
          errorMessage = res.error
        }
        setError(errorMessage)
        setLoading(false)
        return
      }
      
      // Only redirect if there's no error and ok is true
      if (res?.ok && !res?.error) {
        router.push('/movies')
        router.refresh()
      } else {
        setError('An unexpected error occurred. Please try again.')
        setLoading(false)
      }
    } catch (err: any) {
      console.error('Login error:', err)
      setError(err.message || 'An error occurred during login')
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen pt-20 sm:pt-24 pb-20 sm:pb-32 px-4 sm:px-6 flex items-center justify-center">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-md"
      >
        <div className="glass-strong rounded-xl sm:rounded-2xl p-5 sm:p-6 md:p-8 border border-white/10">
          <div className="text-center mb-6 sm:mb-8">
            <Link href="/" className="inline-block mb-3 sm:mb-4">
              <h1 className="text-2xl sm:text-3xl font-clash font-bold text-white">
                CineSnap
              </h1>
            </Link>
            <h2 className="text-xl sm:text-2xl font-clash font-semibold mb-2">
              {isSignup ? 'Create Account' : 'Welcome Back'}
            </h2>
            <p className="text-gray-400 text-xs sm:text-sm px-2">
              {isSignup 
                ? 'Sign up to start booking your favorite movies'
                : 'Sign in to book tickets and manage your bookings'
              }
            </p>
          </div>

          {/* Toggle between Login and Signup */}
          <div className="flex gap-2 mb-6 glass rounded-lg p-1">
            <button
              type="button"
              onClick={() => {
                setIsSignup(false)
                setError(null)
                setSuccessMessage(null)
              }}
              className={`flex-1 py-2 rounded-md font-clash font-semibold transition-all ${
                !isSignup
                  ? 'bg-white text-black'
                  : 'text-white/70 hover:text-white'
              }`}
            >
              Sign In
            </button>
            <button
              type="button"
              onClick={() => {
                setIsSignup(true)
                setError(null)
                setSuccessMessage(null)
              }}
              className={`flex-1 py-2 rounded-md font-clash font-semibold transition-all ${
                isSignup
                  ? 'bg-white text-black'
                  : 'text-white/70 hover:text-white'
              }`}
            >
              Create Account
            </button>
          </div>

          {successMessage && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-4 p-3 bg-green-500/20 border border-green-500/50 rounded-lg text-green-400 text-sm text-center"
            >
              {successMessage}
            </motion.div>
          )}

          <AnimatePresence mode="wait">
            {isSignup ? (
              <motion.form
                key="signup"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                onSubmit={handleSignup}
                className="space-y-4"
              >
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Full Name
                  </label>
                  <input
                    type="text"
                    placeholder="John Doe"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full px-4 py-3 sm:py-3.5 rounded-lg glass border border-white/10 focus:border-white/30 focus:outline-none focus:ring-2 focus:ring-white/20 transition-all bg-black/20 text-white text-base touch-manipulation"
                    required
                    disabled={loading}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Email Address
                  </label>
                  <input
                    type="email"
                    placeholder="your@email.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full px-4 py-3 sm:py-3.5 rounded-lg glass border border-white/10 focus:border-white/30 focus:outline-none focus:ring-2 focus:ring-white/20 transition-all bg-black/20 text-white text-base touch-manipulation"
                    required
                    disabled={loading}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Password
                  </label>
                  <input
                    type="password"
                    placeholder="At least 6 characters"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full px-4 py-3 sm:py-3.5 rounded-lg glass border border-white/10 focus:border-white/30 focus:outline-none focus:ring-2 focus:ring-white/20 transition-all bg-black/20 text-white text-base touch-manipulation"
                    required
                    minLength={6}
                    disabled={loading}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Confirm Password
                  </label>
                  <input
                    type="password"
                    placeholder="Re-enter your password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="w-full px-4 py-3 sm:py-3.5 rounded-lg glass border border-white/10 focus:border-white/30 focus:outline-none focus:ring-2 focus:ring-white/20 transition-all bg-black/20 text-white text-base touch-manipulation"
                    required
                    disabled={loading}
                  />
                </div>

                <motion.button
                  type="submit"
                  disabled={loading}
                  whileHover={{ scale: loading ? 1 : 1.02 }}
                  whileTap={{ scale: loading ? 1 : 0.98 }}
                  className="w-full bg-white text-black rounded-lg py-3 sm:py-3.5 font-clash font-semibold text-base sm:text-lg hover:bg-white/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed touch-manipulation min-h-[44px]"
                >
                  {loading ? 'Creating Account...' : 'Create Account'}
                </motion.button>
              </motion.form>
            ) : (
              <motion.form
                key="login"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                onSubmit={handleLogin}
                className="space-y-4"
              >
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Email Address
                  </label>
                  <input
                    type="email"
                    placeholder="your@email.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full px-4 py-3 sm:py-3.5 rounded-lg glass border border-white/10 focus:border-white/30 focus:outline-none focus:ring-2 focus:ring-white/20 transition-all bg-black/20 text-white text-base touch-manipulation"
                    required
                    disabled={loading}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Password
                  </label>
                  <input
                    type="password"
                    placeholder="Enter your password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full px-4 py-3 sm:py-3.5 rounded-lg glass border border-white/10 focus:border-white/30 focus:outline-none focus:ring-2 focus:ring-white/20 transition-all bg-black/20 text-white text-base touch-manipulation"
                    required
                    disabled={loading}
                  />
                </div>

                <motion.button
                  type="submit"
                  disabled={loading}
                  whileHover={{ scale: loading ? 1 : 1.02 }}
                  whileTap={{ scale: loading ? 1 : 0.98 }}
                  className="w-full bg-white text-black rounded-lg py-3 sm:py-3.5 font-clash font-semibold text-base sm:text-lg hover:bg-white/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed touch-manipulation min-h-[44px]"
                >
                  {loading ? 'Signing in...' : 'Sign In'}
                </motion.button>
              </motion.form>
            )}
          </AnimatePresence>

          {error && (
            <motion.p
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-red-400 text-sm text-center mt-4"
            >
              {error}
            </motion.p>
          )}

          <div className="mt-6 text-center">
            <Link
              href="/movies"
              className="text-sm text-gray-400 hover:text-white transition-colors block"
            >
              ← Back to Movies
            </Link>
          </div>
        </div>
      </motion.div>
    </div>
  )
}

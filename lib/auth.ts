import { NextAuthOptions } from 'next-auth'
import CredentialsProvider from 'next-auth/providers/credentials'
import { queryOne, query } from '@/lib/db'

// Get NextAuth secret (lazy evaluation)
function getNextAuthSecret(): string | undefined {
  const secret = process.env.NEXTAUTH_SECRET
  if (!secret) {
    // During build time, allow undefined secret (will use fallback)
    // In production/runtime, this should be set
    if (process.env.NODE_ENV === 'production' && typeof window === 'undefined') {
      console.warn('⚠️ NEXTAUTH_SECRET environment variable is not set!')
      console.warn('📝 Please add NEXTAUTH_SECRET to your Vercel environment variables')
      console.warn('📖 Generate one with: openssl rand -base64 32')
      // Don't throw during build - allow build to complete
      // The secret will be required at runtime
      return undefined
    }
    // In development, warn but don't throw during build
    if (process.env.NEXT_PHASE !== 'phase-production-build') {
      console.warn('⚠️ NEXTAUTH_SECRET environment variable is not set!')
      console.warn('📝 Please add NEXTAUTH_SECRET to your .env.local file')
      console.warn('📖 Generate one with: openssl rand -base64 32')
    }
    return undefined
  }
  return secret
}

export const authOptions: NextAuthOptions = {
  secret: getNextAuthSecret(),
  pages: {
    signIn: '/login',
    error: '/login',
  },
  providers: [
    CredentialsProvider({
      name: 'Credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        try {
          console.log('[NextAuth] Authorize called with email:', credentials?.email)
          
          if (!credentials?.email) {
            console.error('[NextAuth] No email provided')
            return null
          }

          if (!credentials?.password || credentials.password.length === 0) {
            console.error('[NextAuth] No password provided')
            return null
          }

          const email = credentials.email.trim().toLowerCase()
          console.log('[NextAuth] Searching for user with email:', email)
          
          // Check if user exists (case-insensitive email search)
          let dbUser = await queryOne<any>(
            'SELECT * FROM "User" WHERE LOWER(email) = $1', 
            [email]
          )
          
          // If not found, try exact match (case-sensitive)
          if (!dbUser) {
            console.log('[NextAuth] Case-insensitive search failed, trying exact match...')
            dbUser = await queryOne<any>(
              'SELECT * FROM "User" WHERE email = $1', 
              [credentials.email.trim()]
            )
          }
          
          if (!dbUser) {
            console.error(`[NextAuth] User not found: ${email}`)
            // Debug: List all users
            try {
              const allUsers = await query<any>('SELECT email, id FROM "User" LIMIT 10')
              console.log('[NextAuth] Users in database:', allUsers.map((u: any) => ({ email: u.email, id: u.id })))
            } catch (e) {
              console.log('[NextAuth] Could not fetch users for debugging')
            }
            return null
          }

          console.log(`[NextAuth] User found: ${dbUser.email} (ID: ${dbUser.id}, Role: ${dbUser.role || 'USER'})`)
          
          // Verify password
          // Check if password or passwordHash column exists and matches
          let passwordMatch = false
          
          if (dbUser.password) {
            // Plain password comparison (for development)
            passwordMatch = dbUser.password === credentials.password
            console.log('[NextAuth] Checking plain password match')
          } else if (dbUser.passwordHash) {
            // Hashed password comparison (for production)
            // In production, use: await bcrypt.compare(credentials.password, dbUser.passwordHash)
            passwordMatch = dbUser.passwordHash === credentials.password
            console.log('[NextAuth] Checking passwordHash match')
          } else {
            // No password stored - allow login for development (user was created without password)
            // In production, this should fail
            console.warn('[NextAuth] No password stored for user - allowing login (dev mode)')
            passwordMatch = true // Allow login if no password is stored (development mode)
          }
          
          if (!passwordMatch) {
            console.error('[NextAuth] Password mismatch')
            console.error('[NextAuth] User has password:', !!dbUser.password)
            console.error('[NextAuth] User has passwordHash:', !!dbUser.passwordHash)
            return null
          }
          
          const user = {
            id: dbUser.id,
            email: dbUser.email,
            name: dbUser.name || dbUser.email?.split('@')[0] || 'User',
            role: dbUser.role || 'USER',
          }
          
          console.log('[NextAuth] Authentication successful, returning user:', { id: user.id, email: user.email })
          // The JWT callback will store user.id in the token
          return user as any
        } catch (error: any) {
          console.error('[NextAuth] Authorize error:', error?.message || error)
          console.error('[NextAuth] Error details:', error)
          // Return null to indicate authentication failure
          return null
        }
      },
    }),
  ],
  callbacks: {
    async session({ session, token }) {
      try {
        // First, check if user ID is already in token (from authorize)
        if (token?.sub || token?.userId) {
          (session.user as any).id = (token.sub || token.userId) as string
          (session.user as any).role = token.role as string
          console.log('[NextAuth] Session callback: Using user ID from token:', (session.user as any).id)
          return session
        }

        // If not in token, look up by email
        if (session.user?.email) {
          const email = session.user.email.trim().toLowerCase()
          
          // Try case-insensitive lookup first
          let dbUser = await queryOne<any>(
            'SELECT id, role FROM "User" WHERE LOWER(email) = $1',
            [email]
          )
          
          // If not found, try exact match
          if (!dbUser) {
            dbUser = await queryOne<any>(
              'SELECT id, role FROM "User" WHERE email = $1',
              [session.user.email.trim()]
            )
          }
          
          // If still not found and in development, create the user
          if (!dbUser && process.env.NODE_ENV === 'development') {
            console.log('[NextAuth] User not found, creating user in development mode:', email)
            const { randomBytes } = await import('crypto')
            const userId = randomBytes(16).toString('hex')
            const { execute } = await import('@/lib/db')
            
            try {
              await execute(
                'INSERT INTO "User" (id, email, name, role) VALUES ($1, $2, $3, $4)',
                [userId, email, session.user.name || email?.split('@')[0] || 'User', 'USER']
              )
              dbUser = { id: userId, role: 'USER' }
              console.log('[NextAuth] Created user:', userId)
            } catch (createError: any) {
              // User might have been created by another request
              if (createError?.code !== '23505') { // PostgreSQL unique violation error
                console.error('[NextAuth] Failed to create user:', createError)
              }
              // Try to fetch again
              dbUser = await queryOne<any>(
                'SELECT id, role FROM "User" WHERE LOWER(email) = $1',
                [email]
              )
            }
          }
          
          if (dbUser) {
            (session.user as any).id = dbUser.id
            (session.user as any).role = dbUser.role
            console.log('[NextAuth] Session callback: Set user ID', dbUser.id)
          } else {
            console.warn('[NextAuth] Session callback: User not found in database for email:', email)
          }
        }
        return session
      } catch (error: any) {
        console.error('[NextAuth] Session callback error:', error?.message || error)
        console.error('[NextAuth] Session callback error stack:', error?.stack)
        // Return session even if database query fails - user might still be authenticated
        return session
      }
    },
    async jwt({ token, user }) {
      // Store user ID in token when user first logs in
      if (user) {
        token.userId = user.id
        token.role = (user as any).role
      }
      return token
    },
  },
  debug: process.env.NODE_ENV === 'development',
}


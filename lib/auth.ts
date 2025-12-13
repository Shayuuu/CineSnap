import { NextAuthOptions } from 'next-auth'
import CredentialsProvider from 'next-auth/providers/credentials'
import { queryOne, query } from '@/lib/db'

export const authOptions: NextAuthOptions = {
  secret: process.env.NEXTAUTH_SECRET || process.env.AUTH_SECRET || 'dev-secret-key-change-in-production',
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
            'SELECT * FROM User WHERE LOWER(email) = ?', 
            [email]
          )
          
          // If not found, try exact match (case-sensitive)
          if (!dbUser) {
            console.log('[NextAuth] Case-insensitive search failed, trying exact match...')
            dbUser = await queryOne<any>(
              'SELECT * FROM User WHERE email = ?', 
              [credentials.email.trim()]
            )
          }
          
          if (!dbUser) {
            console.error(`[NextAuth] User not found: ${email}`)
            // Debug: List all users
            try {
              const allUsers = await query<any>('SELECT email, id FROM User LIMIT 10')
              console.log('[NextAuth] Users in database:', allUsers.map((u: any) => ({ email: u.email, id: u.id })))
            } catch (e) {
              console.log('[NextAuth] Could not fetch users for debugging')
            }
            return null
          }

          console.log(`[NextAuth] User found: ${dbUser.email} (ID: ${dbUser.id}, Role: ${dbUser.role || 'USER'})`)
          
          // For development: accept any non-empty password (no password column needed)
          // In production, you would verify: await bcrypt.compare(credentials.password, dbUser.passwordHash)
          
          const user = {
            id: dbUser.id,
            email: dbUser.email,
            name: dbUser.name || dbUser.email.split('@')[0],
            role: dbUser.role || 'USER',
          }
          
          console.log('[NextAuth] Authentication successful, returning user:', { id: user.id, email: user.email })
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
    async session({ session }) {
      try {
        if (session.user?.email) {
          const dbUser = await queryOne<any>(
            'SELECT id, role FROM User WHERE email = ?',
            [session.user.email]
          )
          if (dbUser) {
            session.user.id = dbUser.id
            // @ts-ignore
            session.user.role = dbUser.role
          }
        }
        return session
      } catch (error: any) {
        console.error('[NextAuth] Session callback error:', error?.message || error)
        return session
      }
    },
  },
  debug: process.env.NODE_ENV === 'development',
}


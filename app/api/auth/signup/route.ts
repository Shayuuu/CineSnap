import { queryOne, execute } from '@/lib/db'
import { NextRequest } from 'next/server'
import { randomBytes } from 'crypto'

export async function POST(req: NextRequest) {
  try {
    const { name, email, password } = await req.json()

    if (!email || !password) {
      return Response.json({ error: 'Email and password are required' }, { status: 400 })
    }

    if (password.length < 6) {
      return Response.json({ error: 'Password must be at least 6 characters' }, { status: 400 })
    }

    // Normalize email to lowercase
    const normalizedEmail = email.trim().toLowerCase()

    // Check if user already exists (case-insensitive)
    const existingUser = await queryOne<any>(
      'SELECT id FROM User WHERE LOWER(email) = ?',
      [normalizedEmail]
    )

    if (existingUser) {
      return Response.json({ error: 'User with this email already exists' }, { status: 409 })
    }

    // Create new user with normalized email
    const userId = randomBytes(16).toString('hex')
    await execute(
      'INSERT INTO User (id, email, name, role) VALUES (?, ?, ?, ?)',
      [userId, normalizedEmail, name || null, 'USER']
    )
    
    console.log(`[Signup] User created: ${normalizedEmail} (ID: ${userId})`)

    // In a real app, you would hash the password and store it
    // For now, we'll just create the user and they can login with any password (dev mode)
    // The NextAuth authorize function will handle authentication

    return Response.json({
      success: true,
      message: 'Account created successfully',
      userId,
    })
  } catch (error: any) {
    console.error('Signup error:', error)
    return Response.json(
      { error: 'Failed to create account', details: error?.message },
      { status: 500 }
    )
  }
}


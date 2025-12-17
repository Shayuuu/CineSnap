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
      'SELECT id FROM "User" WHERE LOWER(email) = $1',
      [normalizedEmail]
    )

    if (existingUser) {
      return Response.json({ error: 'User with this email already exists' }, { status: 409 })
    }

    // Create new user with normalized email
    const userId = randomBytes(16).toString('hex')
    
    // Store password (plain text for development - use bcrypt.hash in production)
    await execute(
      'INSERT INTO "User" (id, email, name, role, password) VALUES ($1, $2, $3, $4, $5)',
      [userId, normalizedEmail, name || null, 'USER', password]
    )
    console.log(`[Signup] User created with password: ${normalizedEmail} (ID: ${userId})`)

    return Response.json({
      success: true,
      message: 'Account created successfully',
      userId,
    })
  } catch (error: any) {
    console.error('Signup error:', error)
    console.error('Error details:', {
      message: error?.message,
      code: error?.code,
      detail: error?.detail,
      hint: error?.hint,
      stack: error?.stack
    })
    return Response.json(
      { 
        error: 'Failed to create account', 
        details: error?.message,
        hint: error?.hint || 'Check if DATABASE_URL is set and schema is run'
      },
      { status: 500 }
    )
  }
}


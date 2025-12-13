import { NextRequest } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import { query, queryOne, execute } from '@/lib/db'
import { randomBytes } from 'crypto'

// GET - Get user's wishlist
export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 })
    }

    let userId = (session.user as any)?.id
    if (!userId && session.user?.email) {
      const dbUser = await queryOne<any>('SELECT id FROM User WHERE email = ?', [session.user.email])
      if (dbUser) userId = dbUser.id
    }

    if (!userId) {
      return Response.json({ error: 'User not found' }, { status: 404 })
    }

    const wishlist = await query<any>(
      `SELECT w.*, m.title as movieTitle, m.posterUrl, m.releaseDate
       FROM Wishlist w
       INNER JOIN Movie m ON w.movieId = m.id
       WHERE w.userId = ?
       ORDER BY w.createdAt DESC`,
      [userId]
    )

    return Response.json({ wishlist: wishlist || [] })
  } catch (error: any) {
    console.error('Failed to fetch wishlist:', error)
    return Response.json({ error: 'Failed to fetch wishlist', details: error.message }, { status: 500 })
  }
}

// POST - Add movie to wishlist
export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 })
    }

    let userId = (session.user as any)?.id
    if (!userId && session.user?.email) {
      const dbUser = await queryOne<any>('SELECT id FROM User WHERE email = ?', [session.user.email])
      if (dbUser) userId = dbUser.id
    }

    if (!userId) {
      return Response.json({ error: 'User not found' }, { status: 404 })
    }

    const { movieId } = await req.json()

    if (!movieId) {
      return Response.json({ error: 'movieId is required' }, { status: 400 })
    }

    // Check if already in wishlist
    const existing = await queryOne<any>(
      'SELECT id FROM Wishlist WHERE userId = ? AND movieId = ?',
      [userId, movieId]
    )

    if (existing) {
      return Response.json({ error: 'Movie already in wishlist' }, { status: 400 })
    }

    const wishlistId = randomBytes(16).toString('hex')
    await execute(
      'INSERT INTO Wishlist (id, userId, movieId) VALUES (?, ?, ?)',
      [wishlistId, userId, movieId]
    )

    return Response.json({ success: true, message: 'Added to wishlist' })
  } catch (error: any) {
    console.error('Failed to add to wishlist:', error)
    return Response.json({ error: 'Failed to add to wishlist', details: error.message }, { status: 500 })
  }
}

// DELETE - Remove movie from wishlist
export async function DELETE(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 })
    }

    let userId = (session.user as any)?.id
    if (!userId && session.user?.email) {
      const dbUser = await queryOne<any>('SELECT id FROM User WHERE email = ?', [session.user.email])
      if (dbUser) userId = dbUser.id
    }

    if (!userId) {
      return Response.json({ error: 'User not found' }, { status: 404 })
    }

    const { searchParams } = new URL(req.url)
    const movieId = searchParams.get('movieId')

    if (!movieId) {
      return Response.json({ error: 'movieId is required' }, { status: 400 })
    }

    await execute(
      'DELETE FROM Wishlist WHERE userId = ? AND movieId = ?',
      [userId, movieId]
    )

    return Response.json({ success: true, message: 'Removed from wishlist' })
  } catch (error: any) {
    console.error('Failed to remove from wishlist:', error)
    return Response.json({ error: 'Failed to remove from wishlist', details: error.message }, { status: 500 })
  }
}


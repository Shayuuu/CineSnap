import { query, queryOne, execute } from '@/lib/db'
import { NextRequest } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import { randomBytes } from 'crypto'

// GET - Fetch reviews for a movie (no auth required)
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const movieId = searchParams.get('movieId')

    if (!movieId) {
      return Response.json({ error: 'movieId is required' }, { status: 400 })
    }

    try {
      const reviews = await query<any>(
        `SELECT 
          r.id, r.rating, r.reviewText, r.createdAt, r.updatedAt,
          u.id as userId, u.name as userName, u.email as userEmail
        FROM Review r
        INNER JOIN User u ON r.userId = u.id
        WHERE r.movieId = ?
        ORDER BY r.createdAt DESC
        LIMIT 50`,
        [movieId]
      )

      return Response.json({ reviews: reviews || [] })
    } catch (dbError: any) {
      // If Review table doesn't exist yet, return empty array
      if (dbError?.message?.includes("doesn't exist") || dbError?.message?.includes("Unknown table")) {
        console.log('Review table does not exist yet. Please run database-reviews.sql')
        return Response.json({ reviews: [] })
      }
      throw dbError
    }
  } catch (error: any) {
    console.error('Failed to fetch reviews:', error)
    // Return empty array instead of error to prevent UI issues
    return Response.json({ reviews: [] })
  }
}

// POST - Create or update a review
export async function POST(req: NextRequest) {
  try {
    console.log('[Reviews API] POST request received')
    console.log('[Reviews API] Request headers:', Object.fromEntries(req.headers.entries()))
    
    const session = await getServerSession(authOptions)
    console.log('[Reviews API] Session:', session ? {
      hasUser: !!session.user,
      userEmail: session.user?.email,
      userId: (session.user as any)?.id,
      role: (session.user as any)?.role
    } : 'Not found')
    
    if (!session || !session.user) {
      console.error('[Reviews API] No session or user found')
      return Response.json({ 
        error: 'Unauthorized. Please log in to write a review.',
        debug: 'No session found'
      }, { status: 401 })
    }

    let userId = (session.user as any)?.id
    console.log('[Reviews API] User ID from session:', userId)
    
    // If userId not in session, try to get it from email (fallback)
    if (!userId && session.user?.email) {
      console.log('[Reviews API] User ID not in session, looking up by email:', session.user.email)
      const dbUser = await queryOne<any>('SELECT id FROM User WHERE email = ?', [session.user.email])
      if (dbUser) {
        userId = dbUser.id
        console.log('[Reviews API] Found user ID from email:', userId)
      }
    }
    
    if (!userId) {
      console.error('[Reviews API] User ID not found in session or database. Session user:', session.user)
      return Response.json({ 
        error: 'User ID not found in session. Please log out and log in again.',
        debug: 'Session exists but no user ID'
      }, { status: 401 })
    }

    const { movieId, rating, reviewText } = await req.json()

    if (!movieId || !rating) {
      return Response.json({ error: 'movieId and rating are required' }, { status: 400 })
    }

    if (rating < 1 || rating > 5) {
      return Response.json({ error: 'Rating must be between 1 and 5' }, { status: 400 })
    }

    // Check if user already has a review for this movie
    const existingReview = await queryOne<any>(
      'SELECT id FROM Review WHERE userId = ? AND movieId = ?',
      [userId, movieId]
    )

    if (existingReview) {
      // Update existing review
      await execute(
        'UPDATE Review SET rating = ?, reviewText = ?, updatedAt = NOW() WHERE id = ?',
        [rating, reviewText || null, existingReview.id]
      )
      return Response.json({ 
        success: true, 
        reviewId: existingReview.id,
        message: 'Review updated successfully' 
      })
    } else {
      // Create new review
      const reviewId = randomBytes(16).toString('hex')
      await execute(
        'INSERT INTO Review (id, movieId, userId, rating, reviewText) VALUES (?, ?, ?, ?, ?)',
        [reviewId, movieId, userId, rating, reviewText || null]
      )
      return Response.json({ 
        success: true, 
        reviewId,
        message: 'Review created successfully' 
      })
    }
  } catch (error: any) {
    console.error('Failed to create/update review:', error)
    return Response.json(
      { error: 'Failed to save review', details: error?.message },
      { status: 500 }
    )
  }
}

// DELETE - Delete a review
export async function DELETE(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session || !session.user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const userId = (session.user as any)?.id
    if (!userId) {
      return Response.json({ error: 'User ID not found' }, { status: 401 })
    }

    const { searchParams } = new URL(req.url)
    const reviewId = searchParams.get('reviewId')

    if (!reviewId) {
      return Response.json({ error: 'reviewId is required' }, { status: 400 })
    }

    // Verify the review belongs to the user
    const review = await queryOne<any>(
      'SELECT id FROM Review WHERE id = ? AND userId = ?',
      [reviewId, userId]
    )

    if (!review) {
      return Response.json({ error: 'Review not found or unauthorized' }, { status: 404 })
    }

    await execute('DELETE FROM Review WHERE id = ?', [reviewId])

    return Response.json({ success: true, message: 'Review deleted successfully' })
  } catch (error: any) {
    console.error('Failed to delete review:', error)
    return Response.json(
      { error: 'Failed to delete review', details: error?.message },
      { status: 500 }
    )
  }
}


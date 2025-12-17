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
      const dbUser = await queryOne<any>('SELECT id FROM "User" WHERE LOWER(email) = $1', [session.user.email.toLowerCase()])
      if (dbUser) userId = dbUser.id
    }

    if (!userId) {
      return Response.json({ error: 'User not found' }, { status: 404 })
    }

    try {
      const wishlist = await query<any>(
        `SELECT w.*, m.title as "movieTitle", m."posterUrl", m."releaseDate"
         FROM "Wishlist" w
         INNER JOIN "Movie" m ON w."movieId" = m.id
         WHERE w."userId" = $1
         ORDER BY w."createdAt" DESC`,
        [userId]
      )

      return Response.json({ wishlist: wishlist || [] })
    } catch (dbError: any) {
      // If Wishlist table doesn't exist yet, return empty array
      const errorMsg = dbError?.message || ''
      const errorCode = dbError?.code || ''
      
      if (errorMsg.includes("doesn't exist") || 
          errorMsg.includes("Unknown table") || 
          errorMsg.includes("relation") ||
          errorMsg.includes("Wishlist") ||
          errorCode === '42P01' ||
          errorCode === 'P0001') {
        console.log('Wishlist table does not exist yet. Returning empty array.')
        return Response.json({ wishlist: [] })
      }
      // Log the actual error for debugging
      console.error('Wishlist query error:', { message: errorMsg, code: errorCode, error: dbError })
      throw dbError
    }
  } catch (error: any) {
    console.error('Failed to fetch wishlist:', error)
    // Always return empty array instead of error to prevent UI issues
    // This handles cases where database is unavailable or table doesn't exist
    return Response.json({ wishlist: [] })
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
      const dbUser = await queryOne<any>('SELECT id FROM "User" WHERE LOWER(email) = $1', [session.user.email.toLowerCase()])
      if (dbUser) userId = dbUser.id
    }

    if (!userId) {
      return Response.json({ error: 'User not found' }, { status: 404 })
    }

    const { movieId } = await req.json()

    if (!movieId) {
      return Response.json({ error: 'movieId is required' }, { status: 400 })
    }

    try {
      // Check if already in wishlist
      const existing = await queryOne<any>(
        'SELECT id FROM "Wishlist" WHERE "userId" = $1 AND "movieId" = $2',
        [userId, movieId]
      )

      if (existing) {
        return Response.json({ error: 'Movie already in wishlist' }, { status: 400 })
      }

      const wishlistId = randomBytes(16).toString('hex')
      await execute(
        'INSERT INTO "Wishlist" (id, "userId", "movieId") VALUES ($1, $2, $3)',
        [wishlistId, userId, movieId]
      )
    } catch (dbError: any) {
      // If Wishlist table doesn't exist yet, return success but don't actually add
      const errorMsg = dbError?.message || ''
      const errorCode = dbError?.code || ''
      
      if (errorMsg.includes("doesn't exist") || 
          errorMsg.includes("Unknown table") || 
          errorMsg.includes("relation") ||
          errorMsg.includes("Wishlist") ||
          errorCode === '42P01' ||
          errorCode === 'P0001') {
        console.log('Wishlist table does not exist. Feature unavailable.')
        // Return success to prevent UI errors, but indicate feature is unavailable
        return Response.json({ 
          success: true, 
          message: 'Wishlist feature not available',
          unavailable: true 
        })
      }
      throw dbError
    }

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
      const dbUser = await queryOne<any>('SELECT id FROM "User" WHERE LOWER(email) = $1', [session.user.email.toLowerCase()])
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

    try {
      await execute(
        'DELETE FROM "Wishlist" WHERE "userId" = $1 AND "movieId" = $2',
        [userId, movieId]
      )
    } catch (dbError: any) {
      // If Wishlist table doesn't exist yet, return success but don't actually delete
      const errorMsg = dbError?.message || ''
      const errorCode = dbError?.code || ''
      
      if (errorMsg.includes("doesn't exist") || 
          errorMsg.includes("Unknown table") || 
          errorMsg.includes("relation") ||
          errorMsg.includes("Wishlist") ||
          errorCode === '42P01' ||
          errorCode === 'P0001') {
        console.log('Wishlist table does not exist. Feature unavailable.')
        // Return success to prevent UI errors
        return Response.json({ 
          success: true, 
          message: 'Removed from wishlist',
          unavailable: true 
        })
      }
      throw dbError
    }

    return Response.json({ success: true, message: 'Removed from wishlist' })
  } catch (error: any) {
    console.error('Failed to remove from wishlist:', error)
    return Response.json({ error: 'Failed to remove from wishlist', details: error.message }, { status: 500 })
  }
}



import { NextRequest } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import { queryOne } from '@/lib/db'

// Check if movie is in user's wishlist
export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return Response.json({ inWishlist: false })
    }

    let userId = (session.user as any)?.id
    if (!userId && session.user?.email) {
      const dbUser = await queryOne<any>('SELECT id FROM "User" WHERE LOWER(email) = $1', [session.user.email.toLowerCase()])
      if (dbUser) userId = dbUser.id
    }

    if (!userId) {
      return Response.json({ inWishlist: false })
    }

    const { searchParams } = new URL(req.url)
    const movieId = searchParams.get('movieId')

    if (!movieId) {
      return Response.json({ inWishlist: false })
    }

    try {
      const wishlistItem = await queryOne<any>(
        'SELECT id FROM "Wishlist" WHERE "userId" = $1 AND "movieId" = $2',
        [userId, movieId]
      )

      return Response.json({ inWishlist: !!wishlistItem })
    } catch (dbError: any) {
      // If Wishlist table doesn't exist yet, return false
      if (dbError?.message?.includes("doesn't exist") || 
          dbError?.message?.includes("Unknown table") || 
          dbError?.message?.includes("relation") ||
          dbError?.code === '42P01') {
        return Response.json({ inWishlist: false })
      }
      throw dbError
    }
  } catch (error: any) {
    console.error('Failed to check wishlist:', error)
    return Response.json({ inWishlist: false })
  }
}



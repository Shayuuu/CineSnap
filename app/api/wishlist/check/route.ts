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
      const dbUser = await queryOne<any>('SELECT id FROM User WHERE email = ?', [session.user.email])
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

    const wishlistItem = await queryOne<any>(
      'SELECT id FROM Wishlist WHERE userId = ? AND movieId = ?',
      [userId, movieId]
    )

    return Response.json({ inWishlist: !!wishlistItem })
  } catch (error: any) {
    console.error('Failed to check wishlist:', error)
    return Response.json({ inWishlist: false })
  }
}



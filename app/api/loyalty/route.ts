import { NextRequest } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import { queryOne, execute } from '@/lib/db'
import { randomBytes } from 'crypto'

// GET - Get user's loyalty points
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

    let loyalty = await queryOne<any>(
      'SELECT * FROM LoyaltyPoints WHERE userId = ?',
      [userId]
    )

    // Create if doesn't exist
    if (!loyalty) {
      const loyaltyId = randomBytes(16).toString('hex')
      await execute(
        'INSERT INTO LoyaltyPoints (id, userId, points, tier) VALUES (?, ?, 0, ?)',
        [loyaltyId, userId, 'BRONZE']
      )
      loyalty = await queryOne<any>(
        'SELECT * FROM LoyaltyPoints WHERE userId = ?',
        [userId]
      )
    }

    // Calculate tier based on total earned
    const tier = loyalty.totalEarned >= 10000
      ? 'PLATINUM'
      : loyalty.totalEarned >= 5000
      ? 'GOLD'
      : loyalty.totalEarned >= 2000
      ? 'SILVER'
      : 'BRONZE'

    // Update tier if changed
    if (loyalty.tier !== tier) {
      await execute(
        'UPDATE LoyaltyPoints SET tier = ? WHERE userId = ?',
        [tier, userId]
      )
      loyalty.tier = tier
    }

    return Response.json({ loyalty })
  } catch (error: any) {
    console.error('Failed to fetch loyalty points:', error)
    return Response.json({ error: 'Failed to fetch loyalty points', details: error.message }, { status: 500 })
  }
}


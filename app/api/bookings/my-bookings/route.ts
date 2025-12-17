import { query, queryOne } from '@/lib/db'
import { NextRequest } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'

export async function GET(req: NextRequest) {
  try {
    // Get user from session
    const session = await getServerSession(authOptions)
    
    if (!session || !session.user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 })
    }
    
    let userId = (session.user as any)?.id
    
    // If userId not in session, try to get it from email (fallback)
    if (!userId && session.user?.email) {
      const email = session.user.email.trim().toLowerCase()
      console.log('[My Bookings API] User ID not in session, looking up by email:', email)
      
      // Try case-insensitive lookup first (PostgreSQL syntax)
      const dbUser = await queryOne<any>(
        'SELECT id FROM "User" WHERE LOWER(email) = $1',
        [email]
      )
      
      if (dbUser) {
        userId = dbUser.id
        console.log('[My Bookings API] Found user by email:', userId)
      } else {
        // Try exact match as fallback
        const dbUserExact = await queryOne<any>(
          'SELECT id FROM "User" WHERE email = $1',
          [session.user.email.trim()]
        )
        if (dbUserExact) {
          userId = dbUserExact.id
          console.log('[My Bookings API] Found user by exact email match:', userId)
        }
      }
    }
    
    if (!userId) {
      console.error('[My Bookings API] User ID not found.')
      console.error('[My Bookings API] Session user:', {
        email: session.user?.email,
        name: session.user?.name,
        id: (session.user as any)?.id,
      })
      
      // Debug: List some users to help troubleshoot
      try {
        const sampleUsers = await query<any>('SELECT id, email FROM "User" LIMIT 5')
        console.log('[My Bookings API] Sample users in database:', sampleUsers)
      } catch (err) {
        console.error('[My Bookings API] Could not fetch sample users:', err)
      }
      
      return Response.json({ 
        error: 'User ID not found',
        details: 'Please try logging out and logging back in'
      }, { status: 401 })
    }
    
    // Fetch all bookings for the user (including cancelled) - PostgreSQL syntax
    const bookings = await query<any>(
      `SELECT 
        b.id,
        b."totalAmount",
        b.status,
        b."createdAt",
        b."razorpayOrderId",
        m.title as "movieTitle",
        m."posterUrl",
        t.name as "theaterName",
        sc.name as "screenName",
        s."startTime",
        s.price
      FROM "Booking" b
      INNER JOIN "Showtime" s ON b."showtimeId" = s.id
      INNER JOIN "Movie" m ON s."movieId" = m.id
      INNER JOIN "Screen" sc ON s."screenId" = sc.id
      INNER JOIN "Theater" t ON sc."theaterId" = t.id
      WHERE b."userId" = $1
      ORDER BY b."createdAt" DESC`,
      [userId]
    )

    // Fetch seats for each booking (PostgreSQL syntax)
    const bookingsWithSeats = await Promise.all(
      bookings.map(async (booking: any) => {
        const seats = await query<any>(
          `SELECT s."row", s."number", s.type
           FROM "Seat" s
           INNER JOIN "_BookingSeats" bs ON s.id = bs."B"
           WHERE bs."A" = $1
           ORDER BY s."row", s."number"`,
          [booking.id]
        )
        return {
          ...booking,
          seats: seats.map((s: any) => `${s.row}${s.number}`),
        }
      })
    )

    console.log(`[My Bookings API] Successfully fetched ${bookingsWithSeats.length} bookings for user ${userId}`)
    return Response.json({ bookings: bookingsWithSeats })
  } catch (error: any) {
    console.error('[My Bookings API] Failed to fetch bookings:', error)
    console.error('[My Bookings API] Error stack:', error?.stack)
    return Response.json(
      { error: 'Failed to fetch bookings', details: error?.message },
      { status: 500 }
    )
  }
}


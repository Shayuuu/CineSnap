import { redis } from '@/lib/redis'
import { NextRequest } from 'next/server'

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const showtimeId = searchParams.get('showtimeId')

  if (!showtimeId) {
    return Response.json({ error: 'showtimeId is required' }, { status: 400 })
  }

  const key = `lock:${showtimeId}`
  const now = Date.now()

  try {
    const locked = await redis.hgetall<number>(key)
    const activeLocks: string[] = []
    if (locked) {
      for (const [seatId, expiry] of Object.entries(locked)) {
        if (Number(expiry) > now) activeLocks.push(seatId)
      }
    }
    return Response.json({ lockedSeats: activeLocks })
  } catch (err: any) {
    // Silently fail in development - Redis is optional
    if (process.env.NODE_ENV === 'development') {
      // Only log if it's not a connection error (which is expected without Redis)
      if (!err?.message?.includes('ENOTFOUND') && !err?.message?.includes('fetch failed')) {
        console.warn('[Redis] Unavailable, using empty locked seats list')
      }
    } else {
      console.error('[Redis] Unavailable, returning no locked seats:', err)
    }
    return Response.json({ lockedSeats: [] })
  }
}


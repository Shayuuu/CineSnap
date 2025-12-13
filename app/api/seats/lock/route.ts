import { redis } from '@/lib/redis'
import { NextRequest } from 'next/server'

export async function POST(req: NextRequest) {
  const { showtimeId, seatIds, userId } = await req.json()

  const key = `lock:${showtimeId}`
  const now = Date.now()
  const expiry = now + 10 * 1000 // 10 seconds hold

  try {
    const existing = await redis.hgetall(key) as Record<string, string | number> | null
    for (const seatId of seatIds) {
      if (existing?.[seatId] && Number(existing[seatId]) > now) {
        return Response.json({ error: 'Seat already locked' }, { status: 409 })
      }
    }

    const pipeline = redis.pipeline()
    seatIds.forEach((seatId: string) => pipeline.hset(key, seatId, expiry))
    pipeline.expire(key, 30)
    await pipeline.exec()
  } catch (err: any) {
    // Silently fail in development - Redis is optional
    if (process.env.NODE_ENV === 'development') {
      // Only log if it's not a connection error (which is expected without Redis)
      if (!err?.message?.includes('ENOTFOUND') && !err?.message?.includes('fetch failed')) {
        console.warn('[Redis] Unavailable, seat locking disabled')
      }
    } else {
      console.error('[Redis] Unavailable, skipping lock:', err)
    }
    // In dev without redis, allow locking to proceed locally
  }

  return Response.json({ success: true, expiresAt: expiry, userId })
}


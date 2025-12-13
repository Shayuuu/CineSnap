import { redis } from '@/lib/redis'
import { NextRequest } from 'next/server'

export async function POST(req: NextRequest) {
  const { showtimeId, seatIds } = await req.json()
  const key = `lock:${showtimeId}`

  try {
    const pipeline = redis.pipeline()
    seatIds.forEach((seatId: string) => pipeline.hdel(key, seatId))
    await pipeline.exec()
  } catch (err: any) {
    // Silently fail in development - Redis is optional
    if (process.env.NODE_ENV === 'development') {
      // Only log if it's not a connection error (which is expected without Redis)
      if (!err?.message?.includes('ENOTFOUND') && !err?.message?.includes('fetch failed')) {
        console.warn('[Redis] Unavailable, seat release disabled')
      }
    } else {
      console.error('[Redis] Unavailable, skipping release:', err)
    }
  }

  return Response.json({ success: true })
}


import { NextRequest } from 'next/server'
import { query } from '@/lib/db'

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const seatIdsParam = searchParams.get('seatIds')

    if (!seatIdsParam) {
      return Response.json({ error: 'seatIds parameter is required' }, { status: 400 })
    }

    const seatIds = seatIdsParam.split(',').filter(Boolean)

    if (seatIds.length === 0) {
      return Response.json({ seats: [] })
    }

    // Fetch seat details (row and number) from database
    const placeholders = seatIds.map((_, i) => `$${i + 1}`).join(', ')
    const seats = await query<any>(
      `SELECT id, "row", "number", type
       FROM "Seat"
       WHERE id IN (${placeholders})
       ORDER BY "row", "number"`,
      seatIds
    )

    return Response.json({ seats: seats || [] })
  } catch (error: any) {
    console.error('Failed to fetch seat details:', error)
    return Response.json(
      { error: 'Failed to fetch seat details', details: error?.message },
      { status: 500 }
    )
  }
}


import { NextRequest } from 'next/server'
import { query } from '@/lib/db'

// GET - Get all available food items
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const category = searchParams.get('category')

    let foodItems
    if (category) {
      foodItems = await query<any>(
        'SELECT * FROM FoodItem WHERE available = TRUE AND category = ? ORDER BY category, name',
        [category]
      )
    } else {
      foodItems = await query<any>(
        'SELECT * FROM FoodItem WHERE available = TRUE ORDER BY category, name',
        []
      )
    }

    return Response.json({ items: foodItems || [] })
  } catch (error: any) {
    console.error('Failed to fetch food items:', error)
    return Response.json({ error: 'Failed to fetch food items', details: error.message }, { status: 500 })
  }
}


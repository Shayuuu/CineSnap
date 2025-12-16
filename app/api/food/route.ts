import { NextRequest } from 'next/server'
import { query } from '@/lib/db'
import { MOCK_FOOD_ITEMS } from '@/lib/mockData'

// GET - Get all available food items
export async function GET(req: NextRequest) {
  try {
    const { IS_SHOWCASE_MODE } = await import('@/lib/mockDb')
    
    // In showcase mode, return mock food items
    if (IS_SHOWCASE_MODE) {
      const { searchParams } = new URL(req.url)
      const category = searchParams.get('category')
      
      let foodItems = MOCK_FOOD_ITEMS
      if (category) {
        foodItems = MOCK_FOOD_ITEMS.filter(item => item.category === category)
      }
      
      return Response.json({ items: foodItems || [] })
    }
    
    // Real database mode
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


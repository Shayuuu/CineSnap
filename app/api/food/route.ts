import { NextRequest } from 'next/server'
import { query } from '@/lib/db'

// GET - Get all available food items
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const category = searchParams.get('category')

    // Check if FoodItem table exists, if not return empty array
    let foodItems: any[] = []
    
    try {
      if (category) {
        foodItems = await query<any>(
          'SELECT * FROM "FoodItem" WHERE category = $1 ORDER BY category, name',
          [category]
        )
      } else {
        foodItems = await query<any>(
          'SELECT * FROM "FoodItem" ORDER BY category, name',
          []
        )
      }
    } catch (dbError: any) {
      // If table doesn't exist or column doesn't exist, return empty array
      console.warn('FoodItem table may not exist or have different schema:', dbError.message)
      // Return empty array instead of error
      return Response.json({ items: [] })
    }

    return Response.json({ items: foodItems || [] })
  } catch (error: any) {
    console.error('Failed to fetch food items:', error)
    // Return empty array instead of error to prevent UI breakage
    return Response.json({ items: [] })
  }
}


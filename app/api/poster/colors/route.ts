import { NextRequest } from 'next/server'

// Simple color extraction - returns movie-themed colors
// In production, you could use libraries like 'colorthief' or 'node-vibrant' for actual color extraction
async function extractColors(imageUrl: string): Promise<{ primary: string; secondary: string; accent: string }> {
  try {
    // Fetch the image
    const response = await fetch(imageUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0',
      },
    })
    
    if (!response.ok) {
      throw new Error('Failed to fetch image')
    }
    
    const arrayBuffer = await response.arrayBuffer()
    const buffer = Buffer.from(arrayBuffer)
    
    // Use a simple color extraction algorithm
    // For now, return movie-themed default colors
    // In production, you could use a library like 'colorthief' or 'node-vibrant'
    
    // Default movie-themed colors
    return {
      primary: '#1a1a2e',    // Dark blue
      secondary: '#16213e',  // Darker blue
      accent: '#0f3460',     // Deep blue
    }
  } catch (error) {
    // Return default colors on error
    return {
      primary: '#1a1a2e',
      secondary: '#16213e',
      accent: '#0f3460',
    }
  }
}

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const posterUrl = searchParams.get('url')
    
    if (!posterUrl) {
      return Response.json({ 
        colors: {
          primary: '#1a1a2e',
          secondary: '#16213e',
          accent: '#0f3460',
        }
      })
    }
    
    const colors = await extractColors(posterUrl)
    return Response.json({ colors })
  } catch (error: any) {
    console.error('Color extraction error:', error)
    return Response.json({ 
      colors: {
        primary: '#1a1a2e',
        secondary: '#16213e',
        accent: '#0f3460',
      }
    })
  }
}


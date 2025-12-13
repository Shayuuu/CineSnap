import { NextRequest } from 'next/server'

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const posterUrl = searchParams.get('url')
    
    if (!posterUrl) {
      return Response.json({ error: 'Poster URL is required' }, { status: 400 })
    }
    
    // Fetch the image
    const response = await fetch(posterUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0',
      },
    })
    
    if (!response.ok) {
      return Response.json({ error: 'Failed to fetch image' }, { status: response.status })
    }
    
    const arrayBuffer = await response.arrayBuffer()
    const buffer = Buffer.from(arrayBuffer)
    const base64 = buffer.toString('base64')
    const contentType = response.headers.get('content-type') || 'image/jpeg'
    const dataUrl = `data:${contentType};base64,${base64}`
    
    return Response.json({ dataUrl })
  } catch (error: any) {
    console.error('Poster proxy error:', error)
    return Response.json({ error: 'Failed to process image' }, { status: 500 })
  }
}


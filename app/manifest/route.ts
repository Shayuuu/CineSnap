import { NextResponse } from 'next/server'

export async function GET() {
  const manifest = {
    name: 'CineSnap',
    short_name: 'CineSnap',
    start_url: '/',
    display: 'standalone',
    background_color: '#0a0a0a',
    theme_color: '#0a0a0a',
    icons: [],
  }

  return NextResponse.json(manifest, {
    headers: {
      'Content-Type': 'application/manifest+json',
      'Cache-Control': 'public, max-age=3600',
    },
  })
}


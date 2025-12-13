export const API_KEY = process.env.TMDB_API_KEY || 'MISSING_TMDB_API_KEY'
export const IMG_BASE = 'https://image.tmdb.org/t/p/w500'

export async function getJSON(url: string) {
  try {
    const res = await fetch(url)
    if (!res.ok) throw new Error(`HTTP ${res.status}`)
    return await res.json()
  } catch (err) {
    console.error('Fetch error:', err)
    return null
  }
}

export function poster(path?: string | null) {
  return path ? `${IMG_BASE}${path}` : 'https://via.placeholder.com/500x750?text=No+Image'
}


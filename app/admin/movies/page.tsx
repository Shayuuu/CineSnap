import AdminGuard from '@/components/AdminGuard'
import { query } from '@/lib/db'
import AdminMoviesClient from '@/components/AdminMoviesClient'

// Force dynamic rendering to prevent static generation
export const dynamic = 'force-dynamic'

export default async function AdminMoviesPage() {
  const movies = await query<any>(
    'SELECT * FROM "Movie" ORDER BY "releaseDate" DESC'
  )

  return (
    <AdminGuard>
      <AdminMoviesClient movies={movies} />
    </AdminGuard>
  )
}

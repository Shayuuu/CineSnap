import AdminGuard from '@/components/AdminGuard'
import { query } from '@/lib/db'
import AdminShowtimesClient from '@/components/AdminShowtimesClient'

export default async function AdminShowtimesPage() {
  const showtimes = await query<any>(`
    SELECT 
      s.id, s.startTime, s.price,
      m.id as movieId, m.title as movieTitle,
      sc.id as screenId, sc.name as screenName,
      t.id as theaterId, t.name as theaterName
    FROM Showtime s
    JOIN Movie m ON s.movieId = m.id
    JOIN Screen sc ON s.screenId = sc.id
    JOIN Theater t ON sc.theaterId = t.id
    ORDER BY s.startTime ASC
  `)

  return (
    <AdminGuard>
      <AdminShowtimesClient showtimes={showtimes} />
    </AdminGuard>
  )
}

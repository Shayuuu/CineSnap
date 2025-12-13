import AdminGuard from '@/components/AdminGuard'
import AdminDashboardClient from '@/components/AdminDashboardClient'

export default function AdminPage() {
  return (
    <AdminGuard>
      <AdminDashboardClient />
    </AdminGuard>
  )
}


'use client'

import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'
import { motion } from 'framer-motion'

type Props = {
  children: React.ReactNode
}

export default function AdminGuard({ children }: Props) {
  const { data: session, status } = useSession()
  const router = useRouter()

  useEffect(() => {
    if (status === 'loading') return
    if (!session) {
      router.replace('/login')
      return
    }
    if ((session?.user as any)?.role !== 'ADMIN') {
      router.replace('/movies')
    }
  }, [session, status, router])

  if (status === 'loading') {
    return (
      <div className="min-h-screen pt-24 pb-32 px-6 flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center"
        >
          <div className="glass rounded-2xl p-8">
            <div className="w-12 h-12 border-4 border-white border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-gray-400">Checking access...</p>
          </div>
        </motion.div>
      </div>
    )
  }

  if (!session) {
    return null
  }

  if ((session.user as any)?.role !== 'ADMIN') {
    return null
  }

  return <>{children}</>
}

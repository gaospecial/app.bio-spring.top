'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/hooks/useAuth'
import { MODULE_REGISTRY } from '@/lib/moduleRegistry'
import LoadingSpinner from '@/components/ui/LoadingSpinner'

export default function AuthenticatedHomeClient() {
  const router = useRouter()
  const { user, loading } = useAuth()

  useEffect(() => {
    if (loading) return
    if (!user) return

    const isAdmin = user.role === 'admin'
    const available = isAdmin
      ? MODULE_REGISTRY
      : MODULE_REGISTRY.filter(m => user.modules.includes(m.id))

    if (available.length > 0) {
      router.replace(available[0].defaultRoute)
    }
  }, [user, loading, router])

  return <LoadingSpinner className="min-h-screen" />
}

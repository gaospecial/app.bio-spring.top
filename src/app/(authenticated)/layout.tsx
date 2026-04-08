'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/hooks/useAuth'
import Sidebar from '@/components/layout/Sidebar'
import Header from '@/components/layout/Header'
import LoadingSpinner from '@/components/ui/LoadingSpinner'

export default function AuthenticatedLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const router = useRouter()
  const { isLoggedIn, loading } = useAuth()
  const [sidebarOpen, setSidebarOpen] = useState(false)

  useEffect(() => {
    if (!loading && !isLoggedIn) {
      router.replace('/login')
    }
  }, [loading, isLoggedIn, router])

  if (loading) {
    return <LoadingSpinner className="min-h-screen" />
  }

  if (!isLoggedIn) {
    return null
  }

  return (
    <div className="flex min-h-screen">
      <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <div className="flex-1 md:ml-56">
        <Header onToggleSidebar={() => setSidebarOpen(v => !v)} />
        <main className="p-4 md:p-6 bg-gray-50 min-h-[calc(100vh-3.5rem)]">
          {children}
        </main>
      </div>
    </div>
  )
}

'use client'

import { useAuth } from '@/hooks/useAuth'
import Button from '@/components/ui/Button'

export default function Header() {
  const { user, logout } = useAuth()

  return (
    <header className="h-14 bg-white border-b border-gray-200 flex items-center justify-between px-6">
      <div />
      <div className="flex items-center gap-4">
        <span className="text-sm text-gray-600">
          {user?.display_name || user?.username}
        </span>
        <Button variant="ghost" size="sm" onClick={logout}>
          退出
        </Button>
      </div>
    </header>
  )
}

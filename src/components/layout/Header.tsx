'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useAuth } from '@/hooks/useAuth'
import { MODULE_REGISTRY } from '@/lib/moduleRegistry'

export default function Header() {
  const pathname = usePathname()
  const { user, logout } = useAuth()

  const isAdmin = user?.role === 'admin'
  const availableModules = isAdmin
    ? MODULE_REGISTRY
    : MODULE_REGISTRY.filter(m => user?.modules?.includes(m.id))

  const activeModule = availableModules.find(m =>
    pathname.startsWith(m.defaultRoute.replace(/\/[^/]+$/, ''))
  )

  return (
    <header className="h-14 bg-white border-b border-gray-200 flex items-center px-6">
      {/* Module tabs */}
      <nav className="flex items-center gap-1">
        {availableModules.map(mod => {
          const active = activeModule?.id === mod.id
          return (
            <Link
              key={mod.id}
              href={mod.defaultRoute}
              className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
                active
                  ? 'bg-gray-100 text-gray-900'
                  : 'text-gray-500 hover:text-gray-900 hover:bg-gray-50'
              }`}
            >
              <span className="mr-1">{mod.icon}</span>
              {mod.label}
            </Link>
          )
        })}
      </nav>

      {/* Right side */}
      <div className="ml-auto flex items-center gap-4">
        {isAdmin && (
          <Link
            href="/admin/users"
            className={`text-sm transition-colors ${
              pathname.startsWith('/admin')
                ? 'text-gray-900 font-medium'
                : 'text-gray-500 hover:text-gray-900'
            }`}
          >
            ⚙️ 用户管理
          </Link>
        )}
        <span className="text-sm text-gray-600">
          {user?.display_name || user?.username}
        </span>
        <button
          onClick={logout}
          className="text-sm text-gray-500 hover:text-gray-900 transition-colors"
        >
          退出
        </button>
      </div>
    </header>
  )
}

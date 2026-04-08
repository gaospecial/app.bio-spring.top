'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useAuth } from '@/hooks/useAuth'
import { MODULE_REGISTRY } from '@/lib/moduleRegistry'

interface HeaderProps {
  onToggleSidebar: () => void
}

export default function Header({ onToggleSidebar }: HeaderProps) {
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
    <header className="h-14 bg-white border-b border-gray-200 flex items-center px-4 md:px-6">
      {/* Hamburger - 仅移动端显示 */}
      <button
        onClick={onToggleSidebar}
        className="md:hidden mr-3 p-1.5 rounded-md text-gray-500 hover:text-gray-900 hover:bg-gray-100 transition-colors"
        aria-label="打开菜单"
      >
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
        </svg>
      </button>

      {/* Module tabs */}
      <nav className="flex items-center gap-1 overflow-x-auto">
        {availableModules.map(mod => {
          const active = activeModule?.id === mod.id
          return (
            <Link
              key={mod.id}
              href={mod.defaultRoute}
              className={`px-2 md:px-3 py-1.5 rounded-md text-sm font-medium transition-colors flex items-center ${
                active
                  ? 'bg-gray-100 text-gray-900'
                  : 'text-gray-500 hover:text-gray-900 hover:bg-gray-50'
              }`}
            >
              <span className="material-symbols-outlined text-[20px]">{mod.icon}</span>
              <span className="hidden md:inline ml-1">{mod.label}</span>
            </Link>
          )
        })}
      </nav>

      {/* Right side */}
      <div className="ml-auto flex items-center gap-2 md:gap-4 shrink-0">
        {isAdmin && (
          <Link
            href="/admin/users"
            className={`text-sm transition-colors whitespace-nowrap ${
              pathname.startsWith('/admin')
                ? 'text-gray-900 font-medium'
                : 'text-gray-500 hover:text-gray-900'
            }`}
          >
            <span className="md:hidden">⚙️</span>
            <span className="hidden md:inline">⚙️ 用户管理</span>
          </Link>
        )}
        <span className="hidden sm:inline text-sm text-gray-600 truncate max-w-[120px]">
          {user?.display_name || user?.username}
        </span>
        <button
          onClick={logout}
          className="text-sm text-gray-500 hover:text-gray-900 transition-colors"
        >
          <span className="md:hidden">退出</span>
          <span className="hidden md:inline">退出登录</span>
        </button>
      </div>
    </header>
  )
}

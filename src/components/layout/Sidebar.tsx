'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useAuth } from '@/hooks/useAuth'
import { MODULE_REGISTRY } from '@/lib/moduleRegistry'

export default function Sidebar() {
  const pathname = usePathname()
  const { user } = useAuth()

  const isAdmin = user?.role === 'admin'
  const availableModules = isAdmin
    ? MODULE_REGISTRY
    : MODULE_REGISTRY.filter(m => user?.modules?.includes(m.id))

  // Detect active module from pathname
  const activeModule = availableModules.find(m =>
    pathname.startsWith(m.defaultRoute.replace(/\/[^/]+$/, ''))
  ) || availableModules[0]

  return (
    <aside className="fixed left-0 top-0 h-screen w-56 bg-slate-900 text-white flex flex-col">
      <div className="px-5 py-5 border-b border-slate-700">
        <h1 className="text-lg font-bold">Bio Spring</h1>
        <p className="text-xs text-slate-400 mt-0.5">{user?.display_name || user?.username}</p>
      </div>

      {/* Module selector */}
      <div className="px-3 py-3 border-b border-slate-700">
        <p className="px-3 text-xs text-slate-500 uppercase tracking-wider mb-2">模块</p>
        <div className="space-y-1">
          {availableModules.map(mod => {
            const active = activeModule?.id === mod.id
            return (
              <Link
                key={mod.id}
                href={mod.defaultRoute}
                className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm transition-colors ${
                  active
                    ? 'bg-blue-600 text-white'
                    : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                }`}
              >
                <span>{mod.icon}</span>
                <span>{mod.label}</span>
              </Link>
            )
          })}
        </div>
      </div>

      {/* Sub-navigation for active module */}
      {activeModule && (
        <nav className="flex-1 px-3 py-4 space-y-1">
          <p className="px-3 text-xs text-slate-500 uppercase tracking-wider mb-2">导航</p>
          {activeModule.navItems.map(item => {
            const href = `${activeModule.defaultRoute.replace(/\/[^/]+$/, '')}${item.href}`
            const active = pathname === href
            return (
              <Link
                key={item.href}
                href={href}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                  active
                    ? 'bg-slate-700 text-white'
                    : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                }`}
              >
                <span>{item.icon}</span>
                <span>{item.label}</span>
              </Link>
            )
          })}
        </nav>
      )}

      {/* Admin link */}
      {isAdmin && (
        <div className="px-3 py-3 border-t border-slate-700">
          <Link
            href="/admin/users"
            className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
              pathname.startsWith('/admin')
                ? 'bg-slate-700 text-white'
                : 'text-slate-300 hover:bg-slate-800 hover:text-white'
            }`}
          >
            <span>⚙️</span>
            <span>用户管理</span>
          </Link>
        </div>
      )}
    </aside>
  )
}

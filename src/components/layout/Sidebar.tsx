'use client'

import Link from 'next/link'
import Image from 'next/image'
import { usePathname } from 'next/navigation'
import { useAuth } from '@/hooks/useAuth'
import { MODULE_REGISTRY } from '@/lib/moduleRegistry'

interface SidebarProps {
  open: boolean
  onClose: () => void
}

export default function Sidebar({ open, onClose }: SidebarProps) {
  const pathname = usePathname()
  const { user } = useAuth()

  const isAdmin = user?.role === 'admin'
  const availableModules = isAdmin
    ? MODULE_REGISTRY
    : MODULE_REGISTRY.filter(m => user?.modules?.includes(m.id))

  // Detect active module from pathname (only when inside a module)
  const activeModule = availableModules.find(m =>
    pathname.startsWith(m.defaultRoute.replace(/\/[^/]+$/, ''))
  )

  return (
    <>
      {/* 移动端遮罩 */}
      {open && (
        <div
          className="fixed inset-0 bg-black/40 z-40 md:hidden"
          onClick={onClose}
        />
      )}
      <aside
        className={`fixed left-0 top-0 h-screen w-56 bg-slate-900 text-white flex-col z-50 ${
          open ? 'flex translate-x-0' : 'hidden -translate-x-full'
        } md:flex md:translate-x-0`}
      >
      <Link href="/" onClick={onClose} className="flex items-center justify-center px-5 py-4 border-b border-slate-700">
        <Image src="/logo.png" alt="Bio Spring" width={128} height={32} className="w-full h-auto" />
      </Link>
      {activeModule && (
        <div className="px-5 py-2.5 border-b border-slate-700">
          <p className="text-sm font-semibold text-slate-200">{activeModule.label}</p>
        </div>
      )}

      {/* Sub-navigation for active module */}
      {activeModule && (
        <nav className="flex-1 px-3 py-4 space-y-1">
          {activeModule.navItems.map(item => {
            const href = `${activeModule.defaultRoute.replace(/\/[^/]+$/, '')}${item.href}`
            const active = pathname === href
            return (
              <Link
                key={item.href}
                href={href}
                onClick={onClose}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                  active
                    ? 'bg-slate-700 text-white'
                    : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                }`}
              >
                <span className="material-symbols-outlined text-[20px]">{item.icon}</span>
                <span>{item.label}</span>
              </Link>
            )
          })}
        </nav>
      )}
      </aside>
    </>
  )
}

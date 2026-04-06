'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'

const navItems = [
  { href: '/dashboard', label: '总览', icon: ' ' },
  { href: '/keys', label: 'API Keys', icon: ' ' },
  { href: '/usage', label: '用量图表', icon: ' ' },
  { href: '/details', label: '明细查询', icon: ' ' },
]

export default function Sidebar() {
  const pathname = usePathname()

  return (
    <aside className="fixed left-0 top-0 h-screen w-56 bg-slate-900 text-white flex flex-col">
      <div className="px-5 py-5 border-b border-slate-700">
        <h1 className="text-lg font-bold">LLM Usage</h1>
        <p className="text-xs text-slate-400 mt-0.5">ChatAnywhere 管理</p>
      </div>
      <nav className="flex-1 px-3 py-4 space-y-1">
        {navItems.map((item) => {
          const active = pathname === item.href
          return (
            <Link
              key={item.href}
              href={item.href}
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
    </aside>
  )
}

'use client'

import Link from 'next/link'
import { useAuth } from '@/hooks/useAuth'
import { MODULE_REGISTRY } from '@/lib/moduleRegistry'
import LoadingSpinner from '@/components/ui/LoadingSpinner'

export default function AuthenticatedHomeClient() {
  const { user, loading } = useAuth()

  if (loading || !user) {
    return <LoadingSpinner className="min-h-screen" />
  }

  const isAdmin = user.role === 'admin'
  const availableModules = isAdmin
    ? MODULE_REGISTRY
    : MODULE_REGISTRY.filter(m => user.modules.includes(m.id))

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6">
      <div className="w-full max-w-2xl">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">
          欢迎回来，{user.display_name || user.username}
        </h1>
        <p className="text-gray-500 mb-8">选择一个模块开始使用。</p>

        {availableModules.length === 0 ? (
          <div className="bg-white rounded-xl border border-gray-200 p-8 text-center text-gray-400">
            暂无可访问的模块，请联系管理员开通权限。
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2">
            {availableModules.map(mod => (
              <Link
                key={mod.id}
                href={mod.defaultRoute}
                className="block bg-white rounded-xl border border-gray-200 p-5 hover:border-gray-300 hover:shadow-sm transition-all"
              >
                <div className="text-2xl mb-2">{mod.icon}</div>
                <h2 className="text-base font-semibold text-gray-900 mb-1">
                  {mod.label}
                </h2>
                <p className="text-sm text-gray-500">{mod.description}</p>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

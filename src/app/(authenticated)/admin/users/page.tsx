'use client'

import { useState, useEffect, useCallback } from 'react'
import { useAuth } from '@/hooks/useAuth'
import { listUsers, listModules, getUserModules, setUserModules } from '@/lib/api'
import type { UserResponse, ModuleInfo } from '@/lib/types'
import LoadingSpinner from '@/components/ui/LoadingSpinner'
import { useRouter } from 'next/navigation'

export default function AdminUsersPage() {
  const { user: currentUser } = useAuth()
  const router = useRouter()
  const [users, setUsers] = useState<UserResponse[]>([])
  const [modules, setModules] = useState<ModuleInfo[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState<number | null>(null)
  const [toast, setToast] = useState('')

  const fetchData = useCallback(async () => {
    setLoading(true)
    try {
      const [u, m] = await Promise.all([listUsers(), listModules()])
      setUsers(u)
      setModules(m)
    } catch {
      /* empty */
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    if (currentUser && currentUser.role !== 'admin') {
      router.replace('/')
      return
    }
    fetchData()
  }, [currentUser, router, fetchData])

  const handleToggleModule = async (userId: number, moduleId: string, currentModules: string[]) => {
    const newModules = currentModules.includes(moduleId)
      ? currentModules.filter(m => m !== moduleId)
      : [...currentModules, moduleId]

    setSaving(userId)
    try {
      await setUserModules(userId, newModules)
      setUsers(prev => prev.map(u => u.id === userId ? { ...u, modules: newModules } : u))
      setToast('权限已更新')
      setTimeout(() => setToast(''), 2000)
    } catch {
      alert('更新失败')
    } finally {
      setSaving(null)
    }
  }

  if (loading) return <LoadingSpinner />

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold text-gray-900">用户管理</h2>
        <p className="text-sm text-gray-500 mt-1">管理用户账号和模块访问权限</p>
      </div>

      {toast && (
        <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg text-sm">
          {toast}
        </div>
      )}

      <div className="bg-white rounded-lg border overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 border-b">
            <tr>
              <th className="px-4 py-3 text-left font-medium text-gray-600">用户名</th>
              <th className="px-4 py-3 text-left font-medium text-gray-600">显示名</th>
              <th className="px-4 py-3 text-left font-medium text-gray-600">角色</th>
              <th className="px-4 py-3 text-left font-medium text-gray-600">模块权限</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {users.map(u => (
              <tr key={u.id} className="hover:bg-gray-50">
                <td className="px-4 py-3 font-medium">{u.username}</td>
                <td className="px-4 py-3 text-gray-600">{u.display_name || '-'}</td>
                <td className="px-4 py-3">
                  <span className={`px-2 py-0.5 rounded text-xs font-medium ${
                    u.role === 'admin' ? 'bg-purple-100 text-purple-700' : 'bg-gray-100 text-gray-600'
                  }`}>
                    {u.role}
                  </span>
                </td>
                <td className="px-4 py-3">
                  {u.role === 'admin' ? (
                    <span className="text-xs text-gray-400">全部（管理员）</span>
                  ) : (
                    <div className="flex flex-wrap gap-2">
                      {modules.map(mod => {
                        const checked = u.modules.includes(mod.id)
                        return (
                          <label
                            key={mod.id}
                            className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs cursor-pointer transition-colors ${
                              checked
                                ? 'bg-blue-100 text-blue-700'
                                : 'bg-gray-100 text-gray-500'
                            } ${saving === u.id ? 'opacity-50 pointer-events-none' : ''}`}
                          >
                            <input
                              type="checkbox"
                              checked={checked}
                              onChange={() => handleToggleModule(u.id, mod.id, u.modules)}
                              className="sr-only"
                            />
                            <span>{mod.icon}</span>
                            <span>{mod.label}</span>
                          </label>
                        )
                      })}
                    </div>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

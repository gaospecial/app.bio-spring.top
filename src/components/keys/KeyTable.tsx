'use client'

import Badge from '@/components/ui/Badge'
import Button from '@/components/ui/Button'
import type { ApiKey } from '@/lib/types'

interface KeyTableProps {
  keys: ApiKey[]
  onEdit: (key: ApiKey) => void
  onDelete: (key: ApiKey) => void
  onCollect: (key: ApiKey) => void
  collecting: number | null
}

export default function KeyTable({ keys, onEdit, onDelete, onCollect, collecting }: KeyTableProps) {
  return (
    <div className="overflow-x-auto rounded-lg border border-gray-200 bg-white">
      <table className="w-full text-sm">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-4 py-3 text-left font-medium text-gray-600">名称</th>
            <th className="px-4 py-3 text-left font-medium text-gray-600">API Key</th>
            <th className="px-4 py-3 text-left font-medium text-gray-600">Base URL</th>
            <th className="px-4 py-3 text-center font-medium text-gray-600">状态</th>
            <th className="px-4 py-3 text-right font-medium text-gray-600">余额</th>
            <th className="px-4 py-3 text-center font-medium text-gray-600">操作</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100">
          {keys.length === 0 ? (
            <tr>
              <td colSpan={6} className="px-4 py-8 text-center text-gray-400">暂无 API Key</td>
            </tr>
          ) : (
            keys.map((key) => (
              <tr key={key.id} className="hover:bg-gray-50">
                <td className="px-4 py-3 font-medium">{key.name}</td>
                <td className="px-4 py-3 font-mono text-xs text-gray-500">{key.api_key}</td>
                <td className="px-4 py-3 text-xs text-gray-500">{key.base_url}</td>
                <td className="px-4 py-3 text-center">
                  <Badge variant={key.is_active ? 'success' : 'default'}>
                    {key.is_active ? '启用' : '禁用'}
                  </Badge>
                </td>
                <td className="px-4 py-3 text-right">
                  {key.balance_total ? `$${Number(key.balance_total).toFixed(2)}` : '-'}
                </td>
                <td className="px-4 py-3">
                  <div className="flex items-center justify-center gap-2">
                    <Button size="sm" variant="ghost" onClick={() => onCollect(key)} disabled={collecting === key.id}>
                      {collecting === key.id ? '采集中...' : '采集'}
                    </Button>
                    <Button size="sm" variant="ghost" onClick={() => onEdit(key)}>编辑</Button>
                    <Button size="sm" variant="ghost" onClick={() => onDelete(key)} className="text-red-600 hover:text-red-700">删除</Button>
                  </div>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  )
}

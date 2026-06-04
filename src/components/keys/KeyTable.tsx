'use client'

import { useState } from 'react'
import Badge from '@/components/ui/Badge'
import Button from '@/components/ui/Button'
import { revealKey } from '@/lib/api'
import type { ApiKey } from '@/lib/types'

interface KeyTableProps {
  keys: ApiKey[]
  onEdit: (key: ApiKey) => void
  onDelete: (key: ApiKey) => void
  onCollect: (key: ApiKey) => void
  collecting: number | null
}

export default function KeyTable({ keys, onEdit, onDelete, onCollect, collecting }: KeyTableProps) {
  const [copiedId, setCopiedId] = useState<number | null>(null)

  const handleCopy = async (key: ApiKey) => {
    try {
      const revealed = await revealKey(key.id)
      await navigator.clipboard.writeText(revealed.api_key)
      setCopiedId(key.id)
      setTimeout(() => setCopiedId(null), 2000)
    } catch {
      /* clipboard not available */
    }
  }

  return (
    <div className="overflow-x-auto rounded-lg border border-gray-200 bg-white">
      <table className="w-full text-sm">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-4 py-3 text-left font-medium text-gray-600">名称</th>
            <th className="px-4 py-3 text-left font-medium text-gray-600">Provider</th>
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
              <td colSpan={7} className="px-4 py-8 text-center text-gray-400">暂无 API Key</td>
            </tr>
          ) : (
            keys.map((key) => (
              <tr key={key.id} className="hover:bg-gray-50">
                <td className="px-4 py-3 font-medium">{key.name}</td>
                <td className="px-4 py-3 text-xs text-gray-500">{key.provider || 'chatanywhere'}</td>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-1.5">
                    <span className="font-mono text-xs text-gray-500 truncate max-w-[200px]">{key.api_key}</span>
                    <button
                      onClick={() => handleCopy(key)}
                      className="shrink-0 p-1 rounded hover:bg-gray-100 text-gray-400 hover:text-gray-600 transition-colors"
                      title="复制 API Key"
                    >
                      {copiedId === key.id ? (
                        <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                        </svg>
                      ) : (
                        <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                          <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
                          <path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1" />
                        </svg>
                      )}
                    </button>
                  </div>
                </td>
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

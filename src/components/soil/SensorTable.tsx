'use client'

import type { SensorResponse } from '@/lib/types'
import { formatDateTime } from '@/lib/time'
import Badge from '@/components/ui/Badge'

interface SensorTableProps {
  sensors: SensorResponse[]
  providerName: (id: number) => string
  onEdit: (sensor: SensorResponse) => void
  onDelete: (sensor: SensorResponse) => void
}

export default function SensorTable({ sensors, providerName, onEdit, onDelete }: SensorTableProps) {
  return (
    <div className="bg-white rounded-lg border border-gray-200">
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-3 text-left font-medium text-gray-600">名称</th>
              <th className="px-4 py-3 text-left font-medium text-gray-600">序列号</th>
              <th className="px-4 py-3 text-left font-medium text-gray-600">数据源</th>
              <th className="px-4 py-3 text-left font-medium text-gray-600">位置</th>
              <th className="px-4 py-3 text-right font-medium text-gray-600">最新值</th>
              <th className="px-4 py-3 text-left font-medium text-gray-600">单位</th>
              <th className="px-4 py-3 text-left font-medium text-gray-600">最近采集</th>
              <th className="px-4 py-3 text-center font-medium text-gray-600">状态</th>
              <th className="px-4 py-3 text-center font-medium text-gray-600">操作</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {sensors.length === 0 ? (
              <tr>
                <td colSpan={9} className="px-4 py-8 text-center text-gray-400">暂无传感器数据</td>
              </tr>
            ) : (
              sensors.map((s) => (
                <tr key={s.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 font-medium">{s.name}</td>
                  <td className="px-4 py-3 font-mono text-xs text-gray-400">{s.sensor_sn}</td>
                  <td className="px-4 py-3 text-gray-500">{providerName(s.provider_id)}</td>
                  <td className="px-4 py-3 text-gray-500">{s.location || '-'}</td>
                  <td className="px-4 py-3 text-right font-semibold">
                    {s.latest_value !== null ? Number(s.latest_value).toFixed(2) : '-'}
                  </td>
                  <td className="px-4 py-3 text-gray-500">{s.unit || '-'}</td>
                  <td className="px-4 py-3 text-xs text-gray-400">
                    {s.latest_time ? formatDateTime(s.latest_time) : '-'}
                  </td>
                  <td className="px-4 py-3 text-center">
                    {s.is_active ? (
                      <Badge variant="success">启用</Badge>
                    ) : (
                      <Badge variant="default">停用</Badge>
                    )}
                  </td>
                  <td className="px-4 py-3 text-center">
                    <div className="flex items-center justify-center gap-2">
                      <button
                        onClick={() => onEdit(s)}
                        className="text-blue-600 hover:text-blue-800 text-xs"
                      >
                        编辑
                      </button>
                      <button
                        onClick={() => onDelete(s)}
                        className="text-red-600 hover:text-red-800 text-xs"
                      >
                        删除
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}

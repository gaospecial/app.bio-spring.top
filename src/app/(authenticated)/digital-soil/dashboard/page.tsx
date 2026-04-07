'use client'

import { useState, useEffect, useCallback } from 'react'
import { getSoilDashboard, listSoilSensors } from '@/lib/api'
import type { SoilDashboard, SensorResponse } from '@/lib/types'
import Card from '@/components/ui/Card'
import Badge from '@/components/ui/Badge'
import LoadingSpinner from '@/components/ui/LoadingSpinner'

export default function DigitalSoilDashboard() {
  const [dashboard, setDashboard] = useState<SoilDashboard | null>(null)
  const [sensors, setSensors] = useState<SensorResponse[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const fetchData = useCallback(async () => {
    setLoading(true)
    setError('')
    try {
      const [dash, sensorList] = await Promise.all([
        getSoilDashboard(),
        listSoilSensors({ active: true }),
      ])
      setDashboard(dash)
      setSensors(sensorList)
    } catch (err) {
      setError(err instanceof Error ? err.message : '加载失败')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { fetchData() }, [fetchData])

  if (loading) return <LoadingSpinner />
  if (error) return <div className="text-red-500 p-4">{error}</div>
  if (!dashboard) return null

  const stats = [
    { label: '数据源', value: `${dashboard.active_providers}/${dashboard.total_providers}`, color: 'text-blue-600', sub: '活跃/总计' },
    { label: '传感器', value: `${dashboard.active_sensors}/${dashboard.total_sensors}`, color: 'text-indigo-600', sub: '活跃/总计' },
    { label: '在线', value: String(dashboard.online_sensors), color: 'text-green-600', sub: `离线 ${dashboard.offline_sensors}` },
    { label: '今日数据', value: String(dashboard.today_data_points), color: 'text-orange-600', sub: '条记录' },
  ]

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold text-gray-900">数字土壤 - 总览</h2>
        <p className="text-sm text-gray-500 mt-1">
          土壤物联网数据采集与可视化
          {dashboard.latest_update && (
            <span className="ml-2">
              最近更新: {new Date(dashboard.latest_update).toLocaleString('zh-CN')}
            </span>
          )}
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((s) => (
          <Card key={s.label}>
            <p className="text-sm text-gray-500">{s.label}</p>
            <p className={`text-2xl font-bold mt-1 ${s.color}`}>{s.value}</p>
            <p className="text-xs text-gray-400 mt-1">{s.sub}</p>
          </Card>
        ))}
      </div>

      <Card title="在线传感器状态">
        {sensors.length === 0 ? (
          <div className="text-center text-gray-400 py-6">暂无传感器数据</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100">
                  <th className="text-left py-2 font-medium text-gray-600">名称</th>
                  <th className="text-left py-2 font-medium text-gray-600">位置</th>
                  <th className="text-left py-2 font-medium text-gray-600">序列号</th>
                  <th className="text-right py-2 font-medium text-gray-600">最新值</th>
                  <th className="text-left py-2 font-medium text-gray-600 pl-4">单位</th>
                  <th className="text-left py-2 font-medium text-gray-600 pl-4">最近采集</th>
                  <th className="text-center py-2 font-medium text-gray-600">状态</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {sensors.map((s) => (
                  <tr key={s.id}>
                    <td className="py-2.5 font-medium">{s.name}</td>
                    <td className="py-2.5 text-gray-500">{s.location || '-'}</td>
                    <td className="py-2.5 font-mono text-xs text-gray-400">{s.sensor_sn}</td>
                    <td className="py-2.5 text-right font-semibold">
                      {s.latest_value !== null ? Number(s.latest_value).toFixed(2) : '-'}
                    </td>
                    <td className="py-2.5 pl-4 text-gray-500">{s.unit || '-'}</td>
                    <td className="py-2.5 pl-4 text-xs text-gray-400">
                      {s.latest_time ? new Date(s.latest_time).toLocaleString('zh-CN') : '-'}
                    </td>
                    <td className="py-2.5 text-center">
                      {s.is_active ? (
                        <Badge variant="success">启用</Badge>
                      ) : (
                        <Badge variant="default">停用</Badge>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </div>
  )
}

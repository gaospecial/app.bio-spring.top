'use client'

import { useState, useEffect, useCallback, useMemo } from 'react'
import ReactECharts from 'echarts-for-react'
import { getSoilDashboard, listSoilSensors, getSensorOHLC } from '@/lib/api'
import { formatDateTime } from '@/lib/time'
import type { SoilDashboard, SensorResponse, OHLCItem } from '@/lib/types'
import Card from '@/components/ui/Card'
import Badge from '@/components/ui/Badge'
import LoadingSpinner from '@/components/ui/LoadingSpinner'

type TrendData = Record<number, OHLCItem[]>

export default function DigitalSoilDashboard() {
  const [dashboard, setDashboard] = useState<SoilDashboard | null>(null)
  const [sensors, setSensors] = useState<SensorResponse[]>([])
  const [trends, setTrends] = useState<TrendData>({})
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

      // 为每个有最新值的传感器拉取最近 7 天 OHLC 趋势
      const end = new Date()
      const start = new Date(end.getTime() - 7 * 24 * 60 * 60 * 1000)
      const results = await Promise.all(
        sensorList
          .filter(s => s.latest_value !== null)
          .map(async (s) => {
            try {
              const ohlc = await getSensorOHLC(s.id, {
                interval: '1d',
                start: start.toISOString(),
                end: end.toISOString(),
              })
              return { id: s.id, ohlc }
            } catch {
              return { id: s.id, ohlc: [] }
            }
          })
      )
      const trendMap: TrendData = {}
      for (const r of results) {
        trendMap[r.id] = r.ohlc
      }
      setTrends(trendMap)
    } catch (err) {
      setError(err instanceof Error ? err.message : '加载失败')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { fetchData() }, [fetchData])

  // 按 unit 分组传感器
  const sensorsByUnit = useMemo(() => {
    const groups: Record<string, SensorResponse[]> = {}
    for (const s of sensors) {
      const key = s.unit || '未知'
      if (!groups[key]) groups[key] = []
      groups[key].push(s)
    }
    return groups
  }, [sensors])

  // 构建单个传感器的趋势图配置
  const buildTrendOption = (sensor: SensorResponse) => {
    const ohlc = trends[sensor.id]
    if (!ohlc || ohlc.length === 0) return null

    const xData = ohlc.map(d => {
      const dt = new Date(d.interval_start)
      return `${dt.getMonth() + 1}/${dt.getDate()}`
    })
    const meanData = ohlc.map(d => ((Number(d.open) + Number(d.close)) / 2))
    const highData = ohlc.map(d => Number(d.high))
    const lowData = ohlc.map(d => Number(d.low))

    return {
      tooltip: {
        trigger: 'axis',
        formatter: (params: { seriesName: string; data: number; axisValueLabel: string }[]) => {
          const unit = sensor.unit || ''
          const lines = params.map(p => `${p.seriesName}: ${p.data.toFixed(4)} ${unit}`)
          return `<strong>${params[0].axisValueLabel}</strong><br/>${lines.join('<br/>')}`
        },
      },
      legend: { data: ['均值', '最高', '最低'], top: 0, textStyle: { fontSize: 11 } },
      grid: { left: 50, right: 16, bottom: 24, top: 36 },
      xAxis: {
        type: 'category',
        data: xData,
        axisLabel: { fontSize: 10 },
        axisTick: { show: false },
      },
      yAxis: {
        type: 'value',
        name: sensor.unit || '',
        nameTextStyle: { fontSize: 10 },
        axisLabel: { fontSize: 10 },
        splitLine: { lineStyle: { type: 'dashed', color: '#f0f0f0' } },
      },
      series: [
        {
          name: '最高',
          type: 'line',
          data: highData,
          lineStyle: { color: '#ef4444', width: 1, opacity: 0.4 },
          symbol: 'none',
          itemStyle: { color: '#ef4444' },
        },
        {
          name: '均值',
          type: 'line',
          data: meanData,
          lineStyle: { color: '#3b82f6', width: 2 },
          symbol: 'circle',
          symbolSize: 4,
          itemStyle: { color: '#3b82f6' },
          areaStyle: { color: 'rgba(59,130,246,0.08)' },
        },
        {
          name: '最低',
          type: 'line',
          data: lowData,
          lineStyle: { color: '#22c55e', width: 1, opacity: 0.4 },
          symbol: 'none',
          itemStyle: { color: '#22c55e' },
        },
      ],
    }
  }

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
              最近更新: {formatDateTime(dashboard.latest_update)}
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

      {/* 按指标类型分组展示传感器近 7 天趋势 */}
      {Object.entries(sensorsByUnit).map(([unit, group]) => (
        <div key={unit} className="space-y-3">
          <h3 className="text-sm font-semibold text-gray-700">
            {unit === '未知' ? '其他传感器' : `${unit} 类传感器`}
            <span className="ml-2 text-xs font-normal text-gray-400">近 7 天趋势</span>
          </h3>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {group.map((sensor) => {
              const option = buildTrendOption(sensor)
              return (
                <Card key={sensor.id}>
                  <div className="flex items-center justify-between mb-3">
                    <div>
                      <span className="text-sm font-semibold text-gray-900">{sensor.name}</span>
                      <span className="ml-2 text-xs text-gray-400 font-mono">{sensor.sensor_sn}</span>
                    </div>
                    <div className="text-right">
                      {sensor.latest_value !== null && (
                        <span className="text-sm font-bold text-gray-900">
                          {Number(sensor.latest_value).toFixed(2)}
                          <span className="ml-1 text-xs font-normal text-gray-400">{sensor.unit}</span>
                        </span>
                      )}
                    </div>
                  </div>
                  {option ? (
                    <ReactECharts option={option} style={{ height: 200 }} />
                  ) : (
                    <div className="h-32 flex items-center justify-center text-gray-300 text-sm">
                      暂无历史数据
                    </div>
                  )}
                </Card>
              )
            })}
          </div>
        </div>
      ))}

      <Card title="传感器状态">
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
                      {s.latest_time ? formatDateTime(s.latest_time) : '-'}
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

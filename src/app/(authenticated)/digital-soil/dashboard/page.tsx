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

const RANGE_OPTIONS = [
  { key: '7d' as const, label: '近7天', interval: '1h' as const, days: 7 },
  { key: '30d' as const, label: '近30天', interval: '1d' as const, days: 30 },
  { key: '90d' as const, label: '近90天', interval: '1w' as const, days: 90 },
  { key: '1y' as const, label: '近1年', interval: '1M' as const, days: 365 },
] as const

type RangeKey = (typeof RANGE_OPTIONS)[number]['key']

export default function DigitalSoilDashboard() {
  const [dashboard, setDashboard] = useState<SoilDashboard | null>(null)
  const [sensors, setSensors] = useState<SensorResponse[]>([])
  const [trends, setTrends] = useState<TrendData>({})
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [timeRange, setTimeRange] = useState<RangeKey>('7d')

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

      const opt = RANGE_OPTIONS.find(o => o.key === timeRange) ?? RANGE_OPTIONS[0]
      const end = new Date()
      const start = new Date(end.getTime() - opt.days * 24 * 60 * 60 * 1000)
      const results = await Promise.all(
        sensorList
          .filter(s => s.latest_value !== null)
          .map(async (s) => {
            try {
              const ohlc = await getSensorOHLC(s.id, {
                interval: opt.interval,
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
  }, [timeRange])

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
    const raw = trends[sensor.id]
    if (!raw || raw.length === 0) return null

    const opt = RANGE_OPTIONS.find(o => o.key === timeRange) ?? RANGE_OPTIONS[0]
    const isHourly = opt.interval === '1h'

    // OHLC 返回按时间倒序，反转为正序（左侧早，右侧近）
    // 后端数据库 DateTime 无时区列存储的是 UTC 时间，需要 +8h 转为北京时间
    const ohlc = [...raw].reverse().map(d => {
      const utc = new Date(d.interval_start + 'Z')  // 显式标记为 UTC
      return { ...d, bjMs: utc.getTime() + 8 * 3600000 }
    })

    // 从北京时间毫秒值提取字段
    const bjFields = (ms: number) => {
      const d = new Date(ms)
      return {
        month: String(d.getUTCMonth() + 1),
        day: String(d.getUTCDate()),
        hour: String(d.getUTCHours()).padStart(2, '0'),
        minute: String(d.getUTCMinutes()).padStart(2, '0'),
      }
    }

    // 对于小时级：splitLine 和 tick label 在每日 0 点
    // 对于日/周/月级：每个数据点都显示日期 label，splitLine 在每周一
    let dayStarts: number[]
    let xData: string[]

    if (isHourly) {
      dayStarts = ohlc.reduce<number[]>((acc, d, i) => {
        if (bjFields(d.bjMs).hour === '00') acc.push(i)
        return acc
      }, [])
      xData = ohlc.map((d, i) => {
        if (dayStarts.includes(i)) {
          const f = bjFields(d.bjMs)
          return `${f.month}/${f.day}`
        }
        return ''
      })
    } else {
      // 日/周/月级：splitLine 在每周一（ISO weekday=1）
      dayStarts = ohlc.reduce<number[]>((acc, d, i) => {
        const dt = new Date(d.bjMs)
        if (dt.getUTCDay() === 1) acc.push(i) // Monday
        return acc
      }, [])
      xData = ohlc.map(d => {
        const f = bjFields(d.bjMs)
        return `${f.month}/${f.day}`
      })
    }
    const meanData = ohlc.map(d => ((Number(d.open) + Number(d.close)) / 2))
    const highData = ohlc.map(d => Number(d.high))
    const lowData = ohlc.map(d => Number(d.low))

    return {
      tooltip: {
        trigger: 'axis',
        formatter: (params: { seriesName: string; data: number; axisValueLabel: string; dataIndex: number }[]) => {
          const unit = sensor.unit || ''
          const f = bjFields(ohlc[params[0].dataIndex].bjMs)
          const h = highData[params[0].dataIndex]
          const l = lowData[params[0].dataIndex]
          const m = meanData[params[0].dataIndex]
          return [
            `<strong>${f.month}/${f.day} ${f.hour}:${f.minute}</strong>`,
            `均值: ${m.toFixed(4)} ${unit}`,
            `最高: ${h.toFixed(4)} ${unit}`,
            `最低: ${l.toFixed(4)} ${unit}`,
          ].join('<br/>')
        },
      },
      grid: { left: 50, right: 16, bottom: 40, top: 16 },
      xAxis: {
        type: 'category',
        data: xData,
        axisLabel: {
          fontSize: 10,
          color: '#6b7280',
          fontWeight: 500,
          showMinLabel: true,
          showMaxLabel: true,
          interval: isHourly ? 0 : 'auto',
          formatter: isHourly
            ? (value: string) => value || ' '
            : undefined,
        },
        axisTick: { show: false },
        splitLine: {
          show: true,
          lineStyle: { color: '#e5e7eb', type: 'dashed', width: 1 },
          interval: (index: number) => dayStarts.includes(index),
        },
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
          name: '下界',
          type: 'line',
          data: lowData,
          lineStyle: { opacity: 0 },
          symbol: 'none',
          stack: 'band',
          itemStyle: { color: 'transparent' },
        },
        {
          name: '波动区间',
          type: 'line',
          data: lowData.map((l, i) => highData[i] - l),
          lineStyle: { opacity: 0 },
          symbol: 'none',
          stack: 'band',
          areaStyle: { color: 'rgba(59,130,246,0.15)' },
          itemStyle: { color: 'transparent' },
        },
        {
          name: '均值',
          type: 'line',
          data: meanData,
          lineStyle: { color: '#3b82f6', width: 2 },
          symbol: 'none',
          z: 10,
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
        </p>
        {dashboard.latest_update && (
          <p className="text-xs text-gray-400 mt-0.5">
            最近更新: {formatDateTime(dashboard.latest_update)}
          </p>
        )}
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4">
        {stats.map((s) => (
          <Card key={s.label}>
            <p className="text-sm text-gray-500">{s.label}</p>
            <p className={`text-2xl font-bold mt-1 ${s.color}`}>{s.value}</p>
            <p className="text-xs text-gray-400 mt-1">{s.sub}</p>
          </Card>
        ))}
      </div>

      {/* 按指标类型分组展示传感器趋势 */}
      {Object.entries(sensorsByUnit).map(([unit, group]) => (
        <div key={unit} className="space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold text-gray-700">
              {unit === '未知' ? '其他传感器' : `${unit} 类传感器`}
            </h3>
            <div className="flex flex-wrap gap-1">
              {RANGE_OPTIONS.map(opt => (
                <button
                  key={opt.key}
                  onClick={() => setTimeRange(opt.key)}
                  className={`px-2.5 py-1 text-xs rounded-full transition-colors ${
                    timeRange === opt.key
                      ? 'bg-blue-100 text-blue-700 font-medium'
                      : 'text-gray-500 hover:bg-gray-100'
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {group.map((sensor) => {
              const option = buildTrendOption(sensor)
              return (
                <Card key={sensor.id}>
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1 sm:gap-0 mb-3">
                    <div className="flex flex-wrap items-center gap-1">
                      <span className="text-sm font-semibold text-gray-900">{sensor.name}</span>
                      <span className="text-xs text-gray-400 font-mono">{sensor.sensor_sn}</span>
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
                    <ReactECharts option={option} style={{ height: 180 }} />
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
            <table className="w-full text-sm whitespace-nowrap">
              <thead>
                <tr className="border-b border-gray-100">
                  <th className="text-left py-2 px-3 font-medium text-gray-600">名称</th>
                  <th className="text-left py-2 px-3 font-medium text-gray-600 hidden md:table-cell">位置</th>
                  <th className="text-left py-2 px-3 font-medium text-gray-600 hidden md:table-cell">序列号</th>
                  <th className="text-right py-2 px-3 font-medium text-gray-600">最新值</th>
                  <th className="text-left py-2 px-3 font-medium text-gray-600 hidden md:table-cell">最近采集</th>
                  <th className="text-center py-2 px-3 font-medium text-gray-600">状态</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {sensors.map((s) => (
                  <tr key={s.id}>
                    <td className="py-2.5 px-3 font-medium">{s.name}</td>
                    <td className="py-2.5 px-3 text-gray-500 hidden md:table-cell">{s.location || '-'}</td>
                    <td className="py-2.5 px-3 font-mono text-xs text-gray-400 hidden md:table-cell">{s.sensor_sn}</td>
                    <td className="py-2.5 px-3 text-right font-semibold">
                      {s.latest_value !== null ? (
                        <>{Number(s.latest_value).toFixed(2)} <span className="text-xs font-normal text-gray-400">{s.unit}</span></>
                      ) : '-'}
                    </td>
                    <td className="py-2.5 px-3 text-xs text-gray-400 hidden md:table-cell">
                      {s.latest_time ? formatDateTime(s.latest_time) : '-'}
                    </td>
                    <td className="py-2.5 px-3 text-center">
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

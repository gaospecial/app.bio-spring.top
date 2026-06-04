'use client'

import ReactECharts from 'echarts-for-react'
import type { DailyUsage } from '@/lib/types'

interface DailyUsageChartProps {
  data: DailyUsage[]
  days: number
  onDaysChange: (days: number) => void
}

function fillMissingDates(data: DailyUsage[], daysCount: number) {
  if (data.length === 0) return data

  const sorted = [...data].sort((a, b) => a.date.localeCompare(b.date))
  const end = new Date(sorted[sorted.length - 1].date)
  const start = new Date(end)
  start.setDate(start.getDate() - daysCount + 1)

  const result: DailyUsage[] = []
  const byDate = new Map(sorted.map((d) => [d.date, d]))
  const cursor = new Date(start)

  while (cursor <= end) {
    const key = cursor.toISOString().slice(0, 10)
    result.push(
      byDate.get(key) ?? {
        date: key,
        total_usage: '0',
        total_tokens: 0,
        keys: [],
      },
    )
    cursor.setDate(cursor.getDate() + 1)
  }
  return result
}

export default function DailyUsageChart({ data, days, onDaysChange }: DailyUsageChartProps) {
  const full = fillMissingDates(data, days)
  const dates = full.map((d) => d.date)
  const usages = full.map((d) => parseFloat(d.total_usage))

  const option = {
    tooltip: {
      trigger: 'axis',
      formatter: (params: any) => {
        const p = Array.isArray(params) ? params[0] : params
        return `${p.axisValue}<br/>金额: $${p.value.toFixed(4)}`
      },
    },
    grid: { left: '3%', right: '4%', bottom: '3%', containLabel: true },
    xAxis: { type: 'category', data: dates },
    yAxis: { type: 'value', name: '金额 ($)' },
    series: [
      {
        type: 'bar',
        data: usages,
        itemStyle: { color: '#3b82f6' },
      },
    ],
  }

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-4">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-semibold text-gray-900">每日使用金额</h3>
        <div className="flex gap-1">
          {[7, 14, 30].map((d) => (
            <button
              key={d}
              onClick={() => onDaysChange(d)}
              className={`px-3 py-1 text-xs rounded ${
                days === d ? 'bg-blue-500 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              {d} 天
            </button>
          ))}
        </div>
      </div>
      {data.length === 0 ? (
        <div className="h-64 flex items-center justify-center text-gray-400">暂无数据</div>
      ) : (
        <ReactECharts option={option} style={{ height: 300 }} />
      )}
    </div>
  )
}

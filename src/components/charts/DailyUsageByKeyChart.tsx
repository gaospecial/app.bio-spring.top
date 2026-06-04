'use client'

import ReactECharts from 'echarts-for-react'
import type { DailyUsage } from '@/lib/types'

interface DailyUsageByKeyChartProps {
  data: DailyUsage[]
  keyNames: Record<number, string>
}

const COLOR_PALETTE = [
  '#3b82f6', '#ef4444', '#10b981', '#f59e0b', '#8b5cf6',
  '#ec4899', '#14b8a6', '#f97316', '#6366f1', '#84cc16',
]

export default function DailyUsageByKeyChart({ data, keyNames }: DailyUsageByKeyChartProps) {
  // Fill gaps to ensure consecutive days sorted left to right
  let filled = [...data].sort((a, b) => a.date.localeCompare(b.date))
  if (filled.length > 1) {
    const start = new Date(filled[0].date)
    const end = new Date(filled[filled.length - 1].date)
    const byDate = new Map(filled.map((d) => [d.date, d]))
    const result: DailyUsage[] = []
    const cursor = new Date(start)
    while (cursor <= end) {
      const key = cursor.toISOString().slice(0, 10)
      result.push(
        byDate.get(key) ?? { date: key, total_usage: '0', total_tokens: 0, keys: [] },
      )
      cursor.setDate(cursor.getDate() + 1)
    }
    filled = result
  }

  const dates = filled.map((d) => d.date)

  // Collect all key IDs across all days
  const keyIdSet = new Set<number>()
  data.forEach((d) => d.keys.forEach((k) => keyIdSet.add(k.key_id)))
  const keyIds = Array.from(keyIdSet)

  const series = keyIds.map((keyId, idx) => {
    const values = filled.map((d) => {
      const k = d.keys.find((k) => k.key_id === keyId)
      return k ? parseFloat(k.usage) : 0
    })
    return {
      name: keyNames[keyId] ?? `Key #${keyId}`,
      type: 'bar',
      stack: 'total',
      data: values,
      itemStyle: { color: COLOR_PALETTE[idx % COLOR_PALETTE.length] },
    }
  })

  const option = {
    tooltip: {
      trigger: 'axis',
      axisPointer: { type: 'shadow' },
      formatter: (params: any[]) => {
        if (!params?.length) return ''
        const date = params[0].axisValue
        let html = `<strong>${date}</strong><br/>`
        let total = 0
        params.forEach((p: any) => {
          if (p.value > 0) {
            html += `${p.marker} ${p.seriesName}: $${p.value.toFixed(4)}<br/>`
            total += p.value
          }
        })
        html += `<hr class="my-1"/>总额: $${total.toFixed(4)}`
        return html
      },
    },
    legend: { type: 'scroll', bottom: 0 },
    grid: { left: '3%', right: '4%', bottom: '28%', containLabel: true },
    xAxis: { type: 'category', data: dates },
    yAxis: { type: 'value', name: '金额 ($)' },
    series,
  }

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-4">
      <h3 className="font-semibold text-gray-900 mb-4">近 14 天各 Key 使用金额</h3>
      {data.length === 0 ? (
        <div className="h-64 flex items-center justify-center text-gray-400">暂无数据</div>
      ) : (
        <ReactECharts option={option} style={{ height: 350 }} />
      )}
    </div>
  )
}

'use client'

import ReactECharts from 'echarts-for-react'
import type { DailyModelUsage } from '@/lib/types'

interface DailyUsageChartProps {
  data: DailyModelUsage[]
  days: number
  onDaysChange: (days: number) => void
}

export default function DailyUsageChart({ data, days, onDaysChange }: DailyUsageChartProps) {
  // 收集所有日期（已按升序排列）和模型名
  const dateSet = new Set<string>()
  const modelSet = new Set<string>()
  for (const r of data) {
    dateSet.add(r.date)
    modelSet.add(r.model_name)
  }
  const dates = Array.from(dateSet)
  const models = Array.from(modelSet)

  // 构建 { model -> { date -> totalTokens } } 映射
  const modelDateMap: Record<string, Record<string, number>> = {}
  for (const m of models) modelDateMap[m] = {}
  for (const r of data) {
    modelDateMap[r.model_name][r.date] = (r.input_tokens || 0) + (r.output_tokens || 0)
  }

  const colors = [
    '#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6',
    '#ec4899', '#14b8a6', '#f97316', '#06b6d4', '#84cc16',
  ]

  const series = models.map((model, i) => ({
    name: model,
    type: 'bar',
    stack: 'tokens',
    emphasis: { focus: 'series' },
    data: dates.map((d) => modelDateMap[model][d] || 0),
    itemStyle: { color: colors[i % colors.length] },
  }))

  const option = {
    tooltip: {
      trigger: 'item',
    },
    legend: { show: false },
    grid: { left: '3%', right: '4%', bottom: '3%', containLabel: true },
    xAxis: { type: 'category', data: dates },
    yAxis: { type: 'value', name: 'Tokens' },
    series,
  }

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-4">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-semibold text-gray-900">每日使用趋势</h3>
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

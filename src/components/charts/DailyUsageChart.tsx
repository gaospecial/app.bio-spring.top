'use client'

import ReactECharts from 'echarts-for-react'
import type { DailyUsage } from '@/lib/types'

interface DailyUsageChartProps {
  data: DailyUsage[]
  days: number
  onDaysChange: (days: number) => void
}

export default function DailyUsageChart({ data, days, onDaysChange }: DailyUsageChartProps) {
  const dates = data.map((d) => d.date)
  const usages = data.map((d) => parseFloat(d.total_usage))
  const tokens = data.map((d) => d.total_tokens)

  const option = {
    tooltip: {
      trigger: 'axis',
      axisPointer: { type: 'cross' },
    },
    legend: { data: ['费用 ($)', 'Tokens'] },
    grid: { left: '3%', right: '4%', bottom: '3%', containLabel: true },
    xAxis: { type: 'category', data: dates, boundaryGap: false },
    yAxis: [
      { type: 'value', name: '费用 ($)', position: 'left' },
      { type: 'value', name: 'Tokens', position: 'right' },
    ],
    series: [
      {
        name: '费用 ($)',
        type: 'line',
        smooth: true,
        data: usages,
        yAxisIndex: 0,
        itemStyle: { color: '#3b82f6' },
        areaStyle: { color: 'rgba(59,130,246,0.1)' },
      },
      {
        name: 'Tokens',
        type: 'line',
        smooth: true,
        data: tokens,
        yAxisIndex: 1,
        itemStyle: { color: '#10b981' },
      },
    ],
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

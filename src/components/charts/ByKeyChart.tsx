'use client'

import ReactECharts from 'echarts-for-react'
import type { ByKeyUsage } from '@/lib/types'

interface ByKeyChartProps {
  data: ByKeyUsage[]
}

export default function ByKeyChart({ data }: ByKeyChartProps) {
  const names = data.map((d) => d.key_name)
  const usages = data.map((d) => parseFloat(d.total_usage))
  const avgDaily = data.map((d) => parseFloat(d.avg_daily_usage))

  const option = {
    tooltip: { trigger: 'axis', axisPointer: { type: 'shadow' } },
    legend: { data: ['总使用 ($)', '日均使用 ($)'] },
    grid: { left: '3%', right: '4%', bottom: '3%', containLabel: true },
    xAxis: { type: 'value' },
    yAxis: { type: 'category', data: names },
    series: [
      {
        name: '总使用 ($)',
        type: 'bar',
        data: usages,
        itemStyle: { color: '#f59e0b' },
      },
      {
        name: '日均使用 ($)',
        type: 'bar',
        data: avgDaily,
        itemStyle: { color: '#6366f1' },
      },
    ],
  }

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-4">
      <h3 className="font-semibold text-gray-900 mb-4">按 Key 统计</h3>
      {data.length === 0 ? (
        <div className="h-64 flex items-center justify-center text-gray-400">暂无数据</div>
      ) : (
        <ReactECharts option={option} style={{ height: Math.max(200, data.length * 50) }} />
      )}
    </div>
  )
}

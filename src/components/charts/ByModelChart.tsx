'use client'

import ReactECharts from 'echarts-for-react'
import type { ByModelUsage } from '@/lib/types'

interface ByModelChartProps {
  data: ByModelUsage[]
}

export default function ByModelChart({ data }: ByModelChartProps) {
  const pieData = data.map((d) => ({
    name: d.model_name,
    value: parseFloat(d.total_cost),
  }))

  const option = {
    tooltip: { trigger: 'item', formatter: '{b}: ${c} ({d}%)' },
    legend: { show: false },
    series: [
      {
        type: 'pie',
        radius: ['40%', '70%'],
        center: ['50%', '50%'],
        avoidLabelOverlap: true,
        label: { show: true, formatter: '{b}' },
        labelLine: { show: true },
        emphasis: {
          label: { fontSize: 14, fontWeight: 'bold' },
        },
        data: pieData,
      },
    ],
  }

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-4">
      <h3 className="font-semibold text-gray-900 mb-4">按模型分布</h3>
      {data.length === 0 ? (
        <div className="h-64 flex items-center justify-center text-gray-400">暂无数据</div>
      ) : (
        <ReactECharts option={option} style={{ height: 300 }} />
      )}
    </div>
  )
}

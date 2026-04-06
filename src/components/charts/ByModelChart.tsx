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
    legend: { orient: 'vertical', right: 'right' },
    series: [
      {
        type: 'pie',
        radius: ['40%', '70%'],
        avoidLabelOverlap: true,
        label: { show: false, position: 'center' },
        emphasis: {
          label: { show: true, fontSize: 16, fontWeight: 'bold' },
        },
        labelLine: { show: false },
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

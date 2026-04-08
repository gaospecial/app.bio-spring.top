'use client'

import ReactECharts from 'echarts-for-react'
import type { OHLCItem } from '@/lib/types'

interface SensorOHLCChartProps {
  data: OHLCItem[]
  sensorName: string
  unit: string
  loading?: boolean
  interval: string
}

const intervalLabels: Record<string, string> = {
  '1h': '小时',
  '1d': '天',
  '1w': '周',
  '1M': '月',
}

export default function SensorOHLCChart({ data, sensorName, unit, loading, interval }: SensorOHLCChartProps) {
  if (loading) {
    return (
      <div className="bg-white rounded-lg border border-gray-200 p-4">
        <h3 className="font-semibold text-gray-900 mb-4">趋势图</h3>
        <div className="h-64 flex items-center justify-center text-gray-400">加载中...</div>
      </div>
    )
  }

  if (data.length === 0) {
    return (
      <div className="bg-white rounded-lg border border-gray-200 p-4">
        <h3 className="font-semibold text-gray-900 mb-4">
          {sensorName} - 趋势图（按{intervalLabels[interval] || interval}聚合）
        </h3>
        <div className="h-64 flex items-center justify-center text-gray-400">暂无数据</div>
      </div>
    )
  }

  const xData = data.map(d => new Date(d.interval_start + 'Z').toLocaleDateString('zh-CN', {
    month: 'short',
    day: 'numeric',
    ...(interval === '1h' ? { hour: '2-digit', minute: '2-digit' } : {}),
  }))

  // Candlestick data: [open, close, low, high]
  const candlestickData = data.map(d => [
    Number(d.open),
    Number(d.close),
    Number(d.low),
    Number(d.high),
  ])

  const option = {
    tooltip: {
      trigger: 'axis',
      axisPointer: { type: 'cross' },
      formatter: (params: { data: number[]; name: string }[]) => {
        if (!params || params.length === 0) return ''
        const p = params[0]
        return `
          <div style="font-size:12px">
            <strong>${p.name}</strong><br/>
            开: ${p.data[1].toFixed(2)} ${unit}<br/>
            收: ${p.data[2].toFixed(2)} ${unit}<br/>
            低: ${p.data[3].toFixed(2)} ${unit}<br/>
            高: ${p.data[4].toFixed(2)} ${unit}
          </div>
        `
      },
    },
    grid: { left: '3%', right: '4%', bottom: '10%', containLabel: true },
    xAxis: {
      type: 'category',
      data: xData,
      boundaryGap: true,
      axisLabel: { fontSize: 11 },
    },
    yAxis: {
      type: 'value',
      name: unit || '值',
      scale: true,
    },
    dataZoom: [
      { type: 'inside', start: 0, end: 100 },
      { type: 'slider', start: 0, end: 100, bottom: 10 },
    ],
    series: [
      {
        name: sensorName,
        type: 'candlestick',
        data: candlestickData,
        itemStyle: {
          color: '#ef4444',
          color0: '#22c55e',
          borderColor: '#ef4444',
          borderColor0: '#22c55e',
        },
      },
    ],
  }

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-4">
      <h3 className="font-semibold text-gray-900 mb-4">
        {sensorName} - 趋势图（按{intervalLabels[interval] || interval}聚合）
      </h3>
      <ReactECharts option={option} style={{ height: 280 }} />
    </div>
  )
}

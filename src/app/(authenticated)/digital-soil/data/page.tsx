'use client'

import { useState, useEffect, useCallback } from 'react'
import { listSoilSensors, getSensorOHLC, getSensorValues } from '@/lib/api'
import type { SensorResponse, OHLCItem, SensorValueItem } from '@/lib/types'
import SensorOHLCChart from '@/components/soil/SensorOHLCChart'
import Select from '@/components/ui/Select'
import Input from '@/components/ui/Input'
import Button from '@/components/ui/Button'
import Pagination from '@/components/ui/Pagination'
import LoadingSpinner from '@/components/ui/LoadingSpinner'

export default function DataQueryPage() {
  const [sensors, setSensors] = useState<SensorResponse[]>([])
  const [selectedSensorId, setSelectedSensorId] = useState<number | ''>('')
  const [interval, setInterval] = useState('1h')
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')
  const [ohlcData, setOhlcData] = useState<OHLCItem[]>([])
  const [values, setValues] = useState<SensorValueItem[]>([])
  const [total, setTotal] = useState(0)
  const [page, setPage] = useState(1)
  const [loadingSensors, setLoadingSensors] = useState(true)
  const [loadingChart, setLoadingChart] = useState(false)
  const [loadingTable, setLoadingTable] = useState(false)
  const pageSize = 50

  useEffect(() => {
    listSoilSensors({ active: true })
      .then(setSensors)
      .finally(() => setLoadingSensors(false))
  }, [])

  const selectedSensor = sensors.find(s => s.id === selectedSensorId)

  const fetchOHLC = useCallback(async () => {
    if (!selectedSensorId) return
    setLoadingChart(true)
    try {
      const params: { interval: string; start?: string; end?: string } = { interval }
      if (startDate) params.start = new Date(startDate).toISOString()
      if (endDate) params.end = new Date(endDate).toISOString()
      const data = await getSensorOHLC(selectedSensorId as number, params)
      setOhlcData(data)
    } catch {
      setOhlcData([])
    } finally {
      setLoadingChart(false)
    }
  }, [selectedSensorId, interval, startDate, endDate])

  const fetchValues = useCallback(async () => {
    if (!selectedSensorId) return
    setLoadingTable(true)
    try {
      const params: { page: number; page_size: number; start?: string; end?: string } = { page, page_size: pageSize }
      if (startDate) params.start = new Date(startDate).toISOString()
      if (endDate) params.end = new Date(endDate).toISOString()
      const result = await getSensorValues(selectedSensorId as number, params)
      setValues(result.items)
      setTotal(result.meta.total)
    } catch {
      setValues([])
      setTotal(0)
    } finally {
      setLoadingTable(false)
    }
  }, [selectedSensorId, page, startDate, endDate])

  useEffect(() => { fetchOHLC() }, [fetchOHLC])
  useEffect(() => { fetchValues() }, [fetchValues])

  const handleSearch = () => {
    setPage(1)
    fetchOHLC()
    fetchValues()
  }

  if (loadingSensors) return <LoadingSpinner />

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold text-gray-900">数据查询</h2>
        <p className="text-sm text-gray-500 mt-1">查询传感器时序数据与趋势图</p>
      </div>

      <div className="bg-white rounded-lg border border-gray-200 p-4">
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          <Select
            label="传感器"
            value={selectedSensorId}
            onChange={(e) => {
              setSelectedSensorId(e.target.value ? Number(e.target.value) : '')
              setPage(1)
            }}
            options={[
              { label: '请选择传感器', value: '' },
              ...sensors.map((s) => ({ label: `${s.name} (${s.sensor_sn})`, value: s.id })),
            ]}
          />
          <Select
            label="聚合间隔"
            value={interval}
            onChange={(e) => setInterval(e.target.value)}
            options={[
              { label: '1 小时', value: '1h' },
              { label: '1 天', value: '1d' },
              { label: '1 周', value: '1w' },
              { label: '1 月', value: '1M' },
            ]}
          />
          <Input
            label="开始时间"
            type="datetime-local"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
          />
          <Input
            label="结束时间"
            type="datetime-local"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
          />
          <div className="flex items-end">
            <Button onClick={handleSearch}>查询</Button>
          </div>
        </div>
      </div>

      {!selectedSensorId ? (
        <div className="bg-white rounded-lg border border-gray-200 p-8 text-center text-gray-400">
          请选择传感器以查看数据
        </div>
      ) : (
        <>
          <SensorOHLCChart
            data={ohlcData}
            sensorName={selectedSensor?.name || ''}
            unit={selectedSensor?.unit || ''}
            loading={loadingChart}
            interval={interval}
          />

          <div className="bg-white rounded-lg border border-gray-200">
            <div className="px-4 py-3 border-b border-gray-100">
              <h3 className="text-sm font-semibold text-gray-700">采集数据明细</h3>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-3 text-left font-medium text-gray-600">采集时间</th>
                    <th className="px-4 py-3 text-right font-medium text-gray-600">值</th>
                    <th className="px-4 py-3 text-left font-medium text-gray-600">单位</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {loadingTable ? (
                    <tr>
                      <td colSpan={3} className="px-4 py-8 text-center text-gray-400">加载中...</td>
                    </tr>
                  ) : values.length === 0 ? (
                    <tr>
                      <td colSpan={3} className="px-4 py-8 text-center text-gray-400">暂无数据</td>
                    </tr>
                  ) : (
                    values.map((v, i) => (
                      <tr key={`${v.collected_at}-${i}`} className="hover:bg-gray-50">
                        <td className="px-4 py-3">
                          {new Date(v.collected_at).toLocaleString('zh-CN')}
                        </td>
                        <td className="px-4 py-3 text-right font-semibold">
                          {Number(v.value).toFixed(4)}
                        </td>
                        <td className="px-4 py-3 text-gray-500">
                          {selectedSensor?.unit || '-'}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
            <div className="border-t border-gray-100 px-4 py-3">
              <Pagination page={page} pageSize={pageSize} total={total} onChange={setPage} />
            </div>
          </div>
        </>
      )}
    </div>
  )
}

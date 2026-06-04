'use client'

import { useState, useEffect, useCallback } from 'react'
import { listKeys, getSummary, getDailyUsage, getByModelUsage } from '@/lib/api'
import type { ApiKey, UsageSummary, DailyUsage, ByModelUsage } from '@/lib/types'
import DailyUsageChart from '@/components/charts/DailyUsageChart'
import ByModelChart from '@/components/charts/ByModelChart'
import LoadingSpinner from '@/components/ui/LoadingSpinner'

export default function UsagePage() {
  const [keys, setKeys] = useState<ApiKey[]>([])
  const [summary, setSummary] = useState<UsageSummary | null>(null)
  const [selectedKeyId, setSelectedKeyId] = useState<number | undefined>(undefined)
  const [days, setDays] = useState(7)
  const [dailyUsage, setDailyUsage] = useState<DailyUsage[]>([])
  const [byModel, setByModel] = useState<ByModelUsage[]>([])
  const [loading, setLoading] = useState(true)

  const selectedKey = keys.find((k) => k.id === selectedKeyId)

  const fetchData = useCallback(async () => {
    setLoading(true)
    try {
      const [k, s] = await Promise.all([listKeys(), getSummary()])
      setKeys(k)
      setSummary(s)

      const [d, m] = await Promise.all([
        getDailyUsage(days, selectedKeyId),
        getByModelUsage(selectedKeyId),
      ])
      setDailyUsage(d)
      setByModel(m)
    } catch {
      /* empty */
    } finally {
      setLoading(false)
    }
  }, [days, selectedKeyId])

  useEffect(() => { fetchData() }, [fetchData])

  // 金额 = 从用量记录中统计的总消费
  const totalCost = byModel.reduce((s, m) => s + parseFloat(m.total_cost), 0)

  if (loading) return <LoadingSpinner />

  // 额度：选中 key 时取 balance_total，未选中取 summary.total_granted
  const quota =
    selectedKey
      ? Number(selectedKey.balance_total ?? 0)
      : summary
        ? Number(summary.total_granted)
        : 0
  // 使用的金额：选中 key 时取 balance_used，未选中取 summary.total_used
  const amountUsed =
    selectedKey
      ? Number(selectedKey.balance_used ?? 0)
      : summary
        ? Number(summary.total_used)
        : 0

  return (
    <div className="space-y-6">
      {/* Header + Key Selector */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-gray-900">用量图表</h2>
          <p className="text-sm text-gray-500 mt-1">查看 Key 的额度消耗趋势</p>
        </div>
        <select
          value={selectedKeyId ?? ''}
          onChange={(e) => setSelectedKeyId(e.target.value ? Number(e.target.value) : undefined)}
          className="border border-gray-300 rounded-lg px-3 py-2 text-sm bg-white"
        >
          <option value="">全部 Key</option>
          {keys.map((k) => (
            <option key={k.id} value={k.id}>
              {k.name}
            </option>
          ))}
        </select>
      </div>

      {/* 额度 / 金额 / 使用的金额 */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <p className="text-sm text-gray-500">额度</p>
          <p className="text-2xl font-bold text-blue-600">
            ${quota.toFixed(2)}
          </p>
        </div>
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <p className="text-sm text-gray-500">金额</p>
          <p className="text-2xl font-bold text-orange-600">
            ${totalCost.toFixed(2)}
          </p>
        </div>
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <p className="text-sm text-gray-500">使用的金额</p>
          <p className="text-2xl font-bold text-green-600">
            ${amountUsed.toFixed(2)}
          </p>
        </div>
      </div>

      <DailyUsageChart data={dailyUsage} days={days} onDaysChange={setDays} />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <ByModelChart data={byModel} />
      </div>
    </div>
  )
}

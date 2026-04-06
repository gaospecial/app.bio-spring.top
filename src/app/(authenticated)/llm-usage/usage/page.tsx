'use client'

import { useState, useEffect, useCallback } from 'react'
import { getDailyUsage, getByKeyUsage, getByModelUsage } from '@/lib/api'
import type { DailyUsage, ByKeyUsage, ByModelUsage } from '@/lib/types'
import DailyUsageChart from '@/components/charts/DailyUsageChart'
import ByKeyChart from '@/components/charts/ByKeyChart'
import ByModelChart from '@/components/charts/ByModelChart'
import LoadingSpinner from '@/components/ui/LoadingSpinner'

export default function UsagePage() {
  const [days, setDays] = useState(7)
  const [daily, setDaily] = useState<DailyUsage[]>([])
  const [byKey, setByKey] = useState<ByKeyUsage[]>([])
  const [byModel, setByModel] = useState<ByModelUsage[]>([])
  const [loading, setLoading] = useState(true)

  const fetchData = useCallback(async () => {
    setLoading(true)
    try {
      const [d, k, m] = await Promise.all([
        getDailyUsage(days),
        getByKeyUsage(days),
        getByModelUsage(),
      ])
      setDaily(d)
      setByKey(k)
      setByModel(m)
    } catch {
      /* empty */
    } finally {
      setLoading(false)
    }
  }, [days])

  useEffect(() => { fetchData() }, [fetchData])

  if (loading) return <LoadingSpinner />

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold text-gray-900">用量图表</h2>
        <p className="text-sm text-gray-500 mt-1">查看使用趋势和分布</p>
      </div>
      <DailyUsageChart data={daily} days={days} onDaysChange={setDays} />
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <ByKeyChart data={byKey} />
        <ByModelChart data={byModel} />
      </div>
    </div>
  )
}

'use client'

import { useState, useEffect, useCallback } from 'react'
import { getSummary, getDailyUsage } from '@/lib/api'
import type { UsageSummary, DailyUsage } from '@/lib/types'
import SummaryCards from '@/components/dashboard/SummaryCards'
import KeySummaryTable from '@/components/dashboard/KeySummaryTable'
import DailyUsageByKeyChart from '@/components/charts/DailyUsageByKeyChart'
import LoadingSpinner from '@/components/ui/LoadingSpinner'

export default function DashboardPage() {
  const [summary, setSummary] = useState<UsageSummary | null>(null)
  const [dailyUsage, setDailyUsage] = useState<DailyUsage[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const fetchData = useCallback(async () => {
    setLoading(true)
    setError('')
    try {
      const [s, d] = await Promise.all([getSummary(), getDailyUsage(7)])
      setSummary(s)
      setDailyUsage(d)
    } catch (err) {
      setError(err instanceof Error ? err.message : '加载失败')
    } finally {
      setLoading(false)
    }
  }, [])

  if (loading) return <LoadingSpinner />
  if (error) return <div className="text-red-500 p-4">{error}</div>
  if (!summary) return null

  const keyNames: Record<number, string> = {}
  summary.keys.forEach((k) => { keyNames[k.key_id] = k.key_name })

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold text-gray-900">总览</h2>
        <p className="text-sm text-gray-500 mt-1">
          {summary.active_keys} / {summary.total_keys} 个 KEY 活跃
        </p>
      </div>
      <SummaryCards
        totalGranted={summary.total_granted}
        totalUsed={summary.total_used}
        totalRemaining={summary.total_remaining}
      />
      <DailyUsageByKeyChart data={dailyUsage} keyNames={keyNames} />
      <KeySummaryTable keys={summary.keys} />
    </div>
  )
}

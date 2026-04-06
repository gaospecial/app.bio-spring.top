'use client'

import { useState, useCallback, useEffect } from 'react'
import { getDetails } from '@/lib/api'
import type { UsageDetailItem } from '@/lib/types'
import DetailFilters from '@/components/details/DetailFilters'
import DetailTable from '@/components/details/DetailTable'
import LoadingSpinner from '@/components/ui/LoadingSpinner'

export default function DetailsPage() {
  const [keyId, setKeyId] = useState<number | undefined>(undefined)
  const [date, setDate] = useState('')
  const [modelName, setModelName] = useState('')
  const [page, setPage] = useState(1)
  const [items, setItems] = useState<UsageDetailItem[]>([])
  const [total, setTotal] = useState(0)
  const [loading, setLoading] = useState(true)
  const pageSize = 20

  const fetchData = useCallback(async () => {
    setLoading(true)
    try {
      const result = await getDetails({ key_id: keyId, date: date || undefined, model_name: modelName || undefined, page, page_size: pageSize })
      setItems(result.items)
      setTotal(result.meta.total)
    } catch {
      /* empty */
    } finally {
      setLoading(false)
    }
  }, [keyId, date, modelName, page])

  useEffect(() => { fetchData() }, [fetchData])

  const handleSearch = () => {
    setPage(1)
    fetchData()
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold text-gray-900">明细查询</h2>
        <p className="text-sm text-gray-500 mt-1">查询和筛选用量明细记录</p>
      </div>
      <DetailFilters
        keyId={keyId}
        date={date}
        modelName={modelName}
        onKeyIdChange={setKeyId}
        onDateChange={setDate}
        onModelNameChange={setModelName}
        onSearch={handleSearch}
      />
      <DetailTable
        items={items}
        page={page}
        pageSize={pageSize}
        total={total}
        onPageChange={setPage}
        loading={loading}
      />
    </div>
  )
}

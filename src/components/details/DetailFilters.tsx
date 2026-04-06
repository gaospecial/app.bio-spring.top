'use client'

import { useState, useEffect } from 'react'
import { listKeys } from '@/lib/api'
import type { ApiKey } from '@/lib/types'
import Input from '@/components/ui/Input'
import Select from '@/components/ui/Select'
import Button from '@/components/ui/Button'

interface DetailFiltersProps {
  keyId: number | undefined
  date: string
  modelName: string
  onKeyIdChange: (id: number | undefined) => void
  onDateChange: (date: string) => void
  onModelNameChange: (name: string) => void
  onSearch: () => void
}

export default function DetailFilters({
  keyId,
  date,
  modelName,
  onKeyIdChange,
  onDateChange,
  onModelNameChange,
  onSearch,
}: DetailFiltersProps) {
  const [keys, setKeys] = useState<ApiKey[]>([])

  useEffect(() => {
    listKeys().then(setKeys).catch(() => {})
  }, [])

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') onSearch()
  }

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-4">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Select
          label="API Key"
          value={keyId ?? ''}
          onChange={(e) => onKeyIdChange(e.target.value ? Number(e.target.value) : undefined)}
          options={[
            { label: '全部', value: '' },
            ...keys.map((k) => ({ label: k.name, value: k.id })),
          ]}
        />
        <Input
          label="日期"
          type="date"
          value={date}
          onChange={(e) => onDateChange(e.target.value)}
          onKeyDown={handleKeyDown}
        />
        <Input
          label="模型名称"
          value={modelName}
          onChange={(e) => onModelNameChange(e.target.value)}
          placeholder="例如：gpt-4o"
          onKeyDown={handleKeyDown}
        />
        <div className="flex items-end">
          <Button onClick={onSearch}>查询</Button>
        </div>
      </div>
    </div>
  )
}

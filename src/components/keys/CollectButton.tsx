'use client'

import { useState } from 'react'
import { collectKey } from '@/lib/api'
import type { CollectResult } from '@/lib/types'
import Button from '@/components/ui/Button'

interface CollectButtonProps {
  keyId: number
  onDone: (result: CollectResult) => void
}

export default function CollectButton({ keyId, onDone }: CollectButtonProps) {
  const [loading, setLoading] = useState(false)

  const handleCollect = async () => {
    setLoading(true)
    try {
      const result = await collectKey(keyId)
      onDone(result)
    } catch {
      alert('采集失败')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Button size="sm" variant="ghost" onClick={handleCollect} disabled={loading}>
      {loading ? '采集中...' : '采集'}
    </Button>
  )
}

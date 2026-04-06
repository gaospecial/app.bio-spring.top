'use client'

import { useState, useEffect } from 'react'
import Modal from '@/components/ui/Modal'
import Button from '@/components/ui/Button'
import Input from '@/components/ui/Input'
import type { ApiKey, ApiKeyCreate, ApiKeyUpdate } from '@/lib/types'

interface KeyFormModalProps {
  open: boolean
  onClose: () => void
  onSubmit: (data: ApiKeyCreate | ApiKeyUpdate) => Promise<void>
  editingKey: ApiKey | null
  loading?: boolean
}

export default function KeyFormModal({ open, onClose, onSubmit, editingKey, loading }: KeyFormModalProps) {
  const [name, setName] = useState('')
  const [apiKey, setApiKey] = useState('')
  const [baseUrl, setBaseUrl] = useState('https://api.chatanywhere.cn')
  const [isActive, setIsActive] = useState(true)

  useEffect(() => {
    if (editingKey) {
      setName(editingKey.name)
      setApiKey('')
      setBaseUrl(editingKey.base_url)
      setIsActive(editingKey.is_active)
    } else {
      setName('')
      setApiKey('')
      setBaseUrl('https://api.chatanywhere.cn')
      setIsActive(true)
    }
  }, [editingKey, open])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (editingKey) {
      const data: ApiKeyUpdate = { name, is_active: isActive }
      if (apiKey) data.api_key = apiKey
      if (baseUrl) data.base_url = baseUrl
      await onSubmit(data)
    } else {
      await onSubmit({ name, api_key: apiKey, base_url: baseUrl, is_active: isActive })
    }
  }

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={editingKey ? '编辑 API Key' : '新增 API Key'}
      footer={
        <>
          <Button variant="secondary" onClick={onClose} disabled={loading}>取消</Button>
          <Button onClick={() => void handleSubmit({ preventDefault: () => {} } as React.FormEvent)} disabled={loading}>
            {loading ? '保存中...' : '保存'}
          </Button>
        </>
      }
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <Input label="名称" value={name} onChange={(e) => setName(e.target.value)} placeholder="例如：主力 KEY" required />
        <Input label="API Key" type="password" value={apiKey} onChange={(e) => setApiKey(e.target.value)} placeholder={editingKey ? '留空则不修改' : 'sk-xxxxx'} required={!editingKey} />
        <Input label="Base URL" value={baseUrl} onChange={(e) => setBaseUrl(e.target.value)} />
        <label className="flex items-center gap-2 text-sm">
          <input type="checkbox" checked={isActive} onChange={(e) => setIsActive(e.target.checked)} className="rounded" />
          启用
        </label>
      </form>
    </Modal>
  )
}

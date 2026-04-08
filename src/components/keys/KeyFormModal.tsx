'use client'

import { useState, useEffect } from 'react'
import Modal from '@/components/ui/Modal'
import Button from '@/components/ui/Button'
import Input from '@/components/ui/Input'
import Select from '@/components/ui/Select'
import { listLlmProviders } from '@/lib/api'
import type { ApiKey, ApiKeyCreate, ApiKeyUpdate, LlmProviderInfo } from '@/lib/types'

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
  const [provider, setProvider] = useState('chatanywhere')
  const [baseUrl, setBaseUrl] = useState('')
  const [isActive, setIsActive] = useState(true)
  const [providers, setProviders] = useState<LlmProviderInfo[]>([])

  useEffect(() => {
    if (open) {
      listLlmProviders().then(setProviders).catch(() => setProviders([]))
    }
  }, [open])

  useEffect(() => {
    if (editingKey) {
      setName(editingKey.name)
      setApiKey('')
      setProvider(editingKey.provider || 'chatanywhere')
      setBaseUrl(editingKey.base_url)
      setIsActive(editingKey.is_active)
    } else {
      setName('')
      setApiKey('')
      setProvider('chatanywhere')
      setBaseUrl('')
      setIsActive(true)
    }
  }, [editingKey, open])

  // 新增模式下，选择 provider 时自动填充 base_url
  const handleProviderChange = (value: string) => {
    setProvider(value)
    if (!editingKey) {
      const p = providers.find((p) => p.type === value)
      if (p?.base_url) setBaseUrl(p.base_url)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (editingKey) {
      const data: ApiKeyUpdate = { name, is_active: isActive }
      if (apiKey) data.api_key = apiKey
      if (baseUrl) data.base_url = baseUrl
      await onSubmit(data)
    } else {
      await onSubmit({ name, api_key: apiKey, provider, base_url: baseUrl, is_active: isActive })
    }
  }

  const providerOptions = providers.map((p) => ({ label: p.name, value: p.type }))
  if (!providerOptions.find((o) => o.value === provider)) {
    providerOptions.unshift({ label: provider, value: provider })
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
        {providerOptions.length > 0 && (
          <Select
            label="Provider"
            options={providerOptions}
            value={provider}
            onChange={(e) => handleProviderChange(e.target.value)}
            disabled={!!editingKey}
          />
        )}
        <Input label="Base URL" value={baseUrl} onChange={(e) => setBaseUrl(e.target.value)} />
        <label className="flex items-center gap-2 text-sm">
          <input type="checkbox" checked={isActive} onChange={(e) => setIsActive(e.target.checked)} className="rounded" />
          启用
        </label>
      </form>
    </Modal>
  )
}

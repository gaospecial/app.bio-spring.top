'use client'

import { useState, useEffect, useCallback } from 'react'
import { listKeys, createKey, updateKey, deleteKey, collectKey } from '@/lib/api'
import type { ApiKey, ApiKeyCreate, ApiKeyUpdate, CollectResult } from '@/lib/types'
import KeyTable from '@/components/keys/KeyTable'
import KeyFormModal from '@/components/keys/KeyFormModal'
import Button from '@/components/ui/Button'
import Card from '@/components/ui/Card'
import ConfirmDialog from '@/components/ui/ConfirmDialog'
import LoadingSpinner from '@/components/ui/LoadingSpinner'

export default function KeysPage() {
  const [keys, setKeys] = useState<ApiKey[]>([])
  const [loading, setLoading] = useState(true)
  const [modalOpen, setModalOpen] = useState(false)
  const [editingKey, setEditingKey] = useState<ApiKey | null>(null)
  const [deleteTarget, setDeleteTarget] = useState<ApiKey | null>(null)
  const [collecting, setCollecting] = useState<number | null>(null)
  const [saving, setSaving] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [toast, setToast] = useState('')

  const fetchKeys = useCallback(async () => {
    setLoading(true)
    try {
      const data = await listKeys()
      setKeys(data)
    } catch {
      /* empty */
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { fetchKeys() }, [fetchKeys])

  const handleAdd = () => {
    setEditingKey(null)
    setModalOpen(true)
  }

  const handleEdit = (key: ApiKey) => {
    setEditingKey(key)
    setModalOpen(true)
  }

  const handleSubmit = async (data: ApiKeyCreate | ApiKeyUpdate) => {
    setSaving(true)
    try {
      if (editingKey) {
        await updateKey(editingKey.id, data as ApiKeyUpdate)
      } else {
        await createKey(data as ApiKeyCreate)
      }
      setModalOpen(false)
      fetchKeys()
    } catch {
      alert('保存失败')
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async () => {
    if (!deleteTarget) return
    setDeleting(true)
    try {
      await deleteKey(deleteTarget.id)
      setDeleteTarget(null)
      fetchKeys()
    } catch {
      alert('删除失败')
    } finally {
      setDeleting(false)
    }
  }

  const handleCollect = async (key: ApiKey) => {
    setCollecting(key.id)
    try {
      const result = await collectKey(key.id)
      setToast(`采集完成：${result.records_inserted} 条记录，${result.details_inserted} 条明细`)
      setTimeout(() => setToast(''), 4000)
      fetchKeys()
    } catch {
      alert('采集失败')
    } finally {
      setCollecting(null)
    }
  }

  if (loading) return <LoadingSpinner />

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-gray-900">API Key 管理</h2>
          <p className="text-sm text-gray-500 mt-1">管理 ChatAnywhere API Key</p>
        </div>
        <Button onClick={handleAdd}>新增 Key</Button>
      </div>

      {toast && (
        <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg text-sm">
          {toast}
        </div>
      )}

      <Card>
        <KeyTable
          keys={keys}
          onEdit={handleEdit}
          onDelete={setDeleteTarget}
          onCollect={handleCollect}
          collecting={collecting}
        />
      </Card>

      <KeyFormModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        onSubmit={handleSubmit}
        editingKey={editingKey}
        loading={saving}
      />

      <ConfirmDialog
        open={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDelete}
        title="删除 API Key"
        message={`确定要删除 "${deleteTarget?.name}" 吗？此操作不可恢复。`}
        loading={deleting}
      />
    </div>
  )
}

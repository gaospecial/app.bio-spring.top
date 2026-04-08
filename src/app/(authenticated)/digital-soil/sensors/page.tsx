'use client'

import { useState, useEffect, useCallback } from 'react'
import { listSoilSensors, listSoilProviders, updateSoilSensor, deleteSoilSensor } from '@/lib/api'
import type { SensorResponse, SensorUpdate, ProviderResponse } from '@/lib/types'
import SensorTable from '@/components/soil/SensorTable'
import SensorEditModal from '@/components/soil/SensorEditModal'
import Select from '@/components/ui/Select'
import Badge from '@/components/ui/Badge'
import ConfirmDialog from '@/components/ui/ConfirmDialog'
import LoadingSpinner from '@/components/ui/LoadingSpinner'

export default function SensorsPage() {
  const [sensors, setSensors] = useState<SensorResponse[]>([])
  const [providers, setProviders] = useState<ProviderResponse[]>([])
  const [loading, setLoading] = useState(true)
  const [providerFilter, setProviderFilter] = useState('')
  const [activeFilter, setActiveFilter] = useState('')
  const [editingSensor, setEditingSensor] = useState<SensorResponse | null>(null)
  const [deleteTarget, setDeleteTarget] = useState<SensorResponse | null>(null)
  const [saving, setSaving] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [toast, setToast] = useState('')

  const fetchData = useCallback(async () => {
    setLoading(true)
    try {
      const params: { provider_id?: number; active?: boolean } = {}
      if (providerFilter) params.provider_id = Number(providerFilter)
      if (activeFilter) params.active = activeFilter === 'true'
      const [sensorList, providerList] = await Promise.all([
        listSoilSensors(params),
        listSoilProviders(),
      ])
      setSensors(sensorList)
      setProviders(providerList)
    } catch {
      /* empty */
    } finally {
      setLoading(false)
    }
  }, [providerFilter, activeFilter])

  useEffect(() => { fetchData() }, [fetchData])

  const handleEdit = (sensor: SensorResponse) => {
    setEditingSensor(sensor)
  }

  const handleSubmitEdit = async (data: SensorUpdate) => {
    if (!editingSensor) return
    setSaving(true)
    try {
      await updateSoilSensor(editingSensor.id, data)
      setEditingSensor(null)
      setToast('传感器更新成功')
      setTimeout(() => setToast(''), 3000)
      fetchData()
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
      await deleteSoilSensor(deleteTarget.id)
      setDeleteTarget(null)
      setToast('传感器已删除')
      setTimeout(() => setToast(''), 3000)
      fetchData()
    } catch {
      alert('删除失败')
    } finally {
      setDeleting(false)
    }
  }

  const providerName = (id: number) => providers.find(p => p.id === id)?.name || String(id)

  if (loading) return <LoadingSpinner />

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold text-gray-900">传感器管理</h2>
        <p className="text-sm text-gray-500 mt-1">查看和管理土壤传感器</p>
      </div>

      <div className="bg-white rounded-lg border border-gray-200 p-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          <Select
            label="数据源"
            value={providerFilter}
            onChange={(e) => setProviderFilter(e.target.value)}
            options={[
              { label: '全部', value: '' },
              ...providers.map((p) => ({ label: p.name, value: p.id })),
            ]}
          />
          <Select
            label="状态"
            value={activeFilter}
            onChange={(e) => setActiveFilter(e.target.value)}
            options={[
              { label: '全部', value: '' },
              { label: '启用', value: 'true' },
              { label: '停用', value: 'false' },
            ]}
          />
          <div className="flex items-end">
            <Badge variant="default">
              共 {sensors.length} 个传感器
            </Badge>
          </div>
        </div>
      </div>

      {toast && (
        <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg text-sm">
          {toast}
        </div>
      )}

      <SensorTable
        sensors={sensors}
        providerName={providerName}
        onEdit={handleEdit}
        onDelete={setDeleteTarget}
      />

      <SensorEditModal
        sensor={editingSensor}
        onClose={() => setEditingSensor(null)}
        onSubmit={handleSubmitEdit}
        loading={saving}
      />

      <ConfirmDialog
        open={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDelete}
        title="删除传感器"
        message={`确定要删除传感器 "${deleteTarget?.name}" 吗？此操作将同时删除关联的采集数据。`}
        loading={deleting}
      />
    </div>
  )
}

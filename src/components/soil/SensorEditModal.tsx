'use client'

import { useState, useEffect } from 'react'
import type { SensorResponse, SensorUpdate } from '@/lib/types'
import Modal from '@/components/ui/Modal'
import Input from '@/components/ui/Input'
import Select from '@/components/ui/Select'
import Button from '@/components/ui/Button'

interface SensorEditModalProps {
  sensor: SensorResponse | null
  onClose: () => void
  onSubmit: (data: SensorUpdate) => void
  loading: boolean
}

export default function SensorEditModal({ sensor, onClose, onSubmit, loading }: SensorEditModalProps) {
  const [name, setName] = useState('')
  const [location, setLocation] = useState('')
  const [unit, setUnit] = useState('')
  const [isActive, setIsActive] = useState('true')

  useEffect(() => {
    if (sensor) {
      setName(sensor.name)
      setLocation(sensor.location || '')
      setUnit(sensor.unit || '')
      setIsActive(String(sensor.is_active))
    }
  }, [sensor])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSubmit({
      name: name || undefined,
      location: location || undefined,
      unit: unit || undefined,
      is_active: isActive === 'true',
    })
  }

  return (
    <Modal
      open={!!sensor}
      onClose={onClose}
      title="编辑传感器"
      footer={
        <>
          <Button variant="secondary" onClick={onClose} disabled={loading}>取消</Button>
          <Button onClick={handleSubmit} disabled={loading}>
            {loading ? '保存中...' : '保存'}
          </Button>
        </>
      }
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <Input
          label="名称"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
        />
        <Input
          label="位置"
          value={location}
          onChange={(e) => setLocation(e.target.value)}
          placeholder="例如：山东济南历城区试验田A"
        />
        <Input
          label="单位"
          value={unit}
          onChange={(e) => setUnit(e.target.value)}
          placeholder="例如：℃, %, mS/cm"
        />
        <Select
          label="状态"
          value={isActive}
          onChange={(e) => setIsActive(e.target.value)}
          options={[
            { label: '启用', value: 'true' },
            { label: '停用', value: 'false' },
          ]}
        />
        {sensor && (
          <div className="text-xs text-gray-400 pt-2">
            序列号: {sensor.sensor_sn} | ID: {sensor.id}
          </div>
        )}
      </form>
    </Modal>
  )
}

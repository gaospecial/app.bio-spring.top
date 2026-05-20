'use client'

import { useState, useEffect } from 'react'
import Modal from '@/components/ui/Modal'
import Input from '@/components/ui/Input'
import Select from '@/components/ui/Select'
import Button from '@/components/ui/Button'
import type { BiogasArticle } from '@/lib/types'
import { CROP_OPTIONS, SLURRY_TYPE_OPTIONS } from '@/lib/biogas-vocab'

interface ArticleEditModalProps {
  open: boolean
  article: BiogasArticle | null
  onClose: () => void
  onSave: (id: string, data: Partial<BiogasArticle>) => void
  saving: boolean
}

const CATEGORY_OPTIONS = [
  { label: '未分类', value: '' },
  ...CROP_OPTIONS,
]

const STATUS_OPTIONS = [
  { label: '已发布', value: 'published' },
  { label: '草稿', value: 'draft' },
]

export default function ArticleEditModal({ open, article, onClose, onSave, saving }: ArticleEditModalProps) {
  const [form, setForm] = useState({
    title: '',
    subtitle: '',
    category: '',
    status: '',
    slurry_type: '',
    crop: '',
    soil_type: '',
    dosage: '',
    application_method: '',
    yield_benefit: '',
    quality_benefit: '',
    risk_control: '',
    source_citation: '',
    authors: '',
  })
  const [points, setPoints] = useState<string[]>([])
  const [newPoint, setNewPoint] = useState('')

  useEffect(() => {
    if (article) {
      setForm({
        title: article.title ?? '',
        subtitle: article.subtitle ?? '',
        category: article.category ?? '',
        status: article.status ?? 'published',
        slurry_type: article.slurry_type ?? '',
        crop: article.crop ?? '',
        soil_type: article.soil_type ?? '',
        dosage: article.dosage ?? '',
        application_method: article.application_method ?? '',
        yield_benefit: article.yield_benefit ?? '',
        quality_benefit: article.quality_benefit ?? '',
        risk_control: article.risk_control ?? '',
        source_citation: article.source_citation ?? '',
        authors: article.authors ?? '',
      })
      setPoints(article.understanding_points ?? [])
    }
  }, [article])

  if (!article) return null

  const update = (key: string, value: string) => setForm((prev) => ({ ...prev, [key]: value }))

  const addPoint = () => {
    if (newPoint.trim()) {
      setPoints((prev) => [...prev, newPoint.trim()])
      setNewPoint('')
    }
  }

  const removePoint = (index: number) => {
    setPoints((prev) => prev.filter((_, i) => i !== index))
  }

  const handleSave = () => {
    onSave(article.id, {
      ...form,
      category: form.category || null,
      understanding_points: points.length > 0 ? points : null,
    })
  }

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="编辑文章"
      footer={
        <>
          <Button variant="secondary" onClick={onClose} disabled={saving}>取消</Button>
          <Button variant="primary" onClick={handleSave} disabled={saving}>
            {saving ? '保存中...' : '保存'}
          </Button>
        </>
      }
    >
      <div className="space-y-4 max-h-[60vh] overflow-y-auto pr-2">
        <Input label="标题" value={form.title} onChange={(e) => update('title', e.target.value)} />
        <Input label="副标题" value={form.subtitle} onChange={(e) => update('subtitle', e.target.value)} />

        <div className="grid grid-cols-2 gap-4">
          <Select label="分类" options={CATEGORY_OPTIONS} value={form.category} onChange={(e) => update('category', e.target.value)} />
          <Select label="状态" options={STATUS_OPTIONS} value={form.status} onChange={(e) => update('status', e.target.value)} />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <Select label="沼液类型" options={[{ label: '未指定', value: '' }, ...SLURRY_TYPE_OPTIONS]} value={form.slurry_type} onChange={(e) => update('slurry_type', e.target.value)} />
          <Select label="作物" options={[{ label: '未指定', value: '' }, ...CROP_OPTIONS]} value={form.crop} onChange={(e) => update('crop', e.target.value)} />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <Input label="土壤类型" value={form.soil_type} onChange={(e) => update('soil_type', e.target.value)} />
          <Input label="用量" value={form.dosage} onChange={(e) => update('dosage', e.target.value)} />
        </div>

        <Input label="施用方式" value={form.application_method} onChange={(e) => update('application_method', e.target.value)} />
        <Input label="增产效果" value={form.yield_benefit} onChange={(e) => update('yield_benefit', e.target.value)} />
        <Input label="品质改善" value={form.quality_benefit} onChange={(e) => update('quality_benefit', e.target.value)} />

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">风险关注</label>
          <textarea
            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            rows={3}
            value={form.risk_control}
            onChange={(e) => update('risk_control', e.target.value)}
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">理解要点</label>
          <ul className="space-y-2 mb-2">
            {points.map((point, i) => (
              <li key={i} className="flex items-center gap-2 text-sm text-gray-700 bg-gray-50 rounded-lg px-3 py-2">
                <span className="flex-1">{point}</span>
                <button
                  type="button"
                  onClick={() => removePoint(i)}
                  className="text-red-400 hover:text-red-600 text-xs"
                >
                  删除
                </button>
              </li>
            ))}
          </ul>
          <div className="flex gap-2">
            <Input
              placeholder="添加新要点..."
              value={newPoint}
              onChange={(e) => setNewPoint(e.target.value)}
              onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); addPoint() } }}
            />
            <Button variant="secondary" size="sm" onClick={addPoint}>添加</Button>
          </div>
        </div>

        <Input label="引用来源" value={form.source_citation} onChange={(e) => update('source_citation', e.target.value)} />
        <Input label="作者" value={form.authors} onChange={(e) => update('authors', e.target.value)} />
      </div>
    </Modal>
  )
}

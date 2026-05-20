'use client'

import { useCallback, useRef, useState } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { uploadBiogasPaper, processBiogasPaper } from '@/lib/api'
import Card from '@/components/ui/Card'
import Badge from '@/components/ui/Badge'

interface UploadItem {
  key: string
  file: File
  status: 'uploading' | 'processing' | 'done' | 'error'
  error?: string
}

const UPLOAD_STATUS: Record<UploadItem['status'], { text: string; variant: 'default' | 'success' | 'warning' | 'error' }> = {
  uploading: { text: '上传中...', variant: 'default' },
  processing: { text: '处理中...', variant: 'warning' },
  done: { text: '完成', variant: 'success' },
  error: { text: '失败', variant: 'error' },
}

export default function BiogasUploadPage() {
  const [dragOver, setDragOver] = useState(false)
  const [uploads, setUploads] = useState<UploadItem[]>([])
  const fileInputRef = useRef<HTMLInputElement>(null)
  const queryClient = useQueryClient()
  const nextKey = useRef(0)

  const updateUpload = useCallback(
    (key: string, patch: Partial<UploadItem>) => {
      setUploads((prev) => prev.map((u) => (u.key === key ? { ...u, ...patch } : u)))
    },
    []
  )

  const handleFiles = useCallback(
    (files: FileList | File[]) => {
      const pdfFiles = Array.from(files).filter(
        (f) => f.type === 'application/pdf' || f.name.toLowerCase().endsWith('.pdf')
      )
      if (pdfFiles.length === 0) return

      const newItems: UploadItem[] = pdfFiles.map((file) => ({
        key: `upload-${nextKey.current++}`,
        file,
        status: 'uploading',
      }))
      setUploads((prev) => [...newItems, ...prev])

      for (const item of newItems) {
        uploadBiogasPaper(item.file)
          .then(({ id }) => {
            updateUpload(item.key, { status: 'processing' })
            return processBiogasPaper(id)
          })
          .then(() => {
            updateUpload(item.key, { status: 'done' })
            queryClient.invalidateQueries({ queryKey: ['biogas-papers'] })
          })
          .catch((err: unknown) => {
            const msg = err instanceof Error ? err.message : '未知错误'
            console.error(`[biogas-upload] ${item.file.name}: ${msg}`, err)
            updateUpload(item.key, { status: 'error', error: msg })
          })
      }
    },
    [queryClient, updateUpload]
  )

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault()
      setDragOver(false)
      handleFiles(e.dataTransfer.files)
    },
    [handleFiles]
  )

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold text-gray-900">文献上传</h2>
        <p className="text-sm text-gray-500 mt-1">上传 PDF 论文，系统将自动进行解析和解读</p>
      </div>

      <Card className="p-6">
        <div
          onDrop={handleDrop}
          onDragOver={(e) => { e.preventDefault(); setDragOver(true) }}
          onDragLeave={(e) => { e.preventDefault(); setDragOver(false) }}
          onClick={() => fileInputRef.current?.click()}
          className={`cursor-pointer rounded-xl border-2 border-dashed p-8 text-center transition ${
            dragOver
              ? 'border-blue-500 bg-blue-50'
              : 'border-gray-300 hover:border-blue-400 hover:bg-blue-50/50'
          }`}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept=".pdf"
            multiple
            className="hidden"
            onChange={(e) => {
              if (e.target.files && e.target.files.length > 0) {
                handleFiles(e.target.files)
                e.target.value = ''
              }
            }}
          />
          <p className="text-lg font-medium text-gray-700">拖拽 PDF 文件到此处，或点击选择</p>
          <p className="text-sm text-gray-500 mt-1">支持批量上传，仅接受 PDF 格式</p>
        </div>
      </Card>

      {uploads.length > 0 && (
        <Card className="p-4">
          <h3 className="text-sm font-medium text-gray-700 mb-3">上传进度</h3>
          <ul className="space-y-2">
            {uploads.map((item) => {
              const info = UPLOAD_STATUS[item.status]
              return (
                <li key={item.key} className="flex items-center justify-between rounded-lg bg-gray-50 px-4 py-2">
                  <span className="truncate text-sm text-gray-700">{item.file.name}</span>
                  <Badge variant={info.variant}>{info.text}</Badge>
                </li>
              )
            })}
          </ul>
        </Card>
      )}
    </div>
  )
}

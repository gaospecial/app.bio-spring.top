'use client'

import { useEffect, useMemo, useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { listBiogasPapers, processBiogasPaper, resetBiogasPaper, deleteBiogasPaper } from '@/lib/api'
import type { BiogasPaper } from '@/lib/types'
import Card from '@/components/ui/Card'
import Table from '@/components/ui/Table'
import Badge from '@/components/ui/Badge'
import Button from '@/components/ui/Button'
import Input from '@/components/ui/Input'
import Select from '@/components/ui/Select'
import ConfirmDialog from '@/components/ui/ConfirmDialog'

const STATUS: Record<string, { text: string; variant: 'default' | 'success' | 'warning' | 'error' }> = {
  uploaded: { text: '待解析', variant: 'default' },
  processing: { text: '解析中', variant: 'warning' },
  completed: { text: '已完成', variant: 'success' },
  failed: { text: '失败', variant: 'error' },
}

const STATUS_OPTIONS = [
  { label: '全部状态', value: '' },
  { label: '待解析', value: 'uploading' },
  { label: '解析中', value: 'processing' },
  { label: '已完成', value: 'completed' },
  { label: '失败', value: 'failed' },
]

type ConfirmAction = { type: 'reset' | 'delete'; paper: BiogasPaper }

export default function BiogasParsingPage() {
  const queryClient = useQueryClient()
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [confirm, setConfirm] = useState<ConfirmAction | null>(null)

  const { data: papers, isLoading } = useQuery({
    queryKey: ['biogas-papers'],
    queryFn: listBiogasPapers,
  })

  const retryMutation = useMutation({
    mutationFn: (paperId: string) => processBiogasPaper(paperId),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['biogas-papers'] }),
  })

  const resetMutation = useMutation({
    mutationFn: (paperId: string) => resetBiogasPaper(paperId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['biogas-papers'] })
      setConfirm(null)
    },
  })

  const deleteMutation = useMutation({
    mutationFn: (paperId: string) => deleteBiogasPaper(paperId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['biogas-papers'] })
      setConfirm(null)
    },
  })

  // Auto-refresh when any paper is processing
  const hasProcessing = papers?.some((p) => p.status === 'processing')
  useEffect(() => {
    if (!hasProcessing) return
    const timer = setInterval(() => {
      queryClient.invalidateQueries({ queryKey: ['biogas-papers'] })
    }, 8000)
    return () => clearInterval(timer)
  }, [hasProcessing, queryClient])

  const filtered = useMemo(() => {
    if (!papers) return []
    return papers.filter((p) => {
      const matchSearch = !search || (p.title ?? '').toLowerCase().includes(search.toLowerCase())
      const matchStatus = !statusFilter || p.status === statusFilter
      return matchSearch && matchStatus
    })
  }, [papers, search, statusFilter])

  const columns = [
    {
      key: 'title',
      title: '标题',
      render: (_: unknown, record: BiogasPaper) => (
        <span className="text-gray-900">{record.title ?? `论文 #${record.id}`}</span>
      ),
    },
    {
      key: 'status',
      title: '状态',
      render: (_: unknown, record: BiogasPaper) => {
        const cfg = STATUS[record.status] ?? { text: record.status, variant: 'default' as const }
        return <Badge variant={cfg.variant}>{cfg.text}</Badge>
      },
      className: 'w-24',
    },
    {
      key: 'error_message',
      title: '错误信息',
      render: (_: unknown, record: BiogasPaper) => (
        <span className="text-xs text-red-500 line-clamp-2" title={record.error_message ?? ''}>
          {record.error_message ?? '-'}
        </span>
      ),
      className: 'w-48',
    },
    {
      key: 'article_id',
      title: '关联文章',
      render: (_: unknown, record: BiogasPaper) => (
        <span className="text-xs text-gray-500">
          {record.article_id ? `#${record.article_id}` : '-'}
        </span>
      ),
      className: 'w-24',
    },
    {
      key: 'created_at',
      title: '上传时间',
      render: (_: unknown, record: BiogasPaper) => (
        <span className="text-xs text-gray-500">
          {record.created_at ? new Date(record.created_at).toLocaleString('zh-CN') : '-'}
        </span>
      ),
      className: 'w-40',
    },
    {
      key: 'actions',
      title: '操作',
      render: (_: unknown, record: BiogasPaper) => (
        <div className="flex items-center gap-1">
          {(record.status === 'uploading' || record.status === 'failed') && (
            <Button
              variant="primary"
              size="sm"
              onClick={() => retryMutation.mutate(String(record.id))}
              disabled={retryMutation.isPending}
            >
              重试
            </Button>
          )}
          {(record.status === 'completed' || record.status === 'failed') && (
            <Button
              variant="secondary"
              size="sm"
              onClick={() => setConfirm({ type: 'reset', paper: record })}
            >
              重置
            </Button>
          )}
          <Button
            variant="danger"
            size="sm"
            onClick={() => setConfirm({ type: 'delete', paper: record })}
          >
            删除
          </Button>
        </div>
      ),
      className: 'w-48',
    },
  ]

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold text-gray-900">文献管理</h2>
        <p className="text-sm text-gray-500 mt-1">管理已上传的文献，查看解析状态</p>
      </div>

      <Card className="p-4">
        <div className="flex items-center gap-4">
          <div className="flex-1">
            <Input
              placeholder="搜索标题..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <div className="w-40">
            <Select
              options={STATUS_OPTIONS}
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            />
          </div>
          {hasProcessing && (
            <span className="text-xs text-blue-500 animate-pulse">自动刷新中...</span>
          )}
        </div>
      </Card>

      <Table<BiogasPaper>
        columns={columns}
        data={filtered}
        rowKey="id"
        loading={isLoading}
      />

      <ConfirmDialog
        open={confirm !== null}
        onClose={() => setConfirm(null)}
        onConfirm={() => {
          if (!confirm) return
          if (confirm.type === 'reset') {
            resetMutation.mutate(String(confirm.paper.id))
          } else {
            deleteMutation.mutate(String(confirm.paper.id))
          }
        }}
        title={confirm?.type === 'reset' ? '重置论文' : '删除论文'}
        message={
          confirm?.type === 'reset'
            ? `确定要重置「${confirm.paper.title ?? confirm.paper.id}」吗？关联的文章将被删除，论文状态将恢复为"待解析"。`
            : `确定要删除「${confirm?.paper.title ?? confirm?.paper.id}」吗？此操作不可恢复。`
        }
        confirmText={confirm?.type === 'reset' ? '重置' : '删除'}
        loading={resetMutation.isPending || deleteMutation.isPending}
      />
    </div>
  )
}

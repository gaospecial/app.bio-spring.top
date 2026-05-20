'use client'

import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { listBiogasArticles, deleteBiogasArticle, updateBiogasArticle } from '@/lib/api'
import type { BiogasArticle } from '@/lib/types'
import Table from '@/components/ui/Table'
import Badge from '@/components/ui/Badge'
import Button from '@/components/ui/Button'
import ConfirmDialog from '@/components/ui/ConfirmDialog'
import ArticleEditModal from './ArticleEditModal'

export default function BiogasInterpretationPage() {
  const queryClient = useQueryClient()
  const [editArticle, setEditArticle] = useState<BiogasArticle | null>(null)
  const [deleteTarget, setDeleteTarget] = useState<BiogasArticle | null>(null)

  const { data: articles, isLoading } = useQuery({
    queryKey: ['biogas-articles'],
    queryFn: listBiogasArticles,
  })

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<BiogasArticle> }) =>
      updateBiogasArticle(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['biogas-articles'] })
      setEditArticle(null)
    },
  })

  const deleteMutation = useMutation({
    mutationFn: (articleId: string) => deleteBiogasArticle(articleId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['biogas-articles'] })
      setDeleteTarget(null)
    },
  })

  const columns = [
    {
      key: 'title',
      title: '标题',
      render: (_: unknown, record: BiogasArticle) => (
        <span className="text-gray-900 font-medium">{record.title}</span>
      ),
    },
    {
      key: 'category',
      title: '分类',
      render: (_: unknown, record: BiogasArticle) => (
        record.category ? <Badge variant="default">{record.category}</Badge> : <span className="text-gray-400">-</span>
      ),
      className: 'w-28',
    },
    {
      key: 'status',
      title: '状态',
      render: (_: unknown, record: BiogasArticle) => (
        <Badge variant={record.status === 'published' ? 'success' : 'default'}>
          {record.status === 'published' ? '已发布' : '草稿'}
        </Badge>
      ),
      className: 'w-24',
    },
    {
      key: 'published_at',
      title: '发布时间',
      render: (_: unknown, record: BiogasArticle) => (
        <span className="text-xs text-gray-500">
          {record.published_at ? new Date(record.published_at).toLocaleDateString('zh-CN') : '-'}
        </span>
      ),
      className: 'w-32',
    },
    {
      key: 'actions',
      title: '操作',
      render: (_: unknown, record: BiogasArticle) => (
        <div className="flex items-center gap-1">
          <Button variant="primary" size="sm" onClick={() => setEditArticle(record)}>
            编辑
          </Button>
          <Button variant="danger" size="sm" onClick={() => setDeleteTarget(record)}>
            删除
          </Button>
        </div>
      ),
      className: 'w-32',
    },
  ]

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold text-gray-900">LLM 解读</h2>
        <p className="text-sm text-gray-500 mt-1">管理已生成的文献解读内容</p>
      </div>

      <Table<BiogasArticle>
        columns={columns}
        data={articles ?? []}
        rowKey="id"
        loading={isLoading}
      />

      <ArticleEditModal
        open={editArticle !== null}
        article={editArticle}
        onClose={() => setEditArticle(null)}
        onSave={(id, data) => updateMutation.mutate({ id, data })}
        saving={updateMutation.isPending}
      />

      <ConfirmDialog
        open={deleteTarget !== null}
        onClose={() => setDeleteTarget(null)}
        onConfirm={() => {
          if (deleteTarget) deleteMutation.mutate(String(deleteTarget.id))
        }}
        title="删除文章"
        message={`确定要删除「${deleteTarget?.title}」吗？此操作不可恢复。`}
        confirmText="删除"
        loading={deleteMutation.isPending}
      />
    </div>
  )
}

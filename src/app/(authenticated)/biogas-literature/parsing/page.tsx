'use client'

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { listBiogasPapers, processBiogasPaper } from '@/lib/api'
import Card from '@/components/ui/Card'
import Button from '@/components/ui/Button'
import Badge from '@/components/ui/Badge'

const STATUS: Record<string, { text: string; variant: 'default' | 'success' | 'warning' | 'error' }> = {
  uploaded: { text: '待解析', variant: 'default' },
  processing: { text: '解析中', variant: 'warning' },
  completed: { text: '已完成', variant: 'success' },
  failed: { text: '失败', variant: 'error' },
}

export default function BiogasParsingPage() {
  const queryClient = useQueryClient()

  const { data: papers, isLoading } = useQuery({
    queryKey: ['biogas-papers'],
    queryFn: listBiogasPapers,
  })

  const retryMutation = useMutation({
    mutationFn: (paperId: string) => processBiogasPaper(paperId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['biogas-papers'] })
    },
  })

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold text-gray-900">PDF 解析</h2>
        <p className="text-sm text-gray-500 mt-1">管理文献的 PDF 解析状态，查看提取结果</p>
      </div>

      {isLoading && (
        <Card className="p-8 text-center text-gray-400">加载中...</Card>
      )}

      {!isLoading && papers && papers.length === 0 && (
        <Card className="p-8 text-center text-gray-400">
          暂无论文，请先在"文献上传"页面上传 PDF。
        </Card>
      )}

      {!isLoading && papers && papers.length > 0 && (
        <Card className="p-4">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="text-gray-600">
                <tr>
                  <th className="px-3 py-2 font-medium">文件名</th>
                  <th className="px-3 py-2 font-medium">状态</th>
                  <th className="px-3 py-2 font-medium">错误信息</th>
                  <th className="px-3 py-2 font-medium">操作</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {papers.map((paper) => {
                  const cfg = STATUS[paper.status] ?? { text: paper.status, variant: 'default' as const }
                  return (
                    <tr key={paper.id}>
                      <td className="px-3 py-2 text-gray-900">{paper.title ?? String(paper.id)}</td>
                      <td className="px-3 py-2"><Badge variant={cfg.variant}>{cfg.text}</Badge></td>
                      <td className="px-3 py-2 text-xs text-red-500">{paper.error_message ?? '-'}</td>
                      <td className="px-3 py-2">
                        {(paper.status === 'uploaded' || paper.status === 'failed') && (
                          <Button
                            variant="primary"
                            size="sm"
                            onClick={() => retryMutation.mutate(String(paper.id))}
                            disabled={retryMutation.isPending}
                          >
                            {paper.status === 'failed' ? '重试' : '开始解析'}
                          </Button>
                        )}
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </Card>
      )}
    </div>
  )
}

'use client'

import { useQuery } from '@tanstack/react-query'
import { listBiogasArticles } from '@/lib/api'
import Card from '@/components/ui/Card'
import Badge from '@/components/ui/Badge'
import ReactMarkdown from 'react-markdown'

export default function BiogasInterpretationPage() {
  const { data: articles, isLoading } = useQuery({
    queryKey: ['biogas-articles'],
    queryFn: listBiogasArticles,
  })

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold text-gray-900">LLM 解读</h2>
        <p className="text-sm text-gray-500 mt-1">查看已生成的文献解读内容和要点</p>
      </div>

      {isLoading && (
        <Card className="p-8 text-center text-gray-400">加载中...</Card>
      )}

      {!isLoading && articles && articles.length === 0 && (
        <Card className="p-8 text-center text-gray-400">
          暂无已解读的文章。请先完成 PDF 解析。
        </Card>
      )}

      {!isLoading && articles && articles.length > 0 && (
        <div className="space-y-4">
          {articles.map((article) => (
            <Card key={article.id} className="p-5">
              <div className="flex items-start justify-between mb-3">
                <div>
                  <h3 className="font-medium text-gray-900">{article.title}</h3>
                  {article.subtitle && (
                    <p className="text-sm text-gray-500 mt-1">{article.subtitle}</p>
                  )}
                </div>
                <Badge variant={article.status === 'published' ? 'success' : 'default'}>
                  {article.status}
                </Badge>
              </div>

              {article.understanding_points && article.understanding_points.length > 0 && (
                <div className="mb-3">
                  <h4 className="text-xs font-medium text-gray-500 mb-2">要点</h4>
                  <ul className="list-disc list-inside text-sm text-gray-700 space-y-1">
                    {article.understanding_points.map((point, i) => (
                      <li key={i}>{point}</li>
                    ))}
                  </ul>
                </div>
              )}

              {article.content_md && (
                <div className="prose prose-sm max-w-none text-gray-600">
                  <ReactMarkdown>{article.content_md.length > 500 ? article.content_md.slice(0, 500) + '...' : article.content_md}</ReactMarkdown>
                </div>
              )}

              <div className="mt-3 flex items-center gap-4 text-xs text-gray-400">
                {article.category && <span>分类: {article.category}</span>}
                {article.published_at && <span>发布: {new Date(article.published_at).toLocaleDateString('zh-CN')}</span>}
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}

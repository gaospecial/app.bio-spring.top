'use client'

import type { UsageDetailItem } from '@/lib/types'
import Pagination from '@/components/ui/Pagination'

interface DetailTableProps {
  items: UsageDetailItem[]
  page: number
  pageSize: number
  total: number
  onPageChange: (page: number) => void
  loading?: boolean
}

export default function DetailTable({ items, page, pageSize, total, onPageChange, loading }: DetailTableProps) {
  return (
    <div className="bg-white rounded-lg border border-gray-200">
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-3 text-left font-medium text-gray-600">日期</th>
              <th className="px-4 py-3 text-left font-medium text-gray-600">Key ID</th>
              <th className="px-4 py-3 text-left font-medium text-gray-600">模型</th>
              <th className="px-4 py-3 text-right font-medium text-gray-600">输入 Tokens</th>
              <th className="px-4 py-3 text-right font-medium text-gray-600">输出 Tokens</th>
              <th className="px-4 py-3 text-right font-medium text-gray-600">费用</th>
              <th className="px-4 py-3 text-left font-medium text-gray-600">采集时间</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {loading ? (
              <tr>
                <td colSpan={7} className="px-4 py-8 text-center text-gray-400">加载中...</td>
              </tr>
            ) : items.length === 0 ? (
              <tr>
                <td colSpan={7} className="px-4 py-8 text-center text-gray-400">暂无数据</td>
              </tr>
            ) : (
              items.map((item) => (
                <tr key={item.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3">{item.date}</td>
                  <td className="px-4 py-3 text-gray-500">{item.api_key_id}</td>
                  <td className="px-4 py-3 font-mono text-xs">{item.model_name}</td>
                  <td className="px-4 py-3 text-right">{item.input_tokens.toLocaleString()}</td>
                  <td className="px-4 py-3 text-right">{item.output_tokens.toLocaleString()}</td>
                  <td className="px-4 py-3 text-right">${Number(item.total_cost).toFixed(4)}</td>
                  <td className="px-4 py-3 text-xs text-gray-500">
                    {new Date(item.collected_at).toLocaleString('zh-CN')}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
      <div className="border-t border-gray-100 px-4 py-3">
        <Pagination
          page={page}
          pageSize={pageSize}
          total={total}
          onChange={onPageChange}
        />
      </div>
    </div>
  )
}

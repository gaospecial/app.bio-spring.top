import Card from '@/components/ui/Card'
import type { KeySummary } from '@/lib/types'

interface KeySummaryTableProps {
  keys: KeySummary[]
}

export default function KeySummaryTable({ keys }: KeySummaryTableProps) {
  return (
    <Card title="各 KEY 用量汇总">
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-100">
              <th className="text-left py-2 font-medium text-gray-600">KEY 名称</th>
              <th className="text-right py-2 font-medium text-gray-600">总额度</th>
              <th className="text-right py-2 font-medium text-gray-600">已使用</th>
              <th className="text-right py-2 font-medium text-gray-600">剩余</th>
              <th className="text-left py-2 font-medium text-gray-600 pl-4">最后采集</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {keys.map((key) => {
              const granted = Number(key.total_granted)
              const used = Number(key.total_used)
              const remaining = granted - used
              return (
                <tr key={key.key_id}>
                  <td className="py-2.5">{key.key_name}</td>
                  <td className="py-2.5 text-right">${granted.toFixed(2)}</td>
                  <td className="py-2.5 text-right text-orange-600">${used.toFixed(2)}</td>
                  <td className="py-2.5 text-right text-green-600">${remaining.toFixed(2)}</td>
                  <td className="py-2.5 pl-4 text-gray-400 text-xs">
                    {key.last_collected_at ? new Date(key.last_collected_at).toLocaleString('zh-CN') : '-'}
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </Card>
  )
}

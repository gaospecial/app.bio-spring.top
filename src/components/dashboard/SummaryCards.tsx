import Card from '@/components/ui/Card'

interface SummaryCardsProps {
  totalGranted: string
  totalUsed: string
  totalRemaining: string
}

export default function SummaryCards({ totalGranted, totalUsed, totalRemaining }: SummaryCardsProps) {
  const cards = [
    { label: '总额度', value: `$${Number(totalGranted).toFixed(2)}`, color: 'text-blue-600' },
    { label: '已使用', value: `$${Number(totalUsed).toFixed(2)}`, color: 'text-orange-600' },
    { label: '剩余', value: `$${Number(totalRemaining).toFixed(2)}`, color: 'text-green-600' },
  ]

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      {cards.map((card) => (
        <Card key={card.label}>
          <p className="text-sm text-gray-500">{card.label}</p>
          <p className={`text-2xl font-bold mt-1 ${card.color}`}>{card.value}</p>
        </Card>
      ))}
    </div>
  )
}

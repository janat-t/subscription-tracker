import type { Subscription } from '@/types'
import { monthlyEquivalent, formatCurrency } from '@/lib/utils'
import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from 'recharts'

const CATEGORY_COLORS: Record<string, string> = {
  'Entertainment':    '#6366f1',
  'Productivity':     '#22c55e',
  'Cloud / Storage':  '#0ea5e9',
  'News & Media':     '#f97316',
  'Health & Fitness': '#ec4899',
  'Finance':          '#eab308',
  'Shopping':         '#f43f5e',
  'Gaming':           '#8b5cf6',
  'Utilities':        '#14b8a6',
  'Other':            '#94a3b8',
}

export default function CategoryChart({ subscriptions, currency }: { subscriptions: Subscription[]; currency: string }) {
  if (!subscriptions.length) {
    return <div className="flex items-center justify-center h-[300px]">No subscriptions yet.</div>
  }

  const grouped = subscriptions.reduce<Record<string, number>>((acc, sub) => {
    const m = monthlyEquivalent(sub)
    acc[sub.category] = (acc[sub.category] ?? 0) + m
    return acc
  }, {})

  const data = Object.entries(grouped)
    .filter(([, value]) => value > 0)
    .map(([name, value]) => ({ name, value }))

  return (
    <ResponsiveContainer width="100%" height={300}>
      <PieChart>
        <Pie dataKey="value" nameKey="name" innerRadius={60} outerRadius={100} data={data}>
          {data.map((entry, i) => (
            <Cell key={i} fill={CATEGORY_COLORS[entry.name] ?? '#6366f1'} />
          ))}
        </Pie>
        <Tooltip formatter={(value) => formatCurrency(value as number, currency)} />
        <Legend />
      </PieChart>
    </ResponsiveContainer>
  )
}

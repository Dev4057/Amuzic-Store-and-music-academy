'use client'

import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from 'recharts'
import { formatCurrency } from '@amuzic/shared'

interface Props {
  data: { cash: number; upi: number; bank_transfer: number; cheque: number }
}

const COLORS = ['#16A34A', '#2563EB', '#7C3AED', '#D97706']
const LABELS = ['Cash', 'UPI', 'Bank Transfer', 'Cheque']

export default function PaymentModeChart({ data }: Props) {
  const chartData = [
    { name: 'Cash', value: data.cash },
    { name: 'UPI', value: data.upi },
    { name: 'Bank Transfer', value: data.bank_transfer },
    { name: 'Cheque', value: data.cheque },
  ].filter((d) => d.value > 0)

  const total = chartData.reduce((s, d) => s + d.value, 0)
  const topMode = [...chartData].sort((a, b) => b.value - a.value)[0]

  return (
    <div>
      <ResponsiveContainer width="100%" height={200}>
        <PieChart>
          <Pie data={chartData} cx="50%" cy="50%" innerRadius={50} outerRadius={80} paddingAngle={3} dataKey="value">
            {chartData.map((_, i) => (
              <Cell key={i} fill={COLORS[i % COLORS.length]} />
            ))}
          </Pie>
          <Tooltip
            formatter={(value, name) => [
              `${formatCurrency(Number(value))} (${total > 0 ? Math.round((Number(value) / total) * 100) : 0}%)`,
              name,
            ]}
            contentStyle={{ fontSize: 12, borderRadius: 6, border: '1px solid rgba(44,24,16,0.1)' }}
          />
          <Legend wrapperStyle={{ fontSize: 12 }} />
        </PieChart>
      </ResponsiveContainer>
      {topMode && (
        <p style={{ fontSize: 12, color: 'var(--muted)', textAlign: 'center', marginTop: 4 }}>
          Most payments via <strong>{topMode.name}</strong>
        </p>
      )}
    </div>
  )
}

'use client'

import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, Legend,
} from 'recharts'
import { formatCurrency } from '@amuzic/shared'

interface TrendPoint { month: string; collected: number; pending: number; overdue: number }

function currencyTick(value: number): string {
  if (value >= 100000) return `₹${(value / 100000).toFixed(1)}L`
  if (value >= 1000) return `₹${(value / 1000).toFixed(0)}K`
  return `₹${value}`
}

export default function TrendChart({ data }: { data: TrendPoint[] }) {
  return (
    <ResponsiveContainer width="100%" height={260}>
      <AreaChart data={data} margin={{ top: 4, right: 16, left: 0, bottom: 0 }}>
        <defs>
          <linearGradient id="gCollected" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#16A34A" stopOpacity={0.2} />
            <stop offset="95%" stopColor="#16A34A" stopOpacity={0} />
          </linearGradient>
          <linearGradient id="gPending" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#D97706" stopOpacity={0.2} />
            <stop offset="95%" stopColor="#D97706" stopOpacity={0} />
          </linearGradient>
          <linearGradient id="gOverdue" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#DC2626" stopOpacity={0.2} />
            <stop offset="95%" stopColor="#DC2626" stopOpacity={0} />
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" stroke="rgba(44,24,16,0.06)" />
        <XAxis dataKey="month" tick={{ fontSize: 11 }} />
        <YAxis tickFormatter={currencyTick} tick={{ fontSize: 11 }} width={56} />
        <Tooltip
          formatter={(value, name) => [formatCurrency(Number(value)), String(name).charAt(0).toUpperCase() + String(name).slice(1)]}
          contentStyle={{ fontSize: 12, borderRadius: 6, border: '1px solid rgba(44,24,16,0.1)' }}
        />
        <Legend wrapperStyle={{ fontSize: 12 }} />
        <Area type="monotone" dataKey="collected" stroke="#16A34A" strokeWidth={2} fill="url(#gCollected)" name="collected" />
        <Area type="monotone" dataKey="pending" stroke="#D97706" strokeWidth={2} fill="url(#gPending)" name="pending" />
        <Area type="monotone" dataKey="overdue" stroke="#DC2626" strokeWidth={2} fill="url(#gOverdue)" name="overdue" />
      </AreaChart>
    </ResponsiveContainer>
  )
}

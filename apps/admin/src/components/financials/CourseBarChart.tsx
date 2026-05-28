'use client'

import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, Cell,
} from 'recharts'
import { formatCurrency } from '@amuzic/shared'

interface CourseData { course_name: string; collected: number; student_count: number }

const COURSE_COLORS: Record<string, string> = {
  Keyboard: '#7C3AED',
  Guitar: '#16A34A',
  Drums: '#DC2626',
  Vocals: '#2563EB',
}

function currencyTick(value: number): string {
  if (value >= 100000) return `₹${(value / 100000).toFixed(1)}L`
  if (value >= 1000) return `₹${(value / 1000).toFixed(0)}K`
  return `₹${value}`
}

export default function CourseBarChart({ data }: { data: CourseData[] }) {
  return (
    <ResponsiveContainer width="100%" height={200}>
      <BarChart data={data} layout="vertical" margin={{ top: 0, right: 16, left: 0, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="rgba(44,24,16,0.06)" />
        <XAxis type="number" tickFormatter={currencyTick} tick={{ fontSize: 11 }} />
        <YAxis type="category" dataKey="course_name" tick={{ fontSize: 12 }} width={72} />
        <Tooltip
          formatter={(value) => [formatCurrency(Number(value)), 'Collected']}
          contentStyle={{ fontSize: 12, borderRadius: 6, border: '1px solid rgba(44,24,16,0.1)' }}
        />
        <Bar dataKey="collected" radius={[0, 3, 3, 0]}>
          {data.map((entry) => (
            <Cell key={entry.course_name} fill={COURSE_COLORS[entry.course_name] ?? '#8B1A1A'} />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  )
}

'use client'

import { useReports } from '../../../hooks/useReports'
import { PageHeader } from '../../../components/PageHeader'
import { formatCurrency } from '@amuzic/shared'

function downloadCSV(data: Record<string, number | string>, filename: string) {
  const rows = Object.entries(data).map(([k, v]) => [k, String(v)])
  const csv = ['Metric,Value', ...rows.map((r) => r.join(','))].join('\n')
  const blob = new Blob([csv], { type: 'text/csv' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  a.click()
  URL.revokeObjectURL(url)
}

interface StatItem {
  label: string
  value: string
  color?: string
}

interface Section {
  title: string
  key: string
  stats: StatItem[]
  csvData: Record<string, number | string>
}

export default function ReportsPage() {
  const { data, isLoading } = useReports()
  const r = data?.data

  const now = new Date()
  const monthLabel = now.toLocaleDateString('en-IN', { month: 'long', year: 'numeric' })
  const fileSlug = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`

  if (isLoading) {
    return (
      <>
        <PageHeader title="Reports" description="Monthly summary and insights" />
        <div className="loading-center"><span className="spinner" /> Loading reports…</div>
      </>
    )
  }

  if (!r) return null

  const sections: Section[] = [
    {
      title: 'Fee Summary',
      key: 'fees',
      stats: [
        { label: 'This Month Collection', value: formatCurrency(r.this_month_collection) },
        { label: 'Last Month Collection', value: formatCurrency(r.last_month_collection) },
        { label: 'Pending Fees', value: formatCurrency(r.pending_fees_total), color: r.pending_fees_total > 0 ? '#D97706' : undefined },
        { label: 'Overdue Fees', value: formatCurrency(r.overdue_fees_total), color: r.overdue_fees_total > 0 ? '#DC2626' : undefined },
      ],
      csvData: {
        'This Month Collection': r.this_month_collection,
        'Last Month Collection': r.last_month_collection,
        'Pending Fees Total': r.pending_fees_total,
        'Overdue Fees Total': r.overdue_fees_total,
      },
    },
    {
      title: 'Student Summary',
      key: 'students',
      stats: [
        { label: 'Active Students', value: String(r.active_students) },
        { label: 'New This Month', value: String(r.new_students_this_month) },
      ],
      csvData: {
        'Active Students': r.active_students,
        'New This Month': r.new_students_this_month,
      },
    },
    {
      title: 'Demo Bookings',
      key: 'demos',
      stats: [
        { label: 'Booked This Month', value: String(r.demos_this_month) },
        { label: 'Completed / Converted', value: String(r.demos_converted_this_month) },
        { label: 'Conversion Rate', value: `${r.conversion_rate}%`, color: r.conversion_rate > 50 ? '#16A34A' : undefined },
      ],
      csvData: {
        'Demos Booked': r.demos_this_month,
        'Demos Converted': r.demos_converted_this_month,
        'Conversion Rate %': r.conversion_rate,
      },
    },
    {
      title: 'Batch & Attendance',
      key: 'batches',
      stats: [
        { label: 'Active Batches', value: String(r.batches_active) },
        { label: 'Attendance Rate This Month', value: `${r.attendance_rate_this_month}%`, color: r.attendance_rate_this_month > 80 ? '#16A34A' : '#D97706' },
      ],
      csvData: {
        'Active Batches': r.batches_active,
        'Attendance Rate %': r.attendance_rate_this_month,
      },
    },
  ]

  const fullCsvData: Record<string, number | string> = {
    'Month': monthLabel,
    'This Month Collection': r.this_month_collection,
    'Last Month Collection': r.last_month_collection,
    'Pending Fees': r.pending_fees_total,
    'Overdue Fees': r.overdue_fees_total,
    'Active Students': r.active_students,
    'New Students': r.new_students_this_month,
    'Demos Booked': r.demos_this_month,
    'Demos Converted': r.demos_converted_this_month,
    'Conversion Rate %': r.conversion_rate,
    'Active Batches': r.batches_active,
    'Attendance Rate %': r.attendance_rate_this_month,
  }

  return (
    <>
      <PageHeader
        title="Reports"
        description={`Summary for ${monthLabel}`}
      />

      <div style={{ display: 'flex', flexDirection: 'column', gap: 28 }}>
        {sections.map((section) => (
          <div key={section.key}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
              <div className="section-title">{section.title}</div>
              <button
                className="btn btn-ghost btn-sm"
                onClick={() => downloadCSV(section.csvData, `amuzic-${section.key}-${fileSlug}.csv`)}
              >
                Export CSV
              </button>
            </div>
            <div className="stats-row">
              {section.stats.map((s) => (
                <div key={s.label} className="stat-card">
                  <div className="stat-value" style={s.color ? { color: s.color } : {}}>
                    {s.value}
                  </div>
                  <div className="stat-label">{s.label}</div>
                </div>
              ))}
            </div>
          </div>
        ))}

        <div style={{ paddingTop: 8 }}>
          <button
            className="btn btn-ghost"
            onClick={() => downloadCSV(fullCsvData, `amuzic-report-${fileSlug}.csv`)}
          >
            Export Full Report CSV
          </button>
        </div>
      </div>
    </>
  )
}

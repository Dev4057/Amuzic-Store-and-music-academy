import { Document, Page, View, Text } from '@react-pdf/renderer'
import { pdfStyles } from '../styles'
import { PdfHeader } from '../components/PdfHeader'
import { PdfFooter } from '../components/PdfFooter'
import { formatCurrency, formatDate } from '@amuzic/shared'
import type { FeeRecord, Student } from '@amuzic/shared'

interface FeeWithStudent extends Omit<FeeRecord, 'student'> {
  student: Pick<Student, 'full_name' | 'phone'> | null
  course_name?: string
  batch_name?: string
}

interface Props {
  monthYear: string
  fees: FeeWithStudent[]
  newAdmissions: number
}

export function MonthlyCollectionPdf({ monthYear, fees, newAdmissions }: Props) {
  const totalBilled = fees.reduce((s, f) => s + f.amount, 0)
  const totalCollected = fees.filter((f) => f.status === 'paid').reduce((s, f) => s + (f.paid_amount ?? f.amount), 0)
  const totalPending = fees.filter((f) => f.status === 'pending' || f.status === 'overdue').reduce((s, f) => s + f.amount, 0)
  const collectionRate = totalBilled > 0 ? Math.round((totalCollected / totalBilled) * 100) : 0

  const modeBreakdown = {
    cash: fees.filter((f) => f.status === 'paid' && f.payment_mode === 'cash').reduce((s, f) => s + (f.paid_amount ?? f.amount), 0),
    upi: fees.filter((f) => f.status === 'paid' && f.payment_mode === 'upi').reduce((s, f) => s + (f.paid_amount ?? f.amount), 0),
    bank_transfer: fees.filter((f) => f.status === 'paid' && f.payment_mode === 'bank_transfer').reduce((s, f) => s + (f.paid_amount ?? f.amount), 0),
    cheque: fees.filter((f) => f.status === 'paid' && f.payment_mode === 'cheque').reduce((s, f) => s + (f.paid_amount ?? f.amount), 0),
  }

  const sortedFees = [...fees].sort((a, b) => {
    const order = { paid: 0, pending: 1, overdue: 2, waived: 3 }
    return (order[a.status] ?? 4) - (order[b.status] ?? 4)
  })

  const pendingOverdue = fees.filter((f) => f.status === 'pending' || f.status === 'overdue')

  const generatedOn = new Date().toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })

  return (
    <Document>
      {/* PAGE 1: Executive Summary */}
      <Page size="A4" style={pdfStyles.page}>
        <PdfHeader reportTitle={`MONTHLY COLLECTION REPORT`} subtitle={`${monthYear} · Generated on ${generatedOn}`} />

        <Text style={pdfStyles.sectionTitle}>Collection Summary</Text>
        <View style={pdfStyles.summaryBox}>
          {[
            { label: 'Total Billed', value: formatCurrency(totalBilled) },
            { label: 'Total Collected', value: formatCurrency(totalCollected) },
            { label: 'Total Pending', value: formatCurrency(totalPending) },
            { label: 'Collection Rate', value: `${collectionRate}%` },
            { label: 'New Admissions', value: String(newAdmissions) },
          ].map((row) => (
            <View key={row.label} style={pdfStyles.summaryRow}>
              <Text style={pdfStyles.summaryLabel}>{row.label}</Text>
              <Text style={pdfStyles.summaryValue}>{row.value}</Text>
            </View>
          ))}
        </View>

        <Text style={pdfStyles.sectionTitle}>Payment Mode Breakdown</Text>
        <View style={pdfStyles.table}>
          <View style={pdfStyles.tableHeader}>
            <Text style={[pdfStyles.tableHeaderCell, { flex: 2 }]}>Mode</Text>
            <Text style={[pdfStyles.tableHeaderCell, { flex: 2 }]}>Amount Collected</Text>
          </View>
          {Object.entries(modeBreakdown).filter(([, v]) => v > 0).map(([mode, amount], i) => (
            <View key={mode} style={[pdfStyles.tableRow, i % 2 === 1 ? pdfStyles.tableRowAlt : {}]}>
              <Text style={[pdfStyles.tableCell, { flex: 2, textTransform: 'capitalize' }]}>{mode.replace('_', ' ')}</Text>
              <Text style={[pdfStyles.tableCell, { flex: 2 }]}>{formatCurrency(amount)}</Text>
            </View>
          ))}
        </View>

        <PdfFooter />
      </Page>

      {/* PAGE 2: Student-wise Collection */}
      <Page size="A4" style={pdfStyles.page}>
        <PdfHeader reportTitle="STUDENT-WISE COLLECTION" subtitle={monthYear} />

        <View style={pdfStyles.table}>
          <View style={pdfStyles.tableHeader}>
            <Text style={[pdfStyles.tableHeaderCell, { flex: 2.5 }]}>Student</Text>
            <Text style={[pdfStyles.tableHeaderCell, { flex: 1.5 }]}>Course</Text>
            <Text style={[pdfStyles.tableHeaderCell, { flex: 1.5 }]}>Due</Text>
            <Text style={[pdfStyles.tableHeaderCell, { flex: 1.5 }]}>Paid</Text>
            <Text style={[pdfStyles.tableHeaderCell, { flex: 2 }]}>Paid Date</Text>
            <Text style={[pdfStyles.tableHeaderCell, { flex: 1.5 }]}>Mode</Text>
            <Text style={[pdfStyles.tableHeaderCell, { flex: 1 }]}>Status</Text>
          </View>
          {sortedFees.map((f, i) => (
            <View key={f.id} style={[pdfStyles.tableRow, i % 2 === 1 ? pdfStyles.tableRowAlt : {}]}>
              <Text style={[pdfStyles.tableCell, { flex: 2.5 }]}>{f.student?.full_name ?? '—'}</Text>
              <Text style={[pdfStyles.tableCell, { flex: 1.5 }]}>{f.course_name ?? '—'}</Text>
              <Text style={[pdfStyles.tableCell, { flex: 1.5 }]}>{formatCurrency(f.amount)}</Text>
              <Text style={[pdfStyles.tableCell, { flex: 1.5 }]}>{f.paid_amount ? formatCurrency(f.paid_amount) : '—'}</Text>
              <Text style={[pdfStyles.tableCell, { flex: 2 }]}>{f.paid_date ? formatDate(f.paid_date) : '—'}</Text>
              <Text style={[pdfStyles.tableCell, { flex: 1.5, textTransform: 'capitalize' }]}>{f.payment_mode?.replace('_', ' ') ?? '—'}</Text>
              <Text style={[pdfStyles.tableCell, { flex: 1, textTransform: 'capitalize' }]}>{f.status}</Text>
            </View>
          ))}
          <View style={pdfStyles.totalRow}>
            <Text style={[pdfStyles.totalCell, { flex: 4 }]}>Total</Text>
            <Text style={[pdfStyles.totalCell, { flex: 1.5 }]}>{formatCurrency(totalBilled)}</Text>
            <Text style={[pdfStyles.totalCell, { flex: 1.5 }]}>{formatCurrency(totalCollected)}</Text>
            <Text style={[pdfStyles.totalCell, { flex: 4.5 }]}>{collectionRate}% collected</Text>
          </View>
        </View>

        <PdfFooter />
      </Page>

      {/* PAGE 3: Pending & Overdue */}
      <Page size="A4" style={pdfStyles.page}>
        <PdfHeader reportTitle="PENDING & OVERDUE" subtitle={`${monthYear} · ${pendingOverdue.length} outstanding records`} />

        <View style={pdfStyles.table}>
          <View style={pdfStyles.tableHeader}>
            <Text style={[pdfStyles.tableHeaderCell, { flex: 2.5 }]}>Student</Text>
            <Text style={[pdfStyles.tableHeaderCell, { flex: 2 }]}>Phone</Text>
            <Text style={[pdfStyles.tableHeaderCell, { flex: 1.5 }]}>Course</Text>
            <Text style={[pdfStyles.tableHeaderCell, { flex: 1.5 }]}>Amount Due</Text>
            <Text style={[pdfStyles.tableHeaderCell, { flex: 2 }]}>Due Date</Text>
            <Text style={[pdfStyles.tableHeaderCell, { flex: 1.5 }]}>Status</Text>
          </View>
          {pendingOverdue.map((f, i) => (
            <View key={f.id} style={[pdfStyles.tableRow, i % 2 === 1 ? pdfStyles.tableRowAlt : {}]}>
              <Text style={[pdfStyles.tableCell, { flex: 2.5 }]}>{f.student?.full_name ?? '—'}</Text>
              <Text style={[pdfStyles.tableCell, { flex: 2 }]}>{f.student?.phone ?? '—'}</Text>
              <Text style={[pdfStyles.tableCell, { flex: 1.5 }]}>{f.course_name ?? '—'}</Text>
              <Text style={[pdfStyles.tableCell, { flex: 1.5 }]}>{formatCurrency(f.amount)}</Text>
              <Text style={[pdfStyles.tableCell, { flex: 2 }]}>{formatDate(f.due_date)}</Text>
              <Text style={[pdfStyles.tableCell, { flex: 1.5, textTransform: 'capitalize' }]}>{f.status}</Text>
            </View>
          ))}
          <View style={pdfStyles.totalRow}>
            <Text style={[pdfStyles.totalCell, { flex: 7 }]}>Grand Total Outstanding</Text>
            <Text style={[pdfStyles.totalCell, { flex: 2.5 }]}>{formatCurrency(totalPending)}</Text>
          </View>
        </View>

        <PdfFooter />
      </Page>
    </Document>
  )
}

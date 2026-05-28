import { Document, Page, View, Text } from '@react-pdf/renderer'
import { pdfStyles } from '../styles'
import { PdfHeader } from '../components/PdfHeader'
import { PdfFooter } from '../components/PdfFooter'
import { formatCurrency, formatDate } from '@amuzic/shared'
import type { Student, FeeRecord, ProgressNote, AttendanceStatus } from '@amuzic/shared'

interface AttendanceRow {
  month: string
  held: number
  present: number
  absent: number
  late: number
  rate: number
}

interface Props {
  student: Student & { course_name?: string; batch_name?: string; teacher_name?: string }
  attendanceSummary: AttendanceRow[]
  fees: FeeRecord[]
  progressNotes: (ProgressNote & { teacher_name?: string })[]
  overallAttendanceRate: number
  feeSummary: { total_billed: number; total_paid: number; outstanding: number }
}

const ATT_LABELS: Record<AttendanceStatus, string> = {
  present: 'Present', absent: 'Absent', late: 'Late', cancelled: 'Cancelled',
}

export function StudentReportPdf({ student, attendanceSummary, fees, progressNotes, overallAttendanceRate, feeSummary }: Props) {
  const generatedOn = new Date().toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })

  return (
    <Document>
      {/* PAGE 1: Profile + Summary */}
      <Page size="A4" style={pdfStyles.page}>
        <PdfHeader reportTitle="STUDENT REPORT" subtitle={`Generated on ${generatedOn}`} />

        <Text style={pdfStyles.sectionTitle}>Student Profile</Text>
        <View style={pdfStyles.summaryBox}>
          <View style={pdfStyles.summaryRow}>
            <Text style={pdfStyles.summaryLabel}>Name</Text>
            <Text style={pdfStyles.summaryValue}>{student.full_name}</Text>
          </View>
          <View style={pdfStyles.summaryRow}>
            <Text style={pdfStyles.summaryLabel}>Phone</Text>
            <Text style={pdfStyles.summaryValue}>{student.phone}</Text>
          </View>
          {student.email ? (
            <View style={pdfStyles.summaryRow}>
              <Text style={pdfStyles.summaryLabel}>Email</Text>
              <Text style={pdfStyles.summaryValue}>{student.email}</Text>
            </View>
          ) : null}
          {student.course_name ? (
            <View style={pdfStyles.summaryRow}>
              <Text style={pdfStyles.summaryLabel}>Course</Text>
              <Text style={pdfStyles.summaryValue}>{student.course_name}</Text>
            </View>
          ) : null}
          {student.batch_name ? (
            <View style={pdfStyles.summaryRow}>
              <Text style={pdfStyles.summaryLabel}>Batch</Text>
              <Text style={pdfStyles.summaryValue}>{student.batch_name}</Text>
            </View>
          ) : null}
          {student.teacher_name ? (
            <View style={pdfStyles.summaryRow}>
              <Text style={pdfStyles.summaryLabel}>Teacher</Text>
              <Text style={pdfStyles.summaryValue}>{student.teacher_name}</Text>
            </View>
          ) : null}
          <View style={pdfStyles.summaryRow}>
            <Text style={pdfStyles.summaryLabel}>Enrolled Since</Text>
            <Text style={pdfStyles.summaryValue}>{formatDate(student.enrollment_date)}</Text>
          </View>
          <View style={pdfStyles.summaryRow}>
            <Text style={pdfStyles.summaryLabel}>Status</Text>
            <Text style={[pdfStyles.summaryValue, { textTransform: 'capitalize' }]}>{student.status}</Text>
          </View>
        </View>

        <Text style={pdfStyles.sectionTitle}>Summary</Text>
        <View style={{ flexDirection: 'row', gap: 10 }}>
          {[
            { label: 'Attendance Rate', value: `${overallAttendanceRate}%` },
            { label: 'Fees Paid (YTD)', value: formatCurrency(feeSummary.total_paid) },
            { label: 'Outstanding', value: formatCurrency(feeSummary.outstanding) },
            { label: 'Skill Level', value: progressNotes[0]?.skill_level ?? 'N/A' },
          ].map((item) => (
            <View key={item.label} style={[pdfStyles.summaryBox, { flex: 1, marginBottom: 0 }]}>
              <Text style={[pdfStyles.summaryLabel, { marginBottom: 4 }]}>{item.label}</Text>
              <Text style={{ fontSize: 14, fontFamily: 'Helvetica-Bold', color: '#8B1A1A' }}>{item.value}</Text>
            </View>
          ))}
        </View>

        <PdfFooter />
      </Page>

      {/* PAGE 2: Attendance */}
      <Page size="A4" style={pdfStyles.page}>
        <PdfHeader reportTitle="ATTENDANCE RECORD" subtitle={student.full_name} />

        <View style={pdfStyles.table}>
          <View style={pdfStyles.tableHeader}>
            <Text style={[pdfStyles.tableHeaderCell, { flex: 2 }]}>Month</Text>
            <Text style={[pdfStyles.tableHeaderCell, { flex: 1 }]}>Classes</Text>
            <Text style={[pdfStyles.tableHeaderCell, { flex: 1 }]}>Present</Text>
            <Text style={[pdfStyles.tableHeaderCell, { flex: 1 }]}>Absent</Text>
            <Text style={[pdfStyles.tableHeaderCell, { flex: 1 }]}>Late</Text>
            <Text style={[pdfStyles.tableHeaderCell, { flex: 1 }]}>Rate %</Text>
          </View>
          {attendanceSummary.map((row, i) => (
            <View key={row.month} style={[pdfStyles.tableRow, i % 2 === 1 ? pdfStyles.tableRowAlt : {}]}>
              <Text style={[pdfStyles.tableCell, { flex: 2 }]}>{row.month}</Text>
              <Text style={[pdfStyles.tableCell, { flex: 1 }]}>{row.held}</Text>
              <Text style={[pdfStyles.tableCell, { flex: 1 }]}>{row.present}</Text>
              <Text style={[pdfStyles.tableCell, { flex: 1 }]}>{row.absent}</Text>
              <Text style={[pdfStyles.tableCell, { flex: 1 }]}>{row.late}</Text>
              <Text style={[pdfStyles.tableCell, { flex: 1 }]}>{row.rate}%</Text>
            </View>
          ))}
          <View style={pdfStyles.totalRow}>
            <Text style={[pdfStyles.totalCell, { flex: 2 }]}>Overall</Text>
            <Text style={[pdfStyles.totalCell, { flex: 1 }]}>{attendanceSummary.reduce((s, r) => s + r.held, 0)}</Text>
            <Text style={[pdfStyles.totalCell, { flex: 1 }]}>{attendanceSummary.reduce((s, r) => s + r.present, 0)}</Text>
            <Text style={[pdfStyles.totalCell, { flex: 1 }]}>{attendanceSummary.reduce((s, r) => s + r.absent, 0)}</Text>
            <Text style={[pdfStyles.totalCell, { flex: 1 }]}>{attendanceSummary.reduce((s, r) => s + r.late, 0)}</Text>
            <Text style={[pdfStyles.totalCell, { flex: 1 }]}>{overallAttendanceRate}%</Text>
          </View>
        </View>

        <PdfFooter />
      </Page>

      {/* PAGE 3: Fees + Progress */}
      <Page size="A4" style={pdfStyles.page}>
        <PdfHeader reportTitle="FEE HISTORY & PROGRESS" subtitle={student.full_name} />

        <Text style={pdfStyles.sectionTitle}>Fee Records</Text>
        <View style={pdfStyles.table}>
          <View style={pdfStyles.tableHeader}>
            <Text style={[pdfStyles.tableHeaderCell, { flex: 2 }]}>Month</Text>
            <Text style={[pdfStyles.tableHeaderCell, { flex: 1.5 }]}>Amount</Text>
            <Text style={[pdfStyles.tableHeaderCell, { flex: 2 }]}>Paid Date</Text>
            <Text style={[pdfStyles.tableHeaderCell, { flex: 2 }]}>Mode</Text>
            <Text style={[pdfStyles.tableHeaderCell, { flex: 1.5 }]}>Status</Text>
          </View>
          {fees.slice(0, 12).map((f, i) => (
            <View key={f.id} style={[pdfStyles.tableRow, i % 2 === 1 ? pdfStyles.tableRowAlt : {}]}>
              <Text style={[pdfStyles.tableCell, { flex: 2 }]}>{f.month_year ?? '—'}</Text>
              <Text style={[pdfStyles.tableCell, { flex: 1.5 }]}>{formatCurrency(f.amount)}</Text>
              <Text style={[pdfStyles.tableCell, { flex: 2 }]}>{f.paid_date ? formatDate(f.paid_date) : '—'}</Text>
              <Text style={[pdfStyles.tableCell, { flex: 2, textTransform: 'capitalize' }]}>{f.payment_mode?.replace('_', ' ') ?? '—'}</Text>
              <Text style={[pdfStyles.tableCell, { flex: 1.5, textTransform: 'capitalize' }]}>{f.status}</Text>
            </View>
          ))}
        </View>

        <Text style={pdfStyles.sectionTitle}>Recent Progress Notes</Text>
        {progressNotes.slice(0, 5).map((n, i) => (
          <View key={n.id} style={[pdfStyles.summaryBox, { marginBottom: 8 }]}>
            <View style={pdfStyles.summaryRow}>
              <Text style={pdfStyles.summaryLabel}>{formatDate(n.class_date)}{n.teacher_name ? ` · ${n.teacher_name}` : ''}</Text>
              {n.skill_level ? <Text style={[pdfStyles.summaryLabel, { textTransform: 'capitalize' }]}>{n.skill_level}</Text> : null}
            </View>
            <Text style={{ fontSize: 9, color: '#2C1810', marginTop: 4 }}>{n.note_text}</Text>
          </View>
        ))}
        {progressNotes.length === 0 && (
          <Text style={{ fontSize: 9, color: '#6B6B6B' }}>No progress notes recorded yet.</Text>
        )}

        <PdfFooter />
      </Page>
    </Document>
  )
}

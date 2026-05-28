import { Document, Page, View, Text, StyleSheet } from '@react-pdf/renderer'

const s = StyleSheet.create({
  page: { backgroundColor: '#FEFAF0', fontFamily: 'Helvetica', padding: '40px 48px', fontSize: 10, color: '#2C1810' },
  header: { borderBottom: '2px solid #D4AF37', paddingBottom: 14, marginBottom: 18 },
  headerTitle: { fontSize: 20, color: '#8B1A1A', fontFamily: 'Helvetica-Bold', letterSpacing: 1 },
  headerSub: { fontSize: 10, color: '#6B6B6B', marginTop: 3 },
  receiptMeta: { fontSize: 10, color: '#6B6B6B', marginTop: 4 },
  section: { marginBottom: 16 },
  sectionTitle: { fontSize: 9, fontFamily: 'Helvetica-Bold', textTransform: 'uppercase', letterSpacing: 1, color: '#8B1A1A', marginBottom: 8, borderBottom: '1px solid rgba(139,26,26,0.15)', paddingBottom: 4 },
  row: { flexDirection: 'row', marginBottom: 5 },
  label: { width: 120, color: '#6B6B6B' },
  value: { flex: 1, fontFamily: 'Helvetica-Bold' },
  table: { border: '1px solid rgba(44,24,16,0.12)', borderRadius: 4, overflow: 'hidden' },
  tableHeader: { flexDirection: 'row', backgroundColor: '#8B1A1A', padding: '6px 10px' },
  tableHeaderCell: { flex: 1, color: '#FEFAF0', fontSize: 9, fontFamily: 'Helvetica-Bold' },
  tableRow: { flexDirection: 'row', padding: '8px 10px', borderTop: '1px solid rgba(44,24,16,0.08)' },
  tableCell: { flex: 1, fontSize: 10 },
  totalRow: { flexDirection: 'row', backgroundColor: 'rgba(212,175,55,0.12)', padding: '8px 10px', borderTop: '2px solid #D4AF37' },
  totalLabel: { flex: 3, fontFamily: 'Helvetica-Bold', fontSize: 10 },
  totalValue: { flex: 1, fontFamily: 'Helvetica-Bold', fontSize: 11, color: '#8B1A1A' },
  footer: { position: 'absolute', bottom: 32, left: 48, right: 48, borderTop: '1px solid rgba(44,24,16,0.12)', paddingTop: 10, flexDirection: 'row', justifyContent: 'space-between' },
  footerText: { fontSize: 8, color: '#6B6B6B' },
  thankYou: { textAlign: 'center', marginTop: 24, fontSize: 11, color: '#8B1A1A', fontFamily: 'Helvetica-Oblique' },
})

function fmt(n: number) {
  return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(n)
}
function fmtDate(d: string) {
  return new Date(d).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })
}

interface Props {
  student: { full_name: string; phone: string; batch_name?: string; course_name?: string }
  fee: {
    id: string
    fee_type: string
    amount: number
    due_date: string
    paid_date: string | null
    paid_amount: number | null
    payment_mode: string | null
    month_year: string | null
    status: string
  }
}

export function PortalFeeReceiptPdf({ student, fee }: Props) {
  const receiptNo = `FEE-${fee.id.slice(0, 8).toUpperCase()}`
  const paidDate  = fee.paid_date ? fmtDate(fee.paid_date) : '—'
  const paidAmt   = fee.paid_amount ?? fee.amount

  return (
    <Document>
      <Page size="A4" style={s.page}>
        {/* Header */}
        <View style={s.header}>
          <Text style={s.headerTitle}>Amuzic Academy</Text>
          <Text style={s.headerSub}>Where Passion Meets Precision · Pune, Maharashtra</Text>
          <Text style={s.receiptMeta}>Receipt No: {receiptNo}  ·  Date: {paidDate}</Text>
        </View>

        {/* Student details */}
        <View style={s.section}>
          <Text style={s.sectionTitle}>Student Details</Text>
          <View style={s.row}><Text style={s.label}>Name</Text><Text style={s.value}>{student.full_name}</Text></View>
          <View style={s.row}><Text style={s.label}>Phone</Text><Text style={s.value}>{student.phone}</Text></View>
          {student.course_name ? <View style={s.row}><Text style={s.label}>Course</Text><Text style={s.value}>{student.course_name}</Text></View> : null}
          {student.batch_name  ? <View style={s.row}><Text style={s.label}>Batch</Text><Text style={s.value}>{student.batch_name}</Text></View>  : null}
        </View>

        {/* Payment details */}
        <View style={s.section}>
          <Text style={s.sectionTitle}>Payment Details</Text>
          <View style={s.table}>
            <View style={s.tableHeader}>
              <Text style={[s.tableHeaderCell, { flex: 2 }]}>Fee Type</Text>
              <Text style={[s.tableHeaderCell, { flex: 2 }]}>Month / Year</Text>
              <Text style={[s.tableHeaderCell, { flex: 1.5 }]}>Amount Due</Text>
              <Text style={[s.tableHeaderCell, { flex: 1.5 }]}>Amount Paid</Text>
              <Text style={[s.tableHeaderCell, { flex: 2 }]}>Mode</Text>
            </View>
            <View style={s.tableRow}>
              <Text style={[s.tableCell, { flex: 2, textTransform: 'capitalize' }]}>{fee.fee_type}</Text>
              <Text style={[s.tableCell, { flex: 2 }]}>{fee.month_year ?? '—'}</Text>
              <Text style={[s.tableCell, { flex: 1.5 }]}>{fmt(fee.amount)}</Text>
              <Text style={[s.tableCell, { flex: 1.5 }]}>{fmt(paidAmt)}</Text>
              <Text style={[s.tableCell, { flex: 2, textTransform: 'capitalize' }]}>{fee.payment_mode?.replace('_', ' ') ?? '—'}</Text>
            </View>
            <View style={s.totalRow}>
              <Text style={[s.totalLabel, { flex: 7 }]}>Total Paid</Text>
              <Text style={s.totalValue}>{fmt(paidAmt)}</Text>
            </View>
          </View>
        </View>

        <Text style={s.thankYou}>Thank you for your payment. Keep learning, keep growing! ♪</Text>

        <View style={s.footer}>
          <Text style={s.footerText}>Amuzic Academy · +91 89759 16381</Text>
          <Text style={s.footerText}>This is a computer-generated receipt.</Text>
        </View>
      </Page>
    </Document>
  )
}

import { Document, Page, View, Text } from '@react-pdf/renderer'
import { pdfStyles } from '../styles'
import { PdfHeader } from '../components/PdfHeader'
import { PdfFooter } from '../components/PdfFooter'
import { formatCurrency, formatDate } from '@amuzic/shared'
import type { FeeRecord, Student } from '@amuzic/shared'

interface Props {
  student: Student & { batch_name?: string; course_name?: string }
  fee: FeeRecord
}

export function FeeReceiptPdf({ student, fee }: Props) {
  const receiptNo = `FEE-${fee.id.slice(0, 8).toUpperCase()}`
  const paidDate = fee.paid_date ? formatDate(fee.paid_date) : '—'

  return (
    <Document>
      <Page size="A4" style={pdfStyles.page}>
        <PdfHeader
          reportTitle="PAYMENT RECEIPT"
          subtitle={`Receipt No: ${receiptNo}  ·  Date: ${paidDate}`}
        />

        {/* Student Details */}
        <Text style={pdfStyles.sectionTitle}>Student Details</Text>
        <View style={pdfStyles.summaryBox}>
          <View style={pdfStyles.summaryRow}>
            <Text style={pdfStyles.summaryLabel}>Student Name</Text>
            <Text style={pdfStyles.summaryValue}>{student.full_name}</Text>
          </View>
          <View style={pdfStyles.summaryRow}>
            <Text style={pdfStyles.summaryLabel}>Phone</Text>
            <Text style={pdfStyles.summaryValue}>{student.phone}</Text>
          </View>
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
        </View>

        {/* Payment Details */}
        <Text style={pdfStyles.sectionTitle}>Payment Details</Text>
        <View style={pdfStyles.table}>
          <View style={pdfStyles.tableHeader}>
            <Text style={[pdfStyles.tableHeaderCell, { flex: 2 }]}>Fee Type</Text>
            <Text style={[pdfStyles.tableHeaderCell, { flex: 2 }]}>Month / Year</Text>
            <Text style={[pdfStyles.tableHeaderCell, { flex: 1.5 }]}>Amount Due</Text>
            <Text style={[pdfStyles.tableHeaderCell, { flex: 1.5 }]}>Amount Paid</Text>
            <Text style={[pdfStyles.tableHeaderCell, { flex: 2 }]}>Mode</Text>
            <Text style={[pdfStyles.tableHeaderCell, { flex: 1 }]}>Status</Text>
          </View>
          <View style={pdfStyles.tableRow}>
            <Text style={[pdfStyles.tableCell, { flex: 2, textTransform: 'capitalize' }]}>{fee.fee_type}</Text>
            <Text style={[pdfStyles.tableCell, { flex: 2 }]}>{fee.month_year ?? '—'}</Text>
            <Text style={[pdfStyles.tableCell, { flex: 1.5 }]}>{formatCurrency(fee.amount)}</Text>
            <Text style={[pdfStyles.tableCell, { flex: 1.5 }]}>{formatCurrency(fee.paid_amount ?? fee.amount)}</Text>
            <Text style={[pdfStyles.tableCell, { flex: 2, textTransform: 'capitalize' }]}>{fee.payment_mode?.replace('_', ' ') ?? '—'}</Text>
            <Text style={[pdfStyles.tableCell, { flex: 1, textTransform: 'capitalize' }]}>{fee.status}</Text>
          </View>
          <View style={pdfStyles.totalRow}>
            <Text style={[pdfStyles.totalCell, { flex: 7 }]}>Amount Paid</Text>
            <Text style={[pdfStyles.totalCell, { flex: 2 }]}>{formatCurrency(fee.paid_amount ?? fee.amount)}</Text>
          </View>
        </View>

        <View style={[pdfStyles.thinDivider, { marginTop: 24 }]} />
        <Text style={{ fontSize: 10, textAlign: 'center', color: '#6B6B6B', marginTop: 8 }}>
          Thank you for your payment. Keep learning, keep growing! ♪
        </Text>

        <PdfFooter />
      </Page>
    </Document>
  )
}

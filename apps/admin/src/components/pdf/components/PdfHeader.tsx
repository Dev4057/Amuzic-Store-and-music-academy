import { View, Text } from '@react-pdf/renderer'
import { pdfStyles } from '../styles'

export function PdfHeader({ reportTitle, subtitle }: { reportTitle: string; subtitle?: string }) {
  return (
    <View style={pdfStyles.header}>
      <Text style={pdfStyles.academyName}>AMUZIC STORE &amp; MUSIC ACADEMY</Text>
      <Text style={pdfStyles.academyTagline}>Nurturing Musical Talent Since 2015</Text>
      <Text style={pdfStyles.academyAddress}>Bakaji Corner Chowk, Bavdhan, Pune | +91 89759 16381</Text>
      <View style={pdfStyles.goldDivider} />
      <Text style={pdfStyles.reportTitle}>{reportTitle}</Text>
      {subtitle ? <Text style={{ fontSize: 9, color: '#6B6B6B' }}>{subtitle}</Text> : null}
    </View>
  )
}

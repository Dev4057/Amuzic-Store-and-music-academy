import { View, Text } from '@react-pdf/renderer'
import { pdfStyles } from '../styles'

export function PdfFooter({ pageNote }: { pageNote?: string }) {
  return (
    <View style={pdfStyles.footer} fixed>
      <Text style={pdfStyles.footerText}>Amuzic Store &amp; Music Academy · This is a computer-generated document.</Text>
      <Text style={pdfStyles.footerText}>{pageNote ?? ''}</Text>
    </View>
  )
}

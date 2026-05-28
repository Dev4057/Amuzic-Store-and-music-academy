import type React from 'react'

export async function downloadPdf(
  element: React.ReactElement,
  filename: string,
  onStart: () => void,
  onDone: () => void,
  onError: () => void,
): Promise<void> {
  onStart()
  try {
    const { pdf } = await import('@react-pdf/renderer')
    const { saveAs } = await import('file-saver')
    const blob = await pdf(element).toBlob()
    saveAs(blob, filename)
  } catch {
    onError()
  } finally {
    onDone()
  }
}

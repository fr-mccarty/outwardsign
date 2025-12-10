'use client'

import { FileText, FileDown, Printer, Copy } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { toast } from 'sonner'

interface ExportButtonGroupProps {
  eventTypeSlug: string
  eventId: string
  scriptId: string
}

/**
 * ExportButtonGroup Component
 *
 * Displays 4 stacked export buttons for dynamic event scripts:
 * - PDF: Download PDF file
 * - Word: Download .docx file
 * - Print: Open print view in new tab
 * - Text: Download .txt file
 *
 * Per requirements: Full-width buttons, stacked vertically in sidebar.
 */
export function ExportButtonGroup({ eventTypeSlug, eventId, scriptId }: ExportButtonGroupProps) {
  const handlePDFExport = async () => {
    try {
      const response = await fetch(`/api/events/${eventTypeSlug}/${eventId}/scripts/${scriptId}/export/pdf`)
      if (!response.ok) {
        throw new Error('Failed to generate PDF')
      }
      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = response.headers.get('content-disposition')?.split('filename=')[1]?.replace(/"/g, '') || 'script.pdf'
      document.body.appendChild(a)
      a.click()
      window.URL.revokeObjectURL(url)
      document.body.removeChild(a)
      toast.success('PDF downloaded successfully')
    } catch (error) {
      console.error('Error exporting PDF:', error)
      toast.error('Failed to export PDF')
    }
  }

  const handleWordExport = async () => {
    try {
      const response = await fetch(`/api/events/${eventTypeSlug}/${eventId}/scripts/${scriptId}/export/docx`)
      if (!response.ok) {
        throw new Error('Failed to generate Word document')
      }
      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = response.headers.get('content-disposition')?.split('filename=')[1]?.replace(/"/g, '') || 'script.docx'
      document.body.appendChild(a)
      a.click()
      window.URL.revokeObjectURL(url)
      document.body.removeChild(a)
      toast.success('Word document downloaded successfully')
    } catch (error) {
      console.error('Error exporting Word:', error)
      toast.error('Failed to export Word document')
    }
  }

  const handlePrint = () => {
    window.open(`/print/events/${eventTypeSlug}/${eventId}/scripts/${scriptId}`, '_blank')
  }

  const handleTextExport = async () => {
    try {
      const response = await fetch(`/api/events/${eventTypeSlug}/${eventId}/scripts/${scriptId}/export/txt`)
      if (!response.ok) {
        throw new Error('Failed to generate text file')
      }
      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = response.headers.get('content-disposition')?.split('filename=')[1]?.replace(/"/g, '') || 'script.txt'
      document.body.appendChild(a)
      a.click()
      window.URL.revokeObjectURL(url)
      document.body.removeChild(a)
      toast.success('Text file downloaded successfully')
    } catch (error) {
      console.error('Error exporting text:', error)
      toast.error('Failed to export text file')
    }
  }

  return (
    <div className="space-y-2">
      <Button
        onClick={handlePDFExport}
        className="w-full justify-start"
        variant="default"
      >
        <FileText className="h-4 w-4 mr-2" />
        PDF
      </Button>

      <Button
        onClick={handleWordExport}
        className="w-full justify-start"
        variant="default"
      >
        <FileDown className="h-4 w-4 mr-2" />
        Word
      </Button>

      <Button
        onClick={handlePrint}
        className="w-full justify-start"
        variant="default"
      >
        <Printer className="h-4 w-4 mr-2" />
        Print
      </Button>

      <Button
        onClick={handleTextExport}
        className="w-full justify-start"
        variant="default"
      >
        <Copy className="h-4 w-4 mr-2" />
        Text
      </Button>
    </div>
  )
}

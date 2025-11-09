'use client'

import { Button } from '@/components/ui/button'
import { Printer, Download, FileText } from 'lucide-react'

interface EventActionsClientProps {
  eventId: string
  eventName: string
  startDate?: string
}

export function EventActionsClient({ eventId, eventName, startDate }: EventActionsClientProps) {
  const generateFilename = (extension: string) => {
    const eventDate = startDate
      ? new Date(startDate).toISOString().split('T')[0].replace(/-/g, '')
      : 'NoDate'
    const sanitizedName = eventName.replace(/[^a-z0-9]/gi, '-').substring(0, 30)
    return `event-${sanitizedName}-${eventDate}.${extension}`
  }

  const handlePrint = () => {
    window.open(`/print/events/${eventId}`, '_blank')
  }

  const handleDownloadPDF = () => {
    const link = document.createElement('a')
    link.href = `/api/events/${eventId}/pdf`
    link.download = generateFilename('pdf')
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  const handleDownloadWord = () => {
    const link = document.createElement('a')
    link.href = `/api/events/${eventId}/word`
    link.download = generateFilename('docx')
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  return (
    <>
      <Button variant="outline" onClick={handlePrint}>
        <Printer className="h-4 w-4 mr-2" />
        Print
      </Button>
      <Button variant="outline" onClick={handleDownloadPDF}>
        <Download className="h-4 w-4 mr-2" />
        PDF
      </Button>
      <Button variant="outline" onClick={handleDownloadWord}>
        <FileText className="h-4 w-4 mr-2" />
        Word
      </Button>
    </>
  )
}

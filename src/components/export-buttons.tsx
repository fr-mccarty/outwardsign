/**
 * ExportButtons Component
 *
 * Provides a dropdown menu with export options for user-defined event scripts:
 * - PDF download
 * - Word (DOCX) download
 * - Print view (opens in new tab)
 * - Text (TXT) download
 *
 * Usage:
 * <ExportButtons
 *   eventTypeId="uuid"
 *   eventId="uuid"
 *   scriptId="uuid"
 *   scriptName="English Program"
 * />
 */

'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Download, FileText, Printer } from 'lucide-react'

export interface ExportButtonsProps {
  /** Event type ID (UUID) */
  eventTypeId: string
  /** Event ID (UUID) */
  eventId: string
  /** Script ID (UUID) */
  scriptId: string
  /** Script name for display (optional) */
  scriptName?: string
  /** Button variant (default: 'outline') */
  variant?: 'default' | 'outline' | 'ghost' | 'link'
  /** Button size (default: 'default') */
  size?: 'default' | 'sm' | 'lg' | 'icon'
}

export function ExportButtons({
  eventTypeId,
  eventId,
  scriptId,
  scriptName = 'Script',
  variant = 'outline',
  size = 'default'
}: ExportButtonsProps) {
  const [isExporting, setIsExporting] = useState(false)

  /**
   * Triggers a file download from an API endpoint
   */
  const downloadFile = async (format: 'pdf' | 'docx' | 'txt') => {
    setIsExporting(true)
    try {
      const endpoint = `/api/events/${eventTypeId}/${eventId}/scripts/${scriptId}/export/${format}`

      const response = await fetch(endpoint)

      if (!response.ok) {
        throw new Error(`Export failed: ${response.statusText}`)
      }

      // Get filename from Content-Disposition header or construct default
      const contentDisposition = response.headers.get('Content-Disposition')
      let filename = `${scriptName}.${format}`

      if (contentDisposition) {
        const filenameMatch = contentDisposition.match(/filename="(.+)"/)
        if (filenameMatch) {
          filename = filenameMatch[1]
        }
      }

      // Create blob and trigger download
      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = filename
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      window.URL.revokeObjectURL(url)
    } catch (error) {
      console.error('Export error:', error)
      // TODO: Show toast notification with error message
      alert('Failed to export document. Please try again.')
    } finally {
      setIsExporting(false)
    }
  }

  /**
   * Opens print view in a new tab
   */
  const openPrintView = () => {
    const printUrl = `/print/events/${eventTypeId}/${eventId}/scripts/${scriptId}`
    window.open(printUrl, '_blank')
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant={variant}
          size={size}
          disabled={isExporting}
        >
          <Download className="mr-2 h-4 w-4" />
          {isExporting ? 'Exporting...' : 'Export'}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem
          onClick={() => downloadFile('pdf')}
          disabled={isExporting}
        >
          <FileText className="mr-2 h-4 w-4" />
          Download PDF
        </DropdownMenuItem>
        <DropdownMenuItem
          onClick={() => downloadFile('docx')}
          disabled={isExporting}
        >
          <FileText className="mr-2 h-4 w-4" />
          Download Word
        </DropdownMenuItem>
        <DropdownMenuItem
          onClick={openPrintView}
          disabled={isExporting}
        >
          <Printer className="mr-2 h-4 w-4" />
          Print
        </DropdownMenuItem>
        <DropdownMenuItem
          onClick={() => downloadFile('txt')}
          disabled={isExporting}
        >
          <FileText className="mr-2 h-4 w-4" />
          Download Text
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

"use client"

import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { FileText, Edit, Download, Printer } from 'lucide-react'
import Link from 'next/link'
import type { Event } from '@/lib/types'

interface ModuleViewPanelProps {
  /**
   * The entity being viewed (wedding, funeral, etc.)
   * Must have id, status, and created_at properties
   */
  entity: {
    id: string
    status?: string | null
    created_at: string
  }

  /**
   * Type of entity for display (e.g., "Wedding", "Funeral")
   */
  entityType: string

  /**
   * Module path for URLs (e.g., "weddings", "funerals")
   */
  modulePath: string

  /**
   * Main event for displaying location (optional)
   */
  mainEvent?: Event | null

  /**
   * Function to generate download filenames
   * @param extension - File extension (e.g., "pdf", "docx")
   * @returns filename with extension
   */
  generateFilename: (extension: string) => string

  /**
   * Custom print view path (optional)
   * Defaults to `/print/${modulePath}/${entity.id}`
   */
  printViewPath?: string
}

export function ModuleViewPanel({
  entity,
  entityType,
  modulePath,
  mainEvent,
  generateFilename,
  printViewPath,
}: ModuleViewPanelProps) {
  const defaultPrintPath = printViewPath || `/print/${modulePath}/${entity.id}`

  return (
    <div className="w-full md:w-80 space-y-4 print:hidden order-1 md:order-2">
      <Card>
        <CardContent className="pt-4 px-4 pb-2 space-y-3">
          <Button asChild className="w-full" variant="default">
            <Link href={`/${modulePath}/${entity.id}/edit`}>
              <Edit className="h-4 w-4 mr-2" />
              Edit {entityType}
            </Link>
          </Button>

          <Button
            className="w-full"
            variant="outline"
            onClick={() => window.open(defaultPrintPath, '_blank')}
          >
            <Printer className="h-4 w-4 mr-2" />
            Print View
          </Button>

          <div className="pt-2 border-t">
            <h3 className="font-semibold mb-2">Download Liturgy</h3>
            <div className="space-y-2">
              <Button
                className="w-full"
                variant="outline"
                onClick={() => {
                  const link = document.createElement('a')
                  link.href = `/api/${modulePath}/${entity.id}/pdf`
                  link.download = generateFilename('pdf')
                  document.body.appendChild(link)
                  link.click()
                  document.body.removeChild(link)
                }}
              >
                <Download className="h-4 w-4 mr-2" />
                PDF
              </Button>
              <Button
                className="w-full"
                variant="outline"
                onClick={() => {
                  const link = document.createElement('a')
                  link.href = `/api/${modulePath}/${entity.id}/word`
                  link.download = generateFilename('docx')
                  document.body.appendChild(link)
                  link.click()
                  document.body.removeChild(link)
                }}
              >
                <FileText className="h-4 w-4 mr-2" />
                Word Doc
              </Button>
            </div>
          </div>

          <div className="pt-4 border-t space-y-2 text-sm">
            <div>
              <span className="font-medium">Status:</span> {entity.status || 'N/A'}
            </div>
            {mainEvent?.location && (
              <div>
                <span className="font-medium">Location:</span> {mainEvent.location}
              </div>
            )}
            <div className="text-xs text-muted-foreground pt-1 border-t">
              Created: {new Date(entity.created_at).toLocaleDateString()}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

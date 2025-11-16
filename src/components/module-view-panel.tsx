"use client"

import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { FileText, Edit, Download, Printer } from 'lucide-react'
import Link from 'next/link'
import { ModuleStatusLabel } from '@/components/module-status-label'
import { TemplateSelectorDialog } from '@/components/template-selector-dialog'
import type { Event, Location } from '@/lib/types'
import type { LiturgyTemplate } from '@/lib/types/liturgy-content'

interface ModuleViewPanelProps {
  /**
   * The entity being viewed (wedding, funeral, etc.)
   * Must have id, status, and created_at properties
   */
  entity: {
    id: string
    status?: string | null
    created_at: string
    [key: string]: any  // Allow template_id fields
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
   * Can include location object if fetched with relations
   */
  mainEvent?: (Event & { location?: Location | null }) | null

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

  /**
   * Status type for displaying correct labels
   * Defaults to "module" for most entities
   */
  statusType?: 'module' | 'mass' | 'mass-intention'

  /**
   * Template selector configuration (optional)
   * If provided, shows template selector in metadata section
   */
  templateConfig?: {
    currentTemplateId?: string | null
    templates: Record<string, LiturgyTemplate<any>>
    templateFieldName: string  // e.g., "wedding_template_id", "mass_template_id"
    defaultTemplateId: string
    onUpdateTemplate: (templateId: string) => Promise<void>
  }
}

export function ModuleViewPanel({
  entity,
  entityType,
  modulePath,
  mainEvent,
  generateFilename,
  printViewPath,
  statusType = 'module',
  templateConfig,
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
            <div className="flex items-center gap-2">
              <span className="font-medium">Status:</span>
              <ModuleStatusLabel status={entity.status} statusType={statusType} />
            </div>
            {templateConfig && (
              <div className="pt-2 border-t">
                <TemplateSelectorDialog
                  currentTemplateId={templateConfig.currentTemplateId}
                  templates={templateConfig.templates}
                  moduleName={entityType}
                  onSave={templateConfig.onUpdateTemplate}
                  defaultTemplateId={templateConfig.defaultTemplateId}
                />
              </div>
            )}
            {mainEvent?.location && (
              <div>
                <span className="font-medium">Location:</span> {mainEvent.location.name}
                {(mainEvent.location.street || mainEvent.location.city || mainEvent.location.state) && (
                  <div className="text-xs text-muted-foreground mt-1">
                    {[mainEvent.location.street, mainEvent.location.city, mainEvent.location.state]
                      .filter(Boolean).join(', ')}
                  </div>
                )}
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

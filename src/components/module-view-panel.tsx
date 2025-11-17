"use client"

import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { FileText, Edit, Download, Printer } from 'lucide-react'
import Link from 'next/link'
import { ModuleStatusLabel } from '@/components/module-status-label'
import { TemplateSelectorDialog } from '@/components/template-selector-dialog'
import { DeleteButton } from '@/components/delete-button'
import type { Event, Location } from '@/lib/types'
import type { LiturgyTemplate } from '@/lib/types/liturgy-content'

interface ModuleViewPanelProps {
  /**
   * The entity being viewed (wedding, funeral, etc.)
   * Must have id and created_at properties
   */
  entity: {
    id: string
    created_at: string
    [key: string]: any
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
   * Action buttons for the Actions section (optional)
   * If provided, shows Actions section with these buttons
   */
  actionButtons?: React.ReactNode

  /**
   * Export buttons for the Export section (optional)
   * If provided, shows Export section with these buttons
   */
  exportButtons?: React.ReactNode

  /**
   * Template Selector component (optional)
   * If provided, shows Template Selector section with this component
   */
  templateSelector?: React.ReactNode

  /**
   * Details section content (optional)
   * Custom content for the Details section. created_at will be automatically appended.
   */
  details?: React.ReactNode

  /**
   * Delete function (optional)
   * If provided, shows delete button in Delete section
   */
  onDelete?: (id: string) => Promise<void>
}

export function ModuleViewPanel({
  entity,
  entityType,
  modulePath,
  actionButtons,
  exportButtons,
  templateSelector,
  details,
  onDelete,
}: ModuleViewPanelProps) {
  return (
    <div className="w-full md:w-80 space-y-4 print:hidden order-1 md:order-2">
      <Card>
        <CardContent className="pt-4 px-4 pb-4 space-y-4">
          {/* Actions Section */}
          {actionButtons && (
            <div className="space-y-2">
              <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
                Actions
              </h3>
              {actionButtons}
            </div>
          )}

          {/* Export Section */}
          {exportButtons && (
            <div className={actionButtons ? "pt-4 border-t space-y-2" : "space-y-2"}>
              <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
                Export
              </h3>
              {exportButtons}
            </div>
          )}

          {/* Template Selector Section */}
          {templateSelector && (
            <div className={(actionButtons || exportButtons) ? "pt-4 border-t space-y-2" : "space-y-2"}>
              <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
                Template Selector
              </h3>
              {templateSelector}
            </div>
          )}

          {/* Details Section - Hidden on small screens */}
          <div className={(actionButtons || exportButtons || templateSelector) ? "hidden md:block pt-4 border-t space-y-3 text-sm" : "hidden md:block space-y-3 text-sm"}>
            <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
              Details
            </h3>

            {/* Custom details content */}
            {details}

            {/* Always show created_at at the bottom */}
            {entity.created_at && (
              <div className={details ? "text-xs text-muted-foreground pt-2 border-t" : "text-xs text-muted-foreground"}>
                Created: {new Date(entity.created_at).toLocaleDateString()}
              </div>
            )}
          </div>

          {/* Delete Section */}
          {onDelete && (
            <div className="pt-4 border-t">
              <DeleteButton
                entityId={entity.id}
                entityType={entityType}
                modulePath={modulePath}
                onDelete={onDelete}
              />
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

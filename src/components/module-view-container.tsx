"use client"

import { Card, CardContent } from '@/components/ui/card'
import { ModuleViewPanel } from '@/components/module-view-panel'
import { renderHTML } from '@/lib/renderers/html-renderer'
import type { Event } from '@/lib/types'
import type { LiturgyDocument, LiturgyTemplate } from '@/lib/types/liturgy-content'

interface ModuleViewContainerProps {
  /**
   * The entity being viewed (wedding, funeral, etc.)
   * Must have id, status, and created_at properties
   */
  entity: any

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
   * Function to build liturgy document from entity (optional)
   * @param entity - The entity with relations
   * @param templateId - The template ID to use
   * @returns Document structure for rendering
   * If not provided, children must be provided for content
   */
  buildLiturgy?: (entity: any, templateId: string) => LiturgyDocument

  /**
   * Function to extract template ID from entity (optional)
   * @param entity - The entity with relations
   * @returns Template ID string
   * Required if buildLiturgy is provided
   */
  getTemplateId?: (entity: any) => string

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
    templateFieldName: string
    defaultTemplateId: string
    onUpdateTemplate: (templateId: string) => Promise<void>
  }

  /**
   * Additional content to render before the liturgy content (optional)
   * Useful for module-specific cards like Mass Intention
   */
  children?: React.ReactNode

  /**
   * Delete function (optional)
   * If provided, shows delete button at bottom of sidebar panel
   */
  onDelete?: (id: string) => Promise<void>
}

/**
 * Reusable container for module view pages (weddings, funerals, baptisms, etc.)
 * Handles the layout, liturgy building, and rendering pattern.
 */
export function ModuleViewContainer({
  entity,
  entityType,
  modulePath,
  mainEvent,
  generateFilename,
  buildLiturgy,
  getTemplateId,
  printViewPath,
  statusType = 'module',
  templateConfig,
  children,
  onDelete,
}: ModuleViewContainerProps) {
  // Only build liturgy if builder functions are provided
  let liturgyContent: React.ReactNode = null

  if (buildLiturgy && getTemplateId) {
    // Get template ID from entity
    const templateId = getTemplateId(entity)

    // Build liturgy content using module-specific builder
    const liturgyDocument = buildLiturgy(entity, templateId)

    // Render to HTML/React elements
    liturgyContent = renderHTML(liturgyDocument)
  }

  return (
    <div className="flex flex-col md:flex-row gap-6">
      {/* Side Panel - appears first on mobile, second on desktop */}
      <ModuleViewPanel
        entity={entity}
        entityType={entityType}
        modulePath={modulePath}
        mainEvent={mainEvent}
        generateFilename={generateFilename}
        printViewPath={printViewPath}
        statusType={statusType}
        templateConfig={templateConfig}
        onDelete={onDelete}
      />

      {/* Main Content - appears second on mobile, first on desktop */}
      <div className="flex-1 order-2 md:order-1 space-y-6">
        {/* Optional additional content (e.g., Mass Intention card) */}
        {children}

        {/* Liturgy Content (only if liturgy builder is provided) */}
        {liturgyContent && (
          <Card className="bg-white">
            <CardContent className="p-6 space-y-6">
              {liturgyContent}
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}

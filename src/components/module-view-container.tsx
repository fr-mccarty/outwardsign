"use client"

import { useState, useEffect } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { ModuleViewPanel } from '@/components/module-view-panel'
import { renderHTML } from '@/lib/renderers/html-renderer'
import type { Event } from '@/lib/types'
import type { LiturgyDocument } from '@/lib/types/liturgy-content'
import React from "react";

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
   * Function to generate download filenames (optional)
   * @param extension - File extension (e.g., "pdf", "docx")
   * @returns filename with extension
   * Not used by ModuleViewContainer itself - only needed if parent component generates export buttons
   */
  generateFilename?: (extension: string) => string

  /**
   * Function to build liturgy document from entity (optional)
   * @param entity - The entity with relations
   * @param templateId - The template ID to use
   * @returns Document structure for rendering (can be sync or async)
   * If not provided, children must be provided for content
   */
  buildLiturgy?: (entity: any, templateId: string) => LiturgyDocument | Promise<LiturgyDocument>

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
   * Additional content to render before the liturgy content (optional)
   * Useful for module-specific cards like Mass Intention
   */
  children?: React.ReactNode

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
  buildLiturgy,
  getTemplateId,
  children,
  actionButtons,
  exportButtons,
  templateSelector,
  details,
  onDelete,
}: ModuleViewContainerProps) {
  const [liturgyContent, setLiturgyContent] = useState<React.ReactNode>(null)
  const [isLoading, setIsLoading] = useState(false)

  // Build liturgy content when entity or template changes
  useEffect(() => {
    async function buildContent() {
      if (!buildLiturgy || !getTemplateId) {
        setLiturgyContent(null)
        return
      }

      setIsLoading(true)
      try {
        // Get template ID from entity
        const templateId = getTemplateId(entity)

        // Build liturgy content using module-specific builder (supports async)
        const liturgyDocument = await Promise.resolve(buildLiturgy(entity, templateId))

        // Render to HTML/React elements
        setLiturgyContent(renderHTML(liturgyDocument))
      } catch (error) {
        console.error('Error building liturgy content:', error)
        setLiturgyContent(null)
      } finally {
        setIsLoading(false)
      }
    }

    buildContent()
  }, [entity, buildLiturgy, getTemplateId])

  return (
    <div className="flex flex-col md:flex-row gap-6">
      {/* Side Panel - appears first on mobile, second on desktop */}
      <ModuleViewPanel
        entity={entity}
        entityType={entityType}
        modulePath={modulePath}
        actionButtons={actionButtons}
        exportButtons={exportButtons}
        templateSelector={templateSelector}
        details={details}
        onDelete={onDelete}
      />

      {/* Main Content - appears second on mobile, first on desktop */}
      <div className="flex-1 order-2 md:order-1 space-y-6">
        {/* Optional additional content (e.g., Mass Intention card) */}
        {children}

        {/* Liturgy Content (only if liturgy builder is provided) */}
        {(liturgyContent || isLoading) && (
          <Card className="bg-white">
            <CardContent className="p-6 space-y-6">
              {isLoading ? (
                <div className="text-center text-muted-foreground py-8">Loading content...</div>
              ) : (
                liturgyContent
              )}
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}

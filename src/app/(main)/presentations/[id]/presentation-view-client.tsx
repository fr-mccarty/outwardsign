"use client"

import { PresentationWithRelations, updatePresentation, deletePresentation } from '@/lib/actions/presentations'
import { ModuleViewContainer } from '@/components/module-view-container'
import { buildPresentationLiturgy, PRESENTATION_TEMPLATES } from '@/lib/content-builders/presentation'
import { Button } from '@/components/ui/button'
import { ModuleStatusLabel } from '@/components/module-status-label'
import { TemplateSelectorDialog } from '@/components/template-selector-dialog'
import { Edit, Printer, FileText, Download } from 'lucide-react'
import Link from 'next/link'

interface PresentationViewClientProps {
  presentation: PresentationWithRelations
}

export function PresentationViewClient({ presentation }: PresentationViewClientProps) {
  // Generate filename for downloads
  const generateFilename = (extension: string) => {
    const childLastName = presentation.child?.last_name || 'Child'
    const presentationDate = presentation.presentation_event?.start_date
      ? new Date(presentation.presentation_event.start_date).toISOString().split('T')[0].replace(/-/g, '')
      : 'NoDate'
    return `presentation-${childLastName}-${presentationDate}.${extension}`
  }

  // Extract template ID from presentation record
  const getTemplateId = (presentation: PresentationWithRelations) => {
    return presentation.presentation_template_id || 'presentation-spanish'
  }

  // Handle template update
  const handleUpdateTemplate = async (templateId: string) => {
    await updatePresentation(presentation.id, {
      presentation_template_id: templateId,
    })
  }

  // Generate action buttons
  const actionButtons = (
    <>
      <Button asChild className="w-full">
        <Link href={`/presentations/${presentation.id}/edit`}>
          <Edit className="h-4 w-4 mr-2" />
          Edit Presentation
        </Link>
      </Button>
      <Button asChild variant="outline" className="w-full">
        <Link href={`/print/presentations/${presentation.id}`} target="_blank">
          <Printer className="h-4 w-4 mr-2" />
          Print View
        </Link>
      </Button>
    </>
  )

  // Generate export buttons
  const exportButtons = (
    <>
      <Button asChild variant="outline" className="w-full">
        <Link href={`/api/presentations/${presentation.id}/pdf?filename=${generateFilename('pdf')}`} target="_blank">
          <FileText className="h-4 w-4 mr-2" />
          Download PDF
        </Link>
      </Button>
      <Button asChild variant="outline" className="w-full">
        <Link href={`/api/presentations/${presentation.id}/word?filename=${generateFilename('docx')}`}>
          <Download className="h-4 w-4 mr-2" />
          Download Word
        </Link>
      </Button>
    </>
  )

  // Generate template selector
  const templateSelector = (
    <TemplateSelectorDialog
      currentTemplateId={presentation.presentation_template_id}
      templates={PRESENTATION_TEMPLATES}
      moduleName="Presentation"
      onSave={handleUpdateTemplate}
      defaultTemplateId="presentation-spanish"
    />
  )

  // Generate details section content
  const details = (
    <>
      {presentation.status && (
        <div className="flex items-center gap-2">
          <span className="font-medium">Status:</span>
          <ModuleStatusLabel status={presentation.status} statusType="module" />
        </div>
      )}

      {presentation.presentation_event?.location && (
        <div className={presentation.status ? "pt-2 border-t" : ""}>
          <span className="font-medium">Location:</span> {presentation.presentation_event.location.name}
          {(presentation.presentation_event.location.street || presentation.presentation_event.location.city || presentation.presentation_event.location.state) && (
            <div className="text-xs text-muted-foreground mt-1">
              {[presentation.presentation_event.location.street, presentation.presentation_event.location.city, presentation.presentation_event.location.state]
                .filter(Boolean).join(', ')}
            </div>
          )}
        </div>
      )}
    </>
  )

  return (
    <ModuleViewContainer
      entity={presentation}
      entityType="Presentation"
      modulePath="presentations"
      mainEvent={presentation.presentation_event}
      generateFilename={generateFilename}
      buildLiturgy={buildPresentationLiturgy}
      getTemplateId={getTemplateId}
      actionButtons={actionButtons}
      exportButtons={exportButtons}
      templateSelector={templateSelector}
      details={details}
      onDelete={deletePresentation}
    />
  )
}

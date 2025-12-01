"use client"

import { BaptismWithRelations, updateBaptism, deleteBaptism } from '@/lib/actions/baptisms'
import { ModuleViewContainer } from '@/components/module-view-container'
import { buildBaptismLiturgy, BAPTISM_TEMPLATES } from '@/lib/content-builders/baptism'
import { Button } from '@/components/ui/button'
import { ModuleStatusLabel } from '@/components/module-status-label'
import { TemplateSelectorDialog } from '@/components/template-selector-dialog'
import { Edit, Printer, FileText, Download } from 'lucide-react'
import Link from 'next/link'
import { getBaptismFilename } from '@/lib/utils/formatters'

interface BaptismViewClientProps {
  baptism: BaptismWithRelations
}

export function BaptismViewClient({ baptism }: BaptismViewClientProps) {
  // Generate filename for downloads
  const generateFilename = (extension: string) => {
    return getBaptismFilename(baptism, extension)
  }

  // Extract template ID from baptism record
  const getTemplateId = (baptism: BaptismWithRelations) => {
    return baptism.baptism_template_id || 'baptism-summary-english'
  }

  // Handle template update
  const handleUpdateTemplate = async (templateId: string) => {
    await updateBaptism(baptism.id, {
      baptism_template_id: templateId,
    })
  }

  // Generate action buttons
  const actionButtons = (
    <>
      <Button asChild className="w-full">
        <Link href={`/baptisms/${baptism.id}/edit`}>
          <Edit className="h-4 w-4 mr-2" />
          Edit Baptism
        </Link>
      </Button>
      <Button asChild variant="outline" className="w-full">
        <Link href={`/print/baptisms/${baptism.id}`} target="_blank">
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
        <Link href={`/api/baptisms/${baptism.id}/pdf?filename=${generateFilename('pdf')}`} target="_blank">
          <FileText className="h-4 w-4 mr-2" />
          Download PDF
        </Link>
      </Button>
      <Button asChild variant="outline" className="w-full">
        <Link href={`/api/baptisms/${baptism.id}/word?filename=${generateFilename('docx')}`}>
          <Download className="h-4 w-4 mr-2" />
          Download Word
        </Link>
      </Button>
    </>
  )

  // Generate template selector
  const templateSelector = (
    <TemplateSelectorDialog
      currentTemplateId={baptism.baptism_template_id}
      templates={BAPTISM_TEMPLATES}
      moduleName="Baptism"
      onSave={handleUpdateTemplate}
      defaultTemplateId="baptism-summary-english"
    />
  )

  // Generate details section content
  const details = (
    <>
      {/* Show group baptism link if part of a group */}
      {baptism.group_baptism_id && (
        <Link
          href={`/group-baptisms/${baptism.group_baptism_id}`}
          className="block p-4 rounded-lg border-2 border-primary bg-primary/5 hover:bg-primary/10 transition-colors mb-4"
        >
          <div className="flex items-center justify-between">
            <div>
              <div className="font-semibold text-lg text-primary">Part of Group Baptism</div>
              <div className="text-sm text-muted-foreground mt-1">
                This baptism is part of a group baptism ceremony. Click to view the group details.
              </div>
            </div>
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-primary"><path d="m9 18 6-6-6-6"/></svg>
          </div>
        </Link>
      )}

      {baptism.status && (
        <div className="flex items-center gap-2">
          <span className="font-medium">Status:</span>
          <ModuleStatusLabel status={baptism.status} statusType="module" />
        </div>
      )}

      {/* Only show location if NOT part of a group (group manages event) */}
      {!baptism.group_baptism_id && baptism.baptism_event?.location && (
        <div className={baptism.status ? "pt-2 border-t" : ""}>
          <span className="font-medium">Location:</span> {baptism.baptism_event.location.name}
          {(baptism.baptism_event.location.street || baptism.baptism_event.location.city || baptism.baptism_event.location.state) && (
            <div className="text-xs text-muted-foreground mt-1">
              {[baptism.baptism_event.location.street, baptism.baptism_event.location.city, baptism.baptism_event.location.state]
                .filter(Boolean).join(', ')}
            </div>
          )}
        </div>
      )}

      {baptism.note && (
        <div className={(baptism.status || (!baptism.group_baptism_id && baptism.baptism_event?.location)) ? "pt-2 border-t" : ""}>
          <span className="font-medium">Notes:</span>
          <div className="text-sm text-muted-foreground mt-1 whitespace-pre-wrap">
            {baptism.note}
          </div>
        </div>
      )}
    </>
  )

  return (
    <ModuleViewContainer
      entity={baptism}
      entityType="Baptism"
      modulePath="baptisms"
      mainEvent={baptism.baptism_event}
      generateFilename={generateFilename}
      buildLiturgy={buildBaptismLiturgy}
      getTemplateId={getTemplateId}
      actionButtons={actionButtons}
      exportButtons={exportButtons}
      templateSelector={templateSelector}
      details={details}
      onDelete={deleteBaptism}
    />
  )
}

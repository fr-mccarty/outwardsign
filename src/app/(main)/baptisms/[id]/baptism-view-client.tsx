"use client"

import { BaptismWithRelations, updateBaptism, deleteBaptism } from '@/lib/actions/baptisms'
import { ModuleViewContainer } from '@/components/module-view-container'
import { buildBaptismLiturgy, BAPTISM_TEMPLATES } from '@/lib/content-builders/baptism'
import { Button } from '@/components/ui/button'
import { ModuleStatusLabel } from '@/components/module-status-label'
import { TemplateSelectorDialog } from '@/components/template-selector-dialog'
import { Edit, Printer, FileText, Download } from 'lucide-react'
import Link from 'next/link'

interface BaptismViewClientProps {
  baptism: BaptismWithRelations
}

export function BaptismViewClient({ baptism }: BaptismViewClientProps) {
  // Generate filename for downloads
  const generateFilename = (extension: string) => {
    const childLastName = baptism.child?.last_name || 'Child'
    const baptismDate = baptism.baptism_event?.start_date
      ? new Date(baptism.baptism_event.start_date).toISOString().split('T')[0].replace(/-/g, '')
      : 'NoDate'
    return `${childLastName}-Baptism-${baptismDate}.${extension}`
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
      {baptism.status && (
        <div className="flex items-center gap-2">
          <span className="font-medium">Status:</span>
          <ModuleStatusLabel status={baptism.status} statusType="module" />
        </div>
      )}

      {baptism.baptism_event?.location && (
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

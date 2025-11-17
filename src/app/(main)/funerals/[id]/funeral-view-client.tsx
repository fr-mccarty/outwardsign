"use client"

import { FuneralWithRelations, updateFuneral, deleteFuneral } from '@/lib/actions/funerals'
import { ModuleViewContainer } from '@/components/module-view-container'
import { buildFuneralLiturgy, FUNERAL_TEMPLATES } from '@/lib/content-builders/funeral'
import { Button } from '@/components/ui/button'
import { ModuleStatusLabel } from '@/components/module-status-label'
import { TemplateSelectorDialog } from '@/components/template-selector-dialog'
import { Edit, Printer, FileText, Download } from 'lucide-react'
import Link from 'next/link'

interface FuneralViewClientProps {
  funeral: FuneralWithRelations
}

export function FuneralViewClient({ funeral }: FuneralViewClientProps) {
  // Generate filename for downloads
  const generateFilename = (extension: string) => {
    const deceasedLastName = funeral.deceased?.last_name || 'Deceased'
    const funeralDate = funeral.funeral_event?.start_date
      ? new Date(funeral.funeral_event.start_date).toISOString().split('T')[0].replace(/-/g, '')
      : 'NoDate'
    return `${deceasedLastName}-Funeral-${funeralDate}.${extension}`
  }

  // Extract template ID from funeral record
  const getTemplateId = (funeral: FuneralWithRelations) => {
    return funeral.funeral_template_id || 'funeral-full-script-english'
  }

  // Handle template update
  const handleUpdateTemplate = async (templateId: string) => {
    await updateFuneral(funeral.id, {
      funeral_template_id: templateId,
    })
  }

  // Generate action buttons
  const actionButtons = (
    <>
      <Button asChild className="w-full">
        <Link href={`/funerals/${funeral.id}/edit`}>
          <Edit className="h-4 w-4 mr-2" />
          Edit Funeral
        </Link>
      </Button>
      <Button asChild variant="outline" className="w-full">
        <Link href={`/print/funerals/${funeral.id}`} target="_blank">
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
        <Link href={`/api/funerals/${funeral.id}/pdf?filename=${generateFilename('pdf')}`} target="_blank">
          <FileText className="h-4 w-4 mr-2" />
          Download PDF
        </Link>
      </Button>
      <Button asChild variant="outline" className="w-full">
        <Link href={`/api/funerals/${funeral.id}/word?filename=${generateFilename('docx')}`}>
          <Download className="h-4 w-4 mr-2" />
          Download Word
        </Link>
      </Button>
    </>
  )

  // Generate template selector
  const templateSelector = (
    <TemplateSelectorDialog
      currentTemplateId={funeral.funeral_template_id}
      templates={FUNERAL_TEMPLATES}
      moduleName="Funeral"
      onSave={handleUpdateTemplate}
      defaultTemplateId="funeral-full-script-english"
    />
  )

  // Generate details section content
  const details = (
    <>
      {funeral.status && (
        <div className="flex items-center gap-2">
          <span className="font-medium">Status:</span>
          <ModuleStatusLabel status={funeral.status} statusType="module" />
        </div>
      )}

      {funeral.funeral_event?.location && (
        <div className={funeral.status ? "pt-2 border-t" : ""}>
          <span className="font-medium">Location:</span> {funeral.funeral_event.location.name}
          {(funeral.funeral_event.location.street || funeral.funeral_event.location.city || funeral.funeral_event.location.state) && (
            <div className="text-xs text-muted-foreground mt-1">
              {[funeral.funeral_event.location.street, funeral.funeral_event.location.city, funeral.funeral_event.location.state]
                .filter(Boolean).join(', ')}
            </div>
          )}
        </div>
      )}
    </>
  )

  return (
    <ModuleViewContainer
      entity={funeral}
      entityType="Funeral"
      modulePath="funerals"
      mainEvent={funeral.funeral_event}
      generateFilename={generateFilename}
      buildLiturgy={buildFuneralLiturgy}
      getTemplateId={getTemplateId}
      actionButtons={actionButtons}
      exportButtons={exportButtons}
      templateSelector={templateSelector}
      details={details}
      onDelete={deleteFuneral}
    />
  )
}

"use client"

import { QuinceaneraWithRelations, updateQuinceanera, deleteQuinceanera } from '@/lib/actions/quinceaneras'
import { ModuleViewContainer } from '@/components/module-view-container'
import { buildQuinceaneraLiturgy, QUINCEANERA_TEMPLATES } from '@/lib/content-builders/quinceanera'
import { Button } from '@/components/ui/button'
import { ModuleStatusLabel } from '@/components/module-status-label'
import { TemplateSelectorDialog } from '@/components/template-selector-dialog'
import { Edit, Printer, FileText, Download } from 'lucide-react'
import Link from 'next/link'

interface QuinceaneraViewClientProps {
  quinceanera: QuinceaneraWithRelations
}

export function QuinceaneraViewClient({ quinceanera }: QuinceaneraViewClientProps) {
  // Generate filename for downloads
  const generateFilename = (extension: string) => {
    const quinceaneraLastName = quinceanera.quinceanera?.last_name || 'Quinceanera'
    const quinceaneraDate = quinceanera.quinceanera_event?.start_date
      ? new Date(quinceanera.quinceanera_event.start_date).toISOString().split('T')[0].replace(/-/g, '')
      : 'NoDate'
    return `${quinceaneraLastName}-Quinceanera-${quinceaneraDate}.${extension}`
  }

  // Extract template ID from quinceanera record
  const getTemplateId = (quinceanera: QuinceaneraWithRelations) => {
    return quinceanera.quinceanera_template_id || 'quinceanera-full-script-english'
  }

  // Handle template update
  const handleUpdateTemplate = async (templateId: string) => {
    await updateQuinceanera(quinceanera.id, {
      quinceanera_template_id: templateId,
    })
  }

  // Generate action buttons
  const actionButtons = (
    <>
      <Button asChild className="w-full">
        <Link href={`/quinceaneras/${quinceanera.id}/edit`}>
          <Edit className="h-4 w-4 mr-2" />
          Edit Quinceañera
        </Link>
      </Button>
      <Button asChild variant="outline" className="w-full">
        <Link href={`/print/quinceaneras/${quinceanera.id}`} target="_blank">
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
        <Link href={`/api/quinceaneras/${quinceanera.id}/pdf?filename=${generateFilename('pdf')}`} target="_blank">
          <FileText className="h-4 w-4 mr-2" />
          Download PDF
        </Link>
      </Button>
      <Button asChild variant="outline" className="w-full">
        <Link href={`/api/quinceaneras/${quinceanera.id}/word?filename=${generateFilename('docx')}`}>
          <Download className="h-4 w-4 mr-2" />
          Download Word
        </Link>
      </Button>
    </>
  )

  // Generate template selector
  const templateSelector = (
    <TemplateSelectorDialog
      currentTemplateId={quinceanera.quinceanera_template_id}
      templates={QUINCEANERA_TEMPLATES}
      moduleName="Quinceañera"
      onSave={handleUpdateTemplate}
      defaultTemplateId="quinceanera-full-script-english"
    />
  )

  // Generate details section content
  const details = (
    <>
      {quinceanera.status && (
        <div className="flex items-center gap-2">
          <span className="font-medium">Status:</span>
          <ModuleStatusLabel status={quinceanera.status} statusType="module" />
        </div>
      )}

      {quinceanera.quinceanera_event?.location && (
        <div className={quinceanera.status ? "pt-2 border-t" : ""}>
          <span className="font-medium">Location:</span> {quinceanera.quinceanera_event.location.name}
          {(quinceanera.quinceanera_event.location.street || quinceanera.quinceanera_event.location.city || quinceanera.quinceanera_event.location.state) && (
            <div className="text-xs text-muted-foreground mt-1">
              {[quinceanera.quinceanera_event.location.street, quinceanera.quinceanera_event.location.city, quinceanera.quinceanera_event.location.state]
                .filter(Boolean).join(', ')}
            </div>
          )}
        </div>
      )}
    </>
  )

  return (
    <ModuleViewContainer
      entity={quinceanera}
      entityType="Quinceañera"
      modulePath="quinceaneras"
      mainEvent={quinceanera.quinceanera_event}
      generateFilename={generateFilename}
      buildLiturgy={buildQuinceaneraLiturgy}
      getTemplateId={getTemplateId}
      actionButtons={actionButtons}
      exportButtons={exportButtons}
      templateSelector={templateSelector}
      details={details}
      onDelete={deleteQuinceanera}
    />
  )
}

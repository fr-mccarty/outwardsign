"use client"

import { WeddingWithRelations, updateWedding, deleteWedding } from '@/lib/actions/weddings'
import { ModuleViewContainer } from '@/components/module-view-container'
import { buildWeddingLiturgy, WEDDING_TEMPLATES } from '@/lib/content-builders/wedding'
import { Button } from '@/components/ui/button'
import { ModuleStatusLabel } from '@/components/module-status-label'
import { TemplateSelectorDialog } from '@/components/template-selector-dialog'
import { Edit, Printer, FileText, Download } from 'lucide-react'
import Link from 'next/link'
import { getWeddingFilename } from '@/lib/utils/formatters'

interface WeddingViewClientProps {
  wedding: WeddingWithRelations
}

export function WeddingViewClient({ wedding }: WeddingViewClientProps) {
  // Generate filename for downloads
  const generateFilename = (extension: string) => {
    return getWeddingFilename(wedding, extension)
  }

  // Extract template ID from wedding record
  const getTemplateId = (wedding: WeddingWithRelations) => {
    return wedding.wedding_template_id || 'wedding-full-script-english'
  }

  // Handle template update
  const handleUpdateTemplate = async (templateId: string) => {
    await updateWedding(wedding.id, {
      wedding_template_id: templateId,
    })
  }

  // Generate action buttons
  const actionButtons = (
    <>
      <Button asChild className="w-full">
        <Link href={`/weddings/${wedding.id}/edit`}>
          <Edit className="h-4 w-4 mr-2" />
          Edit Wedding
        </Link>
      </Button>
      <Button asChild variant="outline" className="w-full">
        <Link href={`/print/weddings/${wedding.id}`} target="_blank">
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
        <Link href={`/api/weddings/${wedding.id}/pdf?filename=${generateFilename('pdf')}`} target="_blank">
          <FileText className="h-4 w-4 mr-2" />
          Download PDF
        </Link>
      </Button>
      <Button asChild variant="outline" className="w-full">
        <Link href={`/api/weddings/${wedding.id}/word?filename=${generateFilename('docx')}`}>
          <Download className="h-4 w-4 mr-2" />
          Download Word
        </Link>
      </Button>
    </>
  )

  // Generate template selector
  const templateSelector = (
    <TemplateSelectorDialog
      currentTemplateId={wedding.wedding_template_id}
      templates={WEDDING_TEMPLATES}
      moduleName="Wedding"
      onSave={handleUpdateTemplate}
      defaultTemplateId="wedding-full-script-english"
    />
  )

  // Generate details section content
  const details = (
    <>
      {wedding.status && (
        <div className="flex items-center gap-2">
          <span className="font-medium">Status:</span>
          <ModuleStatusLabel status={wedding.status} statusType="module" />
        </div>
      )}

      {wedding.wedding_event?.location && (
        <div className={wedding.status ? "pt-2 border-t" : ""}>
          <span className="font-medium">Location:</span> {wedding.wedding_event.location.name}
          {(wedding.wedding_event.location.street || wedding.wedding_event.location.city || wedding.wedding_event.location.state) && (
            <div className="text-xs text-muted-foreground mt-1">
              {[wedding.wedding_event.location.street, wedding.wedding_event.location.city, wedding.wedding_event.location.state]
                .filter(Boolean).join(', ')}
            </div>
          )}
        </div>
      )}
    </>
  )

  return (
    <ModuleViewContainer
      entity={wedding}
      entityType="Wedding"
      modulePath="weddings"
      mainEvent={wedding.wedding_event}
      generateFilename={generateFilename}
      buildLiturgy={buildWeddingLiturgy}
      getTemplateId={getTemplateId}
      actionButtons={actionButtons}
      exportButtons={exportButtons}
      templateSelector={templateSelector}
      details={details}
      onDelete={deleteWedding}
    />
  )
}

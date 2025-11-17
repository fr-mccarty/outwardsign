"use client"

import { MassIntentionWithRelations, updateMassIntention, deleteMassIntention } from '@/lib/actions/mass-intentions'
import { ModuleViewContainer } from '@/components/module-view-container'
import { buildMassIntentionLiturgy, MASS_INTENTION_TEMPLATES } from '@/lib/content-builders/mass-intention'
import { Button } from '@/components/ui/button'
import { ModuleStatusLabel } from '@/components/module-status-label'
import { TemplateSelectorDialog } from '@/components/template-selector-dialog'
import { Edit, Printer, FileText, Download } from 'lucide-react'
import Link from 'next/link'
import { getMassIntentionFilename } from '@/lib/utils/formatters'

interface MassIntentionViewClientProps {
  intention: MassIntentionWithRelations
}

export function MassIntentionViewClient({ intention }: MassIntentionViewClientProps) {
  // Generate filename for downloads
  const generateFilename = (extension: string) => {
    return getMassIntentionFilename(intention, extension)
  }

  // Extract template ID from mass intention record
  const getTemplateId = (intention: MassIntentionWithRelations) => {
    return intention.mass_intention_template_id || 'mass-intention-summary-english'
  }

  // Handle template update
  const handleUpdateTemplate = async (templateId: string) => {
    await updateMassIntention(intention.id, {
      mass_intention_template_id: templateId,
    })
  }

  // Generate action buttons
  const actionButtons = (
    <>
      <Button asChild className="w-full">
        <Link href={`/mass-intentions/${intention.id}/edit`}>
          <Edit className="h-4 w-4 mr-2" />
          Edit Mass Intention
        </Link>
      </Button>
      <Button asChild variant="outline" className="w-full">
        <Link href={`/print/mass-intentions/${intention.id}`} target="_blank">
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
        <Link href={`/api/mass-intentions/${intention.id}/pdf?filename=${generateFilename('pdf')}`} target="_blank">
          <FileText className="h-4 w-4 mr-2" />
          Download PDF
        </Link>
      </Button>
      <Button asChild variant="outline" className="w-full">
        <Link href={`/api/mass-intentions/${intention.id}/word?filename=${generateFilename('docx')}`}>
          <Download className="h-4 w-4 mr-2" />
          Download Word
        </Link>
      </Button>
    </>
  )

  // Generate template selector
  const templateSelector = (
    <TemplateSelectorDialog
      currentTemplateId={intention.mass_intention_template_id}
      templates={MASS_INTENTION_TEMPLATES}
      moduleName="Mass Intention"
      onSave={handleUpdateTemplate}
      defaultTemplateId="mass-intention-summary-english"
    />
  )

  // Generate details section content
  const details = (
    <>
      {intention.status && (
        <div className="flex items-center gap-2">
          <span className="font-medium">Status:</span>
          <ModuleStatusLabel status={intention.status} statusType="mass-intention" />
        </div>
      )}
    </>
  )

  return (
    <ModuleViewContainer
      entity={intention}
      entityType="Mass Intention"
      modulePath="mass-intentions"
      generateFilename={generateFilename}
      buildLiturgy={buildMassIntentionLiturgy}
      getTemplateId={getTemplateId}
      statusType="mass-intention"
      actionButtons={actionButtons}
      exportButtons={exportButtons}
      templateSelector={templateSelector}
      details={details}
      onDelete={deleteMassIntention}
    />
  )
}

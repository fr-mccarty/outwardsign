"use client"

import { MassWithRelations, updateMass, deleteMass } from '@/lib/actions/masses'
import { ModuleViewContainer } from '@/components/module-view-container'
import { Button } from '@/components/ui/button'
import { buildMassLiturgy, MASS_TEMPLATES } from '@/lib/content-builders/mass'
import { Edit, Printer, FileText, Download } from 'lucide-react'
import { ModuleStatusLabel } from '@/components/module-status-label'
import { TemplateSelectorDialog } from '@/components/template-selector-dialog'
import { ScriptCard } from '@/components/script-card'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { getMassFilename } from '@/lib/utils/formatters'
import type { Script } from '@/lib/types/event-types'

interface MassViewClientProps {
  mass: MassWithRelations
  scripts: Script[]
}

export function MassViewClient({ mass, scripts }: MassViewClientProps) {
  const router = useRouter()

  // Generate filename for downloads
  const generateFilename = (extension: string) => {
    return getMassFilename(mass, extension)
  }

  // Extract template ID from mass record
  const getTemplateId = (mass: MassWithRelations) => {
    return mass.mass_template_id || 'mass-english'
  }

  // Handle template update
  const handleUpdateTemplate = async (templateId: string) => {
    await updateMass(mass.id, {
      mass_template_id: templateId,
    })
  }

  // Handle script card click
  const handleScriptClick = (scriptId: string) => {
    router.push(`/masses/${mass.id}/scripts/${scriptId}`)
  }

  // Generate action buttons
  const actionButtons = (
    <>
      <Button asChild className="w-full">
        <Link href={`/masses/${mass.id}/edit`}>
          <Edit className="h-4 w-4 mr-2" />
          Edit Mass
        </Link>
      </Button>
      <Button asChild variant="outline" className="w-full">
        <Link href={`/print/masses/${mass.id}`} target="_blank">
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
        <Link href={`/api/masses/${mass.id}/pdf?filename=${generateFilename('pdf')}`} target="_blank">
          <FileText className="h-4 w-4 mr-2" />
          Download PDF
        </Link>
      </Button>
      <Button asChild variant="outline" className="w-full">
        <Link href={`/api/masses/${mass.id}/word?filename=${generateFilename('docx')}`}>
          <Download className="h-4 w-4 mr-2" />
          Download Word
        </Link>
      </Button>
    </>
  )

  // Generate template selector
  const templateSelector = (
    <TemplateSelectorDialog
      currentTemplateId={mass.mass_template_id}
      templates={MASS_TEMPLATES}
      moduleName="Mass"
      onSave={handleUpdateTemplate}
      defaultTemplateId="mass-english"
    />
  )

  // Generate details section content
  const details = (
    <>
      {mass.status && (
        <div className="flex items-center gap-2">
          <span className="font-medium">Status:</span>
          <ModuleStatusLabel status={mass.status} statusType="mass" />
        </div>
      )}

      {mass.event?.location && (
        <div className={mass.status ? "pt-2 border-t" : ""}>
          <span className="font-medium">Location:</span> {mass.event.location.name}
          {(mass.event.location.street || mass.event.location.city || mass.event.location.state) && (
            <div className="text-xs text-muted-foreground mt-1">
              {[mass.event.location.street, mass.event.location.city, mass.event.location.state]
                .filter(Boolean).join(', ')}
            </div>
          )}
        </div>
      )}
    </>
  )

  return (
    <ModuleViewContainer
      entity={mass}
      entityType="Mass"
      modulePath="masses"
      mainEvent={mass.event}
      generateFilename={generateFilename}
      buildLiturgy={buildMassLiturgy}
      getTemplateId={getTemplateId}
      statusType="mass"
      actionButtons={actionButtons}
      exportButtons={exportButtons}
      templateSelector={templateSelector}
      details={details}
      onDelete={deleteMass}
    >
      {/* Mass Intention and Role Assignments are now in the content builder */}

      {/* Show custom scripts if Mass has an event type */}
      {mass.event_type_id && scripts.length > 0 && (
        <div className="space-y-4 mt-6">
          <h3 className="text-lg font-medium">Custom Scripts</h3>
          {scripts.map((script) => (
            <ScriptCard
              key={script.id}
              script={script}
              onClick={() => handleScriptClick(script.id)}
            />
          ))}
        </div>
      )}
    </ModuleViewContainer>
  )
}

"use client"

import { MassWithRelations, updateMass, deleteMass } from '@/lib/actions/masses'
import { ModuleViewContainer } from '@/components/module-view-container'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { buildMassLiturgy, MASS_TEMPLATES } from '@/lib/content-builders/mass'
import { Heart, User, Edit, Printer, FileText, Download } from 'lucide-react'
import { MASS_INTENTION_STATUS_LABELS } from '@/lib/constants'
import { ModuleStatusLabel } from '@/components/module-status-label'
import { TemplateSelectorDialog } from '@/components/template-selector-dialog'
import Link from 'next/link'

interface MassViewClientProps {
  mass: MassWithRelations
}

export function MassViewClient({ mass }: MassViewClientProps) {
  // Generate filename for downloads
  const generateFilename = (extension: string) => {
    const presiderName = mass.presider
      ? `${mass.presider.first_name}-${mass.presider.last_name}`
      : 'Presider'
    const massDate = mass.event?.start_date
      ? new Date(mass.event.start_date).toISOString().split('T')[0].replace(/-/g, '')
      : 'NoDate'
    return `Mass-${presiderName}-${massDate}.${extension}`
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
      {/* Mass Intention Card - rendered before liturgy content */}
      {mass.mass_intention && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Heart className="h-5 w-5" />
              Mass Intention
            </CardTitle>
            <CardDescription>
              This Mass is offered for the following intention
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <div className="font-medium text-lg mb-2">
                {mass.mass_intention.mass_offered_for || 'No intention specified'}
              </div>
              {mass.mass_intention.requested_by && (
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <User className="h-4 w-4" />
                  <span>
                    Requested by:{' '}
                    <Link
                      href={`/people/${mass.mass_intention.requested_by.id}`}
                      className="hover:underline"
                    >
                      {mass.mass_intention.requested_by.first_name} {mass.mass_intention.requested_by.last_name}
                    </Link>
                  </span>
                </div>
              )}
            </div>
            <div className="flex items-center gap-3">
              <Badge variant="secondary">
                {MASS_INTENTION_STATUS_LABELS[mass.mass_intention.status as keyof typeof MASS_INTENTION_STATUS_LABELS]?.en || mass.mass_intention.status}
              </Badge>
              {mass.mass_intention.stipend_in_cents && (
                <div className="text-sm text-muted-foreground">
                  Stipend: ${(mass.mass_intention.stipend_in_cents / 100).toFixed(2)}
                </div>
              )}
            </div>
            {mass.mass_intention.note && (
              <div className="text-sm text-muted-foreground border-l-2 border-muted pl-3">
                {mass.mass_intention.note}
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </ModuleViewContainer>
  )
}

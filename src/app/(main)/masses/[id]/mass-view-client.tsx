"use client"

import { MassWithRelations, updateMass } from '@/lib/actions/masses'
import { ModuleViewContainer } from '@/components/module-view-container'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { buildMassLiturgy, MASS_TEMPLATES } from '@/lib/content-builders/mass'
import { Heart, User } from 'lucide-react'
import { MASS_INTENTION_STATUS_LABELS } from '@/lib/constants'
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
      templateConfig={{
        currentTemplateId: mass.mass_template_id,
        templates: MASS_TEMPLATES,
        templateFieldName: 'mass_template_id',
        defaultTemplateId: 'mass-english',
        onUpdateTemplate: handleUpdateTemplate,
      }}
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

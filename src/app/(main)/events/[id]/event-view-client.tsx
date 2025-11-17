'use client'

import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { ExternalLink, Edit, Printer, FileText, Download } from "lucide-react"
import { MODULE_STATUS_LABELS } from "@/lib/constants"
import { ModuleStatusLabel } from '@/components/module-status-label'
import { TemplateSelectorDialog } from '@/components/template-selector-dialog'
import type { EventWithRelations } from '@/lib/actions/events'
import type { ModuleReference } from '@/lib/helpers/event-helpers'
import Link from 'next/link'
import { useAppContext } from '@/contexts/AppContextProvider'
import { ModuleViewContainer } from '@/components/module-view-container'
import { buildEventLiturgy, EVENT_TEMPLATES } from '@/lib/content-builders/event'
import { updateEvent, deleteEvent } from '@/lib/actions/events'
import { getEventFilename } from '@/lib/utils/formatters'

interface EventViewClientProps {
  event: EventWithRelations
  moduleReference: ModuleReference | null
}

export function EventViewClient({ event, moduleReference }: EventViewClientProps) {
  const { userSettings } = useAppContext()
  const userLanguage = (userSettings?.language || 'en') as 'en' | 'es'

  // Generate filename for downloads
  const generateFilename = (extension: string) => {
    return getEventFilename(event, extension)
  }

  // Extract template ID from event record
  const getTemplateId = (event: EventWithRelations) => {
    return event.event_template_id || 'event-full-script-english'
  }

  // Handle template update
  const handleUpdateTemplate = async (templateId: string) => {
    await updateEvent(event.id, {
      event_template_id: templateId,
    })
  }

  // Generate action buttons
  const actionButtons = (
    <>
      <Button asChild className="w-full">
        <Link href={`/events/${event.id}/edit`}>
          <Edit className="h-4 w-4 mr-2" />
          Edit Event
        </Link>
      </Button>
      <Button asChild variant="outline" className="w-full">
        <Link href={`/print/events/${event.id}`} target="_blank">
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
        <Link href={`/api/events/${event.id}/pdf?filename=${generateFilename('pdf')}`} target="_blank">
          <FileText className="h-4 w-4 mr-2" />
          Download PDF
        </Link>
      </Button>
      <Button asChild variant="outline" className="w-full">
        <Link href={`/api/events/${event.id}/word?filename=${generateFilename('docx')}`}>
          <Download className="h-4 w-4 mr-2" />
          Download Word
        </Link>
      </Button>
    </>
  )

  // Generate template selector
  const templateSelector = (
    <TemplateSelectorDialog
      currentTemplateId={event.event_template_id}
      templates={EVENT_TEMPLATES}
      moduleName="Event"
      onSave={handleUpdateTemplate}
      defaultTemplateId="event-full-script-english"
    />
  )

  // Generate details section content
  const details = (
    <>
      {event.location && (
        <div>
          <span className="font-medium">Location:</span> {event.location.name}
          {(event.location.street || event.location.city || event.location.state) && (
            <div className="text-xs text-muted-foreground mt-1">
              {[event.location.street, event.location.city, event.location.state]
                .filter(Boolean).join(', ')}
            </div>
          )}
        </div>
      )}
    </>
  )

  return (
    <ModuleViewContainer
      entity={event}
      entityType="Event"
      modulePath="events"
      generateFilename={generateFilename}
      buildLiturgy={buildEventLiturgy}
      getTemplateId={getTemplateId}
      actionButtons={actionButtons}
      exportButtons={exportButtons}
      templateSelector={templateSelector}
      details={details}
      onDelete={deleteEvent}
    >
      {/* Module Reference Section - rendered before liturgy content */}
      {moduleReference && (
        <Card className="border-primary/50">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg">Related {moduleReference.moduleDisplay[userLanguage]}</CardTitle>
              <Button variant="outline" size="sm" asChild>
                <Link href={moduleReference.modulePath}>
                  View {moduleReference.moduleDisplay[userLanguage]}
                  <ExternalLink className="h-4 w-4 ml-2" />
                </Link>
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <h4 className="font-medium">{moduleReference.summary.title}</h4>
              {moduleReference.summary.status && (
                <Badge variant="outline">
                  {MODULE_STATUS_LABELS[moduleReference.summary.status]?.[userLanguage] || moduleReference.summary.status}
                </Badge>
              )}
              <ul className="text-sm text-muted-foreground space-y-1">
                {moduleReference.summary.details.map((detail, index) => (
                  <li key={index}>• {detail}</li>
                ))}
              </ul>
            </div>
          </CardContent>
        </Card>
      )}
    </ModuleViewContainer>
  )
}

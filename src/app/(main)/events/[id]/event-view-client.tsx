'use client'

import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { ExternalLink } from "lucide-react"
import { MODULE_STATUS_LABELS } from "@/lib/constants"
import type { EventWithRelations } from '@/lib/actions/events'
import type { ModuleReference } from '@/lib/helpers/event-helpers'
import Link from 'next/link'
import { useAppContext } from '@/contexts/AppContextProvider'
import { ModuleViewContainer } from '@/components/module-view-container'
import { buildEventLiturgy, EVENT_TEMPLATES } from '@/lib/content-builders/event'
import { updateEvent, deleteEvent } from '@/lib/actions/events'

interface EventViewClientProps {
  event: EventWithRelations
  moduleReference: ModuleReference | null
}

export function EventViewClient({ event, moduleReference }: EventViewClientProps) {
  const { userSettings } = useAppContext()
  const userLanguage = (userSettings?.language || 'en') as 'en' | 'es'

  // Generate filename for downloads
  const generateFilename = (extension: string) => {
    const eventDate = event.start_date
      ? new Date(event.start_date).toISOString().split('T')[0].replace(/-/g, '')
      : 'NoDate'
    const sanitizedName = event.name.replace(/[^a-z0-9]/gi, '-').substring(0, 30)
    return `Event-${sanitizedName}-${eventDate}.${extension}`
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

  return (
    <ModuleViewContainer
      entity={event}
      entityType="Event"
      modulePath="events"
      generateFilename={generateFilename}
      buildLiturgy={buildEventLiturgy}
      getTemplateId={getTemplateId}
      templateConfig={{
        currentTemplateId: event.event_template_id,
        templates: EVENT_TEMPLATES,
        templateFieldName: 'event_template_id',
        defaultTemplateId: 'event-full-script-english',
        onUpdateTemplate: handleUpdateTemplate,
      }}
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

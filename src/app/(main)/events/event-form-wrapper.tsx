'use client'

import { ModuleFormWrapper } from '@/components/module-form-wrapper'
import { EventForm } from './event-form'
import type { MasterEventWithRelations } from '@/lib/types'
import type { LiturgicalCalendarEvent } from '@/lib/actions/liturgical-calendar'

interface EventFormWrapperProps {
  event?: MasterEventWithRelations
  title: string
  description: string
  initialLiturgicalEvent?: LiturgicalCalendarEvent | null
}

export function EventFormWrapper({
  event,
  title,
  description,
  initialLiturgicalEvent
}: EventFormWrapperProps) {
  return (
    <ModuleFormWrapper
      title={title}
      description={description}
      moduleName="Event"
      viewPath="/events"
      entity={event}
    >
      {({ formId, onLoadingChange }) => (
        <EventForm
          event={event}
          formId={formId}
          onLoadingChange={onLoadingChange}
          initialLiturgicalEvent={initialLiturgicalEvent}
        />
      )}
    </ModuleFormWrapper>
  )
}

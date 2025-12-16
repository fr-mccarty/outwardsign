'use client'

import { useState } from 'react'
import { PageContainer } from '@/components/page-container'
import { CalendarEventForm } from './calendar-event-form'
import { SaveButton } from '@/components/save-button'
import type { CalendarEvent } from '@/lib/types'
import { Eye } from 'lucide-react'

interface CalendarEventFormWrapperProps {
  calendarEvent?: CalendarEvent
}

export function CalendarEventFormWrapper({ calendarEvent }: CalendarEventFormWrapperProps) {
  const [isLoading, setIsLoading] = useState(false)
  const isEditing = !!calendarEvent
  const formId = 'calendar-event-form'

  return (
    <PageContainer
      title={isEditing ? 'Edit Calendar Event' : 'Create Calendar Event'}
      description={isEditing ? 'Update calendar event details' : 'Add a new standalone calendar event'}
      primaryAction={<SaveButton form={formId} disabled={isLoading} />}
      additionalActions={isEditing ? [
        {
          type: 'action',
          label: 'View',
          icon: <Eye className="h-4 w-4" />,
          href: `/calendar-events/${calendarEvent.id}`
        }
      ] : undefined}
    >
      <CalendarEventForm
        calendarEvent={calendarEvent}
        formId={formId}
        onLoadingChange={setIsLoading}
      />
    </PageContainer>
  )
}

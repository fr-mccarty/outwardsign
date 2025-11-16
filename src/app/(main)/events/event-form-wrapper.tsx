'use client'

import React, { useState } from 'react'
import { EventForm } from './event-form'
import { PageContainer } from '@/components/page-container'
import { Button } from '@/components/ui/button'
import { SaveButton } from '@/components/save-button'
import { Eye } from 'lucide-react'
import Link from 'next/link'
import type { EventWithRelations } from '@/lib/actions/events'

interface EventFormWrapperProps {
  event?: EventWithRelations
  title: string
  description: string
  saveButtonLabel: string
}

export function EventFormWrapper({
  event,
  title,
  description,
  saveButtonLabel
}: EventFormWrapperProps) {
  const formId = 'event-form'
  const [isLoading, setIsLoading] = useState(false)
  const isEditing = !!event

  const actions = (
    <>
      {isEditing && (
        <Button variant="outline" asChild>
          <Link href={`/events/${event.id}`}>
            <Eye className="h-4 w-4 mr-2" />
            View Event
          </Link>
        </Button>
      )}
      <SaveButton isLoading={isLoading} form={formId}>
        {saveButtonLabel}
      </SaveButton>
    </>
  )

  return (
    <PageContainer
      title={title}
      description={description}
      actions={actions}
    >
      <EventForm
        event={event}
        formId={formId}
        onLoadingChange={setIsLoading}
      />
    </PageContainer>
  )
}

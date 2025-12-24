'use client'

import { ModuleFormWrapper } from '@/components/module-form-wrapper'
import { MassLiturgyForm } from './mass-liturgy-form'
import { Settings } from 'lucide-react'
import type { MassWithRelations } from '@/lib/schemas/mass-liturgies'
import type { LiturgicalCalendarEvent } from '@/lib/actions/liturgical-calendar'

interface MassLiturgyFormWrapperProps {
  mass?: MassWithRelations
  title: string
  description: string
  initialLiturgicalEvent?: LiturgicalCalendarEvent | null
}

export function MassLiturgyFormWrapper({
  mass,
  title,
  description,
  initialLiturgicalEvent
}: MassLiturgyFormWrapperProps) {
  // Build additional actions - include "Edit Event Type" if we have an event type
  const eventTypeSlug = mass?.event_type?.slug
  const additionalActions = eventTypeSlug
    ? [
        {
          type: 'action' as const,
          label: 'Edit Event Type',
          icon: <Settings className="h-4 w-4" />,
          href: `/settings/event-types/${eventTypeSlug}`
        }
      ]
    : undefined

  return (
    <ModuleFormWrapper
      title={title}
      description={description}
      moduleName="Mass"
      viewPath="/mass-liturgies"
      entity={mass}
      additionalActions={additionalActions}
    >
      {({ formId, onLoadingChange }) => (
        <MassLiturgyForm
          mass={mass}
          formId={formId}
          onLoadingChange={onLoadingChange}
          initialLiturgicalEvent={initialLiturgicalEvent}
        />
      )}
    </ModuleFormWrapper>
  )
}

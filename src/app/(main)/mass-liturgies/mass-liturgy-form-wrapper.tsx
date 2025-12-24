'use client'

import { ModuleFormWrapper } from '@/components/module-form-wrapper'
import { MassLiturgyForm } from './mass-liturgy-form'
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
  return (
    <ModuleFormWrapper
      title={title}
      description={description}
      moduleName="Mass"
      viewPath="/mass-liturgies"
      entity={mass}
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

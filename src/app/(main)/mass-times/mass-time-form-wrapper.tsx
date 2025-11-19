'use client'

import { PageContainer } from '@/components/page-container'
import { MassTimeForm } from './mass-time-form'
import { MassTimeFormActions } from './[id]/mass-time-form-actions'
import type { MassTimeWithRelations } from '@/lib/actions/mass-times'

interface MassTimeFormWrapperProps {
  massTime?: MassTimeWithRelations
}

export function MassTimeFormWrapper({ massTime }: MassTimeFormWrapperProps) {
  const isEditing = !!massTime

  return (
    <PageContainer
      title={isEditing ? 'Edit Mass Time' : 'Create Mass Time'}
      actions={isEditing ? <MassTimeFormActions massTime={massTime} /> : undefined}
    >
      <MassTimeForm massTime={massTime} />
    </PageContainer>
  )
}

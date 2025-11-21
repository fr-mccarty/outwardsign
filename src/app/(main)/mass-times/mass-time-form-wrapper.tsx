'use client'

import { PageContainer } from '@/components/page-container'
import { MassTimeForm } from './mass-time-form'
import type { MassTimeWithRelations } from '@/lib/actions/mass-times'

interface MassTimeFormWrapperProps {
  massTime?: MassTimeWithRelations
  title?: string
  description?: string
}

export function MassTimeFormWrapper({ massTime, title, description }: MassTimeFormWrapperProps) {
  const isEditing = !!massTime
  const defaultTitle = isEditing ? 'Edit Mass Times Template' : 'Create Mass Times Template'
  const defaultDescription = isEditing
    ? 'Edit mass times template details.'
    : 'Create a new mass times template for different seasons or periods.'

  return (
    <PageContainer
      title={title || defaultTitle}
      description={description || defaultDescription}
    >
      <MassTimeForm massTime={massTime} />
    </PageContainer>
  )
}

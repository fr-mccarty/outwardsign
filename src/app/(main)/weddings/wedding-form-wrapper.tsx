'use client'

import React from 'react'
import { WeddingForm } from './wedding-form'
import { PageContainer } from '@/components/page-container'
import type { Wedding } from '@/lib/types'

interface WeddingFormWrapperProps {
  wedding?: Wedding
  title: string
  description: string
  actions?: React.ReactNode
  saveButtonLabel: string
}

export function WeddingFormWrapper({
  wedding,
  title,
  description,
  actions,
  saveButtonLabel
}: WeddingFormWrapperProps) {
  const formId = 'wedding-form'

  return (
    <PageContainer
      title={title}
      description={description}
      maxWidth="4xl"
      actions={actions}
    >
      <WeddingForm wedding={wedding} formId={formId} />
    </PageContainer>
  )
}

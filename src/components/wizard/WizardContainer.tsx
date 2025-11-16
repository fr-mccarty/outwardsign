'use client'

import { ReactNode } from 'react'
import { PageContainer } from '@/components/page-container'

interface WizardContainerProps {
  title: string
  description: string
  children: ReactNode
}

export function WizardContainer({
  title,
  description,
  children
}: WizardContainerProps) {
  return (
    <PageContainer
      title={title}
      description={description}
    >
      <div className="space-y-6">
        {children}
      </div>
    </PageContainer>
  )
}
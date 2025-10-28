'use client'

import { ReactNode } from 'react'
import { PageContainer } from '@/components/page-container'

interface WizardContainerProps {
  title: string
  description: string
  children: ReactNode
  maxWidth?: 'sm' | 'md' | 'lg' | 'xl' | '2xl' | '3xl' | '4xl' | '5xl' | '6xl' | '7xl'
}

export function WizardContainer({ 
  title, 
  description, 
  children, 
  maxWidth = '4xl' 
}: WizardContainerProps) {
  return (
    <PageContainer
      title={title}
      description={description}
      maxWidth={maxWidth}
    >
      <div className="space-y-6">
        {children}
      </div>
    </PageContainer>
  )
}
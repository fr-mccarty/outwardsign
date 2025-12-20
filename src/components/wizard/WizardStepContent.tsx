'use client'

import { ReactNode } from 'react'
import { Card, CardContent } from '@/components/content-card'

interface WizardStepContentProps {
  children: ReactNode
  loading?: boolean
  loadingMessage?: string
  error?: string | null
  className?: string
}

export function WizardStepContent({
  children,
  loading = false,
  loadingMessage = 'Loading...',
  error,
  className
}: WizardStepContentProps) {
  if (loading) {
    return (
      <Card className={className}>
        <CardContent className="p-8 text-center">
          <p>{loadingMessage}</p>
        </CardContent>
      </Card>
    )
  }

  if (error) {
    return (
      <Card className={className}>
        <CardContent className="p-8 text-center">
          <p className="text-red-600">{error}</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className={className}>
      {children}
    </div>
  )
}
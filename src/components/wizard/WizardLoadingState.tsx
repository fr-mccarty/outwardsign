'use client'

import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'

interface WizardLoadingStateProps {
  title: string
  description: string
  loading: boolean
  error?: string | null
  onRetry?: () => void
  loadingMessage?: string
}

export function WizardLoadingState({
  title,
  description,
  loading,
  error,
  onRetry,
  loadingMessage = 'Loading wizard...'
}: WizardLoadingStateProps) {
  if (loading) {
    return (
      <Card>
        <CardContent className="p-8 text-center">
          <p>{loadingMessage}</p>
        </CardContent>
      </Card>
    )
  }

  if (error) {
    return (
      <Card>
        <CardContent className="p-8 text-center">
          <p className="text-red-600">{error}</p>
          {onRetry && (
            <Button onClick={onRetry} className="mt-4">
              Try Again
            </Button>
          )}
        </CardContent>
      </Card>
    )
  }

  return null
}
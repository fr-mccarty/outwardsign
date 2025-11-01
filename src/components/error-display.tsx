'use client'

import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { AlertCircle } from "lucide-react"

interface ErrorDisplayProps {
  error: Error & { digest?: string }
  reset: () => void
}

export function ErrorDisplay({ error, reset }: ErrorDisplayProps) {
  return (
    <Card className="border-destructive">
      <CardContent className="p-6">
        <div className="flex flex-col items-center text-center space-y-4">
          <AlertCircle className="h-12 w-12 text-destructive" />
          <div>
            <h3 className="text-lg font-semibold mb-2">Something went wrong</h3>
            <p className="text-sm text-muted-foreground mb-4">
              {error.message || 'An unexpected error occurred. Please try again.'}
            </p>
            {error.digest && (
              <p className="text-xs text-muted-foreground font-mono mb-4">
                Error ID: {error.digest}
              </p>
            )}
          </div>
          <Button onClick={reset} variant="outline">
            Try Again
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}

'use client'

import { FileText } from 'lucide-react'
import { Card, CardHeader, CardTitle } from '@/components/ui/card'
import type { Script } from '@/lib/types/event-types'

interface ScriptCardProps {
  script: Script
  onClick: () => void
}

/**
 * ScriptCard Component
 *
 * Displays a script in a clickable card format.
 * Shows script name and icon, designed to navigate to script view page.
 *
 * Per requirements: Visual card with script name, icon, and click navigation.
 */
export function ScriptCard({ script, onClick }: ScriptCardProps) {
  return (
    <Card
      className="cursor-pointer transition-shadow hover:shadow-md"
      onClick={onClick}
    >
      <CardHeader>
        <div className="flex items-start gap-3">
          <FileText className="h-6 w-6 text-muted-foreground mt-1 flex-shrink-0" />
          <div className="flex-1 min-w-0">
            <CardTitle className="text-lg">{script.name}</CardTitle>
            {/* Description field doesn't exist on Script interface, but leaving structure
                in case it's added in future. For now, show nothing. */}
          </div>
        </div>
      </CardHeader>
    </Card>
  )
}

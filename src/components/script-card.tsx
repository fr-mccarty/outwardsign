'use client'

import { FileText } from 'lucide-react'
import { ContentCard } from '@/components/content-card'
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
 */
export function ScriptCard({ script, onClick }: ScriptCardProps) {
  const title = (
    <div className="flex items-center gap-3">
      <FileText className="h-5 w-5 text-muted-foreground flex-shrink-0" />
      <span>{script.name}</span>
    </div>
  )

  return (
    <ContentCard title={title} onClick={onClick}>
      <span className="text-muted-foreground">Click to view script</span>
    </ContentCard>
  )
}

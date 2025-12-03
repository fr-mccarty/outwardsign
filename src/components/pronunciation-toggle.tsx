'use client'

import { Button } from '@/components/ui/button'
import { ChevronDown, ChevronRight } from 'lucide-react'

interface PronunciationToggleProps {
  isExpanded: boolean
  onToggle: () => void
  variant?: 'default' | 'compact'
}

/**
 * PronunciationToggle - Reusable toggle button for showing/hiding pronunciation fields
 *
 * Used in:
 * - PeoplePicker (compact variant)
 * - PersonForm (default variant)
 *
 * @param isExpanded - Whether the pronunciation section is currently expanded
 * @param onToggle - Callback when the toggle button is clicked
 * @param variant - 'compact' for picker (small), 'default' for forms (standard size)
 */
export function PronunciationToggle({
  isExpanded,
  onToggle,
  variant = 'default'
}: PronunciationToggleProps) {
  const isCompact = variant === 'compact'

  return (
    <Button
      type="button"
      variant="ghost"
      size={isCompact ? "sm" : "default"}
      onClick={onToggle}
      className={isCompact
        ? "h-6 px-2 text-xs text-muted-foreground hover:text-foreground"
        : "text-sm text-muted-foreground hover:text-foreground"
      }
    >
      {isExpanded ? (
        <ChevronDown className={isCompact ? "h-3 w-3 mr-1" : "h-4 w-4 mr-2"} />
      ) : (
        <ChevronRight className={isCompact ? "h-3 w-3 mr-1" : "h-4 w-4 mr-2"} />
      )}
      {isExpanded ? 'Hide pronunciation' : 'Add pronunciation guide'}
    </Button>
  )
}

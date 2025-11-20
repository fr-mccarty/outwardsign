'use client'

import { ReactNode } from 'react'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip'

interface CalendarTooltipProps {
  title: string
  children: ReactNode
}

/**
 * Reusable tooltip component for calendar events
 * Shows the full event title on hover
 */
export function CalendarTooltip({ title, children }: CalendarTooltipProps) {
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        {children}
      </TooltipTrigger>
      <TooltipContent>
        {title}
      </TooltipContent>
    </Tooltip>
  )
}

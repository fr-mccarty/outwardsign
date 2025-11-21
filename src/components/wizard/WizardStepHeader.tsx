'use client'

import { LucideIcon } from 'lucide-react'

interface WizardStepHeaderProps {
  icon: LucideIcon
  title: string
  description: string
}

/**
 * WizardStepHeader - Consistent header pattern for wizard steps
 *
 * Usage:
 * <WizardStepHeader
 *   icon={Calendar}
 *   title="Date Range"
 *   description="Select the start and end dates for scheduling"
 * />
 */
export function WizardStepHeader({ icon: Icon, title, description }: WizardStepHeaderProps) {
  return (
    <div className="flex items-start gap-3">
      <Icon className="h-6 w-6 text-primary mt-1" />
      <div>
        <h2 className="text-2xl font-semibold">{title}</h2>
        <p className="text-muted-foreground mt-1">{description}</p>
      </div>
    </div>
  )
}

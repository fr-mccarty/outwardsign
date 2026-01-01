'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/content-card'
import { LinkButton } from '@/components/link-button'
import { ChevronRight } from 'lucide-react'

interface SettingsSectionCardProps {
  icon: React.ElementType
  title: string
  description: string
  href: string
  buttonText: string
  badge?: string
  variant?: 'default' | 'primary'
}

export function SettingsSectionCard({
  icon: Icon,
  title,
  description,
  href,
  buttonText,
  badge,
  variant = 'default',
}: SettingsSectionCardProps) {
  return (
    <Card className="hover:shadow-lg transition-shadow">
      <CardHeader className="pb-2">
        <div className="flex items-start justify-between">
          <CardTitle className="flex items-center gap-3 text-base">
            <Icon className="h-5 w-5 text-primary" />
            {title}
          </CardTitle>
          {badge && (
            <span className="text-xs bg-primary/10 text-primary px-2 py-0.5 rounded-full">
              {badge}
            </span>
          )}
        </div>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-muted-foreground mb-4">
          {description}
        </p>
        <LinkButton
          href={href}
          variant={variant === 'primary' ? 'default' : 'outline'}
          className="w-full justify-between"
        >
          {buttonText}
          <ChevronRight className="h-4 w-4" />
        </LinkButton>
      </CardContent>
    </Card>
  )
}

"use client"

import Link from 'next/link'
import { PageContainer } from '@/components/page-container'
import { ContentCard } from '@/components/content-card'
import type { EventType } from '@/lib/types'
import * as LucideIcons from 'lucide-react'
import { LucideIcon } from 'lucide-react'

interface EventTypeSelectorProps {
  eventTypes: EventType[]
}

export function EventTypeSelector({ eventTypes }: EventTypeSelectorProps) {
  const getIcon = (iconName: string): LucideIcon => {
    const Icon = (LucideIcons as unknown as Record<string, LucideIcon>)[iconName]
    return Icon || LucideIcons.Calendar
  }

  return (
    <PageContainer
      title="Create Event"
      description="Choose the type of event you want to create"
    >
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {eventTypes.map((eventType) => {
          const Icon = getIcon(eventType.icon)
          return (
            <Link
              key={eventType.id}
              href={`/events/${eventType.slug}/create`}
              className="block"
            >
              <ContentCard className="h-full hover:border-primary/50 hover:bg-accent/50 transition-colors cursor-pointer pb-6">
                <div className="flex items-start gap-4">
                  <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                    <Icon className="w-5 h-5 text-primary" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-medium text-foreground">{eventType.name}</h3>
                    {eventType.description && (
                      <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
                        {eventType.description}
                      </p>
                    )}
                  </div>
                </div>
              </ContentCard>
            </Link>
          )
        })}
      </div>
    </PageContainer>
  )
}

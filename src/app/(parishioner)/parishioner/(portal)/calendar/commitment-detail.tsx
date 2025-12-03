'use client'

import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet'
import { Badge } from '@/components/ui/badge'
import { Calendar, Clock, MapPin, BookOpen } from 'lucide-react'
import type { CalendarEvent } from './actions'

interface CommitmentDetailProps {
  event: CalendarEvent | null
  open: boolean
  onOpenChange: (open: boolean) => void
  readings?: {
    first_reading?: string
    psalm?: string
    second_reading?: string
    gospel?: string
  }
}

export function CommitmentDetail({ event, open, onOpenChange, readings }: CommitmentDetailProps) {
  if (!event) return null

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-full sm:max-w-md overflow-y-auto">
        <SheetHeader>
          <SheetTitle>{event.title}</SheetTitle>
          <SheetDescription>
            <Badge variant="secondary" className="mt-2">
              {event.type === 'assignment'
                ? 'Assignment'
                : event.type === 'parish'
                  ? 'Parish Event'
                  : event.type === 'liturgical'
                    ? 'Liturgical'
                    : 'Unavailable'}
            </Badge>
          </SheetDescription>
        </SheetHeader>

        <div className="mt-6 space-y-6">
          {/* Date and Time */}
          <div className="space-y-3">
            <div className="flex items-start gap-3">
              <Calendar className="h-5 w-5 text-muted-foreground mt-0.5" />
              <div>
                <p className="font-medium text-sm text-muted-foreground">Date</p>
                <p>
                  {new Date(event.date).toLocaleDateString('en-US', {
                    weekday: 'long',
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                  })}
                </p>
              </div>
            </div>

            {event.time && (
              <div className="flex items-start gap-3">
                <Clock className="h-5 w-5 text-muted-foreground mt-0.5" />
                <div>
                  <p className="font-medium text-sm text-muted-foreground">Time</p>
                  <p>{event.time}</p>
                </div>
              </div>
            )}

            {event.location && (
              <div className="flex items-start gap-3">
                <MapPin className="h-5 w-5 text-muted-foreground mt-0.5" />
                <div>
                  <p className="font-medium text-sm text-muted-foreground">Location</p>
                  <p>{event.location}</p>
                </div>
              </div>
            )}
          </div>

          {/* Role */}
          {event.role && (
            <div>
              <p className="font-medium text-sm text-muted-foreground mb-2">Your Role</p>
              <p className="text-lg font-semibold">{event.role}</p>
            </div>
          )}

          {/* Description */}
          {event.description && (
            <div>
              <p className="font-medium text-sm text-muted-foreground mb-2">Description</p>
              <p className="text-sm">{event.description}</p>
            </div>
          )}

          {/* Readings */}
          {readings && Object.values(readings).some((r) => r) && (
            <div className="pt-4 border-t">
              <div className="flex items-center gap-2 mb-4">
                <BookOpen className="h-5 w-5 text-muted-foreground" />
                <h3 className="font-semibold">Readings</h3>
              </div>

              <div className="space-y-4">
                {readings.first_reading && (
                  <div>
                    <p className="font-medium text-sm text-muted-foreground mb-1">First Reading</p>
                    <p className="text-sm whitespace-pre-wrap">{readings.first_reading}</p>
                  </div>
                )}

                {readings.psalm && (
                  <div>
                    <p className="font-medium text-sm text-muted-foreground mb-1">
                      Responsorial Psalm
                    </p>
                    <p className="text-sm whitespace-pre-wrap">{readings.psalm}</p>
                  </div>
                )}

                {readings.second_reading && (
                  <div>
                    <p className="font-medium text-sm text-muted-foreground mb-1">
                      Second Reading
                    </p>
                    <p className="text-sm whitespace-pre-wrap">{readings.second_reading}</p>
                  </div>
                )}

                {readings.gospel && (
                  <div>
                    <p className="font-medium text-sm text-muted-foreground mb-1">Gospel</p>
                    <p className="text-sm whitespace-pre-wrap">{readings.gospel}</p>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </SheetContent>
    </Sheet>
  )
}

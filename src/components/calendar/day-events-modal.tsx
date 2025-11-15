'use client'

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { CalendarItem } from './types'
import { LiturgicalEventItemDay, ParishEventItemDay } from './event-items'
import { format } from 'date-fns'

interface DayEventsModalProps<T extends CalendarItem = CalendarItem> {
  open: boolean
  onOpenChange: (open: boolean) => void
  date: Date
  items: T[]
  onItemClick?: (item: T, event: React.MouseEvent) => void
}

export function DayEventsModal<T extends CalendarItem = CalendarItem>({
  open,
  onOpenChange,
  date,
  items,
  onItemClick
}: DayEventsModalProps<T>) {
  const isLiturgicalEvent = (item: any) => item.isLiturgical === true

  // Sort items to show liturgical events first
  const sortedItems = [...items].sort((a, b) => {
    const aIsLiturgical = isLiturgicalEvent(a)
    const bIsLiturgical = isLiturgicalEvent(b)
    if (aIsLiturgical && !bIsLiturgical) return -1
    if (!aIsLiturgical && bIsLiturgical) return 1
    return 0
  })

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[85vh] flex flex-col">
        <DialogHeader className="flex-shrink-0">
          <DialogTitle>
            Events on {format(date, 'EEEE, MMMM d, yyyy')}
          </DialogTitle>
        </DialogHeader>

        <div className="overflow-y-auto flex-1 -mx-6 px-6">
          <div className="space-y-3 mt-4 pb-4">
            {sortedItems.length === 0 ? (
              <p className="text-muted-foreground text-center py-8">
                No events on this day
              </p>
            ) : (
              sortedItems.map((item) => {
                const handleClick = (e: React.MouseEvent) => {
                  onItemClick?.(item, e)
                  onOpenChange(false) // Close modal after clicking an event
                }

                // Render liturgical event
                if (isLiturgicalEvent(item)) {
                  return <LiturgicalEventItemDay key={item.id} event={item} onClick={handleClick} />
                }

                // Render parish event
                return <ParishEventItemDay key={item.id} event={item} onClick={handleClick} />
              })
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}

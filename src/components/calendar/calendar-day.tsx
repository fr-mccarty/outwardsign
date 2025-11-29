'use client'

import { useState } from 'react'
import Link from 'next/link'
import { cn } from '@/lib/utils'
import { CalendarDayProps, CalendarItem } from "./types"
import type { CalendarDay } from "./types"
import { LITURGICAL_COLOR_BAR_TOTAL_WIDTH } from '@/lib/constants'
import { toLocalDateString } from '@/lib/utils/formatters'
import {
  ParishEventItemMonth,
  ParishEventItemWeek,
  LiturgicalEventItemDay,
  ParishEventItemDay,
  LiturgicalEventItemWeek,
  MobileEventIndicators
} from './event-items'
import { DayEventsModal } from './day-events-modal'
import { Button } from '@/components/ui/button'
import { getLiturgicalCssVarValue } from '@/lib/utils/liturgical-colors'
import { CalendarTooltip } from '@/components/calendar/calendar-tooltip'

export function CalendarDay<T extends CalendarItem = CalendarItem>({
  day,
  renderContent,
  onItemClick,
  maxItemsPerDay = 3,
  view = 'month'
}: CalendarDayProps<T>) {
  const [showAllEventsModal, setShowAllEventsModal] = useState(false)

  // Helper to check if an item is a liturgical event
  const isLiturgicalEvent = (item: any) => item.isLiturgical === true

  const defaultRenderContent = (day: CalendarDay<T>) => {

    // In month view, only show parish events (liturgical shown as color blocks)
    // In week/day views, show all events
    let itemsToShow = view === 'month'
      ? day.items.filter(item => !isLiturgicalEvent(item))
      : day.items

    // Sort events: liturgical first (week/day views), then by start_time (earliest first)
    itemsToShow = [...itemsToShow].sort((a, b) => {
      // In week/day views, liturgical events appear first
      if (view === 'week' || view === 'day') {
        const aIsLiturgical = isLiturgicalEvent(a)
        const bIsLiturgical = isLiturgicalEvent(b)
        if (aIsLiturgical && !bIsLiturgical) return -1
        if (!aIsLiturgical && bIsLiturgical) return 1
      }

      // Sort by start_time (earliest first, events without time go last)
      const aTime = (a as any).start_time
      const bTime = (b as any).start_time
      if (aTime && !bTime) return -1
      if (!aTime && bTime) return 1
      if (aTime && bTime) return aTime.localeCompare(bTime)
      return 0
    })

    // Mobile/tablet view for month - show parish event icons only (below lg breakpoint)
    // Liturgical events are shown as dots near the date number
    const mobileContent = view === 'month' && itemsToShow.length > 0 && (
      <div className="lg:hidden">
        <MobileEventIndicators
          parishEvents={itemsToShow as Array<{ id: string; moduleType?: string | null }>}
          onClick={() => setShowAllEventsModal(true)}
        />
      </div>
    )

    // Desktop view - show full event items (lg breakpoint and above)
    const desktopContent = (
      <div className={cn(view === 'month' && "hidden lg:block")}>
        <div className="space-y-1">
          {itemsToShow.slice(0, maxItemsPerDay).map((item) => {
            const handleClick = (e: React.MouseEvent) => {
              e.stopPropagation()
              onItemClick?.(item, e)
            }

            // Render liturgical event (only for week/day views)
            if (isLiturgicalEvent(item)) {
              switch (view) {
                case 'day':
                  return <LiturgicalEventItemDay key={item.id} event={item} onClick={handleClick} />
                case 'week':
                  return <LiturgicalEventItemWeek key={item.id} event={item} onClick={handleClick} />
                default:
                  return null // Month view liturgical events shown as color blocks
              }
            }

            // Render parish event
            switch (view) {
              case 'day':
                return <ParishEventItemDay key={item.id} event={item} onClick={handleClick} />
              case 'week':
                return <ParishEventItemWeek key={item.id} event={item} onClick={handleClick} />
              default:
                return <ParishEventItemMonth key={item.id} event={item} onClick={handleClick} />
            }
          })}
          {itemsToShow.length > maxItemsPerDay && (
            <Button
              variant="ghost"
              size="sm"
              className="text-xs h-6 w-full text-muted-foreground hover:text-foreground hover:bg-accent"
              onClick={(e) => {
                e.stopPropagation()
                setShowAllEventsModal(true)
              }}
            >
              +{itemsToShow.length - maxItemsPerDay} more
            </Button>
          )}
        </div>
      </div>
    )

    return (
      <>
        {mobileContent}
        {desktopContent}
      </>
    )
  }

  const contentRenderer = renderContent || defaultRenderContent

  // Extract liturgical events for color block rendering (month view only)
  const liturgicalEvents = day.items.filter(isLiturgicalEvent)

  // Group colors by liturgical event (each event may have 1 or more colors)
  const liturgicalEventColorGroups: { colors: string[], event: any }[] = []
  liturgicalEvents.forEach((item: any) => {
    const colors = item.liturgicalEvent?.event_data?.color || []
    if (colors.length > 0) {
      liturgicalEventColorGroups.push({ colors, event: item })
    } else if (item.liturgicalColor) {
      liturgicalEventColorGroups.push({ colors: [item.liturgicalColor], event: item })
    }
  })

  // Calculate width for each color block
  const calculateColorWidth = (colorCount: number) => {
    return colorCount > 0 ? LITURGICAL_COLOR_BAR_TOTAL_WIDTH / colorCount : LITURGICAL_COLOR_BAR_TOTAL_WIDTH
  }

  // Format date for URL parameter (YYYY-MM-DD)
  const formattedDate = toLocalDateString(day.date)
  const dayViewUrl = `/calendar?view=day&date=${formattedDate}`

  // Check if there are any events for mobile tap
  const hasEvents = day.items.length > 0

  // Handle mobile cell tap - open modal if there are events
  const handleMobileCellTap = () => {
    if (view === 'month' && hasEvents) {
      setShowAllEventsModal(true)
    }
  }

  return (
    <>
      <div
        className={cn(
          "min-h-[60px] sm:min-h-[100px] border p-1.5 sm:p-3 transition-colors rounded-sm",
          "bg-card",
          !day.isCurrentMonth && "bg-muted/30 text-muted-foreground opacity-60",
          day.isToday && "ring-2 ring-primary bg-primary/5",
          // Mobile/tablet: make cells with events tappable (below lg breakpoint)
          view === 'month' && hasEvents && "lg:cursor-default cursor-pointer active:bg-accent/50"
        )}
        onClick={handleMobileCellTap}
      >
        <div className="flex items-center gap-1 sm:gap-2 mb-1 sm:mb-2">
          <Link
            href={dayViewUrl}
            className={cn(
              "font-medium text-xs sm:text-sm hover:bg-accent hover:text-accent-foreground rounded px-1 sm:px-1.5 py-0.5 -ml-1 sm:-ml-1.5 transition-colors",
              day.isToday && "text-primary font-bold"
            )}
            onClick={(e) => e.stopPropagation()}
          >
            {day.date.getDate()}
          </Link>

          {/* Liturgical color indicators (month view only) */}
          {view === 'month' && liturgicalEventColorGroups.length > 0 && (
            <>
              {/* Mobile/tablet: compact dots */}
              <div className="flex gap-0.5 items-center lg:hidden">
                {liturgicalEventColorGroups.map((group, groupIndex) => (
                  <CalendarTooltip key={groupIndex} title={group.event.title}>
                    <div
                      className="flex gap-0 cursor-pointer overflow-hidden rounded-full transition-all hover:scale-110"
                      onClick={(e) => {
                        e.stopPropagation()
                        onItemClick?.(group.event, e)
                      }}
                    >
                      {group.colors.map((color, colorIndex) => {
                        const isWhite = color.toLowerCase() === 'white'
                        return (
                          <div
                            key={colorIndex}
                            className={cn(
                              "h-2 w-2 rounded-full",
                              isWhite && "border border-border"
                            )}
                            style={{ backgroundColor: getLiturgicalCssVarValue(color.toLowerCase()) }}
                          />
                        )
                      })}
                    </div>
                  </CalendarTooltip>
                ))}
              </div>

              {/* Desktop: rectangular color blocks */}
              <div className="hidden lg:flex gap-1 items-center">
                {liturgicalEventColorGroups.map((group, groupIndex) => (
                  <CalendarTooltip key={groupIndex} title={group.event.title}>
                    <div
                      className={cn(
                        "flex gap-0 cursor-pointer overflow-hidden rounded-[3px] transition-all hover:scale-110 hover:shadow-md",
                        group.colors.length > 1 && "border border-border"
                      )}
                      onClick={(e) => {
                        e.stopPropagation()
                        onItemClick?.(group.event, e)
                      }}
                    >
                      {group.colors.map((color, colorIndex) => (
                        <div
                          key={colorIndex}
                          className="h-4"
                          style={{
                            backgroundColor: getLiturgicalCssVarValue(color.toLowerCase()),
                            width: `${calculateColorWidth(group.colors.length)}px`
                          }}
                        />
                      ))}
                    </div>
                  </CalendarTooltip>
                ))}
              </div>
            </>
          )}
        </div>
        {contentRenderer(day)}
      </div>

      {/* Modal to show all events for this day (only for month view) */}
      {view === 'month' && (
        <DayEventsModal
          open={showAllEventsModal}
          onOpenChange={setShowAllEventsModal}
          date={day.date}
          items={day.items}
          onItemClick={onItemClick}
        />
      )}
    </>
  )
}
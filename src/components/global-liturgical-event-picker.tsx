'use client'

import { useState, useEffect, useCallback, useMemo } from 'react'
import {
  Command,
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command'
import { Badge } from '@/components/ui/badge'
import { DialogTitle } from '@/components/ui/dialog'
import { Calendar } from 'lucide-react'
import { getGlobalLiturgicalEvents } from '@/lib/actions/global-liturgical-events'
import type { GlobalLiturgicalEvent } from '@/lib/actions/global-liturgical-events'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'

interface GlobalLiturgicalEventPickerProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSelect: (event: GlobalLiturgicalEvent) => void
  placeholder?: string
  emptyMessage?: string
  selectedEventId?: string
  className?: string
  locale?: string
  year?: number
}

export function GlobalLiturgicalEventPicker({
  open,
  onOpenChange,
  onSelect,
  placeholder = "Search for a liturgical event...",
  emptyMessage = "No liturgical events found.",
  selectedEventId,
  className,
  locale = 'en',
  year,
}: GlobalLiturgicalEventPickerProps) {
  const [searchQuery, setSearchQuery] = useState('')
  const [events, setEvents] = useState<GlobalLiturgicalEvent[]>([])
  const [loading, setLoading] = useState(false)

  const currentYear = year || new Date().getFullYear()

  const loadEvents = useCallback(async () => {
    try {
      setLoading(true)
      const startDate = `${currentYear}-01-01`
      const endDate = `${currentYear}-12-31`
      const results = await getGlobalLiturgicalEvents(startDate, endDate, locale)
      setEvents(results)
    } catch (error) {
      console.error('Error loading liturgical events:', error)
      toast.error('Failed to load liturgical events')
    } finally {
      setLoading(false)
    }
  }, [currentYear, locale])

  // Load events when dialog opens
  useEffect(() => {
    if (open && events.length === 0) {
      loadEvents()
    }
  }, [open, events.length, loadEvents])

  // Filter events based on search query
  const filteredEvents = useMemo(() => {
    if (!searchQuery) return events

    const query = searchQuery.toLowerCase()
    return events.filter((event) => {
      const name = event.event_data?.name?.toLowerCase() || ''
      const date = event.date || ''
      const monthLong = event.event_data?.month_long?.toLowerCase() || ''
      const dayOfWeek = event.event_data?.day_of_the_week_long?.toLowerCase() || ''

      return (
        name.includes(query) ||
        date.includes(query) ||
        monthLong.includes(query) ||
        dayOfWeek.includes(query)
      )
    })
  }, [events, searchQuery])

  const handleEventSelect = (event: GlobalLiturgicalEvent) => {
    onSelect(event)
    onOpenChange(false)
    setSearchQuery('')
  }

  const formatEventDate = (dateString: string) => {
    try {
      return new Date(dateString).toLocaleDateString('en-US', {
        weekday: 'short',
        month: 'short',
        day: 'numeric',
        year: 'numeric'
      })
    } catch {
      return dateString
    }
  }

  const getColorBadge = (colors: string[] | undefined) => {
    if (!colors || colors.length === 0) return null

    const colorMap: Record<string, string> = {
      white: 'bg-white text-black border border-border',
      red: 'bg-red-600 text-white',
      green: 'bg-green-600 text-white',
      violet: 'bg-purple-600 text-white',
      purple: 'bg-purple-600 text-white',
      rose: 'bg-pink-500 text-white',
      gold: 'bg-yellow-500 text-black',
    }

    const primaryColor = colors[0].toLowerCase()
    const colorClass = colorMap[primaryColor] || 'bg-gray-500 text-white'

    return (
      <span className={cn('inline-block px-2 py-0.5 rounded text-xs capitalize', colorClass)}>
        {primaryColor}
      </span>
    )
  }

  const isEventSelected = (event: GlobalLiturgicalEvent) => {
    return selectedEventId === event.id
  }

  return (
    <CommandDialog open={open} onOpenChange={onOpenChange}>
      <DialogTitle className="sr-only">Select Liturgical Event</DialogTitle>
      <Command className={cn("rounded-lg border shadow-md", className)} shouldFilter={false}>
        <div className="flex items-center border-b px-3" onClick={(e) => e.stopPropagation()}>
          <CommandInput
            placeholder={placeholder}
            value={searchQuery}
            onValueChange={setSearchQuery}
            className="flex h-11 w-full rounded-md bg-transparent py-3 text-sm outline-none placeholder:text-muted-foreground disabled:cursor-not-allowed disabled:opacity-50"
          />
        </div>

        <CommandList className="max-h-[500px]">
          {loading && (
            <div className="flex items-center justify-center py-6">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <div className="h-4 w-4 animate-spin rounded-full border-2 border-muted-foreground border-t-transparent" />
                Loading liturgical events...
              </div>
            </div>
          )}

          {!loading && filteredEvents.length === 0 && (
            <CommandEmpty className="py-6 text-center text-sm">
              <div className="flex flex-col items-center gap-2">
                <Calendar className="h-8 w-8 text-muted-foreground" />
                <div>{emptyMessage}</div>
              </div>
            </CommandEmpty>
          )}

          {!loading && filteredEvents.length > 0 && (
            <CommandGroup heading={`Liturgical Events - ${currentYear}`}>
              {filteredEvents.map((event) => (
                <CommandItem
                  key={event.id}
                  value={event.id}
                  onSelect={() => handleEventSelect(event)}
                  className={cn(
                    "flex items-start gap-3 px-3 py-3 cursor-pointer",
                    isEventSelected(event) && "bg-accent text-accent-foreground"
                  )}
                >
                  <Calendar className="h-5 w-5 text-muted-foreground mt-0.5 flex-shrink-0" />

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-medium">
                        {event.event_data?.name || 'Unnamed Event'}
                      </span>
                      {isEventSelected(event) && (
                        <Badge variant="secondary" className="text-xs">
                          Selected
                        </Badge>
                      )}
                    </div>

                    <div className="flex items-center gap-2 mt-1 text-xs text-muted-foreground">
                      <span>{formatEventDate(event.date)}</span>
                      {event.event_data?.color && getColorBadge(event.event_data.color)}
                    </div>

                    {event.event_data?.liturgical_season && (
                      <div className="mt-1 text-xs text-muted-foreground">
                        {event.event_data.liturgical_season}
                      </div>
                    )}
                  </div>
                </CommandItem>
              ))}
            </CommandGroup>
          )}
        </CommandList>
      </Command>
    </CommandDialog>
  )
}

// Hook to use the global liturgical event picker
export function useGlobalLiturgicalEventPicker() {
  const [open, setOpen] = useState(false)
  const [selectedEvent, setSelectedEvent] = useState<GlobalLiturgicalEvent | null>(null)

  const openPicker = () => setOpen(true)
  const closePicker = () => setOpen(false)

  const handleSelect = (event: GlobalLiturgicalEvent) => {
    setSelectedEvent(event)
    setOpen(false)
  }

  const clearSelection = () => {
    setSelectedEvent(null)
  }

  return {
    open,
    openPicker,
    closePicker,
    selectedEvent,
    handleSelect,
    clearSelection,
    setOpen,
  }
}

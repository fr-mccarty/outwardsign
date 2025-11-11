'use client'

import { useState, useEffect, useMemo } from 'react'
import { Badge } from '@/components/ui/badge'
import { Calendar } from 'lucide-react'
import { getGlobalLiturgicalEvents, type GlobalLiturgicalEvent } from '@/lib/actions/global-liturgical-events'
import { toast } from 'sonner'
import { CorePicker } from '@/components/core-picker'
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

// Extend GlobalLiturgicalEvent with searchable name field
type SearchableGlobalLiturgicalEvent = GlobalLiturgicalEvent & {
  searchable_name: string
}

// Define constants outside component to prevent re-creation on every render
const SEARCH_FIELDS = ['searchable_name', 'date'] as const
const EMPTY_CREATE_FIELDS: never[] = []
const EMPTY_FORM_DATA = {}

export function GlobalLiturgicalEventPicker({
  open,
  onOpenChange,
  onSelect,
  placeholder = 'Search for a liturgical event...',
  emptyMessage = 'No liturgical events found.',
  selectedEventId,
  className,
  locale = 'en',
  year,
}: GlobalLiturgicalEventPickerProps) {
  const [events, setEvents] = useState<SearchableGlobalLiturgicalEvent[]>([])
  const [loading, setLoading] = useState(false)

  // Memoize currentYear to prevent infinite re-renders
  const currentYear = useMemo(() => year || new Date().getFullYear(), [year])

  // Load events when dialog opens
  useEffect(() => {
    if (open) {
      loadEvents()
    }
  }, [open])

  const loadEvents = async () => {
    try {
      setLoading(true)
      const startDate = `${currentYear}-01-01`
      const endDate = `${currentYear}-12-31`
      const results = await getGlobalLiturgicalEvents(startDate, endDate, locale)
      // Add searchable_name field for CorePicker search
      const searchableResults = results.map(event => ({
        ...event,
        searchable_name: event.event_data?.name || ''
      }))
      setEvents(searchableResults)
    } catch (error) {
      console.error('Error loading liturgical events:', error)
      toast.error('Failed to load liturgical events')
    } finally {
      setLoading(false)
    }
  }

  const formatEventDate = (dateString: string) => {
    try {
      return new Date(dateString).toLocaleDateString('en-US', {
        weekday: 'short',
        month: 'short',
        day: 'numeric',
        year: 'numeric',
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
      <span
        className={cn(
          'inline-block px-2 py-0.5 rounded text-xs capitalize',
          colorClass
        )}
      >
        {primaryColor}
      </span>
    )
  }

  const selectedEvent = selectedEventId
    ? events.find((e) => e.id === selectedEventId)
    : null

  // Memoize title to prevent re-renders
  const title = useMemo(() => `Liturgical Events - ${currentYear}`, [currentYear])

  // Custom render for liturgical event list items
  const renderEventItem = (event: SearchableGlobalLiturgicalEvent) => {
    const isSelected = selectedEventId === event.id

    return (
      <div className="flex items-start gap-3">
        <Calendar className="h-5 w-5 text-muted-foreground mt-0.5 flex-shrink-0" />

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="font-medium">
              {event.event_data?.name || 'Unnamed Event'}
            </span>
            {isSelected && (
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
      </div>
    )
  }

  return (
    <CorePicker<SearchableGlobalLiturgicalEvent>
      open={open}
      onOpenChange={onOpenChange}
      items={events}
      selectedItem={selectedEvent}
      onSelect={onSelect}
      title={title}
      searchPlaceholder={placeholder}
      searchFields={SEARCH_FIELDS}
      getItemLabel={(event) => event.event_data?.name || 'Unnamed Event'}
      getItemId={(event) => event.id}
      renderItem={renderEventItem}
      enableCreate={false}
      createFields={EMPTY_CREATE_FIELDS}
      defaultCreateFormData={EMPTY_FORM_DATA}
      emptyMessage={emptyMessage}
      noResultsMessage="No liturgical events match your search"
      isLoading={loading}
    />
  )
}

// Hook to use the global liturgical event picker
export function useGlobalLiturgicalEventPicker() {
  const [open, setOpen] = useState(false)
  const [selectedEvent, setSelectedEvent] = useState<GlobalLiturgicalEvent | null>(
    null
  )

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

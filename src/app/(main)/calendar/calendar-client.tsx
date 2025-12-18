'use client'

import { useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { format } from 'date-fns'
import { Calendar } from '@/components/calendar/calendar'
import { CalendarView, CalendarItem } from '@/components/calendar/types'
import { PageContainer } from '@/components/page-container'
import { CalendarCalendarEventItem } from '@/lib/actions/master-events'
import { useBreadcrumbs } from '@/components/breadcrumb-context'
import { getGlobalLiturgicalEventsByMonth, GlobalLiturgicalEvent } from '@/lib/actions/global-liturgical-events'
import { LiturgicalEventPreview } from '@/components/liturgical-event-preview'
import { Switch } from '@/components/ui/switch'
import { Label } from '@/components/ui/label'
import { toast } from 'sonner'

interface CalendarClientProps {
  occasions: CalendarCalendarEventItem[]
  initialView: CalendarView
  initialDate?: string
}

interface LiturgicalCalendarItem extends CalendarItem {
  isLiturgical: boolean
  liturgicalEvent?: GlobalLiturgicalEvent
  liturgicalColor?: string
  moduleType?: string | null
  start_time?: string | null
  eventTypeIcon?: string | null  // Lucide icon name from event_type
  // Occasion-specific fields for navigation
  event_id?: string
  event_type_slug?: string
  module_id?: string | null
}

// Transform Occasion to CalendarItem
function occasionToCalendarItem(occasion: CalendarCalendarEventItem): LiturgicalCalendarItem {
  // Use event type name as the title
  // For primary occasions, just show the event type name
  // For non-primary calendar events, show event type (label lookup would require input_field_definition)
  const eventTypeName = occasion.event_type_name || 'Event'
  const title = eventTypeName

  // Extract time from start_datetime
  const startTime = occasion.start_datetime ? new Date(occasion.start_datetime).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' }) : null

  return {
    id: occasion.id,
    date: occasion.start_datetime.split('T')[0], // Extract date portion from ISO datetime
    title,
    event_type: eventTypeName,
    isLiturgical: false,
    moduleType: occasion.module_type,
    start_time: startTime,
    eventTypeIcon: occasion.event_type_icon,
    // Additional fields for navigation
    event_id: occasion.master_event_id ?? undefined,
    event_type_slug: occasion.event_type_slug ?? undefined,
    module_id: occasion.module_id ?? undefined,
  }
}

export function CalendarClient({ occasions, initialView, initialDate }: CalendarClientProps) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { setBreadcrumbs } = useBreadcrumbs()

  // Parse initial date if provided, otherwise use today
  const parsedInitialDate = initialDate ? new Date(initialDate) : new Date()
  const [currentDate, setCurrentDate] = useState(parsedInitialDate)
  const [view, setView] = useState<CalendarView>(initialView)
  const [showLiturgical, setShowLiturgical] = useState(true) // Default to ON
  const [liturgicalEvents, setLiturgicalEvents] = useState<GlobalLiturgicalEvent[]>([])
  const [loadingLiturgical, setLoadingLiturgical] = useState(false)
  const [selectedLiturgicalEvent, setSelectedLiturgicalEvent] = useState<GlobalLiturgicalEvent | null>(null)
  const [modalOpen, setModalOpen] = useState(false)

  // Ensure URL has view parameter on initial load
  useEffect(() => {
    // Check if URL has view parameter, if not, set it
    if (!searchParams.has('view')) {
      const dateParam = searchParams.get('date')
      const newUrl = dateParam
        ? `/calendar?view=${initialView}&date=${dateParam}`
        : `/calendar?view=${initialView}`
      router.replace(newUrl, { scroll: false })
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []) // Only run on mount

  // Sync state with URL parameters when they change
  useEffect(() => {
    const urlView = searchParams.get('view') as CalendarView | null
    const urlDate = searchParams.get('date')

    // Update view if URL view parameter differs from current state
    if (urlView && urlView !== view) {
      setView(urlView)
    }

    // Update date if URL date parameter differs from current state
    if (urlDate) {
      const newDate = new Date(urlDate)
      // Only update if the date is different (compare date strings to avoid time differences)
      if (format(newDate, 'yyyy-MM-dd') !== format(currentDate, 'yyyy-MM-dd')) {
        setCurrentDate(newDate)
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams]) // Only sync when URL params change, not when local state changes

  // Load toggle state from localStorage
  useEffect(() => {
    const saved = localStorage.getItem('showLiturgicalCalendar')
    if (saved !== null) {
      setShowLiturgical(JSON.parse(saved))
    } else {
      // First time - set default to true in localStorage
      localStorage.setItem('showLiturgicalCalendar', JSON.stringify(true))
    }
  }, [])

  // Save toggle state to localStorage
  useEffect(() => {
    localStorage.setItem('showLiturgicalCalendar', JSON.stringify(showLiturgical))
  }, [showLiturgical])

  // Fetch liturgical events when toggle is on or date changes
  useEffect(() => {
    async function fetchLiturgicalEvents() {
      if (!showLiturgical) {
        setLiturgicalEvents([])
        return
      }

      setLoadingLiturgical(true)
      try {
        const year = currentDate.getFullYear()
        const month = currentDate.getMonth() + 1
        const events = await getGlobalLiturgicalEventsByMonth(year, month, 'en_US')
        setLiturgicalEvents(events)
      } catch (error) {
        console.error('Error fetching liturgical events:', error)
        toast.error('Failed to load liturgical calendar')
      } finally {
        setLoadingLiturgical(false)
      }
    }

    fetchLiturgicalEvents()
  }, [showLiturgical, currentDate])

  useEffect(() => {
    setBreadcrumbs([
      { label: "Dashboard", href: "/dashboard" },
      { label: "Calendar" }
    ])
  }, [setBreadcrumbs])

  // Convert parish occasions to calendar items
  const parishCalendarItems: LiturgicalCalendarItem[] = occasions
    .map(occasion => occasionToCalendarItem(occasion))

  // Convert liturgical events to calendar items
  const liturgicalCalendarItems: LiturgicalCalendarItem[] = liturgicalEvents.map(event => ({
    id: event.id,
    date: event.date,
    title: event.event_data.name,
    isLiturgical: true,
    liturgicalEvent: event,
    liturgicalColor: event.event_data.color[0]
  }))

  // Merge both types of events
  const calendarItems = [...parishCalendarItems, ...liturgicalCalendarItems]

  const handleNavigate = (direction: 'prev' | 'next') => {
    const newDate = new Date(currentDate)

    switch (view) {
      case 'month':
        newDate.setMonth(currentDate.getMonth() + (direction === 'next' ? 1 : -1))
        break
      case 'week':
        newDate.setDate(currentDate.getDate() + (direction === 'next' ? 7 : -7))
        break
      case 'day':
        newDate.setDate(currentDate.getDate() + (direction === 'next' ? 1 : -1))
        break
    }

    setCurrentDate(newDate)
    // Update URL with new date
    const dateStr = format(newDate, 'yyyy-MM-dd')
    router.push(`/calendar?view=${view}&date=${dateStr}`)
  }

  const handleToday = () => {
    const today = new Date()
    setCurrentDate(today)
    // Update URL with today's date
    const dateStr = format(today, 'yyyy-MM-dd')
    router.push(`/calendar?view=${view}&date=${dateStr}`)
  }

  const handleViewChange = (newView: CalendarView) => {
    setView(newView)
    // Update URL with new view, preserving the current date
    const dateStr = format(currentDate, 'yyyy-MM-dd')
    router.push(`/calendar?view=${newView}&date=${dateStr}`)
  }

  const handleEventClick = async (item: CalendarItem, event: React.MouseEvent) => {
    event.preventDefault()

    const calendarItem = item as LiturgicalCalendarItem

    // Handle liturgical events differently
    if (calendarItem.isLiturgical && calendarItem.liturgicalEvent) {
      setSelectedLiturgicalEvent(calendarItem.liturgicalEvent)
      setModalOpen(true)
      return
    }

    // Check if this occasion has a module link
    if (calendarItem.moduleType && calendarItem.module_id) {
      // Navigate to the module
      // Special case: "mass" → "masses" (not "masss")
      const modulePath = calendarItem.moduleType === 'mass'
        ? '/masses'
        : `/${calendarItem.moduleType}s` // weddings, funerals, baptisms, etc.
      router.push(`${modulePath}/${calendarItem.module_id}`)
    } else if (calendarItem.event_type_slug && calendarItem.event_id) {
      // Navigate to the dynamic event page
      router.push(`/events/${calendarItem.event_type_slug}/${calendarItem.event_id}`)
    } else {
      // Fallback to events list
      router.push(`/events`)
    }
  }

  return (
    <>
      <PageContainer
        title="Calendar"
        description="View all parish events in a calendar format"
      >
        <Calendar
          currentDate={currentDate}
          view={view}
          items={calendarItems}
          title="Parish Events Calendar"
          onNavigate={handleNavigate}
          onToday={handleToday}
          onViewChange={handleViewChange}
          onItemClick={handleEventClick}
          maxItemsPerDay={3}
          showViewSelector={true}
          headerActions={
            <div className="flex items-center gap-2">
              <Switch
                id="liturgical-toggle"
                checked={showLiturgical}
                onCheckedChange={setShowLiturgical}
                disabled={loadingLiturgical}
              />
              <Label htmlFor="liturgical-toggle" className="cursor-pointer">
                Show Liturgical Calendar
              </Label>
            </div>
          }
        />
      </PageContainer>

      <LiturgicalEventPreview
        event={selectedLiturgicalEvent}
        open={modalOpen}
        onOpenChange={setModalOpen}
      />
    </>
  )
}

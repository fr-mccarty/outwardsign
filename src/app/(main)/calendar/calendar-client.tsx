'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Calendar } from '@/components/calendar/calendar'
import { CalendarView, CalendarItem } from '@/components/calendar/types'
import { PageContainer } from '@/components/page-container'
import { Event } from '@/lib/types'
import { getEventModuleLink } from '@/lib/actions/events'
import { useBreadcrumbs } from '@/components/breadcrumb-context'
import { getGlobalLiturgicalEventsByMonth, GlobalLiturgicalEvent } from '@/lib/actions/global-liturgical-events'
import { LiturgicalEventModal } from '@/components/liturgical-event-modal'
import { Switch } from '@/components/ui/switch'
import { Label } from '@/components/ui/label'
import { toast } from 'sonner'

interface CalendarClientProps {
  events: Event[]
  initialView: CalendarView
}

interface LiturgicalCalendarItem extends CalendarItem {
  isLiturgical: boolean
  liturgicalEvent?: GlobalLiturgicalEvent
  liturgicalColor?: string
}

// Transform Event to CalendarItem
function eventToCalendarItem(event: Event): CalendarItem {
  return {
    id: event.id,
    date: event.start_date || '',
    title: event.name,
    event_type: event.event_type,
  }
}

export function CalendarClient({ events, initialView }: CalendarClientProps) {
  const router = useRouter()
  const { setBreadcrumbs } = useBreadcrumbs()
  const [currentDate, setCurrentDate] = useState(new Date())
  const [view, setView] = useState<CalendarView>(initialView)
  const [showLiturgical, setShowLiturgical] = useState(true) // Default to ON
  const [liturgicalEvents, setLiturgicalEvents] = useState<GlobalLiturgicalEvent[]>([])
  const [loadingLiturgical, setLoadingLiturgical] = useState(false)
  const [selectedLiturgicalEvent, setSelectedLiturgicalEvent] = useState<GlobalLiturgicalEvent | null>(null)
  const [modalOpen, setModalOpen] = useState(false)

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
        const events = await getGlobalLiturgicalEventsByMonth(year, month, 'en')
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

  // Convert parish events to calendar items
  const parishCalendarItems: LiturgicalCalendarItem[] = events
    .filter(event => event.start_date)
    .map(event => ({
      ...eventToCalendarItem(event),
      isLiturgical: false
    }))

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
  }

  const handleToday = () => {
    setCurrentDate(new Date())
  }

  const handleViewChange = (newView: CalendarView) => {
    setView(newView)
    // Update URL with new view
    router.push(`/calendar?view=${newView}`)
  }

  const handleEventClick = async (item: CalendarItem, event: React.MouseEvent) => {
    event.preventDefault()

    const liturgicalItem = item as LiturgicalCalendarItem

    // Handle liturgical events differently
    if (liturgicalItem.isLiturgical && liturgicalItem.liturgicalEvent) {
      setSelectedLiturgicalEvent(liturgicalItem.liturgicalEvent)
      setModalOpen(true)
      return
    }

    // Get the module link for this parish event
    const moduleLink = await getEventModuleLink(item.id)

    if (moduleLink.moduleType && moduleLink.moduleId) {
      // Navigate to the module
      const modulePath = `/${moduleLink.moduleType}s` // weddings, funerals, baptisms, etc.
      router.push(`${modulePath}/${moduleLink.moduleId}`)
    } else {
      // No module found, go to event page
      router.push(`/events/${item.id}`)
    }
  }

  const handleAddMass = () => {
    toast.info('Mass scheduling coming soon!')
    setModalOpen(false)
  }

  // Map liturgical colors to styling
  const LITURGICAL_COLOR_STYLES: Record<string, string> = {
    'purple': 'bg-purple-50 dark:bg-purple-950/30 border-l-4 border-l-purple-500 text-purple-900 dark:text-purple-100',
    'white': 'bg-gray-50 dark:bg-gray-900/30 border-l-4 border-l-gray-300 text-gray-900 dark:text-gray-100',
    'red': 'bg-red-50 dark:bg-red-950/30 border-l-4 border-l-red-500 text-red-900 dark:text-red-100',
    'green': 'bg-green-50 dark:bg-green-950/30 border-l-4 border-l-green-500 text-green-900 dark:text-green-100',
    'gold': 'bg-yellow-50 dark:bg-yellow-950/30 border-l-4 border-l-yellow-500 text-yellow-900 dark:text-yellow-100',
    'rose': 'bg-pink-50 dark:bg-pink-950/30 border-l-4 border-l-pink-400 text-pink-900 dark:text-pink-100',
    'black': 'bg-gray-800 dark:bg-gray-950/50 border-l-4 border-l-black text-gray-100 dark:text-gray-200',
  }

  const getItemColor = (item: CalendarItem): string => {
    const liturgicalItem = item as LiturgicalCalendarItem
    if (liturgicalItem.isLiturgical && liturgicalItem.liturgicalColor) {
      const color = liturgicalItem.liturgicalColor.toLowerCase()
      return LITURGICAL_COLOR_STYLES[color] || 'bg-muted/50 border-l-4 border-l-muted text-foreground'
    }
    // Default styling for parish events
    return 'bg-primary/20 text-primary border border-primary/30'
  }

  return (
    <>
      <PageContainer
        title="Calendar"
        description="View all parish events in a calendar format"
        maxWidth="7xl"
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
          getItemColor={getItemColor}
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

      <LiturgicalEventModal
        event={selectedLiturgicalEvent}
        open={modalOpen}
        onOpenChange={setModalOpen}
        onAddMass={handleAddMass}
      />
    </>
  )
}

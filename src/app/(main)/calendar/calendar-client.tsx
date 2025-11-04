'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Calendar } from '@/components/calendar/calendar'
import { CalendarView, CalendarItem } from '@/components/calendar/types'
import { PageContainer } from '@/components/page-container'
import { Event } from '@/lib/types'
import { getEventModuleLink } from '@/lib/actions/events'
import { useBreadcrumbs } from '@/components/breadcrumb-context'

interface CalendarClientProps {
  events: Event[]
  initialView: CalendarView
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

  useEffect(() => {
    setBreadcrumbs([
      { label: "Dashboard", href: "/dashboard" },
      { label: "Calendar" }
    ])
  }, [setBreadcrumbs])

  const calendarItems = events
    .filter(event => event.start_date) // Only show events with dates
    .map(eventToCalendarItem)

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

    // Get the module link for this event
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

  return (
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
        maxItemsPerDay={3}
        showViewSelector={true}
      />
    </PageContainer>
  )
}

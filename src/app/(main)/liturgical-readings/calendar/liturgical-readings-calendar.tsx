'use client'

import { useEffect, useState } from 'react'
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { PageContainer } from '@/components/page-container'
import { 
  BookOpen,
  Plus,
  List
} from "lucide-react"
import { useBreadcrumbs } from '@/components/breadcrumb-context'
import { getCurrentParish } from '@/lib/auth/parish'
import { 
  getLiturgicalReadingsByDateRange
} from '@/lib/actions/liturgical-readings'
import type { LiturgicalReading } from '@/lib/types'
import { Parish } from '@/lib/types'
import { toast } from 'sonner'
import { Calendar, CalendarView, CalendarItem } from '@/components/calendar'

// Transform LiturgicalReading to match CalendarItem interface
interface LiturgicalReadingCalendarItem extends CalendarItem {
  reading: LiturgicalReading
}

export function LiturgicalReadingsCalendar() {
  const [, setCurrentParish] = useState<Parish | null>(null)
  const [readings, setReadings] = useState<LiturgicalReading[]>([])
  const [loading, setLoading] = useState(true)
  const [currentDate, setCurrentDate] = useState(new Date())
  const [selectedDate, setSelectedDate] = useState<Date | null>(null)
  const [calendarView] = useState<CalendarView>('month')
  const { setBreadcrumbs } = useBreadcrumbs()

  useEffect(() => {
    setBreadcrumbs([
      { label: "Dashboard", href: "/dashboard" },
      { label: "Liturgical Readings", href: "/liturgical-readings" },
      { label: "Calendar" }
    ])
  }, [setBreadcrumbs])

  useEffect(() => {
    loadData()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentDate, calendarView])

  async function loadData() {
    try {
      setLoading(true)
      const parish = await getCurrentParish()
      if (parish) {
        setCurrentParish(parish)
        await loadReadings()
      }
    } catch (error) {
      console.error('Error loading data:', error)
      toast.error('Failed to load calendar data')
    } finally {
      setLoading(false)
    }
  }

  async function loadReadings() {
    try {
      const { startDate, endDate } = getDateRange()
      const data = await getLiturgicalReadingsByDateRange(
        startDate.toISOString().split('T')[0],
        endDate.toISOString().split('T')[0]
      )
      setReadings(data)
    } catch (error) {
      console.error('Error loading liturgical readings:', error)
      toast.error('Failed to load liturgical readings')
    }
  }

  const getDateRange = () => {
    const start = new Date(currentDate)
    const end = new Date(currentDate)

    // Month view
    start.setDate(1)
    start.setDate(start.getDate() - start.getDay()) // Start of week containing first day
    end.setMonth(end.getMonth() + 1, 0) // Last day of month
    end.setDate(end.getDate() + (6 - end.getDay())) // End of week containing last day

    return { startDate: start, endDate: end }
  }

  const navigatePeriod = (direction: 'prev' | 'next') => {
    const newDate = new Date(currentDate)
    newDate.setMonth(currentDate.getMonth() + (direction === 'next' ? 1 : -1))
    setCurrentDate(newDate)
  }

  // Transform readings to calendar items
  const calendarItems: LiturgicalReadingCalendarItem[] = readings
    .filter(reading => reading.date) // Only include readings with dates
    .map(reading => ({
      id: reading.id,
      title: reading.title,
      date: reading.date!,
      reading: reading
    }))

  const handleItemClick = (item: LiturgicalReadingCalendarItem) => {
    window.location.href = `/liturgical-readings/${item.reading.id}`
  }

  const getItemColor = () => "bg-green-100 text-green-800 hover:bg-green-200"

  const headerActions = (
    <div className="flex items-center gap-3">
      <Button
        variant="outline"
        onClick={() => window.location.href = '/liturgical-readings'}
      >
        <List className="h-4 w-4 mr-2" />
        List View
      </Button>
      
      <Button onClick={() => window.location.href = '/liturgical-readings/create'}>
        <Plus className="h-4 w-4 mr-2" />
        New Liturgical Reading
      </Button>
    </div>
  )

  const getReadingsCount = (reading: LiturgicalReading): number => {
    let count = 0
    if (reading.first_reading_id) count++
    if (reading.psalm_id) count++
    if (reading.second_reading_id) count++
    if (reading.gospel_reading_id) count++
    return count
  }

  if (loading) {
    return (
      <PageContainer
        title="Liturgical Readings Calendar"
        description="View liturgical readings in calendar format"
        maxWidth="7xl"
      >
        <div className="space-y-6">Loading calendar...</div>
      </PageContainer>
    )
  }

  return (
    <PageContainer
      title="Liturgical Readings Calendar"
      description="View liturgical readings in calendar format"
      maxWidth="7xl"
    >
      <div className="space-y-6">
        <Calendar
          currentDate={currentDate}
          view={calendarView}
          items={calendarItems}
          title="Liturgical Readings Calendar"
          onNavigate={navigatePeriod}
          onToday={() => setCurrentDate(new Date())}
          onDayClick={setSelectedDate}
          getItemColor={getItemColor}
          onItemClick={handleItemClick}
          headerActions={headerActions}
        />

        {/* Legend */}
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-6 text-sm">
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 bg-green-100 rounded"></div>
                <span>Liturgical Reading</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Selected Date Modal/Panel */}
        {selectedDate && (
          <Card className="mt-6">
            <CardHeader>
              <CardTitle>
                Liturgical Readings for {selectedDate.toLocaleDateString()}
              </CardTitle>
            </CardHeader>
            <CardContent>
              {/* Show readings for selected date */}
              <div className="space-y-2">
                {readings
                  .filter(reading => 
                    reading.date && 
                    new Date(reading.date).toDateString() === selectedDate.toDateString()
                  )
                  .map((reading) => (
                    <div key={reading.id} className="p-3 border rounded-md">
                      <div className="flex items-center gap-2 mb-1">
                        <Badge className="text-xs bg-green-100 text-green-800">
                          <BookOpen className="h-3 w-3 mr-1" />
                          {getReadingsCount(reading)} reading{getReadingsCount(reading) !== 1 ? 's' : ''}
                        </Badge>
                      </div>
                      <p className="font-medium">{reading.title}</p>
                      {reading.description && (
                        <p className="text-sm text-muted-foreground mt-1">{reading.description}</p>
                      )}
                      <div className="flex items-center gap-2 mt-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => window.location.href = `/liturgical-readings/${reading.id}`}
                        >
                          View
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => window.location.href = `/liturgical-readings/${reading.id}/wizard`}
                        >
                          Edit
                        </Button>
                      </div>
                    </div>
                  ))}
                {readings.filter(reading => 
                  reading.date && 
                  new Date(reading.date).toDateString() === selectedDate.toDateString()
                ).length === 0 && (
                  <div className="text-center py-8 text-muted-foreground">
                    <BookOpen className="h-12 w-12 mx-auto mb-4" />
                    <p>No liturgical readings for this date</p>
                  </div>
                )}
              </div>
              <Button
                className="mt-4"
                variant="outline"
                onClick={() => setSelectedDate(null)}
              >
                Close
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </PageContainer>
  )
}
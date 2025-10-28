'use client'

import { useEffect, useState } from 'react'
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { PageContainer } from '@/components/page-container'
import { 
  Megaphone,
  Plus,
  List
} from "lucide-react"
import { useBreadcrumbs } from '@/components/breadcrumb-context'
import { getCurrentParish } from '@/lib/auth/parish'
import { 
  getAnnouncementsByDateRange,
  type Announcement
} from '@/lib/actions/announcements'
import { Parish } from '@/lib/types'
import { toast } from 'sonner'
import { Calendar, CalendarView, CalendarItem } from '@/components/calendar'

// Transform announcement to match CalendarItem interface
interface AnnouncementCalendarItem extends CalendarItem {
  announcement: Announcement
}

export function AnnouncementsCalendar() {
  const [, setCurrentParish] = useState<Parish | null>(null)
  const [announcements, setAnnouncements] = useState<Announcement[]>([])
  const [loading, setLoading] = useState(true)
  const [currentDate, setCurrentDate] = useState(new Date())
  const [selectedDate, setSelectedDate] = useState<Date | null>(null)
  const [calendarView] = useState<CalendarView>('month')
  const { setBreadcrumbs } = useBreadcrumbs()

  useEffect(() => {
    setBreadcrumbs([
      { label: "Dashboard", href: "/dashboard" },
      { label: "Announcements", href: "/announcements" },
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
        await loadAnnouncements()
      }
    } catch (error) {
      console.error('Error loading data:', error)
      toast.error('Failed to load calendar data')
    } finally {
      setLoading(false)
    }
  }

  async function loadAnnouncements() {
    try {
      const { startDate, endDate } = getDateRange()
      const data = await getAnnouncementsByDateRange(
        startDate.toISOString().split('T')[0],
        endDate.toISOString().split('T')[0]
      )
      setAnnouncements(data)
    } catch (error) {
      console.error('Error loading announcements:', error)
      toast.error('Failed to load announcements')
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

  // Transform announcements to calendar items
  const calendarItems: AnnouncementCalendarItem[] = announcements
    .filter(announcement => announcement.date) // Only include announcements with dates
    .map(announcement => ({
      id: announcement.id.toString(),
      title: announcement.title || (announcement.text ? announcement.text.substring(0, 50) + '...' : 'Untitled announcement'),
      date: announcement.date!,
      announcement: announcement
    }))

  const handleItemClick = (item: AnnouncementCalendarItem) => {
    window.location.href = `/announcements/${item.announcement.id}/edit`
  }

  const getItemColor = () => "bg-blue-100 text-blue-800 hover:bg-blue-200"

  const headerActions = (
    <div className="flex items-center gap-3">
      <Button
        variant="outline"
        onClick={() => window.location.href = '/announcements'}
      >
        <List className="h-4 w-4 mr-2" />
        List View
      </Button>
      
      <Button onClick={() => window.location.href = '/announcements/create'}>
        <Plus className="h-4 w-4 mr-2" />
        New Announcement
      </Button>
    </div>
  )

  if (loading) {
    return (
      <PageContainer
        title="Announcements Calendar"
        description="View announcements in calendar format"
        maxWidth="7xl"
      >
        <div className="space-y-6">Loading calendar...</div>
      </PageContainer>
    )
  }

  return (
    <PageContainer
      title="Announcements Calendar"
      description="View announcements in calendar format"
      maxWidth="7xl"
    >
      <div className="space-y-6">
        <Calendar
          currentDate={currentDate}
          view={calendarView}
          items={calendarItems}
          title="Announcements Calendar"
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
                <div className="w-4 h-4 bg-blue-100 rounded"></div>
                <span>Announcement</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Selected Date Modal/Panel */}
        {selectedDate && (
          <Card className="mt-6">
            <CardHeader>
              <CardTitle>
                Announcements for {selectedDate.toLocaleDateString()}
              </CardTitle>
            </CardHeader>
            <CardContent>
              {/* Show announcements for selected date */}
              <div className="space-y-2">
                {announcements
                  .filter(announcement => 
                    announcement.date && 
                    new Date(announcement.date).toDateString() === selectedDate.toDateString()
                  )
                  .map((announcement) => (
                    <div key={announcement.id} className="p-3 border rounded-md">
                      <div className="flex items-center gap-2 mb-1">
                        <Badge className="text-xs bg-blue-100 text-blue-800">
                          <Megaphone className="h-3 w-3 mr-1" />
                          Announcement
                        </Badge>
                        <span className="text-sm text-muted-foreground">
                          {new Date(announcement.created_at).toLocaleDateString()}
                        </span>
                      </div>
                      {announcement.title && (
                        <h4 className="font-medium mb-1">{announcement.title}</h4>
                      )}
                      <p className="text-sm leading-relaxed whitespace-pre-wrap line-clamp-3">
                        {announcement.text || <span className="italic text-muted-foreground">No content</span>}
                      </p>
                      <div className="flex items-center gap-2 mt-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => window.location.href = `/announcements/${announcement.id}`}
                        >
                          View
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => window.location.href = `/announcements/${announcement.id}/edit`}
                        >
                          Edit
                        </Button>
                      </div>
                    </div>
                  ))}
                {announcements.filter(announcement => 
                  announcement.date && 
                  new Date(announcement.date).toDateString() === selectedDate.toDateString()
                ).length === 0 && (
                  <div className="text-center py-8 text-muted-foreground">
                    <Megaphone className="h-12 w-12 mx-auto mb-4" />
                    <p>No announcements for this date</p>
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
'use client'

import { useEffect, useState } from 'react'
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { PageContainer } from '@/components/page-container'
import { 
  FileText,
  Plus,
  List
} from "lucide-react"
import { useBreadcrumbs } from '@/components/breadcrumb-context'
import { getCurrentParish } from '@/lib/auth/parish'
import { 
  getPetitionsByDateRange
} from '@/lib/actions/petitions'
import type { Petition } from '@/lib/types'
import { Parish } from '@/lib/types'
import { toast } from 'sonner'
import { Calendar, CalendarView, CalendarItem } from '@/components/calendar'

// Extend Petition to match CalendarItem interface
interface PetitionCalendarItem extends Petition, CalendarItem {
  // Petition already has id, we just need to ensure date is mapped correctly
}

export function PetitionsCalendar() {
  const [, setCurrentParish] = useState<Parish | null>(null)
  const [petitions, setPetitions] = useState<Petition[]>([])
  const [loading, setLoading] = useState(true)
  const [currentDate, setCurrentDate] = useState(new Date())
  const [selectedDate, setSelectedDate] = useState<Date | null>(null)
  const [calendarView] = useState<CalendarView>('month')
  const { setBreadcrumbs } = useBreadcrumbs()

  useEffect(() => {
    setBreadcrumbs([
      { label: "Dashboard", href: "/dashboard" },
      { label: "Petitions", href: "/petitions" },
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
        await loadPetitions()
      }
    } catch (error) {
      console.error('Error loading data:', error)
      toast.error('Failed to load calendar data')
    } finally {
      setLoading(false)
    }
  }

  async function loadPetitions() {
    try {
      const { startDate, endDate } = getDateRange()
      const data = await getPetitionsByDateRange(
        startDate.toISOString().split('T')[0],
        endDate.toISOString().split('T')[0]
      )
      setPetitions(data)
    } catch (error) {
      console.error('Error loading petitions:', error)
      toast.error('Failed to load petitions')
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

  // Transform petitions to calendar items
  const calendarItems: PetitionCalendarItem[] = petitions.map(petition => ({
    ...petition,
    title: petition.title,
    date: petition.date
  }))

  const handleItemClick = (item: PetitionCalendarItem) => {
    window.location.href = `/petitions/${item.id}`
  }

  const getItemColor = () => "bg-amber-100 text-amber-800 hover:bg-amber-200"

  const headerActions = (
    <div className="flex items-center gap-3">
      <Button
        variant="outline"
        onClick={() => window.location.href = '/petitions'}
      >
        <List className="h-4 w-4 mr-2" />
        List View
      </Button>
      
      <Button onClick={() => window.location.href = '/petitions/create'}>
        <Plus className="h-4 w-4 mr-2" />
        New Petition
      </Button>
    </div>
  )

  if (loading) {
    return (
      <PageContainer
        title="Petitions Calendar"
        description="View petitions in calendar format"
        maxWidth="7xl"
      >
        <div className="space-y-6">Loading calendar...</div>
      </PageContainer>
    )
  }

  return (
    <PageContainer
      title="Petitions Calendar"
      description="View petitions in calendar format"
      maxWidth="7xl"
    >
      <div className="space-y-6">
        <Calendar
          currentDate={currentDate}
          view={calendarView}
          items={calendarItems}
          title="Petitions Calendar"
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
                <div className="w-4 h-4 bg-amber-100 rounded"></div>
                <span>Petition</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Selected Date Modal/Panel */}
        {selectedDate && (
          <Card className="mt-6">
            <CardHeader>
              <CardTitle>
                Petitions for {selectedDate.toLocaleDateString()}
              </CardTitle>
            </CardHeader>
            <CardContent>
              {/* Show petitions for selected date */}
              <div className="space-y-2">
                {petitions
                  .filter(petition => 
                    petition.date && 
                    new Date(petition.date).toDateString() === selectedDate.toDateString()
                  )
                  .map((petition) => (
                    <div key={petition.id} className="p-3 border rounded-md">
                      <div className="flex items-center gap-2 mb-1">
                        <Badge className="text-xs bg-amber-100 text-amber-800">
                          <FileText className="h-3 w-3 mr-1" />
                          Petition
                        </Badge>
                        <span className="text-sm font-medium capitalize">
                          {petition.language}
                        </span>
                      </div>
                      <p className="font-medium">{petition.title}</p>
                      <div className="flex items-center gap-2 mt-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => window.location.href = `/petitions/${petition.id}`}
                        >
                          View
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => window.location.href = `/petitions/${petition.id}/edit`}
                        >
                          Edit
                        </Button>
                      </div>
                    </div>
                  ))}
                {petitions.filter(petition => 
                  petition.date && 
                  new Date(petition.date).toDateString() === selectedDate.toDateString()
                ).length === 0 && (
                  <div className="text-center py-8 text-muted-foreground">
                    <FileText className="h-12 w-12 mx-auto mb-4" />
                    <p>No petitions for this date</p>
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
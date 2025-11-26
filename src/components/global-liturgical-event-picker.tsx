'use client'

import { useState, useEffect, useMemo } from 'react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { FormInput } from '@/components/form-input'
import { Loader2, ChevronLeft, ChevronRight, List, CalendarDays } from 'lucide-react'
import { getGlobalLiturgicalEventsPaginated, type GlobalLiturgicalEvent } from '@/lib/actions/global-liturgical-events'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'
import { getLiturgicalBgClass, getLiturgicalTextClass, getLiturgicalCssVarValue } from '@/lib/utils/liturgical-colors'

interface GlobalLiturgicalEventPickerProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSelect: (event: GlobalLiturgicalEvent) => void
  placeholder?: string
  emptyMessage?: string
  selectedEventId?: string
  className?: string
}

// View modes
type ViewMode = 'list' | 'calendar'

// Storage keys for persisting preferences
const STORAGE_KEY_START_DATE = 'liturgical-event-picker-start-date'
const STORAGE_KEY_LOCALE = 'liturgical-event-picker-locale'
const STORAGE_KEY_VIEW_MODE = 'liturgical-event-picker-view-mode'

// Get initial start date from localStorage or default to current date
const getInitialStartDate = (): string => {
  if (typeof window === 'undefined') {
    return new Date().toISOString().split('T')[0]
  }
  const stored = localStorage.getItem(STORAGE_KEY_START_DATE)
  return stored || new Date().toISOString().split('T')[0]
}

// Save start date to localStorage
const saveStartDate = (date: string) => {
  if (typeof window !== 'undefined') {
    localStorage.setItem(STORAGE_KEY_START_DATE, date)
  }
}

// Get initial locale from localStorage or default to en_US
const getInitialLocale = (): string => {
  if (typeof window === 'undefined') return 'en_US'
  const stored = localStorage.getItem(STORAGE_KEY_LOCALE)
  return stored || 'en_US'
}

// Save locale to localStorage
const saveLocale = (locale: string) => {
  if (typeof window !== 'undefined') {
    localStorage.setItem(STORAGE_KEY_LOCALE, locale)
  }
}

// Get initial view mode from localStorage or default to list
const getInitialViewMode = (): ViewMode => {
  if (typeof window === 'undefined') return 'list'
  const stored = localStorage.getItem(STORAGE_KEY_VIEW_MODE)
  return (stored as ViewMode) || 'list'
}

// Save view mode to localStorage
const saveViewMode = (mode: ViewMode) => {
  if (typeof window !== 'undefined') {
    localStorage.setItem(STORAGE_KEY_VIEW_MODE, mode)
  }
}

// Calculate end date (1 year from start date)
const calculateEndDate = (startDate: string): string => {
  const date = new Date(startDate)
  date.setFullYear(date.getFullYear() + 1)
  return date.toISOString().split('T')[0]
}

// Available locale options
const LOCALE_OPTIONS = [
  { value: 'en_US', label: 'English (United States)' },
] as const

export function GlobalLiturgicalEventPicker({
  open,
  onOpenChange,
  onSelect,
  emptyMessage = 'No liturgical events found.',
  selectedEventId,
}: GlobalLiturgicalEventPickerProps) {
  const [events, setEvents] = useState<GlobalLiturgicalEvent[]>([])
  const [loading, setLoading] = useState(false)
  const [currentPage, setCurrentPage] = useState(1)
  const [totalCount, setTotalCount] = useState(0)
  const [startDate, setStartDate] = useState<string>(getInitialStartDate)
  const [selectedLocale, setSelectedLocale] = useState<string>(getInitialLocale)
  const [viewMode, setViewMode] = useState<ViewMode>(getInitialViewMode)
  const [calendarMonth, setCalendarMonth] = useState<Date>(new Date())
  const [selectedEvent, setSelectedEvent] = useState<GlobalLiturgicalEvent | null>(null)
  const [detailsModalOpen, setDetailsModalOpen] = useState(false)
  const PAGE_SIZE = 10

  // Calculate date range based on view mode
  const dateRange = useMemo(() => {
    if (viewMode === 'calendar') {
      // For calendar view, load events for the entire displayed month (including overflow days)
      const firstDay = new Date(calendarMonth.getFullYear(), calendarMonth.getMonth(), 1)
      const startOfCalendar = new Date(firstDay)
      startOfCalendar.setDate(startOfCalendar.getDate() - startOfCalendar.getDay())

      // End date is 42 days later (6 weeks)
      const endOfCalendar = new Date(startOfCalendar)
      endOfCalendar.setDate(endOfCalendar.getDate() + 42)

      return {
        start: startOfCalendar.toISOString().split('T')[0],
        end: endOfCalendar.toISOString().split('T')[0]
      }
    } else {
      // For list view, use start date + 1 year
      return {
        start: startDate,
        end: calculateEndDate(startDate)
      }
    }
  }, [viewMode, calendarMonth, startDate])

  // Load events when dialog opens or when filters change
  useEffect(() => {
    if (open) {
      loadEvents(currentPage, dateRange.start, dateRange.end, selectedLocale)
    }
  }, [open, currentPage, dateRange, selectedLocale, viewMode])

  const loadEvents = async (page: number, start: string, end: string, locale: string) => {
    try {
      setLoading(true)
      // In calendar view, load all events without pagination
      if (viewMode === 'calendar') {
        const result = await getGlobalLiturgicalEventsPaginated(start, end, locale, {
          page: 1,
          limit: 1000, // Large limit to get all events for the month
          search: '',
        })
        setEvents(result.items)
        setTotalCount(result.totalCount)
      } else {
        // In list view, use pagination
        const result = await getGlobalLiturgicalEventsPaginated(start, end, locale, {
          page,
          limit: PAGE_SIZE,
          search: '',
        })
        setEvents(result.items)
        setTotalCount(result.totalCount)
      }
    } catch (error) {
      console.error('Error loading liturgical events:', error)
      toast.error('Failed to load liturgical events')
    } finally {
      setLoading(false)
    }
  }

  // Handle start date change
  const handleStartDateChange = (newDate: string) => {
    setStartDate(newDate)
    saveStartDate(newDate)
    setCurrentPage(1)
  }

  // Handle locale change
  const handleLocaleChange = (newLocale: string) => {
    setSelectedLocale(newLocale)
    saveLocale(newLocale)
    setCurrentPage(1)
  }

  // Handle view mode change
  const handleViewModeChange = (newMode: ViewMode) => {
    setViewMode(newMode)
    saveViewMode(newMode)
  }

  // Handle calendar month navigation
  const handlePreviousMonth = () => {
    const newMonth = new Date(calendarMonth)
    newMonth.setMonth(newMonth.getMonth() - 1)
    setCalendarMonth(newMonth)
  }

  const handleNextMonth = () => {
    const newMonth = new Date(calendarMonth)
    newMonth.setMonth(newMonth.getMonth() + 1)
    setCalendarMonth(newMonth)
  }

  // Handle page change
  const handlePageChange = (page: number) => {
    setCurrentPage(page)
  }

  // Handle item selection
  const handleSelect = (event: GlobalLiturgicalEvent) => {
    onSelect(event)
    onOpenChange(false)
  }

  // Handle showing event details
  const handleShowEventDetails = (event: GlobalLiturgicalEvent) => {
    setSelectedEvent(event)
    setDetailsModalOpen(true)
  }

  // Handle selecting event from details modal
  const handleSelectFromDetails = () => {
    if (selectedEvent) {
      onSelect(selectedEvent)
      setDetailsModalOpen(false)
      onOpenChange(false)
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

    const primaryColor = colors[0].toLowerCase()
    const bgClass = getLiturgicalBgClass(primaryColor)
    const textClass = getLiturgicalTextClass(primaryColor)

    return (
      <span
        className={cn(
          'inline-block px-2 py-0.5 rounded text-xs capitalize',
          bgClass,
          textClass
        )}
      >
        {primaryColor}
      </span>
    )
  }

  // Group events by month for list view
  const eventsByMonth = useMemo(() => {
    const grouped: Record<string, GlobalLiturgicalEvent[]> = {}

    events.forEach((event) => {
      const date = new Date(event.date)
      const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`

      if (!grouped[monthKey]) {
        grouped[monthKey] = []
      }
      grouped[monthKey].push(event)
    })

    // Sort events within each month by date
    Object.keys(grouped).forEach((monthKey) => {
      grouped[monthKey].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
    })

    return grouped
  }, [events])

  // Generate calendar grid days for calendar view
  const calendarDays = useMemo(() => {
    const days: Array<{
      date: Date
      isCurrentMonth: boolean
      isToday: boolean
      events: GlobalLiturgicalEvent[]
    }> = []

    // Get the first day of the current month based on calendarMonth
    const firstDay = new Date(calendarMonth.getFullYear(), calendarMonth.getMonth(), 1)

    // Get the Sunday before the first day of the month
    const startOfCalendar = new Date(firstDay)
    startOfCalendar.setDate(startOfCalendar.getDate() - startOfCalendar.getDay())

    // Generate days until we've covered the whole month
    const currentDateForLoop = new Date(startOfCalendar)
    const today = new Date()

    // Generate up to 42 days (6 weeks)
    for (let i = 0; i < 42; i++) {
      const dayEvents = events.filter(event => {
        const eventDate = new Date(event.date)
        return eventDate.toDateString() === currentDateForLoop.toDateString()
      })

      days.push({
        date: new Date(currentDateForLoop),
        isCurrentMonth: currentDateForLoop.getMonth() === calendarMonth.getMonth(),
        isToday: currentDateForLoop.toDateString() === today.toDateString(),
        events: dayEvents
      })

      currentDateForLoop.setDate(currentDateForLoop.getDate() + 1)
    }

    // Remove trailing weeks that don't contain any days from the current month
    // We need to keep days in groups of 7 (weeks)
    const weeksToKeep = []
    for (let i = 0; i < days.length; i += 7) {
      const week = days.slice(i, i + 7)
      // Keep this week if it has at least one day from the current month
      if (week.some(day => day.isCurrentMonth)) {
        weeksToKeep.push(...week)
      }
    }

    return weeksToKeep
  }, [events, calendarMonth])

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="flex flex-col max-w-2xl max-h-[80vh]">
        <DialogHeader className="flex-shrink-0">
          <DialogTitle className="text-center">Liturgical Events</DialogTitle>

          {/* View Mode Toggle - centered under title */}
          <div className="flex justify-center pt-3">
            <div className="inline-flex gap-0.5 border rounded-md p-0.5 w-64">
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => handleViewModeChange('list')}
                className={cn(
                  'h-6 text-xs flex-1',
                  viewMode === 'list'
                    ? 'bg-primary text-primary-foreground hover:bg-primary/90'
                    : 'text-muted-foreground hover:bg-muted hover:text-muted-foreground'
                )}
              >
                <List className="h-3 w-3 mr-1" />
                List
              </Button>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => handleViewModeChange('calendar')}
                className={cn(
                  'h-6 text-xs flex-1',
                  viewMode === 'calendar'
                    ? 'bg-primary text-primary-foreground hover:bg-primary/90'
                    : 'text-muted-foreground hover:bg-muted hover:text-muted-foreground'
                )}
              >
                <CalendarDays className="h-3 w-3 mr-1" />
                Calendar
              </Button>
            </div>
          </div>
        </DialogHeader>

        {/* Filter controls */}
        <div className="flex-shrink-0 space-y-3">
          {viewMode === 'list' ? (
            /* List View - Start Date and Locale side by side */
            <>
              <div className="grid grid-cols-2 gap-3">
                <FormInput
                  id="start-date"
                  label="Start Date"
                  inputType="date"
                  value={startDate}
                  onChange={handleStartDateChange}
                />

                <FormInput
                  id="locale-select"
                  label="Calendar Locale"
                  inputType="select"
                  value={selectedLocale}
                  onChange={handleLocaleChange}
                  options={LOCALE_OPTIONS.map((option) => ({
                    value: option.value,
                    label: option.label,
                  }))}
                />
              </div>

              {/* Date range description */}
              <p className="text-xs text-muted-foreground">
                Events starting {new Date(startDate).toLocaleDateString()}
              </p>
            </>
          ) : (
            /* Calendar View - Locale selector and month navigation */
            <>
              <FormInput
                id="locale-select-calendar"
                label="Calendar Locale"
                inputType="select"
                value={selectedLocale}
                onChange={handleLocaleChange}
                options={LOCALE_OPTIONS.map((option) => ({
                  value: option.value,
                  label: option.label,
                }))}
              />

              {/* Month navigation */}
              <div className="flex items-center justify-between">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={handlePreviousMonth}
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>

                <h3 className="text-lg font-semibold">
                  {calendarMonth.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
                </h3>

                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={handleNextMonth}
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </>
          )}
        </div>

        {/* Content area - List or Calendar view */}
        <div className="flex-1 overflow-y-auto px-1">
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            </div>
          ) : events.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              {emptyMessage}
            </div>
          ) : viewMode === 'list' ? (
            /* List View - Monthly list with date badges */
            <div className="space-y-6 py-1">
              {Object.keys(eventsByMonth).sort().map((monthKey) => {
                const [year, month] = monthKey.split('-')
                const monthDate = new Date(parseInt(year), parseInt(month) - 1, 1)
                const monthName = monthDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })

                return (
                  <div key={monthKey} className="space-y-3">
                    <h3 className="font-semibold text-lg sticky top-0 bg-background py-2 border-b">
                      {monthName}
                    </h3>

                    <div className="space-y-2">
                      {eventsByMonth[monthKey].map((event) => {
                        const isSelected = selectedEventId === event.id
                        const eventDate = new Date(event.date)
                        const dayOfWeek = eventDate.toLocaleDateString('en-US', { weekday: 'short' })
                        const day = eventDate.getDate()

                        return (
                          <button
                            key={event.id}
                            type="button"
                            onClick={() => handleSelect(event)}
                            className={cn(
                              'w-full text-left p-3 rounded-md border transition-colors',
                              'hover:bg-accent hover:text-accent-foreground',
                              isSelected && 'bg-accent border-primary'
                            )}
                          >
                            <div className="flex items-start gap-3">
                              {/* Date badge */}
                              <div className="flex-shrink-0 text-center w-12">
                                <div className="text-xs text-muted-foreground">{dayOfWeek}</div>
                                <div className="text-2xl font-bold">{day}</div>
                              </div>

                              {/* Color indicator */}
                              {event.event_data?.color && event.event_data.color.length > 0 && (
                                <div className="flex-shrink-0 w-1 rounded-full self-stretch" style={{
                                  backgroundColor:
                                    event.event_data.color[0] === 'white' ? '#e5e5e5' :
                                    event.event_data.color[0] === 'red' ? '#dc2626' :
                                    event.event_data.color[0] === 'green' ? '#16a34a' :
                                    event.event_data.color[0] === 'violet' ? '#9333ea' :
                                    event.event_data.color[0] === 'purple' ? '#9333ea' :
                                    event.event_data.color[0] === 'rose' ? '#ec4899' :
                                    event.event_data.color[0] === 'gold' ? '#eab308' :
                                    '#6b7280'
                                }} />
                              )}

                              {/* Event details */}
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

                                {event.event_data?.liturgical_season && (
                                  <div className="mt-1 text-xs text-muted-foreground">
                                    {event.event_data.liturgical_season}
                                  </div>
                                )}

                                {event.event_data?.color && (
                                  <div className="mt-1">
                                    {getColorBadge(event.event_data.color)}
                                  </div>
                                )}
                              </div>
                            </div>
                          </button>
                        )
                      })}
                    </div>
                  </div>
                )
              })}
            </div>
          ) : (
            /* Calendar View - Visual wall calendar grid */
            <div className="space-y-2">
              {/* Weekday headers */}
              <div className="grid grid-cols-7 gap-1">
                {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
                  <div key={day} className="p-2 text-center text-xs font-semibold text-muted-foreground">
                    {day}
                  </div>
                ))}
              </div>

              {/* Calendar grid */}
              <div className="grid grid-cols-7 gap-1">
                {calendarDays.map((day, index) => {
                  const hasEvents = day.events.length > 0
                  const primaryEvent = day.events[0]

                  return (
                    <div
                      key={index}
                      className={cn(
                        'min-h-[80px] p-2 border rounded-md transition-colors relative',
                        day.isCurrentMonth ? 'bg-background' : 'bg-muted/30',
                        day.isToday && 'ring-2 ring-primary',
                        hasEvents && 'hover:bg-accent cursor-pointer'
                      )}
                      onClick={hasEvents ? () => handleSelect(primaryEvent) : undefined}
                    >
                      {/* Day number */}
                      <div className={cn(
                        'text-xs font-semibold mb-1',
                        day.isCurrentMonth ? 'text-foreground' : 'text-muted-foreground',
                        day.isToday && 'text-primary'
                      )}>
                        {day.date.getDate()}
                      </div>

                      {/* Events */}
                      {hasEvents && (
                        <div className="space-y-1">
                          {day.events.slice(0, 2).map((event) => {
                            const color = event.event_data?.color?.[0]
                            const bgColor = getLiturgicalBgClass(color)
                            const textColor = getLiturgicalTextClass(color)
                            const isSelected = selectedEventId === event.id

                            return (
                              <button
                                key={event.id}
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation() // Prevent day click
                                  handleShowEventDetails(event)
                                }}
                                className={cn(
                                  'w-full text-left px-1.5 py-0.5 rounded text-[10px] leading-tight truncate relative z-10',
                                  bgColor,
                                  textColor,
                                  'hover:opacity-80 transition-opacity',
                                  isSelected && 'ring-2 ring-primary ring-offset-1'
                                )}
                                title={event.event_data?.name}
                              >
                                {event.event_data?.name}
                              </button>
                            )
                          })}
                          {day.events.length > 2 && (
                            <div className="text-[10px] text-muted-foreground">
                              +{day.events.length - 2} more
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  )
                })}
              </div>
            </div>
          )}
        </div>

        {/* Pagination controls - only show in list view */}
        {viewMode === 'list' && (
          <div className="flex-shrink-0 pt-4 border-t">
            <div className="flex items-center justify-between gap-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage <= 1 || loading}
              >
                <ChevronLeft className="h-4 w-4 mr-1" />
                Previous
              </Button>

              <div className="text-sm text-muted-foreground">
                Page {currentPage} of {Math.ceil(totalCount / PAGE_SIZE) || 1}
                {totalCount > 0 && ` (${totalCount} total)`}
              </div>

              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage >= Math.ceil(totalCount / PAGE_SIZE) || loading}
              >
                Next
                <ChevronRight className="h-4 w-4 ml-1" />
              </Button>
            </div>
          </div>
        )}
      </DialogContent>

      {/* Event Details Modal */}
      <Dialog open={detailsModalOpen} onOpenChange={setDetailsModalOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>{selectedEvent?.event_data?.name || 'Liturgical Event'}</DialogTitle>
          </DialogHeader>

          {selectedEvent && (
            <div className="space-y-4">
              {/* Date */}
              <div>
                <Label className="text-sm font-semibold">Date</Label>
                <p className="text-sm text-muted-foreground mt-1">
                  {formatEventDate(selectedEvent.date)}
                </p>
              </div>

              {/* Liturgical Season */}
              {selectedEvent.event_data?.liturgical_season && (
                <div>
                  <Label className="text-sm font-semibold">Liturgical Season</Label>
                  <p className="text-sm text-muted-foreground mt-1">
                    {selectedEvent.event_data.liturgical_season}
                  </p>
                </div>
              )}

              {/* Liturgical Color */}
              {selectedEvent.event_data?.color && selectedEvent.event_data.color.length > 0 && (
                <div>
                  <Label className="text-sm font-semibold">Liturgical Color</Label>
                  <div className="mt-1">
                    {getColorBadge(selectedEvent.event_data.color)}
                  </div>
                </div>
              )}

              {/* Rank */}
              {selectedEvent.event_data?.grade_display && (
                <div>
                  <Label className="text-sm font-semibold">Rank</Label>
                  <p className="text-sm text-muted-foreground mt-1">
                    {selectedEvent.event_data.grade_display}
                  </p>
                </div>
              )}

              {/* Type */}
              {selectedEvent.event_data?.type && (
                <div>
                  <Label className="text-sm font-semibold">Type</Label>
                  <p className="text-sm text-muted-foreground mt-1">
                    {selectedEvent.event_data.type}
                  </p>
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex gap-2 pt-4">
                <Button
                  onClick={handleSelectFromDetails}
                  className="flex-1"
                >
                  Select This Event
                </Button>
                <Button
                  variant="outline"
                  onClick={() => setDetailsModalOpen(false)}
                >
                  Close
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </Dialog>
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

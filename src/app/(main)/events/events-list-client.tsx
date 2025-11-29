'use client'

import { useRouter, useSearchParams } from 'next/navigation'
import { useEffect } from 'react'
import type { EventWithModuleLink } from '@/lib/actions/events'
import { SearchCard } from "@/components/search-card"
import { ContentCard } from "@/components/content-card"
import { FormSectionCard } from "@/components/form-section-card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import Link from "next/link"
import { Plus, CalendarDays, Search, Filter } from "lucide-react"
import { Input } from "@/components/ui/input"
import { ListViewCard } from "@/components/list-view-card"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { RELATED_EVENT_TYPE_LABELS, RelatedEventType } from "@/lib/constants"
import { formatDatePretty, formatTime } from "@/lib/utils/formatters"
import { useAppContext } from '@/contexts/AppContextProvider'
import { FormInput } from "@/components/form-input"
import { DatePickerField } from "@/components/date-picker-field"
import { toLocalDateString } from "@/lib/utils/formatters"
import type { EventType } from "@/lib/types"

interface Stats {
  total: number
  upcoming: number
  past: number
  filtered: number
  eventTypes: EventType[] // User-defined event types
  relatedEventTypes: readonly RelatedEventType[] // System-defined types
  languages: string[]
}

interface EventsListClientProps {
  initialData: EventWithModuleLink[]
  stats: Stats
}

export function EventsListClient({ initialData, stats }: EventsListClientProps) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { userSettings } = useAppContext()
  const userLanguage = (userSettings?.language || 'en') as 'en' | 'es'

  // Get current filter values from URL
  const searchTerm = searchParams.get('search') || ''
  const selectedEventTypeId = searchParams.get('event_type_id') || 'all'
  const selectedRelatedEventType = searchParams.get('related_event_type') || 'all'
  const selectedLanguage = searchParams.get('language') || 'all'
  const startDate = searchParams.get('start_date') || ''
  const endDate = searchParams.get('end_date') || ''
  const sortOrder = searchParams.get('sort') || 'asc'

  // Auto-set start_date to today and sort to asc on initial load if not already set
  useEffect(() => {
    const hasStartDate = searchParams.get('start_date')
    const hasSort = searchParams.get('sort')

    if (!hasStartDate || !hasSort) {
      const params = new URLSearchParams(searchParams.toString())

      if (!hasStartDate) {
        const today = toLocalDateString(new Date())
        params.set('start_date', today)
      }

      if (!hasSort) {
        params.set('sort', 'asc')
      }

      router.replace(`/events?${params.toString()}`)
    }
  }, [])

  // Update URL with new filter values
  const updateFilters = (key: string, value: string) => {
    const params = new URLSearchParams(searchParams.toString())
    if (value && value !== 'all') {
      params.set(key, value)
    } else {
      params.delete(key)
    }
    router.push(`/events?${params.toString()}`)
  }

  const clearFilters = () => {
    router.push('/events')
  }

  const hasActiveFilters = searchTerm || selectedEventTypeId !== 'all' || selectedRelatedEventType !== 'all' || selectedLanguage !== 'all' || startDate || endDate || sortOrder !== 'asc'

  return (
    <div className="space-y-6">
      {/* Search and Filters */}
      <SearchCard modulePlural="Events" moduleSingular="Event">
        <div className="space-y-4">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search events by name, description, or location..."
                defaultValue={searchTerm}
                onChange={(e) => updateFilters('search', e.target.value)}
                className="pl-10"
              />
            </div>
            <div className="flex gap-2">
              <Select
                value={selectedEventTypeId !== 'all' ? `user-${selectedEventTypeId}` : selectedRelatedEventType !== 'all' ? `system-${selectedRelatedEventType}` : 'all'}
                onValueChange={(value) => {
                  if (value === 'all') {
                    updateFilters('event_type_id', '')
                    updateFilters('related_event_type', '')
                  } else if (value.startsWith('user-')) {
                    updateFilters('event_type_id', value.substring(5))
                    updateFilters('related_event_type', '')
                  } else if (value.startsWith('system-')) {
                    updateFilters('event_type_id', '')
                    updateFilters('related_event_type', value.substring(7))
                  }
                }}
              >
                <SelectTrigger className="w-40">
                  <SelectValue placeholder="Event Type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  {stats.eventTypes.length > 0 && (
                    <>
                      {stats.eventTypes.map(type => (
                        <SelectItem key={type.id} value={`user-${type.id}`}>
                          {type.name}
                        </SelectItem>
                      ))}
                    </>
                  )}
                  {stats.relatedEventTypes.length > 0 && (
                    <>
                      {stats.relatedEventTypes.map(type => (
                        <SelectItem key={type} value={`system-${type}`}>
                          {RELATED_EVENT_TYPE_LABELS[type]?.[userLanguage] || type}
                        </SelectItem>
                      ))}
                    </>
                  )}
                </SelectContent>
              </Select>
              <Select value={selectedLanguage} onValueChange={(value) => updateFilters('language', value)}>
                <SelectTrigger className="w-32">
                  <SelectValue placeholder="Language" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Languages</SelectItem>
                  {stats.languages.map(lang => (
                    <SelectItem key={lang} value={lang}>{lang}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <DatePickerField
              id="start-date"
              label="From Date"
              value={startDate ? new Date(startDate + 'T12:00:00') : undefined}
              onValueChange={(date) => updateFilters('start_date', date ? toLocalDateString(date) : '')}
              closeOnSelect
            />
            <DatePickerField
              id="end-date"
              label="To Date"
              value={endDate ? new Date(endDate + 'T12:00:00') : undefined}
              onValueChange={(date) => updateFilters('end_date', date ? toLocalDateString(date) : '')}
              closeOnSelect
            />
            <FormInput
              id="sort"
              label="Sort By Date"
              inputType="select"
              value={sortOrder}
              onChange={(value) => updateFilters('sort', value)}
              options={[
                { value: 'desc', label: 'Newest First' },
                { value: 'asc', label: 'Oldest First' }
              ]}
            />
          </div>
        </div>
      </SearchCard>

      {/* Events List */}
      {initialData.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {initialData.map((event) => {
            const isUpcoming = event.start_date && new Date(event.start_date) >= new Date()

            // Determine edit href based on module link
            let editHref = `/events/${event.id}/edit`
            if (event.moduleLink?.moduleType && event.moduleLink?.moduleId) {
              const { moduleType, moduleId } = event.moduleLink
              // Handle special plural forms
              const modulePath = moduleType === 'mass' ? 'masses' : `${moduleType}s`
              editHref = `/${modulePath}/${moduleId}/edit`
            }

            return (
              <ListViewCard
                key={event.id}
                title={event.name}
                editHref={editHref}
                viewHref={`/events/${event.id}`}
                viewButtonText="Preview"
                language={event.language || undefined}
                datetime={event.start_date ? {
                  date: event.start_date,
                  time: event.start_time || undefined
                } : undefined}
              >
                <div className="flex items-center gap-2 flex-wrap">
                  <Badge variant="secondary" className="text-xs font-medium">
                    {event.related_event_type
                      ? (RELATED_EVENT_TYPE_LABELS[event.related_event_type]?.[userLanguage] || event.related_event_type)
                      : (event.event_type?.name || 'Event')
                    }
                  </Badge>
                  {isUpcoming && (
                    <Badge variant="default" className="text-xs font-medium bg-green-700 hover:bg-green-700 text-white">
                      Upcoming
                    </Badge>
                  )}
                </div>

                {event.description && (
                  <p className="text-sm text-muted-foreground line-clamp-2 mt-3">
                    {event.description}
                  </p>
                )}
              </ListViewCard>
            )
          })}
        </div>
      ) : (
        <ContentCard className="text-center py-12">
          <CalendarDays className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
          <h3 className="text-lg font-medium mb-2">
            {hasActiveFilters
              ? 'No events found'
              : 'No events yet'
            }
          </h3>
          <p className="text-muted-foreground mb-6">
            {hasActiveFilters
              ? 'Try adjusting your search or filters to find more events.'
              : 'Create your first event to start managing parish activities.'
            }
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Button asChild>
              <Link href="/events/create">
                <Plus className="h-4 w-4 mr-2" />
                Create Your First Event
              </Link>
            </Button>
            {hasActiveFilters && (
              <Button variant="outline" onClick={clearFilters}>
                <Filter className="h-4 w-4 mr-2" />
                Clear Filters
              </Button>
            )}
          </div>
        </ContentCard>
      )}

      {/* Quick Stats */}
      {stats.total > 0 && (
        <FormSectionCard title="Event Overview">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
            <div>
              <div className="text-2xl font-bold">{stats.total}</div>
              <div className="text-sm text-muted-foreground">Total Events</div>
            </div>
            <div>
              <div className="text-2xl font-bold">{stats.upcoming}</div>
              <div className="text-sm text-muted-foreground">Upcoming</div>
            </div>
            <div>
              <div className="text-2xl font-bold">{stats.past}</div>
              <div className="text-sm text-muted-foreground">Past</div>
            </div>
            <div>
              <div className="text-2xl font-bold">{stats.filtered}</div>
              <div className="text-sm text-muted-foreground">Filtered Results</div>
            </div>
          </div>
        </FormSectionCard>
      )}
    </div>
  )
}

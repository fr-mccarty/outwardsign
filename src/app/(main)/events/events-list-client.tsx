'use client'

import { useState, useCallback, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { getAllDynamicEvents, deleteEvent, type DynamicEventFilterParams, type DynamicEventWithTypeAndOccasion } from '@/lib/actions/dynamic-events'
import { LIST_VIEW_PAGE_SIZE, INFINITE_SCROLL_LOAD_MORE_SIZE, SEARCH_DEBOUNCE_MS } from '@/lib/constants'
import { useDebounce } from '@/hooks/use-debounce'
import { DataTable } from '@/components/data-table/data-table'
import { ClearableSearchInput } from '@/components/clearable-search-input'
import { ScrollToTopButton } from '@/components/scroll-to-top-button'
import { DeleteConfirmationDialog } from '@/components/delete-confirmation-dialog'
import { AdvancedSearch } from '@/components/advanced-search'
import { SearchCard } from "@/components/search-card"
import { ContentCard } from "@/components/content-card"
import { EndOfListMessage } from '@/components/end-of-list-message'
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { Plus, CalendarDays, Filter, MoreVertical } from "lucide-react"
import { toast } from "sonner"
import { toLocalDateString, formatDatePretty } from "@/lib/utils/formatters"
import { useListFilters } from "@/hooks/use-list-filters"
import { parseSort, formatSort } from '@/lib/utils/sort-utils'
import type { DataTableColumn } from '@/components/data-table/data-table'
import type { DynamicEventType } from '@/lib/types'
import { FormInput } from '@/components/form-input'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'

interface EventsListClientProps {
  initialData: DynamicEventWithTypeAndOccasion[]
  initialHasMore: boolean
  eventTypes: DynamicEventType[]
}

export function EventsListClient({ initialData, initialHasMore, eventTypes }: EventsListClientProps) {
  const router = useRouter()
  const searchParams = useSearchParams()

  // Use list filters hook for URL state management
  const filters = useListFilters({
    baseUrl: '/events',
    defaultFilters: { sort: 'date_desc' }
  })

  // Local state for search value (immediate visual feedback)
  const [searchValue, setSearchValue] = useState(filters.getFilterValue('search'))

  // Event type filter from URL (using 'type' param for slug)
  const selectedEventTypeSlug = filters.getFilterValue('type')

  // Debounced search value (delays URL update)
  const debouncedSearchValue = useDebounce(searchValue, SEARCH_DEBOUNCE_MS)

  // Infinite scroll state
  const [events, setEvents] = useState(initialData)
  const [offset, setOffset] = useState(LIST_VIEW_PAGE_SIZE)
  const [hasMore, setHasMore] = useState(initialHasMore)
  const [isLoadingMore, setIsLoadingMore] = useState(false)

  // Update URL when debounced search value changes
  useEffect(() => {
    filters.updateFilter('search', debouncedSearchValue)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debouncedSearchValue])

  // Reset to initial data when filters change
  useEffect(() => {
    setEvents(initialData)
    setOffset(LIST_VIEW_PAGE_SIZE)
    setHasMore(initialHasMore)
  }, [initialData, initialHasMore])

  // Parse current sort from URL
  const currentSort = parseSort(filters.getFilterValue('sort'))

  // Handle sort change
  const handleSortChange = useCallback((column: string, direction: 'asc' | 'desc' | null) => {
    const sortValue = formatSort(column, direction)
    filters.updateFilter('sort', sortValue)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // Get event type ID from slug for API calls
  const getEventTypeIdFromSlug = (slug: string): string | undefined => {
    const eventType = eventTypes.find(et => et.slug === slug)
    return eventType?.id
  }

  // Load more function for infinite scroll
  const handleLoadMore = async () => {
    if (isLoadingMore || !hasMore) return

    setIsLoadingMore(true)
    try {
      const nextEvents = await getAllDynamicEvents({
        search: filters.getFilterValue('search'),
        eventTypeId: selectedEventTypeSlug ? getEventTypeIdFromSlug(selectedEventTypeSlug) : undefined,
        sort: filters.getFilterValue('sort') as DynamicEventFilterParams['sort'],
        offset: offset,
        limit: INFINITE_SCROLL_LOAD_MORE_SIZE,
        startDate: searchParams.get('start_date') || undefined,
        endDate: searchParams.get('end_date') || undefined
      })

      setEvents(prev => [...prev, ...nextEvents])
      setOffset(prev => prev + INFINITE_SCROLL_LOAD_MORE_SIZE)
      setHasMore(nextEvents.length === INFINITE_SCROLL_LOAD_MORE_SIZE)
    } catch (error) {
      console.error('Failed to load more events:', error)
      toast.error('Failed to load more events')
    } finally {
      setIsLoadingMore(false)
    }
  }

  // Date filters - convert string params to Date objects for DatePickerField
  const startDateParam = searchParams.get('start_date')
  const endDateParam = searchParams.get('end_date')
  const [startDate, setStartDate] = useState<Date | undefined>(
    startDateParam ? new Date(startDateParam) : undefined
  )
  const [endDate, setEndDate] = useState<Date | undefined>(
    endDateParam ? new Date(endDateParam) : undefined
  )

  // Delete dialog state
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [eventToDelete, setEventToDelete] = useState<DynamicEventWithTypeAndOccasion | null>(null)

  // Clear all filters (including date filters)
  const handleClearFilters = () => {
    setSearchValue('')
    setStartDate(undefined)
    setEndDate(undefined)
    filters.clearFilters()
  }

  // Check if any filters are active
  const hasActiveFilters = filters.hasActiveFilters || startDate !== undefined || endDate !== undefined

  // Handle delete confirmation
  const handleDeleteConfirm = async () => {
    if (!eventToDelete) return

    try {
      await deleteEvent(eventToDelete.id)
      toast.success('Event deleted successfully')
      router.refresh()
    } catch (error) {
      console.error('Failed to delete event:', error)
      toast.error('Failed to delete event. Please try again.')
      throw error
    }
  }

  // Define custom "What" column (event type name)
  const whatColumn: DataTableColumn<DynamicEventWithTypeAndOccasion> = {
    key: 'name',
    header: 'What',
    cell: (event) => (
      <div className="flex items-center gap-2 max-w-[200px] md:max-w-[300px]">
        <div className="min-w-0 flex-1">
          <div className="font-medium truncate">
            {event.event_type?.name || 'Event'}
          </div>
        </div>
      </div>
    ),
    sortable: false
  }

  // Define "When" column
  const whenColumn: DataTableColumn<DynamicEventWithTypeAndOccasion> = {
    key: 'date',
    header: 'When',
    cell: (event) => {
      const occasion = event.primary_occasion
      if (!occasion?.date) {
        return <span className="text-muted-foreground">No date set</span>
      }
      return (
        <div>
          <div className="font-medium">{formatDatePretty(occasion.date)}</div>
          {occasion.time && (
            <div className="text-sm text-muted-foreground">{occasion.time}</div>
          )}
        </div>
      )
    },
    sortable: true
  }

  // Define "Where" column
  const whereColumn: DataTableColumn<DynamicEventWithTypeAndOccasion> = {
    key: 'location',
    header: 'Where',
    cell: (event) => {
      const location = event.primary_occasion?.location
      if (!location) {
        return <span className="text-muted-foreground">-</span>
      }
      return (
        <div className="truncate max-w-[150px]">
          {location.name}
        </div>
      )
    },
    hiddenOn: 'lg'
  }

  // Define table columns
  const columns: DataTableColumn<DynamicEventWithTypeAndOccasion>[] = [
    whatColumn,
    whenColumn,
    whereColumn,
    // Custom actions column for events (uses slug in URLs)
    {
      key: 'actions',
      header: '',
      cell: (event) => {
        const typeSlug = event.event_type?.slug || event.event_type_id
        return (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="h-8 w-8">
                <MoreVertical className="h-4 w-4" />
                <span className="sr-only">Open menu</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem asChild>
                <Link href={`/events/${typeSlug}/${event.id}`}>View</Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link href={`/events/${typeSlug}/${event.id}/edit`}>Edit</Link>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                className="text-destructive focus:text-destructive"
                onSelect={(e) => {
                  e.preventDefault()
                  setEventToDelete(event)
                  setDeleteDialogOpen(true)
                }}
              >
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        )
      },
      className: 'w-[50px]'
    }
  ]

  return (
    <div className="space-y-6">
      {/* Search and Filters */}
      <SearchCard title="Search Events">
        <div className="space-y-4">
          {/* Main Search Row with Event Type Filter */}
          <div className="flex flex-col sm:flex-row gap-2">
            <div className="flex-1">
              <ClearableSearchInput
                value={searchValue}
                onChange={(value) => {
                  setSearchValue(value)
                  filters.updateFilter('search', value)
                }}
                placeholder="Search events..."
                className="w-full"
              />
            </div>
            {/* Event Type Filter */}
            <div className="w-full sm:w-[200px]">
              <FormInput
                id="event-type-filter"
                label="Event Type"
                hideLabel
                inputType="select"
                value={selectedEventTypeSlug || 'all'}
                onChange={(value) => {
                  filters.updateFilter('type', value === 'all' ? '' : value)
                }}
                options={[
                  { value: 'all', label: 'All Event Types' },
                  ...eventTypes.map((eventType) => ({
                    value: eventType.slug || eventType.id,
                    label: eventType.name
                  }))
                ]}
              />
            </div>
          </div>

          {/* Advanced Search Collapsible */}
          <AdvancedSearch
            dateRangeFilter={{
              startDate: startDate,
              endDate: endDate,
              onStartDateChange: (date) => {
                setStartDate(date)
                filters.updateFilter('start_date', date ? toLocalDateString(date) : '')
              },
              onEndDateChange: (date) => {
                setEndDate(date)
                filters.updateFilter('end_date', date ? toLocalDateString(date) : '')
              }
            }}
          />
        </div>
      </SearchCard>

      {/* Events Table */}
      {events.length > 0 ? (
        <>
          <DataTable
            columns={columns}
            data={events}
            currentSort={currentSort || undefined}
            onSortChange={handleSortChange}
            keyExtractor={(event) => event.id}
            onRowClick={(event) => router.push(`/events/${event.event_type?.slug || event.event_type_id}/${event.id}`)}
            onLoadMore={handleLoadMore}
            hasMore={hasMore}
            stickyHeader
          />
          <EndOfListMessage show={!hasMore && events.length > 0} />
          <ScrollToTopButton />
        </>
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
              <Button variant="outline" onClick={handleClearFilters}>
                <Filter className="h-4 w-4 mr-2" />
                Clear Filters
              </Button>
            )}
          </div>
        </ContentCard>
      )}

      {/* Delete Confirmation Dialog */}
      <DeleteConfirmationDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        onConfirm={handleDeleteConfirm}
        title="Delete Event"
        description={
          eventToDelete
            ? `Are you sure you want to delete this ${eventToDelete.event_type?.name?.toLowerCase() || 'event'}?`
            : 'Are you sure you want to delete this event?'
        }
      />
    </div>
  )
}

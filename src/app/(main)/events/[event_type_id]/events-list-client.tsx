'use client'

import { useState, useEffect, useCallback } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import type { EventType } from '@/lib/types'
import type { MasterEventWithTypeAndCalendarEvent } from '@/lib/actions/master-events'
import { getEvents, deleteEvent, type MasterEventFilterParams } from '@/lib/actions/master-events'
import { LIST_VIEW_PAGE_SIZE, INFINITE_SCROLL_LOAD_MORE_SIZE, SEARCH_DEBOUNCE_MS, MODULE_STATUS_COLORS, LITURGICAL_COLOR_LABELS } from '@/lib/constants'
import { PAGE_SECTIONS_SPACING } from '@/lib/constants/form-spacing'
import { useDebounce } from '@/hooks/use-debounce'
import { EndOfListMessage } from '@/components/end-of-list-message'
import { DataTable } from '@/components/data-table/data-table'
import { ClearableSearchInput } from '@/components/clearable-search-input'
import { ScrollToTopButton } from '@/components/scroll-to-top-button'
import { ConfirmationDialog } from '@/components/confirmation-dialog'
import { AdvancedSearch } from '@/components/advanced-search'
import { SearchCard } from "@/components/search-card"
import { EmptyState } from "@/components/empty-state"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { Plus, CalendarDays, Filter } from "lucide-react"
import { toast } from "sonner"
import { toLocalDateString, formatDatePretty } from "@/lib/utils/formatters"
import { useListFilters } from "@/hooks/use-list-filters"
import { parseSort, formatSort } from '@/lib/utils/sort-utils'
import { buildWhereColumn, buildActionsColumn } from '@/lib/utils/table-columns'
import type { DataTableColumn } from '@/components/data-table/data-table'
import { getStatusLabel } from '@/lib/content-builders/shared/helpers'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip'

interface EventsListClientProps {
  eventType: EventType
  initialData: MasterEventWithTypeAndCalendarEvent[]
  initialHasMore: boolean
  /** Base URL for this list view (e.g., /events/[id] or /special-liturgies/[slug]) */
  baseUrl?: string
}

export function EventsListClient({ eventType, initialData, initialHasMore, baseUrl }: EventsListClientProps) {
  const router = useRouter()
  const searchParams = useSearchParams()

  // Determine base URL - use prop if provided, otherwise default to events route with slug
  const listBaseUrl = baseUrl || `/events/${eventType.slug}`

  // Use list filters hook for URL state management
  const filters = useListFilters({
    baseUrl: listBaseUrl,
    defaultFilters: { sort: 'date_desc' }
  })

  // Local state for search value (immediate visual feedback)
  const [searchValue, setSearchValue] = useState(filters.getFilterValue('search'))

  // Debounced search value (delays URL update)
  const debouncedSearchValue = useDebounce(searchValue, SEARCH_DEBOUNCE_MS)

  // Infinite scroll state
  const [events, setEvents] = useState<MasterEventWithTypeAndCalendarEvent[]>(initialData)
  const [offset, setOffset] = useState(LIST_VIEW_PAGE_SIZE)
  const [hasMore, setHasMore] = useState(initialHasMore)
  const [isLoadingMore, setIsLoadingMore] = useState(false)

  // Delete dialog state
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [eventToDelete, setEventToDelete] = useState<MasterEventWithTypeAndCalendarEvent | null>(null)

  // Parse current sort from URL for DataTable
  const currentSort = parseSort(filters.getFilterValue('sort'))

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

  // Handle sort change from DataTable column headers
  const handleSortChange = useCallback((column: string, direction: 'asc' | 'desc' | null) => {
    const sortValue = formatSort(column, direction)
    filters.updateFilter('sort', sortValue)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // Load more function for infinite scroll
  const handleLoadMore = async () => {
    if (isLoadingMore || !hasMore) return

    setIsLoadingMore(true)
    try {
      const nextEvents = await getEvents(eventType.id, {
        search: filters.getFilterValue('search'),
        sort: filters.getFilterValue('sort') as MasterEventFilterParams['sort'],
        offset: offset,
        limit: INFINITE_SCROLL_LOAD_MORE_SIZE,
        startDate: filters.getFilterValue('start_date'),
        endDate: filters.getFilterValue('end_date')
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
      toast.success(`${eventType.name} deleted successfully`)
      router.refresh()
    } catch (error) {
      console.error('Failed to delete event:', error)
      toast.error(`Failed to delete ${eventType.name.toLowerCase()}`)
      throw error
    }
  }

  // Build event name column with status indicator
  const buildEventNameColumn = (): DataTableColumn<MasterEventWithTypeAndCalendarEvent> => {
    return {
      key: 'name',
      header: 'Name',
      cell: (event) => {
        const status = event.status || 'PLANNING'
        const statusLabel = getStatusLabel(status, 'en')
        const statusColor = MODULE_STATUS_COLORS[status] || 'bg-muted-foreground/50'

        // Get title from field_values or use event type name as fallback
        const title = event.field_values?.title || event.field_values?.name || eventType.name

        return (
          <div className="flex items-start gap-2">
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <div className={`h-2 w-2 rounded-full flex-shrink-0 mt-1.5 ${statusColor}`} />
                </TooltipTrigger>
                <TooltipContent>
                  <p>{statusLabel}</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
            <div className="flex flex-col">
              <span className="text-sm font-medium">
                {title}
              </span>
            </div>
          </div>
        )
      },
      className: 'max-w-[200px] md:max-w-[300px]',
      sortable: false
    }
  }

  // Define table columns
  const columns: DataTableColumn<MasterEventWithTypeAndCalendarEvent>[] = [
    buildEventNameColumn(),
    // Date column
    {
      key: 'date',
      header: 'Date',
      cell: (event) => {
        if (!event.primary_calendar_event?.start_datetime) {
          return <span className="text-sm text-muted-foreground">No date set</span>
        }
        const date = new Date(event.primary_calendar_event.start_datetime)
        return (
          <span className="text-sm">
            {formatDatePretty(date)}
          </span>
        )
      },
      className: 'max-w-[140px]',
      sortable: true,
      accessorFn: (event) => event.primary_calendar_event?.start_datetime || ''
    },
    // Time column
    {
      key: 'time',
      header: 'Time',
      cell: (event) => {
        if (!event.primary_calendar_event?.start_datetime) {
          return <span className="text-sm text-muted-foreground">—</span>
        }
        const date = new Date(event.primary_calendar_event.start_datetime)
        return (
          <span className="text-sm">
            {date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })}
          </span>
        )
      },
      className: 'max-w-[100px]',
      sortable: false
    },
    // Liturgical Color column (only show for special-liturgy)
    ...(eventType.system_type === 'special-liturgy' ? [{
      key: 'liturgical_color',
      header: 'Color',
      cell: (event: MasterEventWithTypeAndCalendarEvent) => {
        const color = event.liturgical_color
        if (!color || !LITURGICAL_COLOR_LABELS[color]) {
          return <span className="text-sm text-muted-foreground">—</span>
        }
        return (
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <div className={`h-4 w-4 rounded-full bg-liturgy-${color.toLowerCase()}`} />
              </TooltipTrigger>
              <TooltipContent>
                <p>{LITURGICAL_COLOR_LABELS[color].en}</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        )
      },
      className: 'max-w-[60px]',
      sortable: false
    }] : []),
    // Where column (location)
    buildWhereColumn<MasterEventWithTypeAndCalendarEvent>({
      getLocation: (event) => event.primary_calendar_event?.location || null,
      hiddenOn: 'lg'
    }),
    // Actions column
    buildActionsColumn<MasterEventWithTypeAndCalendarEvent>({
      baseUrl: listBaseUrl,
      onDelete: (event) => {
        setEventToDelete(event)
        setDeleteDialogOpen(true)
      },
      getDeleteMessage: (event) =>
        `Are you sure you want to delete this ${event.event_type?.name.toLowerCase() || 'event'}?`
    })
  ]

  return (
    <div className={PAGE_SECTIONS_SPACING}>
      {/* Search and Filters */}
      <SearchCard title={`Search ${eventType.name}s`}>
        <div className="space-y-4">
          {/* Main Search Row */}
          <ClearableSearchInput
            value={searchValue}
            onChange={(value) => {
              setSearchValue(value)
              filters.updateFilter('search', value)
            }}
            placeholder={`Search ${eventType.name.toLowerCase()}s by key person names...`}
            className="w-full"
          />

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
            onRowClick={(event) => router.push(`${listBaseUrl}/${event.id}`)}
            onLoadMore={handleLoadMore}
            hasMore={hasMore}
            stickyHeader
          />
          <EndOfListMessage show={!hasMore && events.length > 0} />
          <ScrollToTopButton />
        </>
      ) : (
        <EmptyState
          icon={<CalendarDays className="h-16 w-16" />}
          title={hasActiveFilters
            ? `No ${eventType.name.toLowerCase()}s found`
            : `No ${eventType.name.toLowerCase()}s yet`}
          description={hasActiveFilters
            ? 'Try adjusting your search or filters to find more events.'
            : `Create your first ${eventType.name.toLowerCase()} to get started.`}
          action={
            <>
              <Button asChild>
                <Link href={`${listBaseUrl}/create`}>
                  <Plus className="h-4 w-4 mr-2" />
                  Create Your First {eventType.name}
                </Link>
              </Button>
              {hasActiveFilters && (
                <Button variant="outline" onClick={handleClearFilters}>
                  <Filter className="h-4 w-4 mr-2" />
                  Clear Filters
                </Button>
              )}
            </>
          }
        />
      )}

      {/* Delete Confirmation Dialog */}
      <ConfirmationDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        onConfirm={handleDeleteConfirm}
        title={`Delete ${eventType.name}`}
        description={
          eventToDelete
            ? `Are you sure you want to delete this ${eventType.name.toLowerCase()}? This action cannot be undone.`
            : `Are you sure you want to delete this ${eventType.name.toLowerCase()}?`
        }
        confirmLabel="Delete"
      />
    </div>
  )
}

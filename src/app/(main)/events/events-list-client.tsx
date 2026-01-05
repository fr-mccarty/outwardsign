'use client'

import { useState, useCallback, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import type { ParishEventWithTypeAndCalendarEvent, ParishEventStats, ParishEventFilterParams } from '@/lib/actions/parish-events'
import { getAllParishEvents, deleteEvent } from '@/lib/actions/parish-events'
import { LIST_VIEW_PAGE_SIZE, INFINITE_SCROLL_LOAD_MORE_SIZE, SEARCH_DEBOUNCE_MS } from '@/lib/constants'
import { PAGE_SECTIONS_SPACING } from '@/lib/constants/form-spacing'
import { useDebounce } from '@/hooks/use-debounce'
import { DataTable } from '@/components/data-table/data-table'
import { ClearableSearchInput } from '@/components/clearable-search-input'
import { ScrollToTopButton } from '@/components/scroll-to-top-button'
import { ConfirmationDialog } from '@/components/confirmation-dialog'
import { AdvancedSearch } from '@/components/advanced-search'
import { SearchCard } from "@/components/search-card"
import { EmptyState } from "@/components/empty-state"
import { ListStatsBar, type ListStat } from "@/components/list-stats-bar"
import { StatusFilter } from "@/components/status-filter"
import { EndOfListMessage } from '@/components/end-of-list-message'
import { Button } from "@/components/ui/button"
import { LinkButton } from "@/components/link-button"
import Link from "next/link"
import { Plus, CalendarDays, Filter, MoreVertical } from "lucide-react"
import { toast } from "sonner"
import { toLocalDateString, formatDatePretty } from "@/lib/utils/formatters"
import type { EventType } from "@/lib/types"
import { FormInput } from "@/components/form-input"
import { SelectItem } from "@/components/ui/select"
import { useListFilters } from "@/hooks/use-list-filters"
import { parseSort, formatSort } from '@/lib/utils/sort-utils'
import { buildWhereColumn } from '@/lib/utils/table-columns'
import { DataTableColumn } from '@/components/data-table/data-table'
import { MODULE_STATUS_COLORS } from '@/lib/constants'
import { getStatusLabel } from '@/lib/content-builders/shared/helpers'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { useTranslations } from 'next-intl'

const MASTER_EVENT_STATUS_VALUES = ['PLANNING', 'ACTIVE', 'COMPLETED', 'CANCELLED'] as const

interface EventsListClientProps {
  initialData: ParishEventWithTypeAndCalendarEvent[]
  stats: ParishEventStats
  eventTypes: EventType[]
}

export function EventsListClient({ initialData, stats, eventTypes }: EventsListClientProps) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const t = useTranslations('events')
  const tCommon = useTranslations('common')

  // Use list filters hook for URL state management
  const filters = useListFilters({
    baseUrl: '/events',
    defaultFilters: { status: 'ACTIVE', sort: 'date_asc' }
  })

  // Local state for search value (immediate visual feedback)
  const [searchValue, setSearchValue] = useState(filters.getFilterValue('search'))

  // Debounced search value (delays URL update)
  const debouncedSearchValue = useDebounce(searchValue, SEARCH_DEBOUNCE_MS)

  // Infinite scroll state
  const [events, setEvents] = useState(initialData)
  const [offset, setOffset] = useState(LIST_VIEW_PAGE_SIZE)
  const [hasMore, setHasMore] = useState(initialData.length === LIST_VIEW_PAGE_SIZE)
  const [isLoadingMore, setIsLoadingMore] = useState(false)

  // Transform stats for ListStatsBar
  const statsList: ListStat[] = [
    { value: stats.total, label: t('totalEvents') },
    { value: stats.upcoming, label: t('upcoming') },
    { value: stats.past, label: t('past') },
    { value: stats.filtered, label: tCommon('filteredResults') }
  ]

  // Date filters - convert string params to Date objects for DatePickerField
  const startDateParam = filters.getFilterValue('start_date')
  const endDateParam = filters.getFilterValue('end_date')
  const [startDate, setStartDate] = useState<Date | undefined>(
    startDateParam ? new Date(startDateParam) : undefined
  )
  const [endDate, setEndDate] = useState<Date | undefined>(
    endDateParam ? new Date(endDateParam) : undefined
  )

  // Delete dialog state
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [eventToDelete, setEventToDelete] = useState<ParishEventWithTypeAndCalendarEvent | null>(null)

  // Update URL when debounced search value changes
  useEffect(() => {
    filters.updateFilter('search', debouncedSearchValue)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debouncedSearchValue])

  // Reset to initial data when filters change
  useEffect(() => {
    setEvents(initialData)
    setOffset(LIST_VIEW_PAGE_SIZE)
    setHasMore(initialData.length === LIST_VIEW_PAGE_SIZE)
  }, [initialData])

  // Sorting state
  const currentSort = parseSort(filters.getFilterValue('sort'))

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
      // Look up event type ID from slug
      const eventTypeSlug = filters.getFilterValue('event_type')
      const eventTypeId = eventTypeSlug
        ? eventTypes.find(et => et.slug === eventTypeSlug)?.id
        : undefined

      const nextEvents = await getAllParishEvents({
        search: filters.getFilterValue('search'),
        systemType: 'parish-event',
        status: filters.getFilterValue('status') as ParishEventFilterParams['status'],
        eventTypeId,
        sort: filters.getFilterValue('sort') as ParishEventFilterParams['sort'],
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
      toast.error(t('errorLoading'))
    } finally {
      setIsLoadingMore(false)
    }
  }

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
      toast.success(t('eventDeleted'))
      router.refresh()
    } catch (error) {
      console.error('Failed to delete event:', error)
      toast.error(t('errorDeleting'))
      throw error
    }
  }

  // Custom "Event Name" column
  const buildEventWhoColumn = (): DataTableColumn<ParishEventWithTypeAndCalendarEvent> => {
    return {
      key: 'who',
      header: t('nameOfEvent'),
      cell: (event) => {
        const status = event.status || 'PLANNING'
        const statusLabel = getStatusLabel(status, 'en')
        const statusColor = MODULE_STATUS_COLORS[status] || 'bg-muted-foreground/50'

        // Compute simple title from event type name
        const title = event.event_type?.name || 'Event'

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
      className: 'max-w-[200px] md:max-w-[250px]',
      sortable: true,
      accessorFn: (event) => event.event_type?.name || 'Event'
    }
  }

  // Define table columns using column builders
  const columns: DataTableColumn<ParishEventWithTypeAndCalendarEvent>[] = [
    buildEventWhoColumn(),
    // When column - date and time from primary calendar event
    {
      key: 'when',
      header: 'When',
      cell: (event) => {
        if (!event.primary_calendar_event?.start_datetime) {
          return <span className="text-sm text-muted-foreground">No date set</span>
        }
        const date = new Date(event.primary_calendar_event.start_datetime)
        return (
          <div className="flex flex-col">
            <span className="text-sm">
              {formatDatePretty(date)}
            </span>
            <span className="text-xs text-muted-foreground">
              {date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })}
            </span>
          </div>
        )
      },
      className: 'max-w-[180px]',
      sortable: true,
      accessorFn: (event) => event.primary_calendar_event?.start_datetime || ''
    },
    // Event Type column - hidden on smaller screens
    {
      key: 'event_type',
      header: t('eventType'),
      cell: (event) => (
        <span className="text-sm">{event.event_type?.name || '—'}</span>
      ),
      className: 'hidden md:table-cell max-w-[150px]',
      sortable: true,
      accessorFn: (event) => event.event_type?.name || ''
    },
    buildWhereColumn<ParishEventWithTypeAndCalendarEvent>({
      getLocation: (event) => event.primary_calendar_event?.location || null,
      hiddenOn: 'lg'
    }),
    // Custom actions column to handle event_type slug in URLs
    {
      key: 'actions',
      header: '',
      cell: (event) => (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="h-8 w-8">
              <MoreVertical className="h-4 w-4" />
              <span className="sr-only">Open menu</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem asChild>
              <Link href={`/events/${event.event_type?.slug}/${event.id}`}>View</Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <Link href={`/events/${event.event_type?.slug}/${event.id}/edit`}>Edit</Link>
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
      ),
      className: 'w-[50px]'
    }
  ]

  return (
    <div className={PAGE_SECTIONS_SPACING}>
      {/* Search and Filters */}
      <SearchCard title={t('title')}>
        <div className="space-y-4">
          {/* Main Search and Status Row - Inline */}
          <div className="flex flex-col sm:flex-row sm:items-center gap-4">
            {/* Search Input */}
            <div className="flex-1">
              <ClearableSearchInput
                value={searchValue}
                onChange={setSearchValue}
                placeholder={t('searchPlaceholder')}
                className="w-full"
              />
            </div>

            {/* Event Type Filter */}
            <div className="w-full sm:w-[200px]">
              <FormInput
                id="event-type-filter"
                label={t('eventType')}
                hideLabel
                inputType="select"
                value={filters.getFilterValue('event_type') || 'all'}
                onChange={(value) => filters.updateFilter('event_type', value === 'all' ? '' : value)}
              >
                <SelectItem value="all">{t('allEventTypes')}</SelectItem>
                {eventTypes.filter(et => et.slug).map((et) => (
                  <SelectItem key={et.id} value={et.slug!}>
                    {et.name}
                  </SelectItem>
                ))}
              </FormInput>
            </div>

            {/* Status Filter */}
            <div className="w-full sm:w-[200px]">
              <StatusFilter
                value={filters.getFilterValue('status')}
                onChange={(value) => filters.updateFilter('status', value)}
                statusValues={MASTER_EVENT_STATUS_VALUES as unknown as string[]}
                hideLabel
              />
            </div>
          </div>

          {/* Advanced Search - Date Range Only */}
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
            data={events}
            columns={columns}
            keyExtractor={(event) => event.id}
            onRowClick={(event) => router.push(`/events/${event.event_type?.slug}/${event.id}`)}
            currentSort={currentSort || undefined}
            onSortChange={handleSortChange}
            onLoadMore={handleLoadMore}
            hasMore={hasMore}
            emptyState={{
              icon: <CalendarDays className="h-16 w-16 mx-auto text-muted-foreground mb-4" />,
              title: hasActiveFilters ? t('noEvents') : t('noEventsYet'),
              description: hasActiveFilters
                ? t('noEventsMessage')
                : t('noEventsYetMessage'),
              action: (
                <div className="flex flex-col sm:flex-row gap-3 justify-center">
                  <LinkButton href="/events/create">
                    <Plus className="h-4 w-4 mr-2" />
                    {t('createYourFirstEvent')}
                  </LinkButton>
                  {hasActiveFilters && (
                    <Button variant="outline" onClick={handleClearFilters}>
                      <Filter className="h-4 w-4 mr-2" />
                      {tCommon('clearFilters')}
                    </Button>
                  )}
                </div>
              )
            }}
            stickyHeader
          />
          <EndOfListMessage show={!hasMore && events.length > 0} />
          <ScrollToTopButton />
        </>
      ) : (
        <EmptyState
          icon={<CalendarDays className="h-16 w-16" />}
          title={hasActiveFilters ? t('noEvents') : t('noEventsYet')}
          description={hasActiveFilters
            ? t('noEventsMessage')
            : t('noEventsYetMessage')}
          action={
            <>
              <LinkButton href="/events/create">
                <Plus className="h-4 w-4 mr-2" />
                {t('createYourFirstEvent')}
              </LinkButton>
              {hasActiveFilters && (
                <Button variant="outline" onClick={handleClearFilters}>
                  <Filter className="h-4 w-4 mr-2" />
                  {tCommon('clearFilters')}
                </Button>
              )}
            </>
          }
        />
      )}

      {/* Quick Stats */}
      {stats.total > 0 && (
        <ListStatsBar title={t('eventOverview')} stats={statsList} />
      )}

      {/* Delete Confirmation Dialog */}
      <ConfirmationDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        onConfirm={handleDeleteConfirm}
        title={t('deleteEvent')}
        description={
          eventToDelete
            ? `Are you sure you want to delete this ${eventToDelete.event_type?.name || 'event'}? This action cannot be undone.`
            : t('confirmDeleteGeneric')
        }
        confirmLabel={tCommon('delete')}
      />
    </div>
  )
}

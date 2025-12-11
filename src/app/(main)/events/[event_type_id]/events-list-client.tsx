'use client'

import { useState, useEffect, useCallback } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import type { DynamicEvent, DynamicEventType } from '@/lib/types'
import { getEvents, type DynamicEventFilterParams } from '@/lib/actions/dynamic-events'
import { LIST_VIEW_PAGE_SIZE, INFINITE_SCROLL_LOAD_MORE_SIZE, SEARCH_DEBOUNCE_MS } from '@/lib/constants'
import { useDebounce } from '@/hooks/use-debounce'
import { EndOfListMessage } from '@/components/end-of-list-message'
import { DataTable } from '@/components/data-table/data-table'
import { ClearableSearchInput } from '@/components/clearable-search-input'
import { ScrollToTopButton } from '@/components/scroll-to-top-button'
import { AdvancedSearch } from '@/components/advanced-search'
import { SearchCard } from "@/components/search-card"
import { EmptyState } from "@/components/empty-state"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { Plus, CalendarDays, Filter } from "lucide-react"
import { toast } from "sonner"
import { toLocalDateString } from "@/lib/utils/formatters"
import { useListFilters } from "@/hooks/use-list-filters"
import { parseSort, formatSort } from '@/lib/utils/sort-utils'
import type { DataTableColumn } from '@/components/data-table/data-table'

interface EventsListClientProps {
  eventType: DynamicEventType
  initialData: DynamicEvent[]
  initialHasMore: boolean
}

export function EventsListClient({ eventType, initialData, initialHasMore }: EventsListClientProps) {
  const router = useRouter()
  const searchParams = useSearchParams()

  // Use list filters hook for URL state management
  const filters = useListFilters({
    baseUrl: `/events/${eventType.id}`,
    defaultFilters: { sort: 'date_desc' }
  })

  // Local state for search value (immediate visual feedback)
  const [searchValue, setSearchValue] = useState(filters.getFilterValue('search'))

  // Debounced search value (delays URL update)
  const debouncedSearchValue = useDebounce(searchValue, SEARCH_DEBOUNCE_MS)

  // Infinite scroll state
  const [events, setEvents] = useState(initialData)
  const [offset, setOffset] = useState(LIST_VIEW_PAGE_SIZE)
  const [hasMore, setHasMore] = useState(initialHasMore)
  const [isLoadingMore, setIsLoadingMore] = useState(false)

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
        sort: filters.getFilterValue('sort') as DynamicEventFilterParams['sort'],
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

  // Define table columns for dynamic events
  // Note: We'll show basic event info for now - primary occasion date and key person names
  // will be added once we have the occasions table and field resolution
  const columns: DataTableColumn<DynamicEvent>[] = [
    {
      key: 'created_at',
      header: 'Created',
      cell: (event) => (
        <div className="min-w-0 flex-1">
          <span className="font-medium">
            {toLocalDateString(new Date(event.created_at))}
          </span>
        </div>
      ),
      sortable: true
    }
  ]

  return (
    <div className="space-y-6">
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
            onRowClick={(event) => router.push(`/events/${eventType.id}/${event.id}`)}
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
                <Link href={`/events/${eventType.id}/create`}>
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
    </div>
  )
}

'use client'

import { useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import type { EventWithModuleLink, EventStats } from '@/lib/actions/events'
import { deleteEvent } from '@/lib/actions/events'
import { DataTable } from '@/components/data-table/data-table'
import { ClearableSearchInput } from '@/components/clearable-search-input'
import { ScrollToTopButton } from '@/components/scroll-to-top-button'
import { DeleteConfirmationDialog } from '@/components/delete-confirmation-dialog'
import { AdvancedSearch } from '@/components/advanced-search'
import { SearchCard } from "@/components/search-card"
import { ContentCard } from "@/components/content-card"
import { ListStatsBar, type ListStat } from "@/components/list-stats-bar"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { Plus, CalendarDays, Filter } from "lucide-react"
import { toast } from "sonner"
import { STANDARD_SORT_OPTIONS } from "@/lib/constants"
import { toLocalDateString } from "@/lib/utils/formatters"
import { useListFilters } from "@/hooks/use-list-filters"
import type { DataTableColumn } from '@/components/data-table/data-table'
import {
  buildWhenColumn,
  buildWhereColumn,
  buildActionsColumn
} from '@/lib/utils/table-columns'

interface EventsListClientProps {
  initialData: EventWithModuleLink[]
  stats: EventStats
}

export function EventsListClient({ initialData, stats }: EventsListClientProps) {
  const router = useRouter()
  const searchParams = useSearchParams()

  // Use list filters hook for URL state management
  const filters = useListFilters({
    baseUrl: '/events',
    defaultFilters: { sort: 'date_asc' }
  })

  // Local state for search value (synced with URL)
  const [searchValue, setSearchValue] = useState(filters.getFilterValue('search'))

  // Transform stats for ListStatsBar
  const statsList: ListStat[] = [
    { value: stats.total, label: 'Total Events' },
    { value: stats.upcoming, label: 'Upcoming' },
    { value: stats.past, label: 'Past' },
    { value: stats.filtered, label: 'Filtered Results' }
  ]

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
  const [eventToDelete, setEventToDelete] = useState<EventWithModuleLink | null>(null)

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

  // Define custom "What" column (event name + type)
  const whatColumn: DataTableColumn<EventWithModuleLink> = {
    key: 'what',
    header: 'What',
    cell: (event) => (
      <div className="flex items-center gap-2 max-w-[200px] md:max-w-[300px]">
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <span className="font-medium truncate">
              {event.name || 'Unnamed Event'}
            </span>
          </div>
          {event.event_type?.name && (
            <div className="text-sm text-muted-foreground truncate">
              {event.event_type.name}
            </div>
          )}
        </div>
      </div>
    ),
    sortable: true
  }

  // Define table columns (no avatar column for events)
  const columns = [
    whatColumn,
    buildWhenColumn<EventWithModuleLink>({
      getDate: (event) => event.start_date || null,
      getTime: (event) => event.start_time || null,
      sortable: true
    }),
    buildWhereColumn<EventWithModuleLink>({
      getLocation: (event) => event.location || null,
      hiddenOn: 'lg'
    }),
    buildActionsColumn<EventWithModuleLink>({
      baseUrl: '/events',
      onDelete: (event) => {
        setEventToDelete(event)
        setDeleteDialogOpen(true)
      },
      getDeleteMessage: (event) =>
        `Are you sure you want to delete the event "${event.name || 'this event'}"?`
    })
  ]

  return (
    <div className="space-y-6">
      {/* Search and Filters */}
      <SearchCard title="Search Events">
        <div className="space-y-4">
          {/* Main Search Row */}
          <ClearableSearchInput
            value={searchValue}
            onChange={(value) => {
              setSearchValue(value)
              filters.updateFilter('search', value)
            }}
            placeholder="Search events by name or description..."
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
      {initialData.length > 0 ? (
        <DataTable
          columns={columns}
          data={initialData}
          keyExtractor={(event) => event.id}
          onRowClick={(event) => router.push(`/events/${event.id}`)}
          stickyHeader
        />
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

      {/* Scroll to Top Button */}
      <ScrollToTopButton />

      {/* Quick Stats */}
      {stats.total > 0 && <ListStatsBar stats={statsList} />}

      {/* Delete Confirmation Dialog */}
      <DeleteConfirmationDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        onConfirm={handleDeleteConfirm}
        title="Delete Event"
        description={
          eventToDelete
            ? `Are you sure you want to delete the event "${eventToDelete.name || 'this event'}"?`
            : 'Are you sure you want to delete this event?'
        }
      />
    </div>
  )
}

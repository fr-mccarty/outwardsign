'use client'

import { useState, useCallback, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import type { MassIntentionWithNames, MassIntentionStats } from '@/lib/actions/mass-intentions'
import { deleteMassIntention, getMassIntentions, type MassIntentionFilterParams } from '@/lib/actions/mass-intentions'
import { LIST_VIEW_PAGE_SIZE, INFINITE_SCROLL_LOAD_MORE_SIZE, SEARCH_DEBOUNCE_MS } from '@/lib/constants'
import { useDebounce } from '@/hooks/use-debounce'
import { DataTable } from '@/components/data-table/data-table'
import { ClearableSearchInput } from '@/components/clearable-search-input'
import { ScrollToTopButton } from '@/components/scroll-to-top-button'
import { DeleteConfirmationDialog } from '@/components/delete-confirmation-dialog'
import { AdvancedSearch } from '@/components/advanced-search'
import { SearchCard } from "@/components/search-card"
import { ContentCard } from "@/components/content-card"
import { ListStatsBar, type ListStat } from "@/components/list-stats-bar"
import { StatusFilter } from "@/components/status-filter"
import { EndOfListMessage } from '@/components/end-of-list-message'
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { Plus, Heart, Filter } from "lucide-react"
import { toast } from "sonner"
import { MASS_INTENTION_STATUS_VALUES } from "@/lib/constants"
import { toLocalDateString } from "@/lib/utils/formatters"
import { useListFilters } from "@/hooks/use-list-filters"
import { parseSort, formatSort } from '@/lib/utils/sort-utils'
import type { DataTableColumn } from '@/components/data-table/data-table'
import {
  buildActionsColumn
} from '@/lib/utils/table-columns'

interface MassIntentionsListClientProps {
  initialData: MassIntentionWithNames[]
  stats: MassIntentionStats
  initialHasMore: boolean
}

export function MassIntentionsListClient({ initialData, stats, initialHasMore }: MassIntentionsListClientProps) {
  const router = useRouter()
  const searchParams = useSearchParams()

  // Use list filters hook for URL state management
  const filters = useListFilters({
    baseUrl: '/mass-intentions',
    defaultFilters: { status: 'ACTIVE', sort: 'date_desc' }
  })

  // Local state for search value (immediate visual feedback)
  const [searchValue, setSearchValue] = useState(filters.getFilterValue('search'))

  // Debounced search value (delays URL update)
  const debouncedSearchValue = useDebounce(searchValue, SEARCH_DEBOUNCE_MS)

  // Infinite scroll state
  const [massIntentions, setMassIntentions] = useState(initialData)
  const [offset, setOffset] = useState(LIST_VIEW_PAGE_SIZE)
  const [hasMore, setHasMore] = useState(initialHasMore)
  const [isLoadingMore, setIsLoadingMore] = useState(false)

  // Transform stats for ListStatsBar
  const statsList: ListStat[] = [
    { value: stats.total, label: 'Total Intentions' },
    { value: stats.requested, label: 'Requested' },
    { value: stats.scheduled, label: 'Confirmed' },
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
  const [intentionToDelete, setIntentionToDelete] = useState<MassIntentionWithNames | null>(null)

  // Update URL when debounced search value changes
  useEffect(() => {
    filters.updateFilter('search', debouncedSearchValue)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debouncedSearchValue])

  // Reset to initial data when filters change
  useEffect(() => {
    setMassIntentions(initialData)
    setOffset(LIST_VIEW_PAGE_SIZE)
    setHasMore(initialHasMore)
  }, [initialData, initialHasMore])

  // Sorting state
  const currentSort = parseSort(filters.getFilterValue('sort'))

  const handleSortChange = useCallback((column: string, direction: 'asc' | 'desc' | null) => {
    // Map UI column names to server sort field names
    const columnMap: Record<string, string> = {
      'for': 'name',
      'requested': 'date'
    }
    const sortValue = formatSort(columnMap[column] || column, direction)
    filters.updateFilter('sort', sortValue)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // Load more function for infinite scroll
  const handleLoadMore = async () => {
    if (isLoadingMore || !hasMore) return

    setIsLoadingMore(true)
    try {
      const nextIntentions = await getMassIntentions({
        search: filters.getFilterValue('search'),
        status: filters.getFilterValue('status') as MassIntentionFilterParams['status'],
        sort: filters.getFilterValue('sort') as MassIntentionFilterParams['sort'],
        offset: offset,
        limit: INFINITE_SCROLL_LOAD_MORE_SIZE,
        start_date: searchParams.get('start_date') || undefined,
        end_date: searchParams.get('end_date') || undefined
      })

      setMassIntentions(prev => [...prev, ...nextIntentions])
      setOffset(prev => prev + INFINITE_SCROLL_LOAD_MORE_SIZE)
      setHasMore(nextIntentions.length === INFINITE_SCROLL_LOAD_MORE_SIZE)
    } catch (error) {
      console.error('Failed to load more mass intentions:', error)
      toast.error('Failed to load more mass intentions')
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
    if (!intentionToDelete) return

    try {
      await deleteMassIntention(intentionToDelete.id)
      toast.success('Mass intention deleted successfully')
      router.refresh()
    } catch (error) {
      console.error('Failed to delete mass intention:', error)
      toast.error('Failed to delete mass intention. Please try again.')
      throw error
    }
  }

  // Define custom "For" column (replaces Who column for mass intentions)
  const forColumn: DataTableColumn<MassIntentionWithNames> = {
    key: 'for',
    header: 'For',
    cell: (intention) => (
      <div className="flex items-center gap-2 max-w-[200px] md:max-w-[250px]">
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <span className="font-medium truncate">
              {intention.mass_offered_for || 'No intention specified'}
            </span>
          </div>
          {intention.requested_by && (
            <div className="text-sm text-muted-foreground truncate">
              Requested by {intention.requested_by.full_name}
            </div>
          )}
        </div>
      </div>
    ),
    sortable: true
  }

  // Define custom "Requested" column (replaces When column - using date_requested instead of event date)
  const requestedColumn: DataTableColumn<MassIntentionWithNames> = {
    key: 'requested',
    header: 'Requested',
    cell: (intention) => {
      if (!intention.date_requested) {
        return <span className="text-sm text-muted-foreground">No date</span>
      }

      return (
        <div className="flex flex-col min-w-[120px] md:min-w-[180px]">
          <span className="text-sm">{toLocalDateString(new Date(intention.date_requested))}</span>
          {intention.date_received && (
            <span className="text-xs text-muted-foreground">
              Received: {toLocalDateString(new Date(intention.date_received))}
            </span>
          )}
        </div>
      )
    },
    sortable: true
  }

  // Define table columns (no avatar column for mass intentions)
  const columns = [
    forColumn,
    requestedColumn,
    buildActionsColumn<MassIntentionWithNames>({
      baseUrl: '/mass-intentions',
      onDelete: (intention) => {
        setIntentionToDelete(intention)
        setDeleteDialogOpen(true)
      },
      getDeleteMessage: (intention) =>
        `Are you sure you want to delete the mass intention for ${intention.mass_offered_for || 'this intention'}?`
    })
  ]

  return (
    <div className="space-y-6">
      {/* Search and Filters */}
      <SearchCard title="Search Mass Intentions">
        <div className="space-y-4">
          {/* Main Search and Status Row - Inline */}
          <div className="flex flex-col sm:flex-row sm:items-center gap-4">
            {/* Search Input */}
            <div className="flex-1">
              <ClearableSearchInput
                value={searchValue}
                onChange={(value) => {
                  setSearchValue(value)
                  filters.updateFilter('search', value)
                }}
                placeholder="Search by intention or name..."
                className="w-full"
              />
            </div>

            {/* Status Filter - Now Inline */}
            <div className="w-full sm:w-[200px]">
              <StatusFilter
                value={filters.getFilterValue('status')}
                onChange={(value) => filters.updateFilter('status', value)}
                statusValues={MASS_INTENTION_STATUS_VALUES}
                hideLabel
              />
            </div>
          </div>

          {/* Advanced Search - Date Range Only */}
          <AdvancedSearch
            dateRangeFilter={{
              startDate,
              endDate,
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

      {/* Mass Intentions Table */}
      {massIntentions.length > 0 ? (
        <>
          <DataTable
            columns={columns}
            data={massIntentions}
            keyExtractor={(intention) => intention.id}
            onRowClick={(intention) => router.push(`/mass-intentions/${intention.id}`)}
            currentSort={currentSort || undefined}
            onSortChange={handleSortChange}
            onLoadMore={handleLoadMore}
            hasMore={hasMore}
            stickyHeader
          />
          <EndOfListMessage show={!hasMore && massIntentions.length > 0} />
          <ScrollToTopButton />
        </>
      ) : (
        <ContentCard className="text-center py-12">
          <Heart className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
          <h3 className="text-lg font-medium mb-2">
            {hasActiveFilters
              ? 'No mass intentions found'
              : 'No mass intentions yet'
            }
          </h3>
          <p className="text-muted-foreground mb-6">
            {hasActiveFilters
              ? 'Try adjusting your search or filters to find more mass intentions.'
              : 'Create your first mass intention to start managing Mass offerings in your parish.'
            }
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Button asChild>
              <Link href="/mass-intentions/create">
                <Plus className="h-4 w-4 mr-2" />
                Create Your First Mass Intention
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

      {/* Quick Stats */}
      {stats.total > 0 && <ListStatsBar stats={statsList} />}

      {/* Delete Confirmation Dialog */}
      <DeleteConfirmationDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        onConfirm={handleDeleteConfirm}
        title="Delete Mass Intention"
        description={
          intentionToDelete
            ? `Are you sure you want to delete the mass intention for ${intentionToDelete.mass_offered_for || 'this intention'}?`
            : 'Are you sure you want to delete this mass intention?'
        }
      />
    </div>
  )
}

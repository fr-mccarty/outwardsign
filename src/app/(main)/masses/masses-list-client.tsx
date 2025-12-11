'use client'

import { useState, useCallback, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import type { MassWithNames, MassStats } from '@/lib/actions/masses'
import { deleteMass, getMasses, type MassFilterParams } from '@/lib/actions/masses'
import { LIST_VIEW_PAGE_SIZE, INFINITE_SCROLL_LOAD_MORE_SIZE, SEARCH_DEBOUNCE_MS } from '@/lib/constants'
import { useDebounce } from '@/hooks/use-debounce'
import { DataTable } from '@/components/data-table/data-table'
import { ClearableSearchInput } from '@/components/clearable-search-input'
import { ScrollToTopButton } from '@/components/scroll-to-top-button'
import { DeleteConfirmationDialog } from '@/components/delete-confirmation-dialog'
import { AdvancedSearch } from '@/components/advanced-search'
import { SearchCard } from "@/components/search-card"
import { EmptyState } from "@/components/empty-state"
import { ListStatsBar, type ListStat } from "@/components/list-stats-bar"
import { StatusFilter } from "@/components/status-filter"
import { EndOfListMessage } from '@/components/end-of-list-message'
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { Plus, Church, Filter } from "lucide-react"
import { toast } from "sonner"
import { MASS_STATUS_VALUES } from "@/lib/constants"
import { toLocalDateString } from "@/lib/utils/formatters"
import { useListFilters } from "@/hooks/use-list-filters"
import { parseSort, formatSort } from '@/lib/utils/sort-utils'
import {
  buildWhenColumn,
  buildWhereColumn,
  buildActionsColumn
} from '@/lib/utils/table-columns'
import { DataTableColumn } from '@/components/data-table/data-table'
import { MODULE_STATUS_COLORS } from '@/lib/constants'
import { getStatusLabel } from '@/lib/content-builders/shared/helpers'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip'

interface MassesListClientProps {
  initialData: MassWithNames[]
  stats: MassStats
  initialHasMore: boolean
}

export function MassesListClient({ initialData, stats, initialHasMore }: MassesListClientProps) {
  const router = useRouter()
  const searchParams = useSearchParams()

  // Use list filters hook for URL state management
  const filters = useListFilters({
    baseUrl: '/masses',
    defaultFilters: { status: 'ACTIVE', sort: 'date_asc' }
  })

  // Local state for search value (immediate visual feedback)
  const [searchValue, setSearchValue] = useState(filters.getFilterValue('search'))

  // Debounced search value (delays URL update)
  const debouncedSearchValue = useDebounce(searchValue, SEARCH_DEBOUNCE_MS)

  // Infinite scroll state
  const [masses, setMasses] = useState(initialData)
  const [offset, setOffset] = useState(LIST_VIEW_PAGE_SIZE)
  const [hasMore, setHasMore] = useState(initialHasMore)
  const [isLoadingMore, setIsLoadingMore] = useState(false)

  // Transform stats for ListStatsBar
  const statsList: ListStat[] = [
    { value: stats.total, label: 'Total Masses' },
    { value: stats.upcoming, label: 'Upcoming' },
    { value: stats.past, label: 'Past' },
    { value: stats.filtered, label: 'Filtered Results' }
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
  const [massToDelete, setMassToDelete] = useState<MassWithNames | null>(null)

  // Update URL when debounced search value changes
  useEffect(() => {
    filters.updateFilter('search', debouncedSearchValue)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debouncedSearchValue])

  // Reset to initial data when filters change
  useEffect(() => {
    setMasses(initialData)
    setOffset(LIST_VIEW_PAGE_SIZE)
    setHasMore(initialHasMore)
  }, [initialData, initialHasMore])

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
      const nextMasses = await getMasses({
        search: filters.getFilterValue('search'),
        status: filters.getFilterValue('status') as MassFilterParams['status'],
        sort: filters.getFilterValue('sort') as MassFilterParams['sort'],
        offset: offset,
        limit: INFINITE_SCROLL_LOAD_MORE_SIZE,
        start_date: searchParams.get('start_date') || undefined,
        end_date: searchParams.get('end_date') || undefined
      })

      setMasses(prev => [...prev, ...nextMasses])
      setOffset(prev => prev + INFINITE_SCROLL_LOAD_MORE_SIZE)
      setHasMore(nextMasses.length === INFINITE_SCROLL_LOAD_MORE_SIZE)
    } catch (error) {
      console.error('Failed to load more masses:', error)
      toast.error('Failed to load more masses')
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
    if (!massToDelete) return

    try {
      await deleteMass(massToDelete.id)
      toast.success('Mass deleted successfully')
      router.refresh()
    } catch (error) {
      console.error('Failed to delete mass:', error)
      toast.error('Failed to delete mass. Please try again.')
      throw error
    }
  }

  // Custom "Name of Mass" column (only shows mass name)
  const buildMassWhoColumn = (): DataTableColumn<MassWithNames> => {
    return {
      key: 'who',
      header: 'Name of Mass',
      cell: (mass) => {
        const status = mass.status || 'PLANNING'
        const statusLabel = getStatusLabel(status, 'en')
        const statusColor = MODULE_STATUS_COLORS[status] || 'bg-muted-foreground/50'

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
                {mass.name || 'Unnamed Mass'}
              </span>
            </div>
          </div>
        )
      },
      className: 'max-w-[200px] md:max-w-[250px]',
      sortable: true,
      accessorFn: (mass) => mass.name || ''
    }
  }

  // Define table columns using column builders
  const columns = [
    buildMassWhoColumn(),
    buildWhenColumn<MassWithNames>({
      getDate: (mass) => mass.event?.start_date || null,
      getTime: (mass) => mass.event?.start_time || null,
      sortable: true
    }),
    buildWhereColumn<MassWithNames>({
      getLocation: (mass) => mass.event?.location || null,
      hiddenOn: 'lg'
    }),
    buildActionsColumn<MassWithNames>({
      baseUrl: '/masses',
      onDelete: (mass) => {
        setMassToDelete(mass)
        setDeleteDialogOpen(true)
      },
      getDeleteMessage: (mass) =>
        `Are you sure you want to delete the mass with presider ${mass.presider?.full_name || 'unknown'}?`
    })
  ]

  return (
    <div className="space-y-6">
      {/* Search and Filters */}
      <SearchCard title="Search Masses">
        <div className="space-y-4">
          {/* Main Search and Status Row - Inline */}
          <div className="flex flex-col sm:flex-row sm:items-center gap-4">
            {/* Search Input */}
            <div className="flex-1">
              <ClearableSearchInput
                value={searchValue}
                onChange={setSearchValue}
                placeholder="Search by presider, homilist, or event name..."
                className="w-full"
              />
            </div>

            {/* Status Filter - Now Inline */}
            <div className="w-full sm:w-[200px]">
              <StatusFilter
                value={filters.getFilterValue('status')}
                onChange={(value) => filters.updateFilter('status', value)}
                statusValues={MASS_STATUS_VALUES}
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

      {/* Masses Table */}
      {masses.length > 0 ? (
        <>
          <DataTable
            data={masses}
            columns={columns}
            keyExtractor={(mass) => mass.id}
            onRowClick={(mass) => router.push(`/masses/${mass.id}`)}
            currentSort={currentSort || undefined}
            onSortChange={handleSortChange}
            onLoadMore={handleLoadMore}
            hasMore={hasMore}
            emptyState={{
              icon: <Church className="h-16 w-16 mx-auto text-muted-foreground mb-4" />,
              title: hasActiveFilters ? 'No masses found' : 'No masses yet',
              description: hasActiveFilters
                ? 'Try adjusting your search or filters to find more masses.'
                : 'Create your first mass to start managing mass celebrations in your parish.',
              action: (
                <div className="flex flex-col sm:flex-row gap-3 justify-center">
                  <Button asChild>
                    <Link href="/masses/create">
                      <Plus className="h-4 w-4 mr-2" />
                      Create Your First Mass
                    </Link>
                  </Button>
                  {hasActiveFilters && (
                    <Button variant="outline" onClick={handleClearFilters}>
                      <Filter className="h-4 w-4 mr-2" />
                      Clear Filters
                    </Button>
                  )}
                </div>
              )
            }}
            stickyHeader
          />
          <EndOfListMessage show={!hasMore && masses.length > 0} />
          <ScrollToTopButton />
        </>
      ) : (
        <EmptyState
          icon={<Church className="h-16 w-16" />}
          title={hasActiveFilters ? 'No masses found' : 'No masses yet'}
          description={hasActiveFilters
            ? 'Try adjusting your search or filters to find more masses.'
            : 'Create your first mass to start managing mass celebrations in your parish.'}
          action={
            <>
              <Button asChild>
                <Link href="/masses/create">
                  <Plus className="h-4 w-4 mr-2" />
                  Create Your First Mass
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

      {/* Quick Stats */}
      {stats.total > 0 && (
        <ListStatsBar title="Mass Overview" stats={statsList} />
      )}

      {/* Delete Confirmation Dialog */}
      <DeleteConfirmationDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        onConfirm={handleDeleteConfirm}
        title="Delete Mass"
        description={
          massToDelete
            ? `Are you sure you want to delete the mass with presider ${massToDelete.presider?.full_name || 'unknown'}? This action cannot be undone.`
            : 'Are you sure you want to delete this mass? This action cannot be undone.'
        }
        actionLabel="Delete"
      />
    </div>
  )
}

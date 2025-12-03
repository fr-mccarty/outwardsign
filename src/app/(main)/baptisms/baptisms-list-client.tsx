'use client'

import { useState, useCallback, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import type { BaptismWithNames, BaptismStats } from '@/lib/actions/baptisms'
import { deleteBaptism, getBaptisms, type BaptismFilterParams } from '@/lib/actions/baptisms'
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
import { Plus, Droplet, Filter } from "lucide-react"
import { toast } from "sonner"
import { toLocalDateString } from "@/lib/utils/formatters"
import { useListFilters } from "@/hooks/use-list-filters"
import { parseSort, formatSort } from '@/lib/utils/sort-utils'
import {
  buildAvatarColumn,
  buildWhoColumn,
  buildWhenColumn,
  buildWhereColumn,
  buildActionsColumn
} from '@/lib/utils/table-columns'

interface BaptismsListClientProps {
  initialData: BaptismWithNames[]
  stats: BaptismStats
  initialHasMore: boolean
}

export function BaptismsListClient({ initialData, stats, initialHasMore }: BaptismsListClientProps) {
  const router = useRouter()
  const searchParams = useSearchParams()

  // Use list filters hook for URL state management
  const filters = useListFilters({
    baseUrl: '/baptisms',
    defaultFilters: { status: 'ACTIVE', sort: 'date_asc' }
  })

  // Local state for search value (immediate visual feedback)
  const [searchValue, setSearchValue] = useState(filters.getFilterValue('search'))

  // Debounced search value (delays URL update)
  const debouncedSearchValue = useDebounce(searchValue, SEARCH_DEBOUNCE_MS)

  // Infinite scroll state
  const [baptisms, setBaptisms] = useState(initialData)
  const [offset, setOffset] = useState(LIST_VIEW_PAGE_SIZE)
  const [hasMore, setHasMore] = useState(initialHasMore)
  const [isLoadingMore, setIsLoadingMore] = useState(false)

  // Parse current sort from URL
  const currentSort = parseSort(filters.getFilterValue('sort'))

  // Update URL when debounced search value changes
  useEffect(() => {
    filters.updateFilter('search', debouncedSearchValue)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debouncedSearchValue])

  // Reset to initial data when filters change
  useEffect(() => {
    setBaptisms(initialData)
    setOffset(LIST_VIEW_PAGE_SIZE)
    setHasMore(initialHasMore)
  }, [initialData, initialHasMore])

  // Handle sort change
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
      const nextBaptisms = await getBaptisms({
        search: filters.getFilterValue('search'),
        status: filters.getFilterValue('status') as BaptismFilterParams['status'],
        sort: filters.getFilterValue('sort') as BaptismFilterParams['sort'],
        offset: offset,
        limit: INFINITE_SCROLL_LOAD_MORE_SIZE,
        start_date: searchParams.get('start_date') || undefined,
        end_date: searchParams.get('end_date') || undefined
      })

      setBaptisms(prev => [...prev, ...nextBaptisms])
      setOffset(prev => prev + INFINITE_SCROLL_LOAD_MORE_SIZE)
      setHasMore(nextBaptisms.length === INFINITE_SCROLL_LOAD_MORE_SIZE)
    } catch (error) {
      console.error('Failed to load more baptisms:', error)
      toast.error('Failed to load more baptisms')
    } finally {
      setIsLoadingMore(false)
    }
  }

  // Transform stats for ListStatsBar
  const statsList: ListStat[] = [
    { value: stats.total, label: 'Total Baptisms' },
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
  const [baptismToDelete, setBaptismToDelete] = useState<BaptismWithNames | null>(null)

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
    if (!baptismToDelete) return

    try {
      await deleteBaptism(baptismToDelete.id)
      toast.success('Baptism deleted successfully')
      router.refresh()
    } catch (error) {
      console.error('Failed to delete baptism:', error)
      toast.error('Failed to delete baptism. Please try again.')
      throw error
    }
  }

  // Define table columns using column builders
  const columns = [
    buildAvatarColumn<BaptismWithNames>({
      people: (baptism) => baptism.child ? [{
        id: baptism.child.id,
        first_name: baptism.child.first_name,
        last_name: baptism.child.last_name,
        full_name: baptism.child.full_name,
        avatar_url: baptism.child.avatar_url
      }] : [],
      type: 'single',
      size: 'md',
      hiddenOn: 'sm'
    }),
    {
      ...buildWhoColumn<BaptismWithNames>({
        header: 'To Be Baptized',
        getName: (baptism) => baptism.child?.full_name || '',
        getStatus: (baptism) => baptism.status || 'PLANNING',
        fallback: 'No child assigned',
        sortable: true
      }),
      key: 'name'  // Override for server-side sorting
    },
    {
      ...buildWhenColumn<BaptismWithNames>({
        getDate: (baptism) => baptism.baptism_event?.start_date || null,
        getTime: (baptism) => baptism.baptism_event?.start_time || null,
        sortable: true
      }),
      key: 'date'  // Override for server-side sorting
    },
    buildWhereColumn<BaptismWithNames>({
      getLocation: (baptism) => baptism.baptism_event?.location || null,
      hiddenOn: 'lg'
    }),
    buildActionsColumn<BaptismWithNames>({
      baseUrl: '/baptisms',
      onDelete: (baptism) => {
        setBaptismToDelete(baptism)
        setDeleteDialogOpen(true)
      },
      getDeleteMessage: (baptism) =>
        `Are you sure you want to delete the baptism for ${baptism.child?.full_name || 'this child'}?`
    })
  ]

  return (
    <div className="space-y-6">
      {/* Search and Filters */}
      <SearchCard title="Search Baptisms">
        {/* Main Search and Status Row - Inline */}
        <div className="flex flex-col sm:flex-row sm:items-center gap-4">
            {/* Search Input */}
            <div className="flex-1">
              <ClearableSearchInput
                value={searchValue}
                onChange={setSearchValue}
                placeholder="Search by child name..."
                className="w-full"
              />
            </div>

            {/* Status Filter - Now Inline */}
            <div className="w-full sm:w-[200px]">
              <StatusFilter
                value={filters.getFilterValue('status')}
                onChange={(value) => filters.updateFilter('status', value)}
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
      </SearchCard>

      {/* Baptisms Table */}
      {baptisms.length > 0 ? (
        <>
          <DataTable
            data={baptisms}
            columns={columns}
            currentSort={currentSort || undefined}
            onSortChange={handleSortChange}
            keyExtractor={(baptism) => baptism.id}
            onRowClick={(baptism) => router.push(`/baptisms/${baptism.id}`)}
            onLoadMore={handleLoadMore}
            hasMore={hasMore}
            emptyState={{
              icon: <Droplet className="h-16 w-16 mx-auto text-muted-foreground mb-4" />,
              title: hasActiveFilters ? 'No baptisms found' : 'No baptisms yet',
              description: hasActiveFilters
                ? 'Try adjusting your search or filters to find more baptisms.'
                : 'Create your first baptism to start managing baptism celebrations in your parish.',
              action: (
                <div className="flex flex-col sm:flex-row gap-3 justify-center">
                  <Button asChild>
                    <Link href="/baptisms/create">
                      <Plus className="h-4 w-4 mr-2" />
                      Create Your First Baptism
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
          <EndOfListMessage show={!hasMore && baptisms.length > 0} />
          <ScrollToTopButton />
        </>
      ) : (
        <ContentCard className="text-center py-12">
          <Droplet className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
          <h3 className="text-lg font-medium mb-2">
            {hasActiveFilters ? 'No baptisms found' : 'No baptisms yet'}
          </h3>
          <p className="text-muted-foreground mb-6">
            {hasActiveFilters
              ? 'Try adjusting your search or filters to find more baptisms.'
              : 'Create your first baptism to start managing baptism celebrations in your parish.'}
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Button asChild>
              <Link href="/baptisms/create">
                <Plus className="h-4 w-4 mr-2" />
                Create Your First Baptism
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
      {stats.total > 0 && (
        <ListStatsBar title="Baptism Overview" stats={statsList} />
      )}

      {/* Delete Confirmation Dialog */}
      <DeleteConfirmationDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        onConfirm={handleDeleteConfirm}
        title="Delete Baptism"
        description={
          baptismToDelete
            ? `Are you sure you want to delete the baptism for ${baptismToDelete.child?.full_name || 'this child'}? This action cannot be undone.`
            : 'Are you sure you want to delete this baptism? This action cannot be undone.'
        }
        actionLabel="Delete"
      />
    </div>
  )
}

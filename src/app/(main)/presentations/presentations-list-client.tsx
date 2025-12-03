'use client'

import { useState, useCallback, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import type { PresentationWithNames, PresentationStats } from '@/lib/actions/presentations'
import { deletePresentation, getPresentations, type PresentationFilterParams } from '@/lib/actions/presentations'
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
import { Badge } from "@/components/ui/badge"
import Link from "next/link"
import { Plus, HandHeartIcon, Filter } from "lucide-react"
import { toast } from "sonner"
import { toLocalDateString } from "@/lib/utils/formatters"
import { useListFilters } from "@/hooks/use-list-filters"
import { parseSort, formatSort } from '@/lib/utils/sort-utils'
import {
  buildAvatarColumn,
  buildWhenColumn,
  buildWhereColumn,
  buildActionsColumn
} from '@/lib/utils/table-columns'
import { MODULE_STATUS_COLORS } from '@/lib/constants'
import { getStatusLabel } from '@/lib/content-builders/shared/helpers'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import type { DataTableColumn } from '@/components/data-table/data-table'

interface PresentationsListClientProps {
  initialData: PresentationWithNames[]
  stats: PresentationStats
  initialHasMore: boolean
}

export function PresentationsListClient({ initialData, stats, initialHasMore }: PresentationsListClientProps) {
  const router = useRouter()
  const searchParams = useSearchParams()

  // Use list filters hook for URL state management
  const filters = useListFilters({
    baseUrl: '/presentations',
    defaultFilters: { status: 'ACTIVE', sort: 'date_asc' }
  })

  // Local state for search value (immediate visual feedback)
  const [searchValue, setSearchValue] = useState(filters.getFilterValue('search'))

  // Debounced search value (delays URL update)
  const debouncedSearchValue = useDebounce(searchValue, SEARCH_DEBOUNCE_MS)

  // Infinite scroll state
  const [presentations, setPresentations] = useState(initialData)
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
    setPresentations(initialData)
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
      const nextPresentations = await getPresentations({
        search: filters.getFilterValue('search'),
        status: filters.getFilterValue('status') as PresentationFilterParams['status'],
        sort: filters.getFilterValue('sort') as PresentationFilterParams['sort'],
        offset: offset,
        limit: INFINITE_SCROLL_LOAD_MORE_SIZE,
        start_date: searchParams.get('start_date') || undefined,
        end_date: searchParams.get('end_date') || undefined
      })

      setPresentations(prev => [...prev, ...nextPresentations])
      setOffset(prev => prev + INFINITE_SCROLL_LOAD_MORE_SIZE)
      setHasMore(nextPresentations.length === INFINITE_SCROLL_LOAD_MORE_SIZE)
    } catch (error) {
      console.error('Failed to load more presentations:', error)
      toast.error('Failed to load more presentations')
    } finally {
      setIsLoadingMore(false)
    }
  }

  // Transform stats for ListStatsBar
  const statsList: ListStat[] = [
    { value: stats.total, label: 'Total Presentations' },
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
  const [presentationToDelete, setPresentationToDelete] = useState<PresentationWithNames | null>(null)

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
    if (!presentationToDelete) return

    try {
      await deletePresentation(presentationToDelete.id)
      toast.success('Presentation deleted successfully')
      router.refresh()
    } catch (error) {
      console.error('Failed to delete presentation:', error)
      toast.error('Failed to delete presentation. Please try again.')
      throw error
    }
  }

  // Define table columns using column builders
  const columns = [
    buildAvatarColumn<PresentationWithNames>({
      people: (presentation) => presentation.child ? [{
        id: presentation.child.id,
        first_name: presentation.child.first_name,
        last_name: presentation.child.last_name,
        full_name: presentation.child.full_name,
        avatar_url: presentation.child.avatar_url
      }] : [],
      type: 'single',
      size: 'md',
      hiddenOn: 'sm'
    }),
    // Custom Who column with Baptized badge support
    {
      key: 'name',  // Override for server-side sorting
      header: 'Child',
      cell: (presentation: PresentationWithNames) => {
        const name = presentation.child?.full_name || ''
        const status = presentation.status || 'PLANNING'
        const statusLabel = getStatusLabel(status, 'en')
        const statusColor = MODULE_STATUS_COLORS[status] || 'bg-muted-foreground/50'

        if (!name) {
          return <span className="text-muted-foreground">No child assigned</span>
        }

        return (
          <div className="flex items-center gap-2">
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <div className={`h-2 w-2 rounded-full flex-shrink-0 ${statusColor}`} />
                </TooltipTrigger>
                <TooltipContent>
                  <p>{statusLabel}</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
            <span className="text-sm font-medium truncate">{name}</span>
            {presentation.is_baptized && (
              <Badge variant="secondary" className="text-xs">
                Baptized
              </Badge>
            )}
          </div>
        )
      },
      className: 'max-w-[200px] md:max-w-[280px]',
      sortable: true,
      accessorFn: (presentation: PresentationWithNames) => presentation.child?.full_name || ''
    } as DataTableColumn<PresentationWithNames>,
    {
      ...buildWhenColumn<PresentationWithNames>({
        getDate: (presentation) => presentation.presentation_event?.start_date || null,
        getTime: (presentation) => presentation.presentation_event?.start_time || null,
        sortable: true
      }),
      key: 'date'  // Override for server-side sorting
    },
    buildWhereColumn<PresentationWithNames>({
      getLocation: (presentation) => presentation.presentation_event?.location || null,
      hiddenOn: 'lg'
    }),
    buildActionsColumn<PresentationWithNames>({
      baseUrl: '/presentations',
      onDelete: (presentation) => {
        setPresentationToDelete(presentation)
        setDeleteDialogOpen(true)
      },
      getDeleteMessage: (presentation) =>
        `Are you sure you want to delete the presentation for ${presentation.child?.full_name || 'this child'}?`
    })
  ]

  return (
    <div className="space-y-6">
      {/* Search and Filters */}
      <SearchCard title="Search Presentations">
        <div className="space-y-4">
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
        </div>
      </SearchCard>

      {/* Presentations Table */}
      {presentations.length > 0 ? (
        <>
          <DataTable
            data={presentations}
            columns={columns}
            currentSort={currentSort || undefined}
            onSortChange={handleSortChange}
            keyExtractor={(presentation) => presentation.id}
            onRowClick={(presentation) => router.push(`/presentations/${presentation.id}`)}
            onLoadMore={handleLoadMore}
            hasMore={hasMore}
            emptyState={{
              icon: <HandHeartIcon className="h-16 w-16 mx-auto text-muted-foreground mb-4" />,
              title: hasActiveFilters ? 'No presentations found' : 'No presentations yet',
              description: hasActiveFilters
                ? 'Try adjusting your search or filters to find more presentations.'
                : 'Create your first presentation to start managing child presentations in your parish.',
              action: (
                <div className="flex flex-col sm:flex-row gap-3 justify-center">
                  <Button asChild>
                    <Link href="/presentations/create">
                      <Plus className="h-4 w-4 mr-2" />
                      Create Your First Presentation
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
          <EndOfListMessage show={!hasMore && presentations.length > 0} />
          <ScrollToTopButton />
        </>
      ) : (
        <ContentCard className="text-center py-12">
          <HandHeartIcon className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
          <h3 className="text-lg font-medium mb-2">
            {hasActiveFilters ? 'No presentations found' : 'No presentations yet'}
          </h3>
          <p className="text-muted-foreground mb-6">
            {hasActiveFilters
              ? 'Try adjusting your search or filters to find more presentations.'
              : 'Create your first presentation to start managing child presentations in your parish.'}
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Button asChild>
              <Link href="/presentations/create">
                <Plus className="h-4 w-4 mr-2" />
                Create Your First Presentation
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
        <ListStatsBar title="Presentation Overview" stats={statsList} />
      )}

      {/* Delete Confirmation Dialog */}
      <DeleteConfirmationDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        onConfirm={handleDeleteConfirm}
        title="Delete Presentation"
        description={
          presentationToDelete
            ? `Are you sure you want to delete the presentation for ${presentationToDelete.child?.full_name || 'this child'}? This action cannot be undone.`
            : 'Are you sure you want to delete this presentation? This action cannot be undone.'
        }
        actionLabel="Delete"
      />
    </div>
  )
}

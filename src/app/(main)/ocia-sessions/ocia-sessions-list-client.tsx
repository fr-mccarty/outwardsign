'use client'

import { useState, useCallback, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import type { OciaSessionWithNames, OciaSessionStats } from '@/lib/actions/ocia-sessions'
import { deleteOciaSession, getOciaSessions, type OciaSessionFilterParams } from '@/lib/actions/ocia-sessions'
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
import { PersonAvatarGroup } from "@/components/person-avatar-group"
import { EndOfListMessage } from '@/components/end-of-list-message'
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { Plus, Users, Filter } from "lucide-react"
import { toast } from "sonner"
import { toLocalDateString } from "@/lib/utils/formatters"
import { useListFilters } from "@/hooks/use-list-filters"
import { parseSort, formatSort } from '@/lib/utils/sort-utils'
import {
  buildWhoColumn,
  buildWhenColumn,
  buildWhereColumn,
  buildActionsColumn
} from '@/lib/utils/table-columns'

interface OciaSessionsListClientProps {
  initialData: OciaSessionWithNames[]
  stats: OciaSessionStats
  initialHasMore: boolean
}

export function OciaSessionsListClient({ initialData, stats, initialHasMore }: OciaSessionsListClientProps) {
  const router = useRouter()
  const searchParams = useSearchParams()

  // Use list filters hook for URL state management
  const filters = useListFilters({
    baseUrl: '/ocia-sessions',
    defaultFilters: { status: 'ACTIVE', sort: 'date_asc' }
  })

  // Local state for search value (immediate visual feedback)
  const [searchValue, setSearchValue] = useState(filters.getFilterValue('search'))

  // Debounced search value (delays URL update)
  const debouncedSearchValue = useDebounce(searchValue, SEARCH_DEBOUNCE_MS)

  // Infinite scroll state
  const [ociaSessions, setOciaSessions] = useState(initialData)
  const [offset, setOffset] = useState(LIST_VIEW_PAGE_SIZE)
  const [hasMore, setHasMore] = useState(initialHasMore)
  const [isLoadingMore, setIsLoadingMore] = useState(false)

  // Transform stats for ListStatsBar
  const statsList: ListStat[] = [
    { value: stats.total, label: 'Total OCIA Sessions' },
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
  const [ociaSessionToDelete, setOciaSessionToDelete] = useState<OciaSessionWithNames | null>(null)

  // Parse current sort from URL
  const currentSort = parseSort(filters.getFilterValue('sort'))

  // Update URL when debounced search value changes
  useEffect(() => {
    filters.updateFilter('search', debouncedSearchValue)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debouncedSearchValue])

  // Reset to initial data when filters change
  useEffect(() => {
    setOciaSessions(initialData)
    setOffset(LIST_VIEW_PAGE_SIZE)
    setHasMore(initialHasMore)
  }, [initialData, initialHasMore])

  // Handle sort change
  const handleSortChange = useCallback((column: string, direction: 'asc' | 'desc' | null) => {
    // Map UI column names to server sort field names
    const columnMap: Record<string, string> = {
      'who': 'name',
      'when': 'date'
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
      const nextOciaSessions = await getOciaSessions({
        search: filters.getFilterValue('search'),
        status: filters.getFilterValue('status') as OciaSessionFilterParams['status'],
        sort: filters.getFilterValue('sort') as OciaSessionFilterParams['sort'],
        offset: offset,
        limit: INFINITE_SCROLL_LOAD_MORE_SIZE,
        start_date: searchParams.get('start_date') || undefined,
        end_date: searchParams.get('end_date') || undefined
      })

      setOciaSessions(prev => [...prev, ...nextOciaSessions])
      setOffset(prev => prev + INFINITE_SCROLL_LOAD_MORE_SIZE)
      setHasMore(nextOciaSessions.length === INFINITE_SCROLL_LOAD_MORE_SIZE)
    } catch (error) {
      console.error('Failed to load more OCIA sessions:', error)
      toast.error('Failed to load more OCIA sessions')
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
    if (!ociaSessionToDelete) return

    try {
      await deleteOciaSession(ociaSessionToDelete.id)
      toast.success('OCIA session deleted successfully')
      router.refresh()
    } catch (error) {
      console.error('Failed to delete OCIA session:', error)
      toast.error('Failed to delete OCIA session. Please try again.')
      throw error
    }
  }

  // Define table columns
  const columns = [
    {
      id: 'candidate-avatars',
      key: 'candidate-avatars',
      header: '',
      cell: (row: OciaSessionWithNames) => {
        const people = (row.candidates || [])
          .filter(candidate => candidate.person)
          .map(candidate => ({
            id: candidate.person!.id,
            first_name: candidate.person!.first_name || '',
            last_name: candidate.person!.last_name || '',
            full_name: candidate.person!.full_name,
            avatar_url: candidate.person!.avatar_url
          }))

        return people.length > 0 ? (
          <PersonAvatarGroup people={people} type="group" maxDisplay={5} size="sm" />
        ) : (
          <Users className="h-4 w-4 text-muted-foreground" />
        )
      },
      enableSorting: false
    },
    buildWhoColumn<OciaSessionWithNames>({
      header: 'Session Name',
      getName: (session) => session.name,
      getStatus: (session) => session.status || 'PLANNING',
      sortable: true
    }),
    buildWhenColumn<OciaSessionWithNames>({
      getDate: (session) => session.ocia_event?.start_date || null,
      getTime: (session) => session.ocia_event?.start_time || null,
      sortable: true
    }),
    buildWhereColumn<OciaSessionWithNames>({
      getLocation: (session) => session.ocia_event?.location || null,
      hiddenOn: 'lg'
    }),
    buildActionsColumn<OciaSessionWithNames>({
      baseUrl: '/ocia-sessions',
      onDelete: (session) => {
        setOciaSessionToDelete(session)
        setDeleteDialogOpen(true)
      },
      getDeleteMessage: (session) =>
        `Are you sure you want to delete the OCIA session "${session.name}"? This will unlink all ${session.candidate_count || 0} candidates from this session. This action cannot be undone.`
    })
  ]

  return (
    <div className="space-y-6">
      {/* Search and Filters */}
      <SearchCard title="Search OCIA Sessions">
        <div className="space-y-4">
          {/* Main Search and Status Row - Inline */}
          <div className="flex flex-col sm:flex-row sm:items-center gap-4">
            {/* Search Input */}
            <div className="flex-1">
              <ClearableSearchInput
                value={searchValue}
                onChange={setSearchValue}
                placeholder="Search by session name..."
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

      {/* OCIA Sessions Table */}
      {ociaSessions.length > 0 ? (
        <>
          <DataTable
            data={ociaSessions}
            columns={columns}
            keyExtractor={(session) => session.id}
            onRowClick={(session) => router.push(`/ocia-sessions/${session.id}`)}
            currentSort={currentSort || undefined}
            onSortChange={handleSortChange}
            onLoadMore={handleLoadMore}
            hasMore={hasMore}
            emptyState={{
              icon: <Users className="h-16 w-16 mx-auto text-muted-foreground mb-4" />,
              title: hasActiveFilters ? 'No OCIA sessions found' : 'No OCIA sessions yet',
              description: hasActiveFilters
                ? 'Try adjusting your search or filters to find more OCIA sessions.'
                : 'Create your first OCIA session to manage candidates for the Order of Christian Initiation of Adults.',
              action: (
                <div className="flex flex-col sm:flex-row gap-3 justify-center">
                  <Button asChild>
                    <Link href="/ocia-sessions/create">
                      <Plus className="h-4 w-4 mr-2" />
                      Create Your First OCIA Session
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
          <EndOfListMessage show={!hasMore && ociaSessions.length > 0} />
          <ScrollToTopButton />
        </>
      ) : (
        <ContentCard className="text-center py-12">
          <Users className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
          <h3 className="text-lg font-medium mb-2">
            {hasActiveFilters ? 'No OCIA sessions found' : 'No OCIA sessions yet'}
          </h3>
          <p className="text-muted-foreground mb-6">
            {hasActiveFilters
              ? 'Try adjusting your search or filters to find more OCIA sessions.'
              : 'Create your first OCIA session to manage candidates for the Order of Christian Initiation of Adults.'}
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Button asChild>
              <Link href="/ocia-sessions/create">
                <Plus className="h-4 w-4 mr-2" />
                Create Your First OCIA Session
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
        <ListStatsBar title="OCIA Session Overview" stats={statsList} />
      )}

      {/* Delete Confirmation Dialog */}
      <DeleteConfirmationDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        onConfirm={handleDeleteConfirm}
        title={`Delete "${ociaSessionToDelete?.name}"?`}
        description={`Are you sure you want to delete the OCIA session "${ociaSessionToDelete?.name}"? This will unlink all ${ociaSessionToDelete?.candidate_count || 0} candidates from this session. This action cannot be undone.`}
      />
    </div>
  )
}

'use client'

import { useState, useCallback, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import type { GroupBaptismWithNames, GroupBaptismStats } from '@/lib/actions/group-baptisms'
import { deleteGroupBaptism, getGroupBaptisms, type GroupBaptismFilterParams } from '@/lib/actions/group-baptisms'
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

interface GroupBaptismsListClientProps {
  initialData: GroupBaptismWithNames[]
  stats: GroupBaptismStats
  initialHasMore: boolean
}

export function GroupBaptismsListClient({ initialData, stats, initialHasMore }: GroupBaptismsListClientProps) {
  const router = useRouter()
  const searchParams = useSearchParams()

  // Use list filters hook for URL state management
  const filters = useListFilters({
    baseUrl: '/group-baptisms',
    defaultFilters: { status: 'ACTIVE', sort: 'date_asc' }
  })

  // Local state for search value (immediate visual feedback)
  const [searchValue, setSearchValue] = useState(filters.getFilterValue('search'))

  // Debounced search value (delays URL update)
  const debouncedSearchValue = useDebounce(searchValue, SEARCH_DEBOUNCE_MS)

  // Infinite scroll state
  const [groupBaptisms, setGroupBaptisms] = useState(initialData)
  const [offset, setOffset] = useState(LIST_VIEW_PAGE_SIZE)
  const [hasMore, setHasMore] = useState(initialHasMore)
  const [isLoadingMore, setIsLoadingMore] = useState(false)

  // Transform stats for ListStatsBar
  const statsList: ListStat[] = [
    { value: stats.total, label: 'Total Group Baptisms' },
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
  const [groupBaptismToDelete, setGroupBaptismToDelete] = useState<GroupBaptismWithNames | null>(null)

  // Parse current sort from URL
  const currentSort = parseSort(filters.getFilterValue('sort'))

  // Update URL when debounced search value changes
  useEffect(() => {
    filters.updateFilter('search', debouncedSearchValue)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debouncedSearchValue])

  // Reset to initial data when filters change
  useEffect(() => {
    setGroupBaptisms(initialData)
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
      const nextGroupBaptisms = await getGroupBaptisms({
        search: filters.getFilterValue('search'),
        status: filters.getFilterValue('status') as GroupBaptismFilterParams['status'],
        sort: filters.getFilterValue('sort') as GroupBaptismFilterParams['sort'],
        offset: offset,
        limit: INFINITE_SCROLL_LOAD_MORE_SIZE,
        start_date: searchParams.get('start_date') || undefined,
        end_date: searchParams.get('end_date') || undefined
      })

      setGroupBaptisms(prev => [...prev, ...nextGroupBaptisms])
      setOffset(prev => prev + INFINITE_SCROLL_LOAD_MORE_SIZE)
      setHasMore(nextGroupBaptisms.length === INFINITE_SCROLL_LOAD_MORE_SIZE)
    } catch (error) {
      console.error('Failed to load more group baptisms:', error)
      toast.error('Failed to load more group baptisms')
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
    if (!groupBaptismToDelete) return

    try {
      await deleteGroupBaptism(groupBaptismToDelete.id)
      toast.success('Group baptism deleted successfully')
      router.refresh()
    } catch (error) {
      console.error('Failed to delete group baptism:', error)
      toast.error('Failed to delete group baptism. Please try again.')
      throw error
    }
  }

  // Define table columns
  const columns = [
    {
      id: 'baptism-avatars',
      key: 'baptism-avatars',
      header: '',
      cell: (row: GroupBaptismWithNames) => {
        const people = (row.baptisms || [])
          .filter(baptism => baptism.person)
          .map(baptism => ({
            id: baptism.person!.id,
            first_name: baptism.person!.first_name || '',
            last_name: baptism.person!.last_name || '',
            full_name: baptism.person!.full_name,
            avatar_url: baptism.person!.avatar_url
          }))

        return people.length > 0 ? (
          <PersonAvatarGroup people={people} type="group" maxDisplay={5} size="sm" />
        ) : (
          <Users className="h-4 w-4 text-muted-foreground" />
        )
      },
      enableSorting: false
    },
    buildWhoColumn<GroupBaptismWithNames>({
      header: 'Group Name',
      getName: (gb) => gb.name,
      getStatus: (gb) => gb.status || 'PLANNING',
      sortable: true
    }),
    buildWhenColumn<GroupBaptismWithNames>({
      getDate: (gb) => gb.group_baptism_event?.start_date || null,
      getTime: (gb) => gb.group_baptism_event?.start_time || null,
      sortable: true
    }),
    buildWhereColumn<GroupBaptismWithNames>({
      getLocation: (gb) => gb.group_baptism_event?.location || null,
      hiddenOn: 'lg'
    }),
    buildActionsColumn<GroupBaptismWithNames>({
      baseUrl: '/group-baptisms',
      onDelete: (gb) => {
        setGroupBaptismToDelete(gb)
        setDeleteDialogOpen(true)
      },
      getDeleteMessage: (gb) =>
        `Are you sure you want to delete the group baptism "${gb.name}"? This will also delete all ${gb.baptism_count || 0} individual baptism records in this group. This action cannot be undone.`
    })
  ]

  return (
    <div className="space-y-6">
      {/* Search and Filters */}
      <SearchCard title="Search Group Baptisms">
        <div className="space-y-4">
          {/* Main Search and Status Row - Inline */}
          <div className="flex flex-col sm:flex-row sm:items-center gap-4">
            {/* Search Input */}
            <div className="flex-1">
              <ClearableSearchInput
                value={searchValue}
                onChange={setSearchValue}
                placeholder="Search by group name..."
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

      {/* Group Baptisms Table */}
      {groupBaptisms.length > 0 ? (
        <>
          <DataTable
            data={groupBaptisms}
            columns={columns}
            keyExtractor={(gb) => gb.id}
            onRowClick={(gb) => router.push(`/group-baptisms/${gb.id}`)}
            currentSort={currentSort || undefined}
            onSortChange={handleSortChange}
            onLoadMore={handleLoadMore}
            hasMore={hasMore}
            emptyState={{
              icon: <Users className="h-16 w-16 mx-auto text-muted-foreground mb-4" />,
              title: hasActiveFilters ? 'No group baptisms found' : 'No group baptisms yet',
              description: hasActiveFilters
                ? 'Try adjusting your search or filters to find more group baptisms.'
                : 'Create your first group baptism to manage ceremonies with multiple children baptized together.',
              action: (
                <div className="flex flex-col sm:flex-row gap-3 justify-center">
                  <Button asChild>
                    <Link href="/group-baptisms/create">
                      <Plus className="h-4 w-4 mr-2" />
                      Create Your First Group Baptism
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
          <EndOfListMessage show={!hasMore && groupBaptisms.length > 0} />
          <ScrollToTopButton />
        </>
      ) : (
        <ContentCard className="text-center py-12">
          <Users className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
          <h3 className="text-lg font-medium mb-2">
            {hasActiveFilters ? 'No group baptisms found' : 'No group baptisms yet'}
          </h3>
          <p className="text-muted-foreground mb-6">
            {hasActiveFilters
              ? 'Try adjusting your search or filters to find more group baptisms.'
              : 'Create your first group baptism to manage ceremonies with multiple children baptized together.'}
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Button asChild>
              <Link href="/group-baptisms/create">
                <Plus className="h-4 w-4 mr-2" />
                Create Your First Group Baptism
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
        <ListStatsBar title="Group Baptism Overview" stats={statsList} />
      )}

      {/* Delete Confirmation Dialog */}
      <DeleteConfirmationDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        onConfirm={handleDeleteConfirm}
        title={`Delete "${groupBaptismToDelete?.name}"?`}
        description={`Are you sure you want to delete the group baptism "${groupBaptismToDelete?.name}"? This will also delete all ${groupBaptismToDelete?.baptism_count || 0} individual baptism records in this group. This action cannot be undone.`}
      />
    </div>
  )
}

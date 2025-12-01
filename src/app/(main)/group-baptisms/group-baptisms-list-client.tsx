'use client'

import { useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import type { GroupBaptismWithNames, GroupBaptismStats } from '@/lib/actions/group-baptisms'
import { deleteGroupBaptism } from '@/lib/actions/group-baptisms'
import { DataTable } from '@/components/data-table/data-table'
import { ClearableSearchInput } from '@/components/clearable-search-input'
import { ScrollToTopButton } from '@/components/scroll-to-top-button'
import { DeleteConfirmationDialog } from '@/components/delete-confirmation-dialog'
import { AdvancedSearch } from '@/components/advanced-search'
import { SearchCard } from "@/components/search-card"
import { ContentCard } from "@/components/content-card"
import { ListStatsBar, type ListStat } from "@/components/list-stats-bar"
import { PersonAvatarGroup } from "@/components/person-avatar-group"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { Plus, Users, Filter } from "lucide-react"
import { toast } from "sonner"
import { MODULE_STATUS_VALUES } from "@/lib/constants"
import { toLocalDateString } from "@/lib/utils/formatters"
import { useListFilters } from "@/hooks/use-list-filters"
import {
  buildWhoColumn,
  buildWhenColumn,
  buildWhereColumn,
  buildActionsColumn
} from '@/lib/utils/table-columns'

interface GroupBaptismsListClientProps {
  initialData: GroupBaptismWithNames[]
  stats: GroupBaptismStats
}

export function GroupBaptismsListClient({ initialData, stats }: GroupBaptismsListClientProps) {
  const router = useRouter()
  const searchParams = useSearchParams()

  // Use list filters hook for URL state management
  const filters = useListFilters({
    baseUrl: '/group-baptisms',
    defaultFilters: { status: 'ACTIVE', sort: 'date_asc' }
  })

  // Local state for search value (synced with URL)
  const [searchValue, setSearchValue] = useState(filters.getFilterValue('search'))

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
          {/* Main Search Row */}
          <ClearableSearchInput
            value={searchValue}
            onChange={(value) => {
              setSearchValue(value)
              filters.updateFilter('search', value)
            }}
            placeholder="Search by group name..."
            className="w-full"
          />

          {/* Advanced Search Collapsible */}
          <AdvancedSearch
            statusFilter={{
              value: filters.getFilterValue('status'),
              onChange: (value) => filters.updateFilter('status', value),
              statusValues: MODULE_STATUS_VALUES
            }}
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
      {initialData.length > 0 ? (
        <>
          <DataTable
            data={initialData}
            columns={columns}
            keyExtractor={(gb) => gb.id}
            onRowClick={(gb) => router.push(`/group-baptisms/${gb.id}`)}
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

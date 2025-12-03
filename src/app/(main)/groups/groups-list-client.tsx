'use client'

import { useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import type { Group } from '@/lib/actions/groups'
import type { GroupStats } from '@/lib/actions/groups'
import { deleteGroup } from '@/lib/actions/groups'
import { DataTable } from '@/components/data-table/data-table'
import type { DataTableColumn } from '@/components/data-table/data-table'
import { ClearableSearchInput } from '@/components/clearable-search-input'
import { ScrollToTopButton } from '@/components/scroll-to-top-button'
import { DeleteConfirmationDialog } from '@/components/delete-confirmation-dialog'
import { SearchCard } from "@/components/search-card"
import { ContentCard } from "@/components/content-card"
import { ListStatsBar, type ListStat } from "@/components/list-stats-bar"
import { StatusFilter } from "@/components/status-filter"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { Plus, Users, Filter } from "lucide-react"
import { toast } from "sonner"
import { useListFilters } from "@/hooks/use-list-filters"
import { buildActionsColumn } from '@/lib/utils/table-columns'
import { parseSort, formatSort } from '@/lib/utils/sort-utils'
import { GROUP_STATUS_VALUES } from "@/lib/constants"

interface GroupsListClientProps {
  initialData: Group[]
  stats: GroupStats
}

export function GroupsListClient({ initialData, stats }: GroupsListClientProps) {
  const router = useRouter()

  // Use list filters hook for URL state management
  const filters = useListFilters({
    baseUrl: '/groups',
    defaultFilters: { status: 'ACTIVE', sort: 'name_asc' }
  })

  // Local state for search value (synced with URL)
  const [searchValue, setSearchValue] = useState(filters.getFilterValue('search'))

  // Parse current sort from URL for DataTable
  const currentSort = parseSort(filters.getFilterValue('sort'))

  // Handle sort change from DataTable column headers
  const handleSortChange = useCallback((column: string, direction: 'asc' | 'desc' | null) => {
    const sortValue = formatSort(column, direction)
    filters.updateFilter('sort', sortValue)
  }, [filters])

  // Transform stats for ListStatsBar
  const statsList: ListStat[] = [
    { value: stats.total, label: 'Total Groups' },
    { value: stats.filtered, label: 'Filtered Results' }
  ]

  // Delete dialog state
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [groupToDelete, setGroupToDelete] = useState<Group | null>(null)

  // Clear all filters
  const handleClearFilters = () => {
    setSearchValue('')
    filters.clearFilters()
  }

  // Check if any filters are active
  const hasActiveFilters = filters.hasActiveFilters

  // Handle delete confirmation
  const handleDeleteConfirm = async () => {
    if (!groupToDelete) return

    try {
      await deleteGroup(groupToDelete.id)
      toast.success('Group deleted successfully')
      router.refresh()
    } catch (error) {
      console.error('Failed to delete group:', error)
      toast.error('Failed to delete group. Please try again.')
      throw error
    }
  }

  // Define table columns
  const columns: DataTableColumn<Group>[] = [
    {
      key: 'name',
      header: 'Name',
      cell: (group) => (
        <span className="text-sm font-medium">{group.name}</span>
      ),
      className: 'min-w-[150px]',
      sortable: true
    },
    {
      key: 'description',
      header: 'Description',
      cell: (group) => {
        if (!group.description) {
          return <span className="text-muted-foreground text-sm">No description</span>
        }
        return (
          <span className="text-sm line-clamp-2">{group.description}</span>
        )
      },
      className: 'min-w-[200px] max-w-[400px]',
      hiddenOn: 'md'
    },
    {
      key: 'status',
      header: 'Status',
      cell: (group) => (
        <span className={`text-sm ${group.is_active ? 'text-foreground' : 'text-muted-foreground'}`}>
          {group.is_active ? 'Active' : 'Inactive'}
        </span>
      ),
      className: 'min-w-[100px]',
      hiddenOn: 'lg'
    },
    buildActionsColumn<Group>({
      baseUrl: '/groups',
      onDelete: (group) => {
        setGroupToDelete(group)
        setDeleteDialogOpen(true)
      },
      getDeleteMessage: (group) =>
        `Are you sure you want to delete ${group.name}?`
    })
  ]

  return (
    <div className="space-y-6">
      {/* Search and Filters */}
      <SearchCard title="Search Groups">
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
              placeholder="Search by name or description..."
              className="w-full"
            />
          </div>

          {/* Status Filter - Inline */}
          <div className="w-full sm:w-[200px]">
            <StatusFilter
              value={filters.getFilterValue('status')}
              onChange={(value) => filters.updateFilter('status', value)}
              statusValues={GROUP_STATUS_VALUES}
              hideLabel
            />
          </div>
        </div>
      </SearchCard>

      {/* Groups Table */}
      {initialData.length > 0 ? (
        <>
          <DataTable
            data={initialData}
            columns={columns}
            keyExtractor={(group) => group.id}
            onRowClick={(group) => router.push(`/groups/${group.id}`)}
            currentSort={currentSort || undefined}
            onSortChange={handleSortChange}
            emptyState={{
              icon: <Users className="h-16 w-16 mx-auto text-muted-foreground mb-4" />,
              title: hasActiveFilters ? 'No groups found' : 'No groups yet',
              description: hasActiveFilters
                ? 'Try adjusting your search to find more groups.'
                : 'Create your first group to start managing ministry groups.',
              action: (
                <div className="flex flex-col sm:flex-row gap-3 justify-center">
                  <Button asChild>
                    <Link href="/groups/create">
                      <Plus className="h-4 w-4 mr-2" />
                      Create Your First Group
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
            {hasActiveFilters ? 'No groups found' : 'No groups yet'}
          </h3>
          <p className="text-muted-foreground mb-6">
            {hasActiveFilters
              ? 'Try adjusting your search to find more groups.'
              : 'Create and manage groups of people who can be scheduled together for liturgical services.'}
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Button asChild>
              <Link href="/groups/create">
                <Plus className="h-4 w-4 mr-2" />
                Create Your First Group
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
        <ListStatsBar title="Group Overview" stats={statsList} />
      )}

      {/* Delete Confirmation Dialog */}
      <DeleteConfirmationDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        onConfirm={handleDeleteConfirm}
        title="Delete Group"
        description={
          groupToDelete
            ? `Are you sure you want to delete ${groupToDelete.name}? This action cannot be undone.`
            : 'Are you sure you want to delete this group? This action cannot be undone.'
        }
        actionLabel="Delete"
      />
    </div>
  )
}

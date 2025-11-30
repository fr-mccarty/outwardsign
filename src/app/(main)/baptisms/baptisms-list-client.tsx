'use client'

import { useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import type { BaptismWithNames, BaptismStats } from '@/lib/actions/baptisms'
import { deleteBaptism } from '@/lib/actions/baptisms'
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
import { Plus, Droplet, Filter } from "lucide-react"
import { toast } from "sonner"
import { MODULE_STATUS_VALUES, STANDARD_SORT_OPTIONS } from "@/lib/constants"
import { toLocalDateString } from "@/lib/utils/formatters"
import { useListFilters } from "@/hooks/use-list-filters"
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
}

export function BaptismsListClient({ initialData, stats }: BaptismsListClientProps) {
  const router = useRouter()
  const searchParams = useSearchParams()

  // Use list filters hook for URL state management
  const filters = useListFilters({
    baseUrl: '/baptisms',
    defaultFilters: { status: 'all', sort: 'date_asc' }
  })

  // Local state for search value (synced with URL)
  const [searchValue, setSearchValue] = useState(filters.getFilterValue('search'))

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
    buildWhoColumn<BaptismWithNames>({
      getName: (baptism) => baptism.child?.full_name || '',
      getStatus: (baptism) => baptism.status || 'PLANNING',
      fallback: 'No child assigned',
      sortable: true
    }),
    buildWhenColumn<BaptismWithNames>({
      getDate: (baptism) => baptism.baptism_event?.start_date || null,
      getTime: (baptism) => baptism.baptism_event?.start_time || null,
      sortable: true
    }),
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
      <SearchCard modulePlural="Baptisms" moduleSingular="Baptism">
        <div className="space-y-4">
          {/* Main Search Row */}
          <ClearableSearchInput
            value={searchValue}
            onChange={(value) => {
              setSearchValue(value)
              filters.updateFilter('search', value)
            }}
            placeholder="Search by child name..."
            className="w-full"
          />

          {/* Advanced Search Collapsible */}
          <AdvancedSearch
            statusFilter={{
              value: filters.getFilterValue('status'),
              onChange: (value) => filters.updateFilter('status', value),
              statusValues: MODULE_STATUS_VALUES
            }}
            sortFilter={{
              value: filters.getFilterValue('sort'),
              onChange: (value) => filters.updateFilter('sort', value),
              sortOptions: STANDARD_SORT_OPTIONS
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

      {/* Baptisms Table */}
      {initialData.length > 0 ? (
        <>
          <DataTable
            data={initialData}
            columns={columns}
            keyExtractor={(baptism) => baptism.id}
            onRowClick={(baptism) => router.push(`/baptisms/${baptism.id}`)}
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

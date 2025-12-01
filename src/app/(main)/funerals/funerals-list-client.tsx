'use client'

import { useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import type { FuneralWithNames, FuneralStats } from '@/lib/actions/funerals'
import { deleteFuneral } from '@/lib/actions/funerals'
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
import { Plus, Cross, Filter } from "lucide-react"
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

interface FuneralsListClientProps {
  initialData: FuneralWithNames[]
  stats: FuneralStats
}

export function FuneralsListClient({ initialData, stats }: FuneralsListClientProps) {
  const router = useRouter()
  const searchParams = useSearchParams()

  // Use list filters hook for URL state management
  const filters = useListFilters({
    baseUrl: '/funerals',
    defaultFilters: { status: 'ACTIVE', sort: 'date_asc' }
  })

  // Local state for search value (synced with URL)
  const [searchValue, setSearchValue] = useState(filters.getFilterValue('search'))

  // Transform stats for ListStatsBar
  const statsList: ListStat[] = [
    { value: stats.total, label: 'Total Funerals' },
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
  const [funeralToDelete, setFuneralToDelete] = useState<FuneralWithNames | null>(null)

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
    if (!funeralToDelete) return

    try {
      await deleteFuneral(funeralToDelete.id)
      toast.success('Funeral deleted successfully')
      router.refresh()
    } catch (error) {
      console.error('Failed to delete funeral:', error)
      toast.error('Failed to delete funeral. Please try again.')
      throw error
    }
  }

  // Define table columns using column builders
  const columns = [
    buildAvatarColumn<FuneralWithNames>({
      people: (funeral) => funeral.deceased ? [{
        id: funeral.deceased.id,
        first_name: funeral.deceased.first_name,
        last_name: funeral.deceased.last_name,
        full_name: funeral.deceased.full_name,
        avatar_url: funeral.deceased.avatar_url
      }] : [],
      type: 'single',
      size: 'md',
      hiddenOn: 'sm'
    }),
    buildWhoColumn<FuneralWithNames>({
      header: 'Deceased',
      getName: (funeral) => funeral.deceased?.full_name || '',
      getStatus: (funeral) => funeral.status || 'PLANNING',
      fallback: 'No deceased assigned',
      sortable: true
    }),
    buildWhenColumn<FuneralWithNames>({
      getDate: (funeral) => funeral.funeral_event?.start_date || null,
      getTime: (funeral) => funeral.funeral_event?.start_time || null,
      sortable: true
    }),
    buildWhereColumn<FuneralWithNames>({
      getLocation: (funeral) => funeral.funeral_event?.location || null,
      hiddenOn: 'lg'
    }),
    buildActionsColumn<FuneralWithNames>({
      baseUrl: '/funerals',
      onDelete: (funeral) => {
        setFuneralToDelete(funeral)
        setDeleteDialogOpen(true)
      },
      getDeleteMessage: (funeral) =>
        `Are you sure you want to delete the funeral for ${funeral.deceased?.full_name || 'this person'}?`
    })
  ]

  return (
    <div className="space-y-6">
      {/* Search and Filters */}
      <SearchCard title="Search Funerals">
        <div className="space-y-4">
          {/* Main Search Row */}
          <ClearableSearchInput
            value={searchValue}
            onChange={(value) => {
              setSearchValue(value)
              filters.updateFilter('search', value)
            }}
            placeholder="Search by deceased or family contact name..."
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

      {/* Funerals Table */}
      {initialData.length > 0 ? (
        <>
          <DataTable
            data={initialData}
            columns={columns}
            keyExtractor={(funeral) => funeral.id}
            onRowClick={(funeral) => router.push(`/funerals/${funeral.id}`)}
            emptyState={{
              icon: <Cross className="h-16 w-16 mx-auto text-muted-foreground mb-4" />,
              title: hasActiveFilters ? 'No funerals found' : 'No funerals yet',
              description: hasActiveFilters
                ? 'Try adjusting your search or filters to find more funerals.'
                : 'Create your first funeral to start managing funeral services in your parish.',
              action: (
                <div className="flex flex-col sm:flex-row gap-3 justify-center">
                  <Button asChild>
                    <Link href="/funerals/create">
                      <Plus className="h-4 w-4 mr-2" />
                      Create Your First Funeral
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
          <Cross className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
          <h3 className="text-lg font-medium mb-2">
            {hasActiveFilters ? 'No funerals found' : 'No funerals yet'}
          </h3>
          <p className="text-muted-foreground mb-6">
            {hasActiveFilters
              ? 'Try adjusting your search or filters to find more funerals.'
              : 'Create your first funeral to start managing funeral services in your parish.'}
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Button asChild>
              <Link href="/funerals/create">
                <Plus className="h-4 w-4 mr-2" />
                Create Your First Funeral
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
        <ListStatsBar title="Funeral Overview" stats={statsList} />
      )}

      {/* Delete Confirmation Dialog */}
      <DeleteConfirmationDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        onConfirm={handleDeleteConfirm}
        title="Delete Funeral"
        description={
          funeralToDelete
            ? `Are you sure you want to delete the funeral for ${funeralToDelete.deceased?.full_name || 'this person'}? This action cannot be undone.`
            : 'Are you sure you want to delete this funeral? This action cannot be undone.'
        }
        actionLabel="Delete"
      />
    </div>
  )
}

'use client'

import { useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import type { WeddingWithNames, WeddingStats } from '@/lib/actions/weddings'
import { deleteWedding } from '@/lib/actions/weddings'
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
import { Plus, VenusAndMars, Filter } from "lucide-react"
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

interface WeddingsListClientProps {
  initialData: WeddingWithNames[]
  stats: WeddingStats
}

export function WeddingsListClient({ initialData, stats }: WeddingsListClientProps) {
  const router = useRouter()
  const searchParams = useSearchParams()

  // Use list filters hook for URL state management
  const filters = useListFilters({
    baseUrl: '/weddings',
    defaultFilters: { status: 'ACTIVE', sort: 'date_asc' }
  })

  // Local state for search value (synced with URL)
  const [searchValue, setSearchValue] = useState(filters.getFilterValue('search'))

  // Transform stats for ListStatsBar
  const statsList: ListStat[] = [
    { value: stats.total, label: 'Total Weddings' },
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
  const [weddingToDelete, setWeddingToDelete] = useState<WeddingWithNames | null>(null)

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
    if (!weddingToDelete) return

    try {
      await deleteWedding(weddingToDelete.id)
      toast.success('Wedding deleted successfully')
      router.refresh()
    } catch (error) {
      console.error('Failed to delete wedding:', error)
      toast.error('Failed to delete wedding. Please try again.')
      throw error
    }
  }

  // Define table columns using column builders
  const columns = [
    buildAvatarColumn<WeddingWithNames>({
      people: (wedding) => [wedding.bride, wedding.groom].filter(Boolean) as Array<{
        id: string
        first_name: string
        last_name: string
        full_name: string
        avatar_url?: string | null
      }>,
      type: 'couple',
      size: 'md',
      hiddenOn: 'sm'
    }),
    buildWhoColumn<WeddingWithNames>({
      header: 'Couple',
      getName: (wedding) => {
        const brideName = wedding.bride?.full_name
        const groomName = wedding.groom?.full_name
        if (brideName && groomName) return `${brideName}-${groomName}`
        return brideName || groomName || ''
      },
      getStatus: (wedding) => wedding.status || 'PLANNING',
      fallback: 'No couple assigned',
      sortable: true
    }),
    buildWhenColumn<WeddingWithNames>({
      getDate: (wedding) => wedding.wedding_event?.start_date || null,
      getTime: (wedding) => wedding.wedding_event?.start_time || null,
      sortable: true
    }),
    buildWhereColumn<WeddingWithNames>({
      getLocation: (wedding) => wedding.wedding_event?.location || null,
      hiddenOn: 'lg'
    }),
    buildActionsColumn<WeddingWithNames>({
      baseUrl: '/weddings',
      onDelete: (wedding) => {
        setWeddingToDelete(wedding)
        setDeleteDialogOpen(true)
      },
      getDeleteMessage: (wedding) =>
        `Are you sure you want to delete the wedding for ${wedding.bride?.full_name || ''}${wedding.bride && wedding.groom ? ' and ' : ''}${wedding.groom?.full_name || ''}?`
    })
  ]

  return (
    <div className="space-y-6">
      {/* Search and Filters */}
      <SearchCard title="Search Weddings">
        <div className="space-y-4">
          {/* Main Search Row */}
          <ClearableSearchInput
            value={searchValue}
            onChange={(value) => {
              setSearchValue(value)
              filters.updateFilter('search', value)
            }}
            placeholder="Search by bride or groom name..."
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

      {/* Weddings Table */}
      {initialData.length > 0 ? (
        <>
          <DataTable
            data={initialData}
            columns={columns}
            keyExtractor={(wedding) => wedding.id}
            onRowClick={(wedding) => router.push(`/weddings/${wedding.id}`)}
            emptyState={{
              icon: <VenusAndMars className="h-16 w-16 mx-auto text-muted-foreground mb-4" />,
              title: hasActiveFilters ? 'No weddings found' : 'No weddings yet',
              description: hasActiveFilters
                ? 'Try adjusting your search or filters to find more weddings.'
                : 'Create your first wedding to start managing wedding celebrations in your parish.',
              action: (
                <div className="flex flex-col sm:flex-row gap-3 justify-center">
                  <Button asChild>
                    <Link href="/weddings/create">
                      <Plus className="h-4 w-4 mr-2" />
                      Create Your First Wedding
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
          <VenusAndMars className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
          <h3 className="text-lg font-medium mb-2">
            {hasActiveFilters ? 'No weddings found' : 'No weddings yet'}
          </h3>
          <p className="text-muted-foreground mb-6">
            {hasActiveFilters
              ? 'Try adjusting your search or filters to find more weddings.'
              : 'Create your first wedding to start managing wedding celebrations in your parish.'}
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Button asChild>
              <Link href="/weddings/create">
                <Plus className="h-4 w-4 mr-2" />
                Create Your First Wedding
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
        <ListStatsBar title="Wedding Overview" stats={statsList} />
      )}

      {/* Delete Confirmation Dialog */}
      <DeleteConfirmationDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        onConfirm={handleDeleteConfirm}
        title="Delete Wedding"
        description={
          weddingToDelete
            ? `Are you sure you want to delete the wedding for ${weddingToDelete.bride?.full_name || ''}${weddingToDelete.bride && weddingToDelete.groom ? ' and ' : ''}${weddingToDelete.groom?.full_name || ''}? This action cannot be undone.`
            : 'Are you sure you want to delete this wedding? This action cannot be undone.'
        }
        actionLabel="Delete"
      />
    </div>
  )
}

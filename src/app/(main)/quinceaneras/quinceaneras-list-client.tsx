'use client'

import { useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import type { QuinceaneraWithNames, QuinceaneraStats } from '@/lib/actions/quinceaneras'
import { deleteQuinceanera } from '@/lib/actions/quinceaneras'
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
import { Plus, BookHeart, Filter } from "lucide-react"
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

interface QuinceanerasListClientProps {
  initialData: QuinceaneraWithNames[]
  stats: QuinceaneraStats
}

export function QuinceanerasListClient({ initialData, stats }: QuinceanerasListClientProps) {
  const router = useRouter()
  const searchParams = useSearchParams()

  // Use list filters hook for URL state management
  const filters = useListFilters({
    baseUrl: '/quinceaneras',
    defaultFilters: { status: 'all', sort: 'date_asc' }
  })

  // Local state for search value (synced with URL)
  const [searchValue, setSearchValue] = useState(filters.getFilterValue('search'))

  // Transform stats for ListStatsBar
  const statsList: ListStat[] = [
    { value: stats.total, label: 'Total Quinceañeras' },
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
  const [quinceaneraToDelete, setQuinceaneraToDelete] = useState<QuinceaneraWithNames | null>(null)

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
    if (!quinceaneraToDelete) return

    try {
      await deleteQuinceanera(quinceaneraToDelete.id)
      toast.success('Quinceañera deleted successfully')
      router.refresh()
    } catch (error) {
      console.error('Failed to delete quinceañera:', error)
      toast.error('Failed to delete quinceañera. Please try again.')
      throw error
    }
  }

  // Define table columns using column builders
  const columns = [
    buildAvatarColumn<QuinceaneraWithNames>({
      people: (quinceanera) => quinceanera.quinceanera ? [{
        id: quinceanera.quinceanera.id,
        first_name: quinceanera.quinceanera.first_name,
        last_name: quinceanera.quinceanera.last_name,
        full_name: quinceanera.quinceanera.full_name,
        avatar_url: quinceanera.quinceanera.avatar_url
      }] : [],
      type: 'single',
      size: 'md',
      hiddenOn: 'sm'
    }),
    buildWhoColumn<QuinceaneraWithNames>({
      getName: (quinceanera) => quinceanera.quinceanera?.full_name || '',
      getStatus: (quinceanera) => quinceanera.status || 'PLANNING',
      fallback: 'No quinceañera assigned',
      sortable: true
    }),
    buildWhenColumn<QuinceaneraWithNames>({
      getDate: (quinceanera) => quinceanera.quinceanera_event?.start_date || null,
      getTime: (quinceanera) => quinceanera.quinceanera_event?.start_time || null,
      sortable: true
    }),
    buildWhereColumn<QuinceaneraWithNames>({
      getLocation: (quinceanera) => quinceanera.quinceanera_event?.location || null,
      hiddenOn: 'lg'
    }),
    buildActionsColumn<QuinceaneraWithNames>({
      baseUrl: '/quinceaneras',
      onDelete: (quinceanera) => {
        setQuinceaneraToDelete(quinceanera)
        setDeleteDialogOpen(true)
      },
      getDeleteMessage: (quinceanera) =>
        `Are you sure you want to delete the quinceañera for ${quinceanera.quinceanera?.full_name || 'this person'}?`
    })
  ]

  return (
    <div className="space-y-6">
      {/* Search and Filters */}
      <SearchCard modulePlural="Quinceañeras" moduleSingular="Quinceañera">
        <div className="space-y-4">
          {/* Main Search Row */}
          <ClearableSearchInput
            value={searchValue}
            onChange={(value) => {
              setSearchValue(value)
              filters.updateFilter('search', value)
            }}
            placeholder="Search by quinceañera or family contact name..."
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

      {/* Quinceañeras Table */}
      {initialData.length > 0 ? (
        <>
          <DataTable
            data={initialData}
            columns={columns}
            keyExtractor={(quinceanera) => quinceanera.id}
            onRowClick={(quinceanera) => router.push(`/quinceaneras/${quinceanera.id}`)}
            emptyState={{
              icon: <BookHeart className="h-16 w-16 mx-auto text-muted-foreground mb-4" />,
              title: hasActiveFilters ? 'No quinceañeras found' : 'No quinceañeras yet',
              description: hasActiveFilters
                ? 'Try adjusting your search or filters to find more quinceañeras.'
                : 'Create your first quinceañera to start managing celebrations in your parish.',
              action: (
                <div className="flex flex-col sm:flex-row gap-3 justify-center">
                  <Button asChild>
                    <Link href="/quinceaneras/create">
                      <Plus className="h-4 w-4 mr-2" />
                      Create Your First Quinceañera
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
          <BookHeart className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
          <h3 className="text-lg font-medium mb-2">
            {hasActiveFilters ? 'No quinceañeras found' : 'No quinceañeras yet'}
          </h3>
          <p className="text-muted-foreground mb-6">
            {hasActiveFilters
              ? 'Try adjusting your search or filters to find more quinceañeras.'
              : 'Create your first quinceañera to start managing celebrations in your parish.'}
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Button asChild>
              <Link href="/quinceaneras/create">
                <Plus className="h-4 w-4 mr-2" />
                Create Your First Quinceañera
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
        <ListStatsBar title="Quinceañera Overview" stats={statsList} />
      )}

      {/* Delete Confirmation Dialog */}
      <DeleteConfirmationDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        onConfirm={handleDeleteConfirm}
        title="Delete Quinceañera"
        description={
          quinceaneraToDelete
            ? `Are you sure you want to delete the quinceañera for ${quinceaneraToDelete.quinceanera?.full_name || 'this person'}? This action cannot be undone.`
            : 'Are you sure you want to delete this quinceañera? This action cannot be undone.'
        }
        actionLabel="Delete"
      />
    </div>
  )
}

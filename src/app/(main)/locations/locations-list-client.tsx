'use client'

import { useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import type { Location } from '@/lib/actions/locations'
import type { LocationStats } from '@/lib/actions/locations'
import { deleteLocation } from '@/lib/actions/locations'
import { DataTable } from '@/components/data-table/data-table'
import type { DataTableColumn } from '@/components/data-table/data-table'
import { ClearableSearchInput } from '@/components/clearable-search-input'
import { ScrollToTopButton } from '@/components/scroll-to-top-button'
import { DeleteConfirmationDialog } from '@/components/delete-confirmation-dialog'
import { AdvancedSearch } from '@/components/advanced-search'
import { SearchCard } from "@/components/search-card"
import { ContentCard } from "@/components/content-card"
import { ListStatsBar, type ListStat } from "@/components/list-stats-bar"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { Plus, Building, Filter, MapPin, Phone } from "lucide-react"
import { toast } from "sonner"
import { useListFilters } from "@/hooks/use-list-filters"
import { buildActionsColumn } from '@/lib/utils/table-columns'
import { parseSort, formatSort } from '@/lib/utils/sort-utils'

interface LocationsListClientProps {
  initialData: Location[]
  stats: LocationStats
}

const LOCATION_SORT_OPTIONS = [
  { value: 'name_asc', label: 'Name (A-Z)' },
  { value: 'name_desc', label: 'Name (Z-A)' },
  { value: 'created_asc', label: 'Oldest First' },
  { value: 'created_desc', label: 'Newest First' }
]

export function LocationsListClient({ initialData, stats }: LocationsListClientProps) {
  const router = useRouter()

  // Use list filters hook for URL state management
  const filters = useListFilters({
    baseUrl: '/locations',
    defaultFilters: { sort: 'name_asc' }
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
    { value: stats.total, label: 'Total Locations' },
    { value: stats.filtered, label: 'Filtered Results' }
  ]

  // Delete dialog state
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [locationToDelete, setLocationToDelete] = useState<Location | null>(null)

  // Clear all filters
  const handleClearFilters = () => {
    setSearchValue('')
    filters.clearFilters()
  }

  // Check if any filters are active
  const hasActiveFilters = filters.hasActiveFilters

  // Handle delete confirmation
  const handleDeleteConfirm = async () => {
    if (!locationToDelete) return

    try {
      await deleteLocation(locationToDelete.id)
      toast.success('Location deleted successfully')
      router.refresh()
    } catch (error) {
      console.error('Failed to delete location:', error)
      toast.error('Failed to delete location. Please try again.')
      throw error
    }
  }

  // Define table columns
  const columns: DataTableColumn<Location>[] = [
    {
      key: 'name',
      header: 'Name',
      cell: (location) => (
        <span className="text-sm font-medium">{location.name}</span>
      ),
      className: 'min-w-[150px]',
      sortable: true
    },
    {
      key: 'address',
      header: 'Address',
      cell: (location) => {
        const addressParts = [location.street, location.city, location.state].filter(Boolean)
        if (addressParts.length === 0) {
          return <span className="text-muted-foreground text-sm">No address</span>
        }
        return (
          <div className="flex items-start gap-2">
            <MapPin className="h-3 w-3 text-muted-foreground mt-0.5 flex-shrink-0" />
            <span className="text-sm truncate">{addressParts.join(', ')}</span>
          </div>
        )
      },
      className: 'min-w-[200px] max-w-[300px]',
      hiddenOn: 'md'
    },
    {
      key: 'phone',
      header: 'Phone',
      cell: (location) => {
        if (!location.phone_number) {
          return <span className="text-muted-foreground text-sm">—</span>
        }
        return (
          <div className="flex items-center gap-2">
            <Phone className="h-3 w-3 text-muted-foreground flex-shrink-0" />
            <span className="text-sm">{location.phone_number}</span>
          </div>
        )
      },
      className: 'min-w-[120px]',
      hiddenOn: 'lg'
    },
    buildActionsColumn<Location>({
      baseUrl: '/locations',
      onDelete: (location) => {
        setLocationToDelete(location)
        setDeleteDialogOpen(true)
      },
      getDeleteMessage: (location) =>
        `Are you sure you want to delete ${location.name}?`
    })
  ]

  return (
    <div className="space-y-6">
      {/* Search and Filters */}
      <SearchCard title="Search Locations">
        <div className="space-y-4">
          {/* Main Search Row */}
          <ClearableSearchInput
            value={searchValue}
            onChange={(value) => {
              setSearchValue(value)
              filters.updateFilter('search', value)
            }}
            placeholder="Search by name, description, or city..."
            className="w-full"
          />

          {/* Advanced Search Collapsible */}
          <AdvancedSearch />
        </div>
      </SearchCard>

      {/* Locations Table */}
      {initialData.length > 0 ? (
        <>
          <DataTable
            data={initialData}
            columns={columns}
            keyExtractor={(location) => location.id}
            onRowClick={(location) => router.push(`/locations/${location.id}`)}
            currentSort={currentSort || undefined}
            onSortChange={handleSortChange}
            emptyState={{
              icon: <Building className="h-16 w-16 mx-auto text-muted-foreground mb-4" />,
              title: hasActiveFilters ? 'No locations found' : 'No locations yet',
              description: hasActiveFilters
                ? 'Try adjusting your search to find more locations.'
                : 'Create your first location to start managing parish venues.',
              action: (
                <div className="flex flex-col sm:flex-row gap-3 justify-center">
                  <Button asChild>
                    <Link href="/locations/create">
                      <Plus className="h-4 w-4 mr-2" />
                      Create Your First Location
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
          <Building className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
          <h3 className="text-lg font-medium mb-2">
            {hasActiveFilters ? 'No locations found' : 'No locations yet'}
          </h3>
          <p className="text-muted-foreground mb-6">
            {hasActiveFilters
              ? 'Try adjusting your search to find more locations.'
              : 'Create your first location to start managing parish venues.'}
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Button asChild>
              <Link href="/locations/create">
                <Plus className="h-4 w-4 mr-2" />
                Create Your First Location
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
        <ListStatsBar title="Location Overview" stats={statsList} />
      )}

      {/* Delete Confirmation Dialog */}
      <DeleteConfirmationDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        onConfirm={handleDeleteConfirm}
        title="Delete Location"
        description={
          locationToDelete
            ? `Are you sure you want to delete ${locationToDelete.name}? This action cannot be undone.`
            : 'Are you sure you want to delete this location? This action cannot be undone.'
        }
        actionLabel="Delete"
      />
    </div>
  )
}

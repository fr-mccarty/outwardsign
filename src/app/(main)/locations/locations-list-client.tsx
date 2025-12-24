'use client'

import { useState, useCallback, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import type { Location } from '@/lib/actions/locations'
import type { LocationStats } from '@/lib/actions/locations'
import { deleteLocation, getLocations, type LocationFilterParams } from '@/lib/actions/locations'
import { LIST_VIEW_PAGE_SIZE, INFINITE_SCROLL_LOAD_MORE_SIZE, SEARCH_DEBOUNCE_MS } from '@/lib/constants'
import { PAGE_SECTIONS_SPACING } from '@/lib/constants/form-spacing'
import { useDebounce } from '@/hooks/use-debounce'
import { DataTable } from '@/components/data-table/data-table'
import type { DataTableColumn } from '@/components/data-table/data-table'
import { ClearableSearchInput } from '@/components/clearable-search-input'
import { ScrollToTopButton } from '@/components/scroll-to-top-button'
import { ConfirmationDialog } from '@/components/confirmation-dialog'
import { AdvancedSearch } from '@/components/advanced-search'
import { SearchCard } from "@/components/search-card"
import { EmptyState } from "@/components/empty-state"
import { ListStatsBar, type ListStat } from "@/components/list-stats-bar"
import { EndOfListMessage } from '@/components/end-of-list-message'
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { Plus, Building, Filter, MapPin, Phone } from "lucide-react"
import { toast } from "sonner"
import { useListFilters } from "@/hooks/use-list-filters"
import { buildActionsColumn } from '@/lib/utils/table-columns'
import { parseSort, formatSort } from '@/lib/utils/sort-utils'
import { useTranslations } from 'next-intl'

interface LocationsListClientProps {
  initialData: Location[]
  stats: LocationStats
  initialHasMore: boolean
}

export function LocationsListClient({ initialData, stats, initialHasMore }: LocationsListClientProps) {
  const router = useRouter()
  const t = useTranslations('locations')
  const tCommon = useTranslations('common')

  // Use list filters hook for URL state management
  const filters = useListFilters({
    baseUrl: '/locations',
    defaultFilters: { sort: 'name_asc' }
  })

  // Local state for search value (immediate visual feedback)
  const [searchValue, setSearchValue] = useState(filters.getFilterValue('search'))

  // Debounced search value (delays URL update)
  const debouncedSearchValue = useDebounce(searchValue, SEARCH_DEBOUNCE_MS)

  // Infinite scroll state
  const [locations, setLocations] = useState(initialData)
  const [offset, setOffset] = useState(LIST_VIEW_PAGE_SIZE)
  const [hasMore, setHasMore] = useState(initialHasMore)
  const [isLoadingMore, setIsLoadingMore] = useState(false)

  // Update URL when debounced search value changes
  useEffect(() => {
    filters.updateFilter('search', debouncedSearchValue)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debouncedSearchValue])

  // Reset to initial data when filters change
  useEffect(() => {
    setLocations(initialData)
    setOffset(LIST_VIEW_PAGE_SIZE)
    setHasMore(initialHasMore)
  }, [initialData, initialHasMore])

  // Parse current sort from URL for DataTable
  const currentSort = parseSort(filters.getFilterValue('sort'))

  // Handle sort change from DataTable column headers
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
      const nextLocations = await getLocations({
        search: filters.getFilterValue('search'),
        sort: filters.getFilterValue('sort') as LocationFilterParams['sort'],
        offset: offset,
        limit: INFINITE_SCROLL_LOAD_MORE_SIZE
      })

      setLocations(prev => [...prev, ...nextLocations])
      setOffset(prev => prev + INFINITE_SCROLL_LOAD_MORE_SIZE)
      setHasMore(nextLocations.length === INFINITE_SCROLL_LOAD_MORE_SIZE)
    } catch (error) {
      console.error('Failed to load more locations:', error)
      toast.error(t('errorLoading'))
    } finally {
      setIsLoadingMore(false)
    }
  }

  // Transform stats for ListStatsBar
  const statsList: ListStat[] = [
    { value: stats.total, label: t('totalLocations') },
    { value: stats.filtered, label: tCommon('filteredResults') }
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
      toast.success(t('locationDeleted'))
      router.refresh()
    } catch (error) {
      console.error('Failed to delete location:', error)
      toast.error(t('errorDeleting'))
      throw error
    }
  }

  // Define table columns
  const columns: DataTableColumn<Location>[] = [
    {
      key: 'name',
      header: t('name'),
      cell: (location) => (
        <span className="text-sm font-medium">{location.name}</span>
      ),
      className: 'min-w-[150px]',
      sortable: true
    },
    {
      key: 'address',
      header: t('address'),
      cell: (location) => {
        const addressParts = [location.street, location.city, location.state].filter(Boolean)
        if (addressParts.length === 0) {
          return <span className="text-muted-foreground text-sm">{t('noAddress')}</span>
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
      header: t('phone'),
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
        t('confirmDelete', { locationName: location.name })
    })
  ]

  return (
    <div className={PAGE_SECTIONS_SPACING}>
      {/* Search and Filters */}
      <SearchCard title={t('searchLocations')}>
        <div className="space-y-4">
          {/* Main Search Row */}
          <ClearableSearchInput
            value={searchValue}
            onChange={(value) => {
              setSearchValue(value)
              filters.updateFilter('search', value)
            }}
            placeholder={t('searchPlaceholder')}
            className="w-full"
          />

          {/* Advanced Search Collapsible */}
          <AdvancedSearch />
        </div>
      </SearchCard>

      {/* Locations Table */}
      {locations.length > 0 ? (
        <>
          <DataTable
            data={locations}
            columns={columns}
            keyExtractor={(location) => location.id}
            onRowClick={(location) => router.push(`/locations/${location.id}`)}
            currentSort={currentSort || undefined}
            onSortChange={handleSortChange}
            onLoadMore={handleLoadMore}
            hasMore={hasMore}
            emptyState={{
              icon: <Building className="h-16 w-16 mx-auto text-muted-foreground mb-4" />,
              title: hasActiveFilters ? t('noLocations') : t('noLocationsYet'),
              description: hasActiveFilters
                ? t('noLocationsMessage')
                : t('noLocationsYetMessage'),
              action: (
                <div className="flex flex-col sm:flex-row gap-3 justify-center">
                  <Button asChild>
                    <Link href="/locations/create">
                      <Plus className="h-4 w-4 mr-2" />
                      {t('createYourFirstLocation')}
                    </Link>
                  </Button>
                  {hasActiveFilters && (
                    <Button variant="outline" onClick={handleClearFilters}>
                      <Filter className="h-4 w-4 mr-2" />
                      {t('clearFilters')}
                    </Button>
                  )}
                </div>
              )
            }}
            stickyHeader
          />
          <EndOfListMessage show={!hasMore && locations.length > 0} />
          <ScrollToTopButton />
        </>
      ) : (
        <EmptyState
          icon={<Building className="h-16 w-16" />}
          title={hasActiveFilters ? t('noLocations') : t('noLocationsYet')}
          description={hasActiveFilters
            ? t('noLocationsMessage')
            : t('noLocationsYetMessage')}
          action={
            <>
              <Button asChild>
                <Link href="/locations/create">
                  <Plus className="h-4 w-4 mr-2" />
                  {t('createYourFirstLocation')}
                </Link>
              </Button>
              {hasActiveFilters && (
                <Button variant="outline" onClick={handleClearFilters}>
                  <Filter className="h-4 w-4 mr-2" />
                  {t('clearFilters')}
                </Button>
              )}
            </>
          }
        />
      )}

      {/* Quick Stats */}
      {stats.total > 0 && (
        <ListStatsBar title={t('locationOverview')} stats={statsList} />
      )}

      {/* Delete Confirmation Dialog */}
      <ConfirmationDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        onConfirm={handleDeleteConfirm}
        title={t('deleteLocation')}
        description={
          locationToDelete
            ? t('confirmDelete', { locationName: locationToDelete.name })
            : t('confirmDeleteGeneric')
        }
        confirmLabel={tCommon('delete')}
      />
    </div>
  )
}

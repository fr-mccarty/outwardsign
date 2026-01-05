'use client'

import { useState, useCallback, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import type { Family, FamilyStats, FamilyFilters } from '@/lib/actions/families'
import { deleteFamily, getFamilies } from '@/lib/actions/families'
import { LIST_VIEW_PAGE_SIZE, INFINITE_SCROLL_LOAD_MORE_SIZE, SEARCH_DEBOUNCE_MS } from '@/lib/constants'
import { PAGE_SECTIONS_SPACING } from '@/lib/constants/form-spacing'
import { useDebounce } from '@/hooks/use-debounce'
import { DataTable } from '@/components/data-table/data-table'
import type { DataTableColumn } from '@/components/data-table/data-table'
import { ClearableSearchInput } from '@/components/clearable-search-input'
import { ScrollToTopButton } from '@/components/scroll-to-top-button'
import { ConfirmationDialog } from '@/components/confirmation-dialog'
import { SearchCard } from "@/components/search-card"
import { EmptyState } from "@/components/empty-state"
import { ListStatsBar, type ListStat } from "@/components/list-stats-bar"
import { EndOfListMessage } from '@/components/end-of-list-message'
import { Button } from "@/components/ui/button"
import { LinkButton } from '@/components/link-button'
import { Plus, Users2, Filter, Check } from "lucide-react"
import { FormInput } from "@/components/form-input"
import { SelectItem } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { toast } from "sonner"
import { useTranslations } from 'next-intl'
import { useListFilters } from "@/hooks/use-list-filters"
import { buildActionsColumn } from '@/lib/utils/table-columns'
import { parseSort, formatSort } from '@/lib/utils/sort-utils'

interface FamiliesListClientProps {
  initialData: Family[]
  stats: FamilyStats
  initialHasMore: boolean
}

export function FamiliesListClient({ initialData, stats, initialHasMore }: FamiliesListClientProps) {
  const router = useRouter()
  const t = useTranslations('families')

  // Use list filters hook for URL state management
  const filters = useListFilters({
    baseUrl: '/families',
    defaultFilters: { sort: 'name_asc' }
  })

  // Local state for search value (immediate visual feedback)
  const [searchValue, setSearchValue] = useState(filters.getFilterValue('search'))

  // Debounced search value (delays URL update)
  const debouncedSearchValue = useDebounce(searchValue, SEARCH_DEBOUNCE_MS)

  // Infinite scroll state
  const [families, setFamilies] = useState(initialData)
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
    setFamilies(initialData)
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
      const nextFamilies = await getFamilies({
        search: filters.getFilterValue('search'),
        sort: filters.getFilterValue('sort') as FamilyFilters['sort'],
        offset: offset,
        limit: INFINITE_SCROLL_LOAD_MORE_SIZE
      })

      setFamilies(prev => [...prev, ...nextFamilies])
      setOffset(prev => prev + INFINITE_SCROLL_LOAD_MORE_SIZE)
      setHasMore(nextFamilies.length === INFINITE_SCROLL_LOAD_MORE_SIZE)
    } catch (error) {
      console.error('Failed to load more families:', error)
      toast.error('Failed to load more families')
    } finally {
      setIsLoadingMore(false)
    }
  }

  // Transform stats for ListStatsBar
  const statsList: ListStat[] = [
    { value: stats.total, label: 'Total Families' },
    { value: stats.filtered, label: 'Filtered Results' }
  ]

  // Delete dialog state
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [familyToDelete, setFamilyToDelete] = useState<Family | null>(null)

  // Clear all filters
  const handleClearFilters = () => {
    setSearchValue('')
    filters.clearFilters()
  }

  // Check if any filters are active
  const hasActiveFilters = filters.hasActiveFilters

  // Handle delete confirmation
  const handleDeleteConfirm = async () => {
    if (!familyToDelete) return

    try {
      await deleteFamily(familyToDelete.id)
      toast.success('Family deleted successfully')
      router.refresh()
    } catch (error) {
      console.error('Failed to delete family:', error)
      toast.error('Failed to delete family. Please try again.')
      throw error
    }
  }

  // Define table columns
  const columns: DataTableColumn<Family>[] = [
    {
      key: 'name',
      header: 'Family Name',
      cell: (family) => (
        <span className="text-sm font-medium">{family.family_name}</span>
      ),
      className: 'min-w-[200px]',
      sortable: true
    },
    {
      key: 'status',
      header: 'Status',
      cell: (family) => (
        <Badge variant={family.active ? 'default' : 'secondary'} className="text-xs">
          {family.active ? (
            <>
              <Check className="h-3 w-3 mr-1" />
              Active
            </>
          ) : (
            'Inactive'
          )}
        </Badge>
      ),
      className: 'min-w-[100px]',
      hiddenOn: 'sm'
    },
    {
      key: 'created',
      header: 'Created',
      cell: (family) => (
        <span className="text-sm text-muted-foreground">
          {new Date(family.created_at).toLocaleDateString()}
        </span>
      ),
      className: 'min-w-[120px]',
      hiddenOn: 'md',
      sortable: true
    },
    buildActionsColumn<Family>({
      baseUrl: '/families',
      onDelete: (family) => {
        setFamilyToDelete(family)
        setDeleteDialogOpen(true)
      },
      getDeleteMessage: (family) =>
        `Are you sure you want to delete the ${family.family_name} family?`
    })
  ]

  return (
    <div className={PAGE_SECTIONS_SPACING}>
      {/* Search and Filters */}
      <SearchCard title="Search Families">
        <div className="flex flex-col sm:flex-row sm:items-center gap-4">
          <div className="flex-1">
            <ClearableSearchInput
              value={searchValue}
              onChange={(value) => {
                setSearchValue(value)
                filters.updateFilter('search', value)
              }}
              placeholder="Search by family name..."
              className="w-full"
            />
          </div>
          {/* Active Filter */}
          <div className="w-[130px]">
            <FormInput
              id="active-filter"
              label={t('statusFilter')}
              hideLabel
              inputType="select"
              value={filters.getFilterValue('active') || 'all'}
              onChange={(value) => filters.updateFilter('active', value === 'all' ? '' : value)}
            >
              <SelectItem value="all">{t('allStatus')}</SelectItem>
              <SelectItem value="active">{t('activeOnly')}</SelectItem>
              <SelectItem value="inactive">{t('inactiveOnly')}</SelectItem>
            </FormInput>
          </div>
        </div>
      </SearchCard>

      {/* Families Table */}
      {families.length > 0 ? (
        <>
          <DataTable
            data={families}
            columns={columns}
            keyExtractor={(family) => family.id}
            onRowClick={(family) => router.push(`/families/${family.id}`)}
            currentSort={currentSort || undefined}
            onSortChange={handleSortChange}
            onLoadMore={handleLoadMore}
            hasMore={hasMore}
            emptyState={{
              icon: <Users2 className="h-16 w-16 mx-auto text-muted-foreground mb-4" />,
              title: hasActiveFilters ? t('noFamilies') : t('noFamiliesYet'),
              description: hasActiveFilters
                ? t('noFamiliesMessage')
                : t('noFamiliesYetMessage'),
              action: (
                <div className="flex flex-col sm:flex-row gap-3 justify-center">
                  <LinkButton href="/families/create">
                    <Plus className="h-4 w-4 mr-2" />
                    {t('createYourFirstFamily')}
                  </LinkButton>
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
          <EndOfListMessage show={!hasMore && families.length > 0} />
          <ScrollToTopButton />
        </>
      ) : (
        <EmptyState
          icon={<Users2 className="h-16 w-16" />}
          title={hasActiveFilters ? t('noFamilies') : t('noFamiliesYet')}
          description={hasActiveFilters
            ? t('noFamiliesMessage')
            : t('noFamiliesYetMessage')}
          action={
            <>
              <LinkButton href="/families/create">
                <Plus className="h-4 w-4 mr-2" />
                {t('createYourFirstFamily')}
              </LinkButton>
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
        <ListStatsBar title="Family Overview" stats={statsList} />
      )}

      {/* Delete Confirmation Dialog */}
      <ConfirmationDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        onConfirm={handleDeleteConfirm}
        title="Delete Family"
        description={
          familyToDelete
            ? `Are you sure you want to delete the ${familyToDelete.family_name} family? This will remove all family member links but will not delete the individual people. This action cannot be undone.`
            : 'Are you sure you want to delete this family? This action cannot be undone.'
        }
        confirmLabel="Delete"
      />
    </div>
  )
}

'use client'

import { useState, useCallback, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import type { MasterEventWithTypeAndCalendarEvent, MasterEventStats, MasterEventFilterParams } from '@/lib/actions/master-events'
import { getAllMasterEvents, deleteEvent } from '@/lib/actions/master-events'
import { LIST_VIEW_PAGE_SIZE, INFINITE_SCROLL_LOAD_MORE_SIZE, SEARCH_DEBOUNCE_MS, LITURGICAL_COLOR_LABELS } from '@/lib/constants'
import { PAGE_SECTIONS_SPACING } from '@/lib/constants/form-spacing'
import { useDebounce } from '@/hooks/use-debounce'
import { DataTable } from '@/components/data-table/data-table'
import { ClearableSearchInput } from '@/components/clearable-search-input'
import { ScrollToTopButton } from '@/components/scroll-to-top-button'
import { ConfirmationDialog } from '@/components/confirmation-dialog'
import { AdvancedSearch } from '@/components/advanced-search'
import { SearchCard } from "@/components/search-card"
import { EmptyState } from "@/components/empty-state"
import { ListStatsBar, type ListStat } from "@/components/list-stats-bar"
import { StatusFilter } from "@/components/status-filter"
import { EndOfListMessage } from '@/components/end-of-list-message'
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { Plus, Church, Filter } from "lucide-react"
import { toast } from "sonner"
import { toLocalDateString } from "@/lib/utils/formatters"
import { useListFilters } from "@/hooks/use-list-filters"
import { parseSort, formatSort } from '@/lib/utils/sort-utils'
import {
  buildWhereColumn,
  buildActionsColumn
} from '@/lib/utils/table-columns'
import { DataTableColumn } from '@/components/data-table/data-table'
import { MODULE_STATUS_COLORS } from '@/lib/constants'
import { getStatusLabel } from '@/lib/content-builders/shared/helpers'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import { useTranslations } from 'next-intl'

const MASTER_EVENT_STATUS_VALUES = ['PLANNING', 'ACTIVE', 'COMPLETED', 'CANCELLED'] as const

interface MassesListClientProps {
  initialData: MasterEventWithTypeAndCalendarEvent[]
  stats: MasterEventStats
}

export function MassLiturgiesListClient({ initialData, stats }: MassesListClientProps) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const t = useTranslations('masses')
  const tCommon = useTranslations('common')

  // Use list filters hook for URL state management
  const filters = useListFilters({
    baseUrl: '/mass-liturgies',
    defaultFilters: { status: 'ACTIVE', sort: 'date_asc' }
  })

  // Local state for search value (immediate visual feedback)
  const [searchValue, setSearchValue] = useState(filters.getFilterValue('search'))

  // Debounced search value (delays URL update)
  const debouncedSearchValue = useDebounce(searchValue, SEARCH_DEBOUNCE_MS)

  // Infinite scroll state
  const [masses, setMasses] = useState(initialData)
  const [offset, setOffset] = useState(LIST_VIEW_PAGE_SIZE)
  const [hasMore, setHasMore] = useState(initialData.length === LIST_VIEW_PAGE_SIZE)
  const [isLoadingMore, setIsLoadingMore] = useState(false)

  // Transform stats for ListStatsBar
  const statsList: ListStat[] = [
    { value: stats.total, label: t('totalMasses') },
    { value: stats.upcoming, label: t('upcoming') },
    { value: stats.past, label: t('past') },
    { value: stats.filtered, label: tCommon('filteredResults') }
  ]

  // Date filters - convert string params to Date objects for DatePickerField
  const startDateParam = filters.getFilterValue('start_date')
  const endDateParam = filters.getFilterValue('end_date')
  const [startDate, setStartDate] = useState<Date | undefined>(
    startDateParam ? new Date(startDateParam) : undefined
  )
  const [endDate, setEndDate] = useState<Date | undefined>(
    endDateParam ? new Date(endDateParam) : undefined
  )

  // Delete dialog state
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [massToDelete, setMassToDelete] = useState<MasterEventWithTypeAndCalendarEvent | null>(null)

  // Update URL when debounced search value changes
  useEffect(() => {
    filters.updateFilter('search', debouncedSearchValue)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debouncedSearchValue])

  // Reset to initial data when filters change
  useEffect(() => {
    setMasses(initialData)
    setOffset(LIST_VIEW_PAGE_SIZE)
    setHasMore(initialData.length === LIST_VIEW_PAGE_SIZE)
  }, [initialData])

  // Sorting state
  const currentSort = parseSort(filters.getFilterValue('sort'))

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
      const nextMasses = await getAllMasterEvents({
        search: filters.getFilterValue('search'),
        systemType: 'mass-liturgy',
        status: filters.getFilterValue('status') as MasterEventFilterParams['status'],
        sort: filters.getFilterValue('sort') as MasterEventFilterParams['sort'],
        offset: offset,
        limit: INFINITE_SCROLL_LOAD_MORE_SIZE,
        startDate: searchParams.get('start_date') || undefined,
        endDate: searchParams.get('end_date') || undefined
      })

      setMasses(prev => [...prev, ...nextMasses])
      setOffset(prev => prev + INFINITE_SCROLL_LOAD_MORE_SIZE)
      setHasMore(nextMasses.length === INFINITE_SCROLL_LOAD_MORE_SIZE)
    } catch (error) {
      console.error('Failed to load more masses:', error)
      toast.error(t('errorLoading'))
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
    if (!massToDelete) return

    try {
      await deleteEvent(massToDelete.id)
      toast.success(t('massDeleted'))
      router.refresh()
    } catch (error) {
      console.error('Failed to delete mass:', error)
      toast.error(t('errorDeleting'))
      throw error
    }
  }

  // Custom "Event Name" column
  const buildMassWhoColumn = (): DataTableColumn<MasterEventWithTypeAndCalendarEvent> => {
    return {
      key: 'who',
      header: t('nameOfMass'),
      cell: (mass) => {
        const status = mass.status || 'PLANNING'
        const statusLabel = getStatusLabel(status, 'en')
        const statusColor = MODULE_STATUS_COLORS[status] || 'bg-muted-foreground/50'

        // Compute simple title from event type name
        const title = mass.event_type?.name || 'Mass'

        return (
          <div className="flex items-start gap-2">
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <div className={`h-2 w-2 rounded-full flex-shrink-0 mt-1.5 ${statusColor}`} />
                </TooltipTrigger>
                <TooltipContent>
                  <p>{statusLabel}</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
            <div className="flex flex-col">
              <span className="text-sm font-medium">
                {title}
              </span>
            </div>
          </div>
        )
      },
      className: 'max-w-[200px] md:max-w-[250px]',
      sortable: true,
      accessorFn: (mass) => mass.event_type?.name || 'Mass'
    }
  }

  // Define table columns using column builders
  const columns: DataTableColumn<MasterEventWithTypeAndCalendarEvent>[] = [
    buildMassWhoColumn(),
    // When column - list all calendar events with date and time
    {
      key: 'when',
      header: 'When',
      cell: (mass) => {
        const calendarEvents = mass.calendar_events || []
        if (calendarEvents.length === 0) {
          return <span className="text-sm text-muted-foreground">No dates set</span>
        }
        return (
          <div className="flex flex-col gap-0.5">
            {calendarEvents.map((ce) => {
              if (!ce.start_datetime) return null
              const date = new Date(ce.start_datetime)
              const dateStr = date.toLocaleDateString('en-US', {
                month: 'short',
                day: 'numeric',
                year: 'numeric'
              })
              const timeStr = date.toLocaleTimeString('en-US', {
                hour: 'numeric',
                minute: '2-digit',
                hour12: true
              })
              return (
                <span key={ce.id} className="text-sm">
                  {dateStr} at {timeStr}
                </span>
              )
            })}
          </div>
        )
      },
      className: 'max-w-[200px]',
      sortable: true,
      accessorFn: (mass) => mass.primary_calendar_event?.start_datetime || ''
    },
    // Liturgical Color column
    {
      key: 'liturgical_color',
      header: 'Color',
      cell: (mass) => {
        const color = mass.liturgical_color
        if (!color || !LITURGICAL_COLOR_LABELS[color]) {
          return <span className="text-sm text-muted-foreground">—</span>
        }
        return (
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <div className={`h-4 w-4 rounded-full bg-liturgy-${color.toLowerCase()}`} />
              </TooltipTrigger>
              <TooltipContent>
                <p>{LITURGICAL_COLOR_LABELS[color].en}</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        )
      },
      className: 'max-w-[60px]',
      sortable: false
    },
    buildWhereColumn<MasterEventWithTypeAndCalendarEvent>({
      getLocation: (mass) => mass.primary_calendar_event?.location || null,
      hiddenOn: 'lg'
    }),
    buildActionsColumn<MasterEventWithTypeAndCalendarEvent>({
      baseUrl: '/mass-liturgies',
      onDelete: (mass) => {
        setMassToDelete(mass)
        setDeleteDialogOpen(true)
      },
      getDeleteMessage: (mass) =>
        `Are you sure you want to delete this ${mass.event_type?.name || 'event'}?`
    })
  ]

  return (
    <div className={PAGE_SECTIONS_SPACING}>
      {/* Search and Filters */}
      <SearchCard title={t('title')}>
        <div className="space-y-4">
          {/* Main Search and Status Row - Inline */}
          <div className="flex flex-col sm:flex-row sm:items-center gap-4">
            {/* Search Input */}
            <div className="flex-1">
              <ClearableSearchInput
                value={searchValue}
                onChange={setSearchValue}
                placeholder={t('searchPlaceholder')}
                className="w-full"
              />
            </div>

            {/* Status Filter - Now Inline */}
            <div className="w-full sm:w-[200px]">
              <StatusFilter
                value={filters.getFilterValue('status')}
                onChange={(value) => filters.updateFilter('status', value)}
                statusValues={MASTER_EVENT_STATUS_VALUES as unknown as string[]}
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

      {/* Masses Table */}
      {masses.length > 0 ? (
        <>
          <DataTable
            data={masses}
            columns={columns}
            keyExtractor={(mass) => mass.id}
            onRowClick={(mass) => router.push(`/mass-liturgies/${mass.id}`)}
            currentSort={currentSort || undefined}
            onSortChange={handleSortChange}
            onLoadMore={handleLoadMore}
            hasMore={hasMore}
            emptyState={{
              icon: <Church className="h-16 w-16 mx-auto text-muted-foreground mb-4" />,
              title: hasActiveFilters ? t('noMasses') : t('noMassesYet'),
              description: hasActiveFilters
                ? t('noMassesMessage')
                : t('noMassesYetMessage'),
              action: (
                <div className="flex flex-col sm:flex-row gap-3 justify-center">
                  <Button asChild>
                    <Link href="/mass-liturgies/create">
                      <Plus className="h-4 w-4 mr-2" />
                      {t('createYourFirstMass')}
                    </Link>
                  </Button>
                  {hasActiveFilters && (
                    <Button variant="outline" onClick={handleClearFilters}>
                      <Filter className="h-4 w-4 mr-2" />
                      {tCommon('clearFilters')}
                    </Button>
                  )}
                </div>
              )
            }}
            stickyHeader
          />
          <EndOfListMessage show={!hasMore && masses.length > 0} />
          <ScrollToTopButton />
        </>
      ) : (
        <EmptyState
          icon={<Church className="h-16 w-16" />}
          title={hasActiveFilters ? t('noMasses') : t('noMassesYet')}
          description={hasActiveFilters
            ? t('noMassesMessage')
            : t('noMassesYetMessage')}
          action={
            <>
              <Button asChild>
                <Link href="/mass-liturgies/create">
                  <Plus className="h-4 w-4 mr-2" />
                  {t('createYourFirstMass')}
                </Link>
              </Button>
              {hasActiveFilters && (
                <Button variant="outline" onClick={handleClearFilters}>
                  <Filter className="h-4 w-4 mr-2" />
                  {tCommon('clearFilters')}
                </Button>
              )}
            </>
          }
        />
      )}

      {/* Quick Stats */}
      {stats.total > 0 && (
        <ListStatsBar title={t('massOverview')} stats={statsList} />
      )}

      {/* Delete Confirmation Dialog */}
      <ConfirmationDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        onConfirm={handleDeleteConfirm}
        title={t('deleteMass')}
        description={
          massToDelete
            ? `Are you sure you want to delete this ${massToDelete.event_type?.name || 'event'}? This action cannot be undone.`
            : t('confirmDeleteGeneric')
        }
        confirmLabel={tCommon('delete')}
      />
    </div>
  )
}

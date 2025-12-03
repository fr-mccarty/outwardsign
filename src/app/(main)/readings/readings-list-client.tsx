'use client'

import { useState, useCallback, useEffect, useMemo, useRef } from 'react'
import { useRouter } from 'next/navigation'
import type { Reading, ReadingStats } from '@/lib/actions/readings'
import { deleteReading, getReadings, type ReadingFilterParams } from '@/lib/actions/readings'
import { LIST_VIEW_PAGE_SIZE, INFINITE_SCROLL_LOAD_MORE_SIZE, SEARCH_DEBOUNCE_MS } from '@/lib/constants'
import { useDebounce } from '@/hooks/use-debounce'
import { DataTable } from '@/components/data-table/data-table'
import type { DataTableColumn } from '@/components/data-table/data-table'
import { ClearableSearchInput } from '@/components/clearable-search-input'
import { ScrollToTopButton } from '@/components/scroll-to-top-button'
import { DeleteConfirmationDialog } from '@/components/delete-confirmation-dialog'
import { SearchCard } from "@/components/search-card"
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible'
import { ChevronDown } from "lucide-react"
import { ContentCard } from "@/components/content-card"
import { ListStatsBar, type ListStat } from "@/components/list-stats-bar"
import { EndOfListMessage } from '@/components/end-of-list-message'
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import Link from "next/link"
import { Plus, BookOpen, Filter, MoreVertical } from "lucide-react"
import { toast } from "sonner"
import { READING_CATEGORIES, READING_CATEGORY_LABELS, LITURGICAL_LANGUAGE_VALUES, LITURGICAL_LANGUAGE_LABELS } from "@/lib/constants"
import { useListFilters } from "@/hooks/use-list-filters"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { parseSort, formatSort } from '@/lib/utils/sort-utils'
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

interface ReadingsListClientProps {
  initialData: Reading[]
  stats: ReadingStats
  initialHasMore: boolean
}

export function ReadingsListClient({ initialData, stats, initialHasMore }: ReadingsListClientProps) {
  const router = useRouter()

  // Use list filters hook for URL state management
  const filters = useListFilters({
    baseUrl: '/readings',
    defaultFilters: { sort: 'created_desc' }
  })

  // Local state for search value (immediate visual feedback)
  const [searchValue, setSearchValue] = useState(filters.getFilterValue('search'))

  // State for advanced filters collapsible
  const [filtersOpen, setFiltersOpen] = useState(false)

  // State for selected categories (array for multi-select)
  const [selectedCategories, setSelectedCategories] = useState<string[]>(() => {
    const categoryParam = filters.getFilterValue('categories')
    return categoryParam ? categoryParam.split(',').filter(Boolean) : []
  })

  // Debounced search value (delays URL update)
  const debouncedSearchValue = useDebounce(searchValue, SEARCH_DEBOUNCE_MS)

  // Infinite scroll state
  const [allReadings, setAllReadings] = useState(initialData)
  const [offset, setOffset] = useState(LIST_VIEW_PAGE_SIZE)
  const [hasMore, setHasMore] = useState(initialHasMore)
  const [isLoadingMore, setIsLoadingMore] = useState(false)

  // Filter readings by selected categories (client-side, similar to picker)
  const readings = useMemo(() => {
    // If no categories selected, show all readings
    if (selectedCategories.length === 0) {
      return allReadings
    }

    // Convert display labels to database keys
    const selectedDatabaseKeys = selectedCategories.map(label => {
      const entry = Object.entries(READING_CATEGORY_LABELS).find(
        ([key, labels]) => labels.en === label
      )
      return entry ? entry[0] : null
    }).filter(Boolean) as string[]

    // Filter readings that have ALL selected categories (AND logic)
    return allReadings.filter(reading => {
      if (!reading.categories || reading.categories.length === 0) {
        return false
      }

      // Get all categories for this reading (stored as database keys)
      const readingDatabaseCategories = new Set<string>()
      reading.categories.forEach(cat => {
        if (cat) {
          readingDatabaseCategories.add(cat.toUpperCase())
        }
      })

      // Check if reading has ALL selected categories
      return selectedDatabaseKeys.every(selectedKey =>
        readingDatabaseCategories.has(selectedKey)
      )
    })
  }, [allReadings, selectedCategories])

  // Update URL when debounced search value changes
  useEffect(() => {
    filters.updateFilter('search', debouncedSearchValue)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debouncedSearchValue])

  // Update URL when categories change
  useEffect(() => {
    filters.updateFilter('categories', selectedCategories.length > 0 ? selectedCategories.join(',') : '')
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedCategories])

  // Reset to initial data when filters change
  useEffect(() => {
    setAllReadings(initialData)
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
  const handleLoadMore = useCallback(async () => {
    if (isLoadingMore || !hasMore) return

    setIsLoadingMore(true)
    try {
      const nextReadings = await getReadings({
        search: filters.getFilterValue('search'),
        language: filters.getFilterValue('language') as ReadingFilterParams['language'],
        sort: filters.getFilterValue('sort') as ReadingFilterParams['sort'],
        offset: offset,
        limit: INFINITE_SCROLL_LOAD_MORE_SIZE
      })

      // Prevent duplicates by checking existing IDs
      setAllReadings(prev => {
        const existingIds = new Set(prev.map(r => r.id))
        const newReadings = nextReadings.filter(r => !existingIds.has(r.id))
        return [...prev, ...newReadings]
      })

      setOffset(prev => prev + INFINITE_SCROLL_LOAD_MORE_SIZE)
      setHasMore(nextReadings.length === INFINITE_SCROLL_LOAD_MORE_SIZE)
    } catch (error) {
      console.error('Failed to load more readings:', error)
      toast.error('Failed to load more readings')
    } finally {
      setIsLoadingMore(false)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isLoadingMore, hasMore, offset])

  // Transform stats for ListStatsBar
  const statsList: ListStat[] = [
    { value: stats.total, label: 'Total Readings' },
    { value: readings.length, label: 'Filtered Results' }
  ]

  // Delete dialog state
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [readingToDelete, setReadingToDelete] = useState<Reading | null>(null)

  // Clear all filters
  const handleClearFilters = () => {
    setSearchValue('')
    setSelectedCategories([])
    filters.clearFilters()
  }

  // Check if any filters are active
  const hasActiveFilters = filters.hasActiveFilters

  // Toggle category selection
  const toggleCategory = (category: string) => {
    setSelectedCategories(prev =>
      prev.includes(category)
        ? prev.filter(c => c !== category)
        : [...prev, category]
    )
  }

  // Get category labels for display
  const categoryLabels = READING_CATEGORIES.map(cat => READING_CATEGORY_LABELS[cat].en)

  // Handle delete confirmation
  const handleDeleteConfirm = async () => {
    if (!readingToDelete) return

    try {
      await deleteReading(readingToDelete.id)
      toast.success('Reading deleted successfully')
      router.refresh()
    } catch (error) {
      console.error('Failed to delete reading:', error)
      toast.error('Failed to delete reading. Please try again.')
      throw error
    }
  }

  // Define table columns
  const columns: DataTableColumn<Reading>[] = [
    // Title (Pericope) Column
    {
      key: 'pericope',
      header: 'Title',
      cell: (reading) => {
        const title = reading.pericope || 'Untitled Reading'
        return (
          <div className="flex flex-col gap-1">
            <span className="text-sm font-medium">{title}</span>
            {reading.language && (
              <span className="text-xs text-muted-foreground">
                {LITURGICAL_LANGUAGE_LABELS[reading.language]?.en || reading.language}
              </span>
            )}
          </div>
        )
      },
      className: 'max-w-[200px] md:max-w-[250px]',
      sortable: true
    },
    // Categories Column
    {
      key: 'categories',
      header: 'Categories',
      cell: (reading) => {
        if (!reading.categories || reading.categories.length === 0) {
          return <span className="text-muted-foreground text-sm">No categories</span>
        }
        return (
          <div className="flex flex-wrap gap-1">
            {reading.categories.slice(0, 2).map((category) => (
              <Badge key={category} variant="secondary" className="text-xs">
                {READING_CATEGORY_LABELS[category]?.en || category}
              </Badge>
            ))}
            {reading.categories.length > 2 && (
              <Badge variant="outline" className="text-xs">
                +{reading.categories.length - 2}
              </Badge>
            )}
          </div>
        )
      },
      className: 'min-w-[150px]',
      hiddenOn: 'lg'
    },
    // Text Preview Column
    {
      key: 'text',
      header: 'Preview',
      cell: (reading) => {
        if (!reading.text) {
          return <span className="text-muted-foreground text-sm">No text</span>
        }
        return (
          <span className="text-sm text-muted-foreground line-clamp-2 max-w-[300px]">
            {reading.text}
          </span>
        )
      },
      className: 'min-w-[200px] hidden xl:table-cell'
    },
    // Actions Column
    {
      key: 'actions',
      header: '',
      cell: (reading) => (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="h-8 w-8">
              <MoreVertical className="h-4 w-4" />
              <span className="sr-only">Open menu</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem asChild>
              <Link href={`/readings/${reading.id}`}>View</Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <Link href={`/readings/${reading.id}/edit`}>Edit</Link>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              className="text-destructive focus:text-destructive"
              onSelect={(e) => {
                e.preventDefault()
                setReadingToDelete(reading)
                setDeleteDialogOpen(true)
              }}
            >
              Delete
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      ),
      className: 'w-[50px]'
    }
  ]

  return (
    <div className="space-y-6">
      {/* Search and Filters */}
      <SearchCard title="Search Readings">
        <div className="space-y-4">
          {/* Main Search Row */}
          <ClearableSearchInput
            value={searchValue}
            onChange={(value) => {
              setSearchValue(value)
              filters.updateFilter('search', value)
            }}
            placeholder="Search by pericope, text, introduction, or conclusion..."
            className="w-full"
          />

          {/* Advanced Filters Collapsible */}
          <Collapsible open={filtersOpen} onOpenChange={setFiltersOpen}>
            <CollapsibleTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                className="flex items-center gap-2 w-full justify-start px-0 text-muted-foreground hover:text-foreground"
              >
                <ChevronDown
                  className={`h-4 w-4 transition-transform duration-200 ${
                    filtersOpen ? 'rotate-180' : ''
                  }`}
                />
                <span className="text-sm font-medium">Advanced Filters</span>
              </Button>
            </CollapsibleTrigger>
            <CollapsibleContent className="pt-4 space-y-4">
              {/* Language Filter */}
              <div className="space-y-2">
                <Label htmlFor="language-filter">Language</Label>
                <Select
                  value={filters.getFilterValue('language') || 'all'}
                  onValueChange={(value) => filters.updateFilter('language', value === 'all' ? '' : value)}
                >
                  <SelectTrigger id="language-filter" className="w-full sm:w-1/2">
                    <SelectValue placeholder="All languages">
                      {filters.getFilterValue('language') && filters.getFilterValue('language') !== 'all'
                        ? LITURGICAL_LANGUAGE_LABELS[filters.getFilterValue('language') as keyof typeof LITURGICAL_LANGUAGE_LABELS]?.en
                        : 'All languages'}
                    </SelectValue>
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All languages</SelectItem>
                    {LITURGICAL_LANGUAGE_VALUES.map(lang => (
                      <SelectItem key={lang} value={lang}>
                        {LITURGICAL_LANGUAGE_LABELS[lang].en}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Category Filter - Toggle Buttons */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <Label className="text-sm font-medium">Categories</Label>
                </div>
                <div className="flex flex-wrap gap-2">
                  {categoryLabels.map(category => (
                    <Button
                      key={category}
                      variant={selectedCategories.includes(category) ? "default" : "outline"}
                      size="sm"
                      onClick={() => toggleCategory(category)}
                      className="text-xs h-7 flex-shrink-0"
                    >
                      {category}
                    </Button>
                  ))}
                </div>
              </div>

              {/* Filter Count Display */}
              <div className="flex items-center gap-2">
                <Filter className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                <span className="text-sm text-muted-foreground">
                  {selectedCategories.length > 0 && (
                    <span className="text-primary">
                      {selectedCategories.length} categor{selectedCategories.length > 1 ? 'ies' : 'y'} selected
                    </span>
                  )}
                  {selectedCategories.length === 0 && 'No category filters applied'}
                </span>
              </div>
            </CollapsibleContent>
          </Collapsible>
        </div>
      </SearchCard>

      {/* Readings Table */}
      {readings.length > 0 ? (
        <>
          <DataTable
            data={readings}
            columns={columns}
            keyExtractor={(reading) => reading.id}
            onRowClick={(reading) => router.push(`/readings/${reading.id}`)}
            currentSort={currentSort || undefined}
            onSortChange={handleSortChange}
            onLoadMore={handleLoadMore}
            hasMore={hasMore}
            emptyState={{
              icon: <BookOpen className="h-16 w-16 mx-auto text-muted-foreground mb-4" />,
              title: hasActiveFilters ? 'No readings found' : 'No readings yet',
              description: hasActiveFilters
                ? 'Try adjusting your search or filters to find more readings.'
                : 'Create your first reading to start building your collection of liturgical texts.',
              action: (
                <div className="flex flex-col sm:flex-row gap-3 justify-center">
                  <Button asChild>
                    <Link href="/readings/create">
                      <Plus className="h-4 w-4 mr-2" />
                      Create Your First Reading
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
          <EndOfListMessage show={!hasMore && readings.length > 0} />
          <ScrollToTopButton />
        </>
      ) : (
        <ContentCard className="text-center py-12">
          <BookOpen className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
          <h3 className="text-lg font-medium mb-2">
            {hasActiveFilters ? 'No readings found' : 'No readings yet'}
          </h3>
          <p className="text-muted-foreground mb-6">
            {hasActiveFilters
              ? 'Try adjusting your search or filters to find more readings.'
              : 'Create your first reading to start building your collection of liturgical texts.'}
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Button asChild>
              <Link href="/readings/create">
                <Plus className="h-4 w-4 mr-2" />
                Create Your First Reading
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
        <ListStatsBar title="Reading Overview" stats={statsList} />
      )}

      {/* Delete Confirmation Dialog */}
      <DeleteConfirmationDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        onConfirm={handleDeleteConfirm}
        title="Delete Reading"
        description={
          readingToDelete
            ? `Are you sure you want to delete the reading "${readingToDelete.pericope || 'Untitled Reading'}"? This action cannot be undone.`
            : 'Are you sure you want to delete this reading? This action cannot be undone.'
        }
        actionLabel="Delete"
      />
    </div>
  )
}

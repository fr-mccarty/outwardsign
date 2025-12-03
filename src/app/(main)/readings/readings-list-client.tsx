'use client'

import { useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import type { Reading, ReadingStats } from '@/lib/actions/readings'
import { deleteReading } from '@/lib/actions/readings'
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
import { Badge } from "@/components/ui/badge"
import Link from "next/link"
import { Plus, BookOpen, Filter, MoreVertical } from "lucide-react"
import { toast } from "sonner"
import { READING_CATEGORY_LABELS, LITURGICAL_LANGUAGE_LABELS } from "@/lib/constants"
import { useListFilters } from "@/hooks/use-list-filters"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { parseSort, formatSort } from '@/lib/utils/sort-utils'

interface ReadingsListClientProps {
  initialData: Reading[]
  stats: ReadingStats
}

// Reading-specific sort options
const READING_SORT_OPTIONS = [
  { value: 'created_desc', label: 'Newest First' },
  { value: 'created_asc', label: 'Oldest First' },
  { value: 'pericope_asc', label: 'Pericope A-Z' },
  { value: 'pericope_desc', label: 'Pericope Z-A' }
]

export function ReadingsListClient({ initialData, stats }: ReadingsListClientProps) {
  const router = useRouter()

  // Use list filters hook for URL state management
  const filters = useListFilters({
    baseUrl: '/readings',
    defaultFilters: { sort: 'created_desc' }
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
    { value: stats.total, label: 'Total Readings' },
    { value: stats.filtered, label: 'Filtered Results' }
  ]

  // Delete dialog state
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [readingToDelete, setReadingToDelete] = useState<Reading | null>(null)

  // Clear all filters
  const handleClearFilters = () => {
    setSearchValue('')
    filters.clearFilters()
  }

  // Check if any filters are active
  const hasActiveFilters = filters.hasActiveFilters

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

          {/* Advanced Search Collapsible */}
          <AdvancedSearch />
        </div>
      </SearchCard>

      {/* Readings Table */}
      {initialData.length > 0 ? (
        <>
          <DataTable
            data={initialData}
            columns={columns}
            keyExtractor={(reading) => reading.id}
            onRowClick={(reading) => router.push(`/readings/${reading.id}`)}
            currentSort={currentSort || undefined}
            onSortChange={handleSortChange}
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

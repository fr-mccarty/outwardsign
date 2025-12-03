'use client'

import { useState, useCallback, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import type { Person } from '@/lib/types'
import { deletePerson, getPeople, type PersonFilterParams } from '@/lib/actions/people'
import { LIST_VIEW_PAGE_SIZE, INFINITE_SCROLL_LOAD_MORE_SIZE, SEARCH_DEBOUNCE_MS } from '@/lib/constants'
import { useDebounce } from '@/hooks/use-debounce'
import { DataTable } from '@/components/data-table/data-table'
import { ClearableSearchInput } from '@/components/clearable-search-input'
import { ScrollToTopButton } from '@/components/scroll-to-top-button'
import { DeleteConfirmationDialog } from '@/components/delete-confirmation-dialog'
import { SearchCard } from "@/components/search-card"
import { ContentCard } from "@/components/content-card"
import { ListStatsBar, type ListStat } from "@/components/list-stats-bar"
import { EndOfListMessage } from '@/components/end-of-list-message'
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { Plus, User, Filter } from "lucide-react"
import { toast } from "sonner"
import { useListFilters } from "@/hooks/use-list-filters"
import {
  buildAvatarColumn,
  buildWhoColumn,
  buildActionsColumn
} from '@/lib/utils/table-columns'
import { parseSort, formatSort } from '@/lib/utils/sort-utils'

interface Stats {
  total: number
  withEmail: number
  withPhone: number
  filtered: number
}

interface PeopleListClientProps {
  initialData: Person[]
  stats: Stats
  initialHasMore: boolean
}


export function PeopleListClient({ initialData, stats, initialHasMore }: PeopleListClientProps) {
  const router = useRouter()

  // Use list filters hook for URL state management
  const filters = useListFilters({
    baseUrl: '/people',
    defaultFilters: { sort: 'name_asc' }
  })

  // Local state for search value (immediate visual feedback)
  const [searchValue, setSearchValue] = useState(filters.getFilterValue('search'))

  // Debounced search value (delays URL update)
  const debouncedSearchValue = useDebounce(searchValue, SEARCH_DEBOUNCE_MS)

  // Infinite scroll state
  const [people, setPeople] = useState(initialData)
  const [offset, setOffset] = useState(LIST_VIEW_PAGE_SIZE)
  const [hasMore, setHasMore] = useState(initialHasMore)
  const [isLoadingMore, setIsLoadingMore] = useState(false)

  // Parse current sort from URL for DataTable
  const currentSort = parseSort(filters.getFilterValue('sort'))

  // Update URL when debounced search value changes
  useEffect(() => {
    filters.updateFilter('search', debouncedSearchValue)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debouncedSearchValue])

  // Reset to initial data when filters change
  useEffect(() => {
    setPeople(initialData)
    setOffset(LIST_VIEW_PAGE_SIZE)
    setHasMore(initialHasMore)
  }, [initialData, initialHasMore])

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
      const nextPeople = await getPeople({
        search: filters.getFilterValue('search'),
        sort: filters.getFilterValue('sort') as PersonFilterParams['sort'],
        offset: offset,
        limit: INFINITE_SCROLL_LOAD_MORE_SIZE
      })

      setPeople(prev => [...prev, ...nextPeople])
      setOffset(prev => prev + INFINITE_SCROLL_LOAD_MORE_SIZE)
      setHasMore(nextPeople.length === INFINITE_SCROLL_LOAD_MORE_SIZE)
    } catch (error) {
      console.error('Failed to load more people:', error)
      toast.error('Failed to load more people')
    } finally {
      setIsLoadingMore(false)
    }
  }

  // Transform stats for ListStatsBar
  const statsList: ListStat[] = [
    { value: stats.total, label: 'Total People' },
    { value: stats.withEmail, label: 'With Email' },
    { value: stats.withPhone, label: 'With Phone' },
    { value: stats.filtered, label: 'Filtered Results' }
  ]

  // Delete dialog state
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [personToDelete, setPersonToDelete] = useState<Person | null>(null)

  // Clear all filters
  const handleClearFilters = () => {
    setSearchValue('')
    filters.clearFilters()
  }

  // Check if any filters are active
  const hasActiveFilters = filters.hasActiveFilters

  // Handle delete confirmation
  const handleDeleteConfirm = async () => {
    if (!personToDelete) return

    try {
      await deletePerson(personToDelete.id)
      toast.success('Person deleted successfully')
      router.refresh()
    } catch (error) {
      console.error('Failed to delete person:', error)
      toast.error('Failed to delete person. Please try again.')
      throw error
    }
  }

  // Define table columns using column builders
  const columns = [
    buildAvatarColumn<Person>({
      people: (person) => [{
        id: person.id,
        first_name: person.first_name,
        last_name: person.last_name,
        full_name: person.full_name,
        avatar_url: person.avatar_url
      }],
      type: 'single',
      size: 'md',
      hiddenOn: 'sm'
    }),
    {
      ...buildWhoColumn<Person>({
        getName: (person) => person.full_name,
        getStatus: () => 'ACTIVE', // People don't have status, use placeholder
        fallback: 'No name',
        header: 'Name',
        sortable: true
      }),
      key: 'name' // Override key to match server sort parameter
    },
    {
      key: 'contact',
      header: 'Contact',
      cell: (person: Person) => (
        <div className="flex flex-col gap-1 text-sm">
          {person.email && (
            <span className="text-muted-foreground truncate max-w-[200px]">
              {person.email}
            </span>
          )}
          {person.phone_number && (
            <span className="text-muted-foreground">
              {person.phone_number}
            </span>
          )}
          {!person.email && !person.phone_number && (
            <span className="text-muted-foreground">No contact info</span>
          )}
        </div>
      ),
      className: 'min-w-[150px] md:min-w-[200px]',
      hiddenOn: 'md' as const
    },
    {
      key: 'location',
      header: 'Location',
      cell: (person: Person) => {
        if (person.city || person.state) {
          const location = `${person.city || ''}${person.city && person.state ? ', ' : ''}${person.state || ''}`
          return <span className="text-sm truncate block max-w-[150px]">{location}</span>
        }
        return <span className="text-muted-foreground text-sm">No location</span>
      },
      className: 'min-w-[100px] lg:min-w-[120px]',
      hiddenOn: 'lg' as const
    },
    buildActionsColumn<Person>({
      baseUrl: '/people',
      onDelete: (person) => {
        setPersonToDelete(person)
        setDeleteDialogOpen(true)
      },
      getDeleteMessage: (person) =>
        `Are you sure you want to delete ${person.full_name}?`
    })
  ]

  return (
    <div className="space-y-6">
      {/* Search */}
      <SearchCard title="Search People">
        <ClearableSearchInput
          value={searchValue}
          onChange={setSearchValue}
          placeholder="Search people by name, email, or phone..."
          className="w-full"
        />
      </SearchCard>

      {/* People Table */}
      {people.length > 0 ? (
        <>
          <DataTable
            data={people}
            columns={columns}
            keyExtractor={(person) => person.id}
            onRowClick={(person) => router.push(`/people/${person.id}`)}
            currentSort={currentSort || undefined}
            onSortChange={handleSortChange}
            onLoadMore={handleLoadMore}
            hasMore={hasMore}
            emptyState={{
              icon: <User className="h-16 w-16 mx-auto text-muted-foreground mb-4" />,
              title: hasActiveFilters ? 'No people found' : 'No people yet',
              description: hasActiveFilters
                ? 'Try adjusting your search to find more people.'
                : 'Create your first person to start managing your parish directory.',
              action: (
                <div className="flex flex-col sm:flex-row gap-3 justify-center">
                  <Button asChild>
                    <Link href="/people/create">
                      <Plus className="h-4 w-4 mr-2" />
                      Create Your First Person
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
          <EndOfListMessage show={!hasMore && people.length > 0} />
          <ScrollToTopButton />
        </>
      ) : (
        <ContentCard className="text-center py-12">
          <User className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
          <h3 className="text-lg font-medium mb-2">
            {hasActiveFilters ? 'No people found' : 'No people yet'}
          </h3>
          <p className="text-muted-foreground mb-6">
            {hasActiveFilters
              ? 'Try adjusting your search to find more people.'
              : 'Create your first person to start managing your parish directory.'}
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Button asChild>
              <Link href="/people/create">
                <Plus className="h-4 w-4 mr-2" />
                Create Your First Person
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
        <ListStatsBar title="People Overview" stats={statsList} />
      )}

      {/* Delete Confirmation Dialog */}
      <DeleteConfirmationDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        onConfirm={handleDeleteConfirm}
        title="Delete Person"
        description={
          personToDelete
            ? `Are you sure you want to delete ${personToDelete.full_name}? This action cannot be undone.`
            : 'Are you sure you want to delete this person? This action cannot be undone.'
        }
        actionLabel="Delete"
      />
    </div>
  )
}

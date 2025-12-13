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
import { EmptyState } from "@/components/empty-state"
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
import { useTranslations } from 'next-intl'

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
  const t = useTranslations()

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
      toast.error(t('people.errorLoading'))
    } finally {
      setIsLoadingMore(false)
    }
  }

  // Transform stats for ListStatsBar
  const statsList: ListStat[] = [
    { value: stats.total, label: t('people.totalPeople') },
    { value: stats.withEmail, label: t('people.withEmail') },
    { value: stats.withPhone, label: t('people.withPhone') },
    { value: stats.filtered, label: t('people.filteredResults') }
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
      toast.success(t('people.personDeleted'))
      router.refresh()
    } catch (error) {
      console.error('Failed to delete person:', error)
      toast.error(t('people.errorDeleting'))
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
        fallback: t('people.noContactInfo'),
        header: t('people.name'),
        sortable: true
      }),
      key: 'name' // Override key to match server sort parameter
    },
    {
      key: 'contact',
      header: t('people.contact'),
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
            <span className="text-muted-foreground">{t('people.noContactInfo')}</span>
          )}
        </div>
      ),
      className: 'min-w-[150px] md:min-w-[200px]',
      hiddenOn: 'md' as const
    },
    {
      key: 'location',
      header: t('people.location'),
      cell: (person: Person) => {
        if (person.city || person.state) {
          const location = `${person.city || ''}${person.city && person.state ? ', ' : ''}${person.state || ''}`
          return <span className="text-sm truncate block max-w-[150px]">{location}</span>
        }
        return <span className="text-muted-foreground text-sm">{t('people.noLocation')}</span>
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
      <SearchCard title={t('people.title')}>
        <ClearableSearchInput
          value={searchValue}
          onChange={setSearchValue}
          placeholder={t('people.searchPlaceholder')}
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
              title: hasActiveFilters ? t('people.noPeople') : t('people.noPeopleYet'),
              description: hasActiveFilters
                ? t('people.noPeopleMessage')
                : t('people.noPeopleYetMessage'),
              action: (
                <div className="flex flex-col sm:flex-row gap-3 justify-center">
                  <Button asChild>
                    <Link href="/people/create">
                      <Plus className="h-4 w-4 mr-2" />
                      {t('people.createYourFirstPerson')}
                    </Link>
                  </Button>
                  {hasActiveFilters && (
                    <Button variant="outline" onClick={handleClearFilters}>
                      <Filter className="h-4 w-4 mr-2" />
                      {t('common.filter')}
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
        <EmptyState
          icon={<User className="h-16 w-16" />}
          title={hasActiveFilters ? t('people.noPeople') : t('people.noPeopleYet')}
          description={hasActiveFilters
            ? t('people.noPeopleMessage')
            : t('people.noPeopleYetMessage')}
          action={
            <>
              <Button asChild>
                <Link href="/people/create">
                  <Plus className="h-4 w-4 mr-2" />
                  {t('people.createYourFirstPerson')}
                </Link>
              </Button>
              {hasActiveFilters && (
                <Button variant="outline" onClick={handleClearFilters}>
                  <Filter className="h-4 w-4 mr-2" />
                  {t('common.filter')}
                </Button>
              )}
            </>
          }
        />
      )}

      {/* Quick Stats */}
      {stats.total > 0 && (
        <ListStatsBar title={t('people.peopleOverview')} stats={statsList} />
      )}

      {/* Delete Confirmation Dialog */}
      <DeleteConfirmationDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        onConfirm={handleDeleteConfirm}
        title={t('people.deletePerson')}
        description={
          personToDelete
            ? `${t('people.confirmDelete')} ${t('people.confirmDeleteMessage')}`
            : `${t('people.confirmDelete')} ${t('people.confirmDeleteMessage')}`
        }
        actionLabel={t('common.delete')}
      />
    </div>
  )
}

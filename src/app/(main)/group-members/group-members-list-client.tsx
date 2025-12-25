'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { PageContainer } from '@/components/page-container'
import { BreadcrumbSetter } from '@/components/breadcrumb-setter'
import { DataTable, type DataTableColumn } from '@/components/data-table/data-table'
import { ClearableSearchInput } from '@/components/clearable-search-input'
import { ScrollToTopButton } from '@/components/scroll-to-top-button'
import { AdvancedSearch } from '@/components/advanced-search'
import { SearchCard } from '@/components/search-card'
import { EmptyState } from '@/components/empty-state'
import { ListStatsBar, type ListStat } from '@/components/list-stats-bar'
import { EndOfListMessage } from '@/components/end-of-list-message'
import { PersonAvatarGroup } from '@/components/person-avatar-group'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { FormDialog } from '@/components/form-dialog'
import { Label } from '@/components/ui/label'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import Link from 'next/link'
import { UserPlus, Users, MoreVertical, Filter } from 'lucide-react'
import { addGroupMember, type PersonWithMemberships, type GroupMemberStats, getPeopleWithGroupMemberships, type GroupMemberFilters } from '@/lib/actions/groups'
import { toast } from 'sonner'
import { useTranslations } from 'next-intl'
import { useListFilters } from '@/hooks/use-list-filters'
import { useDebounce } from '@/hooks/use-debounce'
import { LIST_VIEW_PAGE_SIZE, INFINITE_SCROLL_LOAD_MORE_SIZE, SEARCH_DEBOUNCE_MS } from '@/lib/constants'
import { PAGE_SECTIONS_SPACING } from '@/lib/constants/form-spacing'
import type { Person } from '@/lib/types'
import type { GroupRole } from '@/lib/actions/group-roles'
import type { Group } from '@/lib/actions/groups'

interface GroupMembersListClientProps {
  peopleWithMemberships: PersonWithMemberships[]
  stats: GroupMemberStats
  groups: Group[]
  groupRoles: GroupRole[]
  allPeople: Person[]
  initialHasMore: boolean
}

export function GroupMembersListClient({
  peopleWithMemberships,
  stats,
  groups,
  groupRoles,
  allPeople,
  initialHasMore
}: GroupMembersListClientProps) {
  const router = useRouter()
  const t = useTranslations('groups')

  // Use list filters hook for URL state management
  const filters = useListFilters({
    baseUrl: '/group-members',
    defaultFilters: { sort: 'name_asc' }
  })

  // Local state for search value (immediate visual feedback)
  const [searchValue, setSearchValue] = useState(filters.getFilterValue('search'))

  // Debounced search value (delays URL update)
  const debouncedSearchValue = useDebounce(searchValue, SEARCH_DEBOUNCE_MS)

  // Infinite scroll state
  const [people, setPeople] = useState(peopleWithMemberships)
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
    setPeople(peopleWithMemberships)
    setOffset(LIST_VIEW_PAGE_SIZE)
    setHasMore(initialHasMore)
  }, [peopleWithMemberships, initialHasMore])

  // Load more function for infinite scroll
  const handleLoadMore = async () => {
    if (isLoadingMore || !hasMore) return

    setIsLoadingMore(true)
    try {
      const nextPeople = await getPeopleWithGroupMemberships({
        search: filters.getFilterValue('search'),
        sort: filters.getFilterValue('sort') as GroupMemberFilters['sort'],
        offset: offset,
        limit: INFINITE_SCROLL_LOAD_MORE_SIZE
      })

      setPeople(prev => [...prev, ...nextPeople])
      setOffset(prev => prev + INFINITE_SCROLL_LOAD_MORE_SIZE)
      setHasMore(nextPeople.length === INFINITE_SCROLL_LOAD_MORE_SIZE)
    } catch (error) {
      console.error('Failed to load more group members:', error)
      toast.error('Failed to load more group members')
    } finally {
      setIsLoadingMore(false)
    }
  }

  // Dialog state for adding membership
  const [dialogOpen, setDialogOpen] = useState(false)
  const [selectedPersonId, setSelectedPersonId] = useState<string>('')
  const [selectedGroupId, setSelectedGroupId] = useState<string>('')
  const [selectedRoleId, setSelectedRoleId] = useState<string>('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Transform stats for ListStatsBar
  const statsList: ListStat[] = [
    { value: stats.total, label: 'Total Members' },
    { value: stats.filtered, label: 'Filtered Results' }
  ]

  // Clear all filters
  const handleClearFilters = () => {
    setSearchValue('')
    filters.clearFilters()
  }

  // Check if any filters are active
  const hasActiveFilters = filters.hasActiveFilters

  const handleAddMembership = async () => {
    if (!selectedPersonId || !selectedGroupId) {
      toast.error('Please select both a person and a group')
      return
    }

    setIsSubmitting(true)
    try {
      await addGroupMember(selectedGroupId, selectedPersonId, selectedRoleId || undefined)
      toast.success('Group membership added successfully')
      setDialogOpen(false)
      setSelectedPersonId('')
      setSelectedGroupId('')
      setSelectedRoleId('')
      router.refresh()
    } catch (error) {
      console.error('Error adding group membership:', error)
      toast.error(error instanceof Error ? error.message : 'Failed to add group membership')
    } finally {
      setIsSubmitting(false)
    }
  }

  // Define table columns
  const columns: DataTableColumn<PersonWithMemberships>[] = [
    // Avatar column
    {
      key: 'avatar',
      header: '',
      cell: (row) => (
        <PersonAvatarGroup
          people={[{
            id: row.person.id,
            first_name: row.person.first_name,
            last_name: row.person.last_name,
            full_name: row.person.full_name,
            avatar_url: row.person.avatar_url
          }]}
          type="single"
          size="md"
        />
      ),
      className: 'w-[60px]',
      hiddenOn: 'sm'
    },
    // Name column
    {
      key: 'name',
      header: 'Name',
      cell: (row) => (
        <div className="flex flex-col">
          <span className="text-sm font-medium">{row.person.full_name}</span>
          {row.person.email && (
            <span className="text-xs text-muted-foreground truncate max-w-[200px]">
              {row.person.email}
            </span>
          )}
        </div>
      ),
      className: 'min-w-[150px]',
      sortable: true,
      accessorFn: (row) => row.person.full_name
    },
    // Groups column
    {
      key: 'groups',
      header: 'Groups',
      cell: (row) => (
        <div className="flex flex-wrap gap-1">
          {row.memberships.length === 0 ? (
            <span className="text-sm text-muted-foreground">No groups</span>
          ) : row.memberships.length <= 2 ? (
            row.memberships.map((m) => (
              <Badge key={m.id} variant="secondary" className="text-xs">
                {m.group_role?.name || 'Member'}
              </Badge>
            ))
          ) : (
            <Badge variant="secondary" className="text-xs">
              {row.memberships.length} groups
            </Badge>
          )}
        </div>
      ),
      className: 'min-w-[120px]',
      hiddenOn: 'md'
    },
    // Phone column
    {
      key: 'phone',
      header: 'Phone',
      cell: (row) => (
        <span className="text-sm text-muted-foreground">
          {row.person.phone_number || '—'}
        </span>
      ),
      className: 'min-w-[120px]',
      hiddenOn: 'lg'
    },
    // Actions column
    {
      key: 'actions',
      header: '',
      cell: (row) => (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="h-8 w-8">
              <MoreVertical className="h-4 w-4" />
              <span className="sr-only">Open menu</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem asChild>
              <Link href={`/group-members/${row.person.id}`}>View Details</Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <Link href={`/group-members/${row.person.id}/memberships`}>Edit Memberships</Link>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      ),
      className: 'w-[50px]'
    }
  ]

  const breadcrumbs = [
    { label: 'Dashboard', href: '/dashboard' },
    { label: 'Groups', href: '/groups' },
    { label: 'Group Members', href: '/group-members' },
  ]

  return (
    <PageContainer
      title="Group Members"
      description="View and manage people serving in groups"
    >
      <BreadcrumbSetter breadcrumbs={breadcrumbs} />
      <div className={PAGE_SECTIONS_SPACING}>
        {/* Search and Add Button */}
        <SearchCard title="Search Group Members">
          <div className="space-y-4">
            <div className="flex items-center gap-4">
              <div className="flex-1">
                <ClearableSearchInput
                  value={searchValue}
                  onChange={(value) => {
                    setSearchValue(value)
                    filters.updateFilter('search', value)
                  }}
                  placeholder="Search by name or email..."
                  className="w-full"
                />
              </div>

              <Button onClick={() => setDialogOpen(true)}>
                <UserPlus className="mr-2 h-4 w-4" />
                Add Membership
              </Button>
              <FormDialog
                open={dialogOpen}
                onOpenChange={setDialogOpen}
                title="Add Group Membership"
                description="Add a person to a group with an optional role"
                onSubmit={handleAddMembership}
                isLoading={isSubmitting}
                submitLabel="Add Membership"
                loadingLabel="Adding..."
              >
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="person">Person</Label>
                    <select
                      id="person"
                      value={selectedPersonId}
                      onChange={(e) => setSelectedPersonId(e.target.value)}
                      className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                    >
                      <option value="">Select a person...</option>
                      {allPeople.map((person) => (
                        <option key={person.id} value={person.id}>
                          {person.full_name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="group">Group</Label>
                    <select
                      id="group"
                      value={selectedGroupId}
                      onChange={(e) => setSelectedGroupId(e.target.value)}
                      className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                    >
                      <option value="">Select a group...</option>
                      {groups.map((group) => (
                        <option key={group.id} value={group.id}>
                          {group.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="role">Role (Optional)</Label>
                    <select
                      id="role"
                      value={selectedRoleId}
                      onChange={(e) => setSelectedRoleId(e.target.value)}
                      className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                    >
                      <option value="">No specific role</option>
                      {groupRoles.map((role) => (
                        <option key={role.id} value={role.id}>
                          {role.name}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              </FormDialog>
            </div>

            {/* Advanced Search */}
            <AdvancedSearch />
          </div>
        </SearchCard>

        {/* Table */}
        {people.length > 0 ? (
          <>
            <DataTable
              data={people}
              columns={columns}
              keyExtractor={(row) => row.person.id}
              onRowClick={(row) => router.push(`/group-members/${row.person.id}`)}
              onLoadMore={handleLoadMore}
              hasMore={hasMore}
              emptyState={{
                icon: <Users className="h-16 w-16 mx-auto text-muted-foreground mb-4" />,
                title: hasActiveFilters ? t('noMembersFound') : t('noGroupMembersYet'),
                description: hasActiveFilters
                  ? t('noMembersFoundMessage')
                  : t('noGroupMembersYetMessage'),
                action: hasActiveFilters ? (
                  <Button variant="outline" onClick={handleClearFilters}>
                    <Filter className="h-4 w-4 mr-2" />
                    {t('clearFilters')}
                  </Button>
                ) : undefined
              }}
              stickyHeader
            />
            <EndOfListMessage show={!hasMore && people.length > 0} />
            <ScrollToTopButton />
          </>
        ) : (
          <EmptyState
            icon={<Users className="h-16 w-16" />}
            title={hasActiveFilters ? t('noMembersFound') : t('noGroupMembersYet')}
            description={hasActiveFilters
              ? t('noMembersFoundMessage')
              : t('noGroupMembersYetMessage')}
            action={hasActiveFilters ? (
              <Button variant="outline" onClick={handleClearFilters}>
                <Filter className="h-4 w-4 mr-2" />
                {t('clearFilters')}
              </Button>
            ) : undefined}
          />
        )}

        {/* Stats */}
        {stats.total > 0 && (
          <ListStatsBar title={t('groupMembersOverview')} stats={statsList} />
        )}
      </div>
    </PageContainer>
  )
}

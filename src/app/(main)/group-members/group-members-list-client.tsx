'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { PageContainer } from '@/components/page-container'
import { BreadcrumbSetter } from '@/components/breadcrumb-setter'
import { DataTable, type DataTableColumn } from '@/components/data-table/data-table'
import { ClearableSearchInput } from '@/components/clearable-search-input'
import { ScrollToTopButton } from '@/components/scroll-to-top-button'
import { AdvancedSearch } from '@/components/advanced-search'
import { SearchCard } from '@/components/search-card'
import { ContentCard } from '@/components/content-card'
import { ListStatsBar, type ListStat } from '@/components/list-stats-bar'
import { PersonAvatarGroup } from '@/components/person-avatar-group'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { DialogButton } from '@/components/dialog-button'
import { Label } from '@/components/ui/label'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import Link from 'next/link'
import { UserPlus, Users, MoreVertical, Filter } from 'lucide-react'
import { addGroupMember, type PersonWithMemberships, type GroupMemberStats } from '@/lib/actions/groups'
import { toast } from 'sonner'
import { useListFilters } from '@/hooks/use-list-filters'
import type { Person } from '@/lib/types'
import type { GroupRole } from '@/lib/actions/group-roles'
import type { Group } from '@/lib/actions/groups'

// Note: Sorting options removed - managed through useListFilters hook
// const GROUP_MEMBER_SORT_OPTIONS = [
//   { value: 'name_asc', label: 'Name A-Z' },
//   { value: 'name_desc', label: 'Name Z-A' },
//   { value: 'groups_desc', label: 'Most Groups' },
//   { value: 'groups_asc', label: 'Fewest Groups' },
//   { value: 'created_desc', label: 'Recently Joined' },
//   { value: 'created_asc', label: 'Oldest Member' },
// ] as const

interface GroupMembersListClientProps {
  peopleWithMemberships: PersonWithMemberships[]
  stats: GroupMemberStats
  groups: Group[]
  groupRoles: GroupRole[]
  allPeople: Person[]
}

export function GroupMembersListClient({
  peopleWithMemberships,
  stats,
  groups,
  groupRoles,
  allPeople
}: GroupMembersListClientProps) {
  const router = useRouter()

  // Use list filters hook for URL state management
  const filters = useListFilters({
    baseUrl: '/group-members',
    defaultFilters: { sort: 'name_asc' }
  })

  // Local state for search value (synced with URL)
  const [searchValue, setSearchValue] = useState(filters.getFilterValue('search'))

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
      <div className="space-y-6">
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

              <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
                <DialogButton>
                  <UserPlus className="mr-2 h-4 w-4" />
                  Add Membership
                </DialogButton>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Add Group Membership</DialogTitle>
                    <DialogDescription>
                      Add a person to a group with an optional role
                    </DialogDescription>
                  </DialogHeader>

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

                  <DialogFooter>
                    <Button
                      variant="outline"
                      onClick={() => setDialogOpen(false)}
                      disabled={isSubmitting}
                    >
                      Cancel
                    </Button>
                    <Button onClick={handleAddMembership} disabled={isSubmitting}>
                      {isSubmitting ? 'Adding...' : 'Add Membership'}
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </div>

            {/* Advanced Search */}
            <AdvancedSearch />
          </div>
        </SearchCard>

        {/* Table */}
        {peopleWithMemberships.length > 0 ? (
          <>
            <DataTable
              data={peopleWithMemberships}
              columns={columns}
              keyExtractor={(row) => row.person.id}
              onRowClick={(row) => router.push(`/group-members/${row.person.id}`)}
              emptyState={{
                icon: <Users className="h-16 w-16 mx-auto text-muted-foreground mb-4" />,
                title: hasActiveFilters ? 'No members found' : 'No group members yet',
                description: hasActiveFilters
                  ? 'Try adjusting your search to find more members.'
                  : 'Add people to groups to see them here.',
                action: hasActiveFilters ? (
                  <Button variant="outline" onClick={handleClearFilters}>
                    <Filter className="h-4 w-4 mr-2" />
                    Clear Filters
                  </Button>
                ) : undefined
              }}
              stickyHeader
            />
            <ScrollToTopButton />
          </>
        ) : (
          <ContentCard className="text-center py-12">
            <Users className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-medium mb-2">
              {hasActiveFilters ? 'No members found' : 'No group members yet'}
            </h3>
            <p className="text-muted-foreground mb-6">
              {hasActiveFilters
                ? 'Try adjusting your search to find more members.'
                : 'Add people to groups to see them here.'}
            </p>
            {hasActiveFilters && (
              <Button variant="outline" onClick={handleClearFilters}>
                <Filter className="h-4 w-4 mr-2" />
                Clear Filters
              </Button>
            )}
          </ContentCard>
        )}

        {/* Stats */}
        {stats.total > 0 && (
          <ListStatsBar title="Group Members Overview" stats={statsList} />
        )}
      </div>
    </PageContainer>
  )
}

'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { PageContainer } from '@/components/page-container'
import { BreadcrumbSetter } from '@/components/breadcrumb-setter'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { DialogButton } from '@/components/dialog-button'
import { Label } from '@/components/ui/label'
import { UserPlus, Mail, Phone, Users } from 'lucide-react'
import { formatPersonName } from '@/lib/utils/formatters'
import { addGroupMember } from '@/lib/actions/groups'
import { toast } from 'sonner'
import type { Person } from '@/lib/types'
import type { GroupRole } from '@/lib/actions/group-roles'
import type { Group } from '@/lib/actions/groups'

interface PersonWithMemberships {
  person: {
    id: string
    first_name: string
    last_name: string
    email?: string
    phone_number?: string
  }
  memberships: Array<{
    id: string
    group_id: string
    group_role_id?: string | null
    joined_at: string
    group_role: {
      id: string
      name: string
      description?: string
    } | null
  }>
}

interface GroupMemberDirectoryListClientProps {
  peopleWithMemberships: PersonWithMemberships[]
  groups: Group[]
  groupRoles: GroupRole[]
  allPeople: Person[]
}

export function GroupMemberDirectoryListClient({
  peopleWithMemberships,
  groups,
  groupRoles,
  allPeople
}: GroupMemberDirectoryListClientProps) {
  const router = useRouter()
  const [search, setSearch] = useState('')
  const [dialogOpen, setDialogOpen] = useState(false)
  const [selectedPersonId, setSelectedPersonId] = useState<string>('')
  const [selectedGroupId, setSelectedGroupId] = useState<string>('')
  const [selectedRoleId, setSelectedRoleId] = useState<string>('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Filter people based on search
  const filteredPeople = peopleWithMemberships.filter(({ person }) => {
    if (!search) return true
    const searchLower = search.toLowerCase()
    const fullName = formatPersonName(person).toLowerCase()
    const email = person.email?.toLowerCase() || ''
    return fullName.includes(searchLower) || email.includes(searchLower)
  })

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

  const breadcrumbs = [
    { label: 'Dashboard', href: '/dashboard' },
    { label: 'Groups', href: '/groups' },
    { label: 'Member Directory', href: '/group-member-directory' },
  ]

  return (
    <PageContainer
      title="Group Member Directory"
      description="View and manage people serving in groups"
    >
      <BreadcrumbSetter breadcrumbs={breadcrumbs} />
      <div className="space-y-6">
        {/* Search and Add Button */}
        <div className="flex items-center gap-4">
          <div className="flex-1">
            <Input
              type="search"
              placeholder="Search by name or email..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="max-w-md"
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
                        {formatPersonName(person)}
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

        {/* People Grid */}
        {filteredPeople.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <Users className="h-12 w-12 text-muted-foreground mb-4" />
              <p className="text-lg font-medium mb-2">No people found</p>
              <p className="text-sm text-muted-foreground mb-4">
                {search ? 'Try adjusting your search' : 'Add people to groups to see them here'}
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {filteredPeople.map(({ person, memberships }) => (
              <Card
                key={person.id}
                className="cursor-pointer hover:bg-accent transition-colors"
                onClick={() => router.push(`/group-member-directory/${person.id}`)}
              >
                <CardHeader>
                  <CardTitle className="text-lg">
                    {formatPersonName(person)}
                  </CardTitle>
                  <CardDescription className="space-y-1">
                    {person.email && (
                      <div className="flex items-center gap-2 text-sm">
                        <Mail className="h-3 w-3" />
                        {person.email}
                      </div>
                    )}
                    {person.phone_number && (
                      <div className="flex items-center gap-2 text-sm">
                        <Phone className="h-3 w-3" />
                        {person.phone_number}
                      </div>
                    )}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-1">
                    <div className="text-sm font-medium">Group Memberships:</div>
                    <div className="text-sm text-muted-foreground">
                      {memberships.length} {memberships.length === 1 ? 'group' : 'groups'}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </PageContainer>
  )
}

'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { PageContainer } from '@/components/page-container'
import { BreadcrumbSetter } from '@/components/breadcrumb-setter'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Plus, X, Calendar, Save } from 'lucide-react'
import { formatPersonName } from '@/lib/utils/formatters'
import { formatDatePretty } from '@/lib/utils/date-format'
import { addGroupMember, removeGroupMember, updateGroupMemberRole } from '@/lib/actions/groups'
import { toast } from 'sonner'
import type { Person } from '@/lib/types'
import type { PersonGroupMembership, Group } from '@/lib/actions/groups'
import type { GroupRole } from '@/lib/actions/group-roles'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'

interface GroupMembershipsFormProps {
  person: Person
  memberships: PersonGroupMembership[]
  groups: Group[]
  groupRoles: GroupRole[]
}

export function GroupMembershipsForm({
  person,
  memberships,
  groups,
  groupRoles
}: GroupMembershipsFormProps) {
  const router = useRouter()
  const [isAdding, setIsAdding] = useState(false)
  const [selectedGroupId, setSelectedGroupId] = useState<string>('')
  const [selectedRoleId, setSelectedRoleId] = useState<string>('')
  const [editingMembership, setEditingMembership] = useState<string | null>(null)
  const [editingRoleId, setEditingRoleId] = useState<string>('')
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const breadcrumbs = [
    { label: 'Dashboard', href: '/dashboard' },
    { label: 'Groups', href: '/groups' },
    { label: 'Member Directory', href: '/group-member-directory' },
    { label: formatPersonName(person), href: `/group-member-directory/${person.id}` },
    { label: 'Manage Memberships', href: `/group-member-directory/${person.id}/memberships` },
  ]

  // Get groups that person is not already a member of
  const memberGroupIds = new Set(memberships.map(m => m.group_id))
  const availableGroups = groups.filter(g => !memberGroupIds.has(g.id))

  const handleAddMembership = async () => {
    if (!selectedGroupId) {
      toast.error('Please select a group')
      return
    }

    setIsSubmitting(true)
    try {
      await addGroupMember(selectedGroupId, person.id, selectedRoleId || undefined)
      toast.success('Membership added successfully')
      setIsAdding(false)
      setSelectedGroupId('')
      setSelectedRoleId('')
      router.refresh()
    } catch (error) {
      console.error('Error adding membership:', error)
      toast.error(error instanceof Error ? error.message : 'Failed to add membership')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleRemoveMembership = async (groupId: string) => {
    setIsSubmitting(true)
    try {
      await removeGroupMember(groupId, person.id)
      toast.success('Membership removed successfully')
      setDeleteConfirmId(null)
      router.refresh()
    } catch (error) {
      console.error('Error removing membership:', error)
      toast.error(error instanceof Error ? error.message : 'Failed to remove membership')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleUpdateRole = async (groupId: string, newRoleId: string) => {
    setIsSubmitting(true)
    try {
      await updateGroupMemberRole(groupId, person.id, newRoleId || null)
      toast.success('Role updated successfully')
      setEditingMembership(null)
      setEditingRoleId('')
      router.refresh()
    } catch (error) {
      console.error('Error updating role:', error)
      toast.error(error instanceof Error ? error.message : 'Failed to update role')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <PageContainer
      title={`Manage Memberships - ${formatPersonName(person)}`}
      description="Add, edit, or remove group memberships"
    >
      <BreadcrumbSetter breadcrumbs={breadcrumbs} />
      <div className="space-y-6">
        {/* Current Memberships */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Current Group Memberships</CardTitle>
                <CardDescription>
                  {memberships.length} {memberships.length === 1 ? 'membership' : 'memberships'}
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {memberships.length === 0 ? (
              <p className="text-sm text-muted-foreground">No group memberships yet</p>
            ) : (
              <div className="space-y-4">
                {memberships.map((membership) => (
                  <div
                    key={membership.id}
                    className="flex items-start justify-between p-4 border rounded-lg"
                  >
                    <div className="space-y-2 flex-1">
                      <div className="flex items-center gap-3">
                        <div className="font-medium">{membership.group.name}</div>
                        {!membership.group.is_active && (
                          <Badge variant="outline" className="opacity-60">
                            Inactive
                          </Badge>
                        )}
                      </div>
                      {membership.group.description && (
                        <div className="text-sm text-muted-foreground">
                          {membership.group.description}
                        </div>
                      )}
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Calendar className="h-3 w-3" />
                        Joined {formatDatePretty(membership.joined_at)}
                      </div>

                      {/* Role Selection */}
                      {editingMembership === membership.id ? (
                        <div className="flex items-center gap-2 mt-2">
                          <Label htmlFor={`role-${membership.id}`} className="sr-only">
                            Role
                          </Label>
                          <select
                            id={`role-${membership.id}`}
                            value={editingRoleId}
                            onChange={(e) => setEditingRoleId(e.target.value)}
                            className="flex h-9 w-full max-w-xs rounded-md border border-input bg-background px-3 py-1 text-sm"
                          >
                            <option value="">No specific role</option>
                            {groupRoles.map((role) => (
                              <option key={role.id} value={role.id}>
                                {role.name}
                              </option>
                            ))}
                          </select>
                          <Button
                            size="sm"
                            onClick={() => handleUpdateRole(membership.group_id, editingRoleId)}
                            disabled={isSubmitting}
                          >
                            <Save className="h-3 w-3 mr-1" />
                            Save
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => {
                              setEditingMembership(null)
                              setEditingRoleId('')
                            }}
                            disabled={isSubmitting}
                          >
                            Cancel
                          </Button>
                        </div>
                      ) : (
                        <div className="flex items-center gap-2 mt-2">
                          {membership.group_role && (
                            <Badge variant="secondary">
                              {membership.group_role.name}
                            </Badge>
                          )}
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => {
                              setEditingMembership(membership.id)
                              setEditingRoleId(membership.group_role_id || '')
                            }}
                          >
                            {membership.group_role ? 'Change Role' : 'Add Role'}
                          </Button>
                        </div>
                      )}
                    </div>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => setDeleteConfirmId(membership.id)}
                      disabled={isSubmitting}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Add New Membership */}
        <Card>
          <CardHeader>
            <CardTitle>Add Group Membership</CardTitle>
            <CardDescription>Add this person to a new group</CardDescription>
          </CardHeader>
          <CardContent>
            {availableGroups.length === 0 ? (
              <p className="text-sm text-muted-foreground">
                This person is already a member of all available groups
              </p>
            ) : (
              <div className="space-y-4">
                {!isAdding ? (
                  <Button onClick={() => setIsAdding(true)}>
                    <Plus className="h-4 w-4 mr-2" />
                    Add to Group
                  </Button>
                ) : (
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="group">Group</Label>
                      <select
                        id="group"
                        value={selectedGroupId}
                        onChange={(e) => setSelectedGroupId(e.target.value)}
                        className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                      >
                        <option value="">Select a group...</option>
                        {availableGroups.map((group) => (
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
                        className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                      >
                        <option value="">No specific role</option>
                        {groupRoles.map((role) => (
                          <option key={role.id} value={role.id}>
                            {role.name}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="flex gap-2">
                      <Button onClick={handleAddMembership} disabled={isSubmitting}>
                        {isSubmitting ? 'Adding...' : 'Add Membership'}
                      </Button>
                      <Button
                        variant="outline"
                        onClick={() => {
                          setIsAdding(false)
                          setSelectedGroupId('')
                          setSelectedRoleId('')
                        }}
                        disabled={isSubmitting}
                      >
                        Cancel
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Actions */}
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={() => router.push(`/group-member-directory/${person.id}`)}
          >
            Back to Profile
          </Button>
        </div>
      </div>

      {/* Delete Confirmation Dialog */}
      <Dialog open={!!deleteConfirmId} onOpenChange={(open) => !open && setDeleteConfirmId(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Remove Membership</DialogTitle>
            <DialogDescription>
              Are you sure you want to remove this person from the group? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setDeleteConfirmId(null)}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={() => {
                const membership = memberships.find(m => m.id === deleteConfirmId)
                if (membership) {
                  handleRemoveMembership(membership.group_id)
                }
              }}
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Removing...' : 'Remove Membership'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </PageContainer>
  )
}

"use client"

import { useState, useEffect } from "react"
import { z } from "zod"
import { FormField } from "@/components/ui/form-field"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import { FormSectionCard } from "@/components/form-section-card"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Plus, Users } from "lucide-react"
import { createGroup, updateGroup, type GroupWithMembers, type GroupMember, addGroupMember, removeGroupMember } from "@/lib/actions/groups"
import { getGroupRoles, type GroupRole } from "@/lib/actions/group-roles"
import type { Person } from "@/lib/types"
import { useRouter } from "next/navigation"
import { toast } from 'sonner'
import { FormBottomActions } from "@/components/form-bottom-actions"
import { DeleteConfirmationDialog } from '@/components/delete-confirmation-dialog'
import { formatPersonName } from '@/lib/utils/formatters'
import { PersonPickerField } from "@/components/person-picker-field"
import { MemberListItem } from "@/components/member-list-item"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

// Zod validation schema
const groupSchema = z.object({
  name: z.string().min(1, "Name is required"),
  description: z.string().optional(),
  is_active: z.boolean().optional(),
})

interface GroupFormProps {
  group?: GroupWithMembers
  formId?: string
  onLoadingChange?: (loading: boolean) => void
}

export function GroupForm({ group, formId, onLoadingChange }: GroupFormProps) {
  const router = useRouter()
  const isEditing = !!group
  const [isLoading, setIsLoading] = useState(false)

  // Notify parent component of loading state changes
  useEffect(() => {
    onLoadingChange?.(isLoading)
  }, [isLoading, onLoadingChange])

  // State for group fields
  const [name, setName] = useState(group?.name || "")
  const [description, setDescription] = useState(group?.description || "")
  const [isActive, setIsActive] = useState(group?.is_active ?? true)

  // Member management state
  const [addMemberDialogOpen, setAddMemberDialogOpen] = useState(false)
  const [showPersonPicker, setShowPersonPicker] = useState(false)
  const [selectedPerson, setSelectedPerson] = useState<Person | null>(null)
  const [selectedGroupRoleId, setSelectedGroupRoleId] = useState<string>('none')
  const [isAddingMember, setIsAddingMember] = useState(false)
  const [deletingMemberId, setDeletingMemberId] = useState<string | null>(null)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)

  // Local state for members (optimistic updates)
  const [members, setMembers] = useState<GroupMember[]>(group?.members || [])
  const [groupRoles, setGroupRoles] = useState<GroupRole[]>([])

  // Load group roles in edit mode
  useEffect(() => {
    if (isEditing) {
      getGroupRoles().then(setGroupRoles).catch(error => {
        console.error('Failed to load group roles:', error)
        toast.error('Failed to load group roles')
      })
    }
  }, [isEditing])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      // Validate with Zod
      const groupData = groupSchema.parse({
        name,
        description: description || undefined,
        is_active: isActive,
      })

      if (isEditing && group) {
        await updateGroup(group.id, groupData)
        toast.success('Group updated successfully')
        router.refresh() // Stay on edit page to show updated data
      } else {
        const newGroup = await createGroup(groupData)
        toast.success('Group created successfully')
        router.push(`/groups/${newGroup.id}/edit`) // Go to edit page
      }
    } catch (error) {
      if (error instanceof z.ZodError) {
        toast.error(error.issues[0].message)
      } else {
        console.error('Error saving group:', error)
        toast.error(isEditing ? 'Failed to update group' : 'Failed to create group')
      }
    } finally {
      setIsLoading(false)
    }
  }

  const handleAddMember = async () => {
    if (!selectedPerson || !group) return

    // Check if person already a member
    if (members.some(m => m.person_id === selectedPerson.id)) {
      toast.error('This person is already a member of this group')
      return
    }

    try {
      setIsAddingMember(true)

      const newMember = await addGroupMember(
        group.id,
        selectedPerson.id,
        selectedGroupRoleId === 'none' ? undefined : selectedGroupRoleId
      )

      // Find the group role if one was selected
      const groupRole = selectedGroupRoleId !== 'none'
        ? groupRoles.find(r => r.id === selectedGroupRoleId)
        : null

      // Optimistically add to local state
      setMembers(prev => [...prev, {
        id: newMember.id,
        group_id: group.id,
        person_id: selectedPerson.id,
        group_role_id: selectedGroupRoleId === 'none' ? null : selectedGroupRoleId,
        joined_at: new Date().toISOString(),
        person: {
          id: selectedPerson.id,
          first_name: selectedPerson.first_name,
          last_name: selectedPerson.last_name,
          email: selectedPerson.email || undefined
        },
        group_role: groupRole ? {
          id: groupRole.id,
          name: groupRole.name,
          description: groupRole.description || undefined
        } : undefined
      }])

      toast.success('Member added successfully')

      // Reset and close
      setSelectedPerson(null)
      setSelectedGroupRoleId('none')
      setAddMemberDialogOpen(false)
    } catch (error) {
      toast.error('Failed to add member')
      console.error(error)
    } finally {
      setIsAddingMember(false)
    }
  }

  const handleCancelAddMember = () => {
    setSelectedPerson(null)
    setSelectedGroupRoleId('none')
    setAddMemberDialogOpen(false)
  }

  const handleDeleteMember = async () => {
    if (!deletingMemberId || !group) return

    try {
      const memberToDelete = members.find(m => m.id === deletingMemberId)
      if (!memberToDelete) return

      await removeGroupMember(group.id, memberToDelete.person_id)

      // Optimistically remove from local state
      setMembers(prev => prev.filter(m => m.id !== deletingMemberId))

      toast.success('Member removed successfully')
      setDeletingMemberId(null)
    } catch (error) {
      toast.error('Failed to remove member')
      console.error(error)
      throw error
    }
  }

  const openDeleteDialog = (memberId: string) => {
    setDeletingMemberId(memberId)
    setDeleteDialogOpen(true)
  }

  return (
    <>
      <form id={formId} onSubmit={handleSubmit} className="space-y-6">
        {/* Group Information */}
        <FormSectionCard
          title="Group Information"
          description="Basic information about this group"
        >
          <FormField
            id="name"
            label="Name"
            value={name}
            onChange={setName}
            placeholder="e.g., Lectors, Eucharistic Ministers, Choir"
            required
          />

          <FormField
            id="description"
            inputType="textarea"
            label="Description"
            value={description}
            onChange={setDescription}
            placeholder="Optional description of this group's purpose"
            rows={3}
          />

          <FormField
            id="is_active"
            inputType="checkbox"
            label="Active"
            description="Inactive groups are hidden from selection but not deleted"
            value={isActive}
            onChange={setIsActive}
          />
        </FormSectionCard>

        {/* Member Management (Edit Mode Only) */}
        {isEditing && (
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                Manage Members
              </CardTitle>
              <Button
                type="button"
                onClick={() => setAddMemberDialogOpen(true)}
                size="sm"
              >
                <Plus className="h-4 w-4 mr-2" />
                Add Member
              </Button>
            </CardHeader>
            <CardContent className="space-y-6">
              {members.length > 0 ? (
                <div className="space-y-3">
                  <h4 className="font-medium text-sm text-muted-foreground">
                    Members ({members.length})
                  </h4>
                  <div className="space-y-3">
                    {members.map((member) => (
                      <MemberListItem
                        key={member.id}
                        person={member.person!}
                        badge={member.group_role ? {
                          label: member.group_role.name,
                          variant: 'secondary'
                        } : undefined}
                        onDelete={() => openDeleteDialog(member.id)}
                        testIdPrefix="group-member"
                      />
                    ))}
                  </div>
                </div>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  <Users className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>No members in this group yet</p>
                  <p className="text-sm mt-2">Use the button above to add people to this group</p>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* Form Actions */}
        <FormBottomActions
          isEditing={isEditing}
          isLoading={isLoading}
          cancelHref={isEditing && group ? `/groups/${group.id}` : '/groups'}
          moduleName="Group"
        />
      </form>

      {/* Add Member Dialog */}
      {isEditing && (
        <Dialog open={addMemberDialogOpen} onOpenChange={setAddMemberDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add Member to {group?.name}</DialogTitle>
              <DialogDescription>
                Select a person and optionally assign a group role
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4 py-4">
              <PersonPickerField
                label="Person"
                value={selectedPerson}
                onValueChange={setSelectedPerson}
                showPicker={showPersonPicker}
                onShowPickerChange={setShowPersonPicker}
                placeholder="Search or create a person"
                required
              />

              <div className="space-y-2">
                <Label htmlFor="group_role">Group Role (Optional)</Label>
                <Select
                  value={selectedGroupRoleId}
                  onValueChange={setSelectedGroupRoleId}
                >
                  <SelectTrigger id="group_role">
                    <SelectValue placeholder="Select role (optional)..." />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">No role</SelectItem>
                    {groupRoles.map((role) => (
                      <SelectItem key={role.id} value={role.id}>
                        {role.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={handleCancelAddMember}
                disabled={isAddingMember}
              >
                Cancel
              </Button>
              <Button
                type="button"
                onClick={handleAddMember}
                disabled={!selectedPerson || isAddingMember}
              >
                {isAddingMember ? 'Adding...' : 'Add Member'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}

      {/* Delete Member Confirmation Dialog */}
      {isEditing && (
        <DeleteConfirmationDialog
          open={deleteDialogOpen}
          onOpenChange={setDeleteDialogOpen}
          title="Remove Member"
          itemName={
            members.find(m => m.id === deletingMemberId)
              ? formatPersonName(members.find(m => m.id === deletingMemberId)!.person)
              : undefined
          }
          description="Are you sure you want to remove this person from this group?"
          onConfirm={handleDeleteMember}
        />
      )}
    </>
  )
}

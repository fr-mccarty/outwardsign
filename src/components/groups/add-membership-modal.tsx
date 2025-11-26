'use client'

import { useState, useEffect } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Save, X } from "lucide-react"
import { PersonPickerField } from '@/components/person-picker-field'
import { GroupRolePickerField } from '@/components/group-role-picker-field'
import { usePickerState } from '@/hooks/use-picker-state'
import type { Person } from '@/lib/types'
import { addGroupMember, updateGroupMemberRole, type GroupMember } from '@/lib/actions/groups'
import type { GroupRole } from '@/lib/actions/group-roles'
import { toast } from 'sonner'

interface AddMembershipModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  groupId: string
  groupName: string
  onSuccess: () => void
  editMode?: boolean
  memberToEdit?: GroupMember | null
}

export function AddMembershipModal({
  open,
  onOpenChange,
  groupId,
  groupName,
  onSuccess,
  editMode = false,
  memberToEdit = null,
}: AddMembershipModalProps) {
  const [saving, setSaving] = useState(false)

  const person = usePickerState<Person>()
  const groupRole = usePickerState<GroupRole>()

  // Pre-populate fields when editing
  useEffect(() => {
    if (editMode && memberToEdit && open) {
      if (memberToEdit.person) {
        person.setValue(memberToEdit.person as Person)
      }
      if (memberToEdit.group_role) {
        groupRole.setValue(memberToEdit.group_role as GroupRole)
      }
    }
  }, [editMode, memberToEdit, open])

  const handleSubmit = async () => {
    if (!person.value) {
      toast.error('Please select a person')
      return
    }

    setSaving(true)
    try {
      if (editMode && memberToEdit) {
        // Update existing member's role
        await updateGroupMemberRole(groupId, memberToEdit.person_id, groupRole.value?.id || null)
        toast.success('Member updated successfully')
      } else {
        // Add new member
        await addGroupMember(groupId, person.value.id, groupRole.value?.id)
        toast.success('Member added successfully')
      }

      // Reset form
      person.setValue(null)
      groupRole.setValue(null)

      // Close modal and refresh data
      onOpenChange(false)
      onSuccess()
    } catch (error) {
      console.error(editMode ? 'Failed to update member:' : 'Failed to add member:', error)
      toast.error(error instanceof Error ? error.message : (editMode ? 'Failed to update member' : 'Failed to add member'))
    } finally {
      setSaving(false)
    }
  }

  const handleCancel = () => {
    person.setValue(null)
    groupRole.setValue(null)
    onOpenChange(false)
  }

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-md flex flex-col">
          <DialogHeader className="flex-shrink-0">
            <DialogTitle>
              {editMode ? `Edit Member in ${groupName}` : `Add Member to ${groupName}`}
            </DialogTitle>
            <DialogDescription>
              {editMode
                ? 'Update the group role for this member'
                : 'Select a person and optionally assign a group role'}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-6 overflow-y-auto flex-1">
            {/* Person Selection */}
            {editMode ? (
              <div className="space-y-2">
                <label className="text-sm font-medium">Person</label>
                <div className="p-3 border rounded-md bg-muted">
                  <p className="font-medium">
                    {person.value
                      ? `${person.value.first_name} ${person.value.last_name}`
                      : 'Unknown Person'}
                  </p>
                  {person.value?.email && (
                    <p className="text-sm text-muted-foreground">{person.value.email}</p>
                  )}
                </div>
              </div>
            ) : (
              <PersonPickerField
                label="Person"
                value={person.value}
                onValueChange={person.setValue}
                showPicker={person.showPicker}
                onShowPickerChange={person.setShowPicker}
                placeholder="Select Person"
                required
                additionalVisibleFields={['email', 'phone_number', 'note']}
              />
            )}

            {/* Group Role Selection */}
            <GroupRolePickerField
              label="Group Role"
              value={groupRole.value}
              onValueChange={groupRole.setValue}
              showPicker={groupRole.showPicker}
              onShowPickerChange={groupRole.setShowPicker}
              placeholder="Select Group Role (Optional)"
              description="Optional: Assign a role to this member in the group"
            />
          </div>

          <div className="flex gap-2 justify-end flex-shrink-0 pt-4 border-t">
            <Button
              variant="outline"
              onClick={handleCancel}
              disabled={saving}
            >
              <X className="h-4 w-4 mr-2" />
              Cancel
            </Button>
            <Button
              onClick={handleSubmit}
              disabled={saving || !person.value}
            >
              <Save className="h-4 w-4 mr-2" />
              {saving ? (editMode ? 'Updating...' : 'Adding...') : (editMode ? 'Update Member' : 'Add Member')}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}

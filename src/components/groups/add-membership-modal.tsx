'use client'

import { useState, useEffect } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Save, X, UserPlus } from "lucide-react"
import { PeoplePicker } from '@/components/people-picker'
import { usePickerState } from '@/hooks/use-picker-state'
import type { Person } from '@/lib/types'
import { addGroupMember } from '@/lib/actions/groups'
import { getGroupRoles, type GroupRole } from '@/lib/actions/group-roles'
import { toast } from 'sonner'
import { MASS_ROLE_LABELS, type MassRoleType } from '@/lib/constants'
import { useLanguage } from '@/components/language-context'

interface AddMembershipModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  groupId: string
  groupName: string
  onSuccess: () => void
}

export function AddMembershipModal({
  open,
  onOpenChange,
  groupId,
  groupName,
  onSuccess,
}: AddMembershipModalProps) {
  const { language } = useLanguage()
  const [selectedPersonId, setSelectedPersonId] = useState<string | null>(null)
  const [selectedGroupRoleId, setSelectedGroupRoleId] = useState<string | undefined>(undefined)
  const [groupRoles, setGroupRoles] = useState<GroupRole[]>([])
  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)

  const peoplePickerState = usePickerState()

  // Helper function to get group role label
  const getRoleLabel = (roleName: string) => {
    if (roleName in MASS_ROLE_LABELS) {
      return MASS_ROLE_LABELS[roleName as MassRoleType][language]
    }
    return roleName
  }

  // Fetch group roles when modal opens
  useEffect(() => {
    if (open) {
      setLoading(true)
      getGroupRoles()
        .then(roles => setGroupRoles(roles))
        .catch(error => {
          console.error('Failed to fetch group roles:', error)
          toast.error('Failed to load group roles')
        })
        .finally(() => setLoading(false))
    }
  }, [open])

  const handlePersonSelect = (person: Person) => {
    setSelectedPersonId(person.id)
    peoplePickerState.setShowPicker(false)
  }

  const handleSubmit = async () => {
    if (!selectedPersonId) {
      toast.error('Please select a person')
      return
    }

    setSaving(true)
    try {
      await addGroupMember(groupId, selectedPersonId, selectedGroupRoleId)
      toast.success('Member added successfully')

      // Reset form
      setSelectedPersonId(null)
      setSelectedGroupRoleId(undefined)

      // Close modal and refresh data
      onOpenChange(false)
      onSuccess()
    } catch (error) {
      console.error('Failed to add member:', error)
      toast.error(error instanceof Error ? error.message : 'Failed to add member')
    } finally {
      setSaving(false)
    }
  }

  const handleCancel = () => {
    setSelectedPersonId(null)
    setSelectedGroupRoleId(undefined)
    onOpenChange(false)
  }

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-md flex flex-col">
          <DialogHeader className="flex-shrink-0">
            <DialogTitle>Add Member to {groupName}</DialogTitle>
            <DialogDescription>
              Select a person and optionally assign a group role
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-6 overflow-y-auto flex-1">
            {/* Person Selection */}
            <div className="space-y-2">
              <Label>Person *</Label>
              <Button
                variant="outline"
                className="w-full justify-start"
                onClick={() => peoplePickerState.setShowPicker(true)}
              >
                <UserPlus className="h-4 w-4 mr-2" />
                {selectedPersonId ? 'Change Person' : 'Select Person'}
              </Button>
              {selectedPersonId && (
                <p className="text-sm text-muted-foreground">
                  Person selected
                </p>
              )}
            </div>

            {/* Group Role Selection */}
            <div className="space-y-2">
              <Label htmlFor="group-role">Group Role (Optional)</Label>
              <Select
                value={selectedGroupRoleId}
                onValueChange={setSelectedGroupRoleId}
                disabled={loading}
              >
                <SelectTrigger id="group-role" data-testid="role-select-trigger">
                  <SelectValue placeholder="Select a group role..." />
                </SelectTrigger>
                <SelectContent data-testid="role-select-content">
                  <SelectItem value="none" data-testid="role-option-none">No Group Role</SelectItem>
                  {groupRoles.map((role) => (
                    <SelectItem key={role.id} value={role.id} data-testid={`role-option-${role.name}`}>
                      {getRoleLabel(role.name)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
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
              disabled={saving || !selectedPersonId}
            >
              <Save className="h-4 w-4 mr-2" />
              {saving ? 'Adding...' : 'Add Member'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* People Picker Modal */}
      <PeoplePicker
        open={peoplePickerState.showPicker}
        onOpenChange={peoplePickerState.setShowPicker}
        onSelect={handlePersonSelect}
        selectedPersonId={selectedPersonId || undefined}
      />
    </>
  )
}

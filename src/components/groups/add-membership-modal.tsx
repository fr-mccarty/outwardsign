'use client'

import { useState } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { Save, X, UserPlus } from "lucide-react"
import { PeoplePicker } from '@/components/people-picker'
import { usePickerState } from '@/hooks/use-picker-state'
import type { Person } from '@/lib/types'
import { ROLE_VALUES, ROLE_LABELS, type LiturgicalRole } from '@/lib/constants'
import { addGroupMember } from '@/lib/actions/groups'
import { toast } from 'sonner'

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
  const [selectedPersonId, setSelectedPersonId] = useState<string | null>(null)
  const [selectedRoles, setSelectedRoles] = useState<LiturgicalRole[]>([])
  const [saving, setSaving] = useState(false)

  const peoplePickerState = usePickerState()

  const handlePersonSelect = (person: Person) => {
    setSelectedPersonId(person.id)
    peoplePickerState.setShowPicker(false)
  }

  const handleRoleToggle = (role: LiturgicalRole) => {
    setSelectedRoles(prev => {
      if (prev.includes(role)) {
        return prev.filter(r => r !== role)
      } else {
        return [...prev, role]
      }
    })
  }

  const handleSubmit = async () => {
    if (!selectedPersonId) {
      toast.error('Please select a person')
      return
    }

    setSaving(true)
    try {
      await addGroupMember(groupId, selectedPersonId, selectedRoles.length > 0 ? selectedRoles : undefined)
      toast.success('Member added successfully')

      // Reset form
      setSelectedPersonId(null)
      setSelectedRoles([])

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
    setSelectedRoles([])
    onOpenChange(false)
  }

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-md flex flex-col">
          <DialogHeader className="flex-shrink-0">
            <DialogTitle>Add Member to {groupName}</DialogTitle>
            <DialogDescription>
              Select a person and assign one or more liturgical roles
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

            {/* Role Selection */}
            <div className="space-y-3">
              <Label>Roles (Optional)</Label>
              <p className="text-sm text-muted-foreground">
                Select one or more roles for this member
              </p>
              <div className="space-y-3 border rounded-lg p-4">
                {ROLE_VALUES.map((role) => (
                  <div key={role} className="flex items-start space-x-3">
                    <Checkbox
                      id={role}
                      checked={selectedRoles.includes(role)}
                      onCheckedChange={() => handleRoleToggle(role)}
                    />
                    <div className="flex-1">
                      <label
                        htmlFor={role}
                        className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
                      >
                        {ROLE_LABELS[role].en}
                      </label>
                      <p className="text-xs text-muted-foreground mt-1">
                        {ROLE_LABELS[role].es}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
              {selectedRoles.length > 0 && (
                <p className="text-sm text-muted-foreground">
                  {selectedRoles.length} role{selectedRoles.length !== 1 ? 's' : ''} selected
                </p>
              )}
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

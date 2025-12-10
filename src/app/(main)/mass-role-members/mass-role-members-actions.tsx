'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { UserPlus } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { Person, MassRole } from '@/lib/types'
import { PersonPickerField } from '@/components/person-picker-field'
import { MassRolePickerField } from '@/components/mass-role-picker-field'
import { createMassRolePreference } from '@/lib/actions/mass-role-members-compat'
import { toast } from 'sonner'

interface MassRoleMembersActionsProps {
  massRoles: MassRole[]
  allPeople: Person[]
}

export function MassRoleMembersActions({ massRoles: _massRoles, allPeople: _allPeople }: MassRoleMembersActionsProps) {
  // Note: massRoles and allPeople are available for future filtering enhancements
  void _massRoles
  void _allPeople
  const router = useRouter()
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [selectedRole, setSelectedRole] = useState<MassRole | null>(null)
  const [selectedPerson, setSelectedPerson] = useState<Person | null>(null)
  const [showRolePicker, setShowRolePicker] = useState(false)
  const [showPersonPicker, setShowPersonPicker] = useState(false)
  const [isSaving, setIsSaving] = useState(false)

  const handleAddRoleAssignment = async () => {
    if (!selectedRole) {
      toast.error('Please select a mass role')
      return
    }

    if (!selectedPerson) {
      toast.error('Please select a person')
      return
    }

    setIsSaving(true)
    try {
      await createMassRolePreference({
        person_id: selectedPerson.id,
        mass_role_id: selectedRole.id,
        active: true
      })

      toast.success(`${selectedPerson.first_name} ${selectedPerson.last_name} assigned to ${selectedRole.name}`)
      setIsDialogOpen(false)
      setSelectedRole(null)
      setSelectedPerson(null)
      router.refresh()
    } catch (error) {
      console.error('Error creating role assignment:', error)
      toast.error('Failed to create role assignment')
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <>
      <Button onClick={() => setIsDialogOpen(true)}>
        <UserPlus className="h-4 w-4 mr-2" />
        New Mass Role Member
      </Button>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>New Mass Role Member</DialogTitle>
            <DialogDescription>
              Select a mass role and assign a person to serve in that role.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <MassRolePickerField
              label="Mass Role"
              value={selectedRole}
              onValueChange={setSelectedRole}
              showPicker={showRolePicker}
              onShowPickerChange={setShowRolePicker}
              placeholder="Select a mass role..."
              required
            />
            <PersonPickerField
              label="Person"
              value={selectedPerson}
              onValueChange={setSelectedPerson}
              showPicker={showPersonPicker}
              onShowPickerChange={setShowPersonPicker}
              placeholder="Select a person..."
              required
              additionalVisibleFields={['email', 'phone_number', 'note']}
            />
            <div className="flex justify-end gap-3">
              <Button
                variant="outline"
                onClick={() => {
                  setIsDialogOpen(false)
                  setSelectedRole(null)
                  setSelectedPerson(null)
                }}
                disabled={isSaving}
              >
                Cancel
              </Button>
              <Button
                onClick={handleAddRoleAssignment}
                disabled={!selectedRole || !selectedPerson || isSaving}
              >
                {isSaving ? 'Creating...' : 'Create Assignment'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}

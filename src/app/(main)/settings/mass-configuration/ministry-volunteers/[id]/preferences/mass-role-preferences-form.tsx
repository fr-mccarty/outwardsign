'use client'

import { useState } from 'react'
import { Card, CardHeader, CardTitle, CardContent } from "@/components/content-card"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Save, Plus, X, Trash2 } from "lucide-react"
import { Person, MassRole } from "@/lib/types"
import type { MassRolePreferenceWithDetails } from "@/lib/actions/mass-role-members-compat"
import { createMassRolePreference, updateMassRolePreference, deleteMassRolePreference } from "@/lib/actions/mass-role-members-compat"
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'

interface MassRolePreferencesFormProps {
  person: Person
  preferences: MassRolePreferenceWithDetails[]
  massRoles: MassRole[]
}

export function MassRolePreferencesForm({
  person,
  preferences,
  massRoles
}: MassRolePreferencesFormProps) {
  const router = useRouter()
  const [isSaving, setIsSaving] = useState(false)
  const [editingMember, setEditingMember] = useState<MassRolePreferenceWithDetails | null>(null)
  const [isCreating, setIsCreating] = useState(false)

  // Form state
  const [selectedRole, setSelectedRole] = useState<string>('')
  const [membershipType, setMembershipType] = useState<'MEMBER' | 'LEADER'>('MEMBER')
  const [notes, setNotes] = useState('')

  const startEdit = (member: MassRolePreferenceWithDetails) => {
    setEditingMember(member)
    setSelectedRole(member.mass_role_id)
    setMembershipType(member.membership_type)
    setNotes(member.notes || '')
    setIsCreating(false)
  }

  const startCreate = () => {
    setEditingMember(null)
    setSelectedRole('')
    setMembershipType('MEMBER')
    setNotes('')
    setIsCreating(true)
  }

  const cancelEdit = () => {
    setEditingMember(null)
    setIsCreating(false)
  }

  const handleSave = async () => {
    if (!selectedRole) {
      toast.error('Please select a mass role')
      return
    }

    setIsSaving(true)
    try {
      const data = {
        person_id: person.id,
        mass_role_id: selectedRole,
        membership_type: membershipType,
        notes: notes || undefined,
        active: true
      }

      if (editingMember) {
        await updateMassRolePreference(editingMember.id, {
          membership_type: membershipType,
          notes: notes || undefined
        })
        toast.success('Role membership updated successfully')
      } else {
        await createMassRolePreference(data)
        toast.success('Role membership created successfully')
      }

      cancelEdit()
      router.refresh()
    } catch (error) {
      console.error('Error saving role membership:', error)
      toast.error('Failed to save role membership')
    } finally {
      setIsSaving(false)
    }
  }

  const handleDelete = async (memberId: string) => {
    if (!confirm('Are you sure you want to remove this role membership?')) {
      return
    }

    setIsSaving(true)
    try {
      await deleteMassRolePreference(memberId)
      toast.success('Role membership removed successfully')
      router.refresh()
    } catch (error) {
      console.error('Error deleting role membership:', error)
      toast.error('Failed to remove role membership')
    } finally {
      setIsSaving(false)
    }
  }

  // Get available roles (not already assigned)
  const assignedRoleIds = preferences.map(p => p.mass_role_id)
  const availableRoles = massRoles.filter(role =>
    !assignedRoleIds.includes(role.id) || (editingMember && editingMember.mass_role_id === role.id)
  )

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Mass Role Memberships</CardTitle>
          {!isCreating && !editingMember && (
            <Button onClick={startCreate} size="sm">
              <Plus className="h-4 w-4 mr-2" />
              Add Role
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {/* Existing role memberships */}
          {!isCreating && !editingMember && (
            <div className="space-y-3">
              {preferences.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <p>No role memberships yet</p>
                  <Button variant="link" onClick={startCreate} className="mt-2">
                    Add first role
                  </Button>
                </div>
              ) : (
                preferences.map((member) => (
                  <div
                    key={member.id}
                    className="flex items-start justify-between p-4 border rounded-lg"
                  >
                    <div className="space-y-2 flex-1">
                      <div className="flex items-center gap-3">
                        <h4 className="font-medium">
                          {member.mass_role?.name || 'Unknown Role'}
                        </h4>
                        <Badge variant={member.membership_type === 'LEADER' ? 'default' : 'secondary'}>
                          {member.membership_type}
                        </Badge>
                        {!member.active && (
                          <Badge variant="outline">Inactive</Badge>
                        )}
                      </div>
                      {member.notes && (
                        <p className="text-sm text-muted-foreground">{member.notes}</p>
                      )}
                    </div>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => startEdit(member)}
                        disabled={isSaving}
                      >
                        Edit
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDelete(member.id)}
                        disabled={isSaving}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}

          {/* Edit/Create form */}
          {(isCreating || editingMember) && (
            <div className="space-y-4 border p-4 rounded-lg">
              <h3 className="font-medium">
                {editingMember ? 'Edit Role Membership' : 'Add Role Membership'}
              </h3>

              {/* Role selection */}
              <div className="space-y-2">
                <Label>Mass Role *</Label>
                <Select
                  value={selectedRole}
                  onValueChange={setSelectedRole}
                  disabled={!!editingMember || isSaving}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select a role..." />
                  </SelectTrigger>
                  <SelectContent>
                    {availableRoles.map((role) => (
                      <SelectItem key={role.id} value={role.id}>
                        {role.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {editingMember && (
                  <p className="text-sm text-muted-foreground">
                    Role cannot be changed after creation
                  </p>
                )}
              </div>

              {/* Membership type */}
              <div className="space-y-2">
                <Label>Membership Type *</Label>
                <Select
                  value={membershipType}
                  onValueChange={(value: 'MEMBER' | 'LEADER') => setMembershipType(value)}
                  disabled={isSaving}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="MEMBER">Member</SelectItem>
                    <SelectItem value="LEADER">Leader (Coordinator)</SelectItem>
                  </SelectContent>
                </Select>
                <p className="text-sm text-muted-foreground">
                  Leaders coordinate scheduling and serve as contacts for the role
                </p>
              </div>

              {/* Notes */}
              <div className="space-y-2">
                <Label htmlFor="notes">Notes</Label>
                <Textarea
                  id="notes"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Special requirements, preferences, or other notes..."
                  rows={3}
                  disabled={isSaving}
                />
              </div>

              {/* Actions */}
              <div className="flex gap-3 pt-2">
                <Button
                  onClick={handleSave}
                  disabled={!selectedRole || isSaving}
                >
                  <Save className="h-4 w-4 mr-2" />
                  {isSaving ? 'Saving...' : 'Save'}
                </Button>
                <Button
                  variant="outline"
                  onClick={cancelEdit}
                  disabled={isSaving}
                >
                  <X className="h-4 w-4 mr-2" />
                  Cancel
                </Button>
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}

"use client"

import { useState, useEffect } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { FormInput } from "@/components/form-input"
import { FormSectionCard } from "@/components/form-section-card"
import { createMassRole, updateMassRole, MassRoleWithRelations } from "@/lib/actions/mass-roles"
import { createMassRoleMember, deleteMassRoleMember, updateMassRoleMember } from "@/lib/actions/mass-role-members"
import { Person } from "@/lib/types"
import { useRouter } from "next/navigation"
import { toast } from 'sonner'
import { FormBottomActions } from "@/components/form-bottom-actions"
import { PersonPickerField } from "@/components/person-picker-field"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/content-card"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Plus, X, Users } from "lucide-react"
import { DeleteConfirmationDialog } from "@/components/delete-confirmation-dialog"
import { createMassRoleSchema, type CreateMassRoleData } from "@/lib/schemas/mass-roles"

interface MassRoleFormProps {
  massRole?: MassRoleWithRelations
  formId?: string
  onLoadingChange?: (loading: boolean) => void
}

export function MassRoleForm({ massRole, formId, onLoadingChange }: MassRoleFormProps) {
  const router = useRouter()
  const isEditing = !!massRole

  // Initialize React Hook Form
  const {
    handleSubmit,
    setValue,
    watch,
    formState: { errors, isSubmitting }
  } = useForm<CreateMassRoleData>({
    resolver: zodResolver(createMassRoleSchema),
    defaultValues: {
      name: massRole?.name || "",
      description: massRole?.description || "",
      note: massRole?.note || "",
      is_active: massRole?.is_active ?? true,
    }
  })

  // Watch form values for controlled inputs
  const name = watch("name")
  const description = watch("description")
  const note = watch("note")
  const isActive = watch("is_active")

  // Notify parent component of loading state changes
  useEffect(() => {
    onLoadingChange?.(isSubmitting)
  }, [isSubmitting, onLoadingChange])

  // Member management state
  const [addMemberDialogOpen, setAddMemberDialogOpen] = useState(false)
  const [showPersonPicker, setShowPersonPicker] = useState(false)
  const [selectedPerson, setSelectedPerson] = useState<Person | null>(null)
  const [membershipType, setMembershipType] = useState<'MEMBER' | 'LEADER'>('MEMBER')
  const [isAddingMember, setIsAddingMember] = useState(false)
  const [deletingMemberId, setDeletingMemberId] = useState<string | null>(null)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)

  // Local state for members (optimistic updates)
  const [members, setMembers] = useState(massRole?.mass_role_members || [])

  const onSubmit = async (data: CreateMassRoleData) => {
    try {
      // Prepare data for submission
      const massRoleData = {
        name: data.name,
        description: data.description || undefined,
        note: data.note || undefined,
        is_active: data.is_active,
      }

      if (isEditing) {
        await updateMassRole(massRole.id, massRoleData)
        toast.success('Mass role updated successfully')
        router.refresh() // Refresh to show updated data, stay on edit page
      } else {
        const newMassRole = await createMassRole(massRoleData)
        toast.success('Mass role created successfully')
        router.push(`/settings/mass-configuration/role-definitions/${newMassRole.id}/edit`)
      }
    } catch (error) {
      console.error('Error saving mass role:', error)
      toast.error(isEditing ? 'Failed to update mass role' : 'Failed to create mass role')
    }
  }

  const handleAddMember = async () => {
    if (!selectedPerson || !massRole) return

    // Check if person already a member
    if (members.some(m => m.person_id === selectedPerson.id)) {
      toast.error('This person is already a member of this role')
      return
    }

    try {
      setIsAddingMember(true)

      const newMember = await createMassRoleMember({
        person_id: selectedPerson.id,
        mass_role_id: massRole.id,
        membership_type: membershipType,
        active: true
      })

      // Optimistically add to local state
      setMembers(prev => [...prev, {
        id: newMember.id,
        person_id: selectedPerson.id,
        membership_type: membershipType,
        active: true,
        notes: null,
        person: {
          id: selectedPerson.id,
          first_name: selectedPerson.first_name,
          last_name: selectedPerson.last_name,
          full_name: selectedPerson.full_name,
          preferred_name: null,
          email: selectedPerson.email || null,
          phone_number: selectedPerson.phone_number || null
        }
      }])

      toast.success('Member added successfully')

      // Reset and close
      setSelectedPerson(null)
      setMembershipType('MEMBER')
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
    setMembershipType('MEMBER')
    setAddMemberDialogOpen(false)
  }

  const handleToggleMemberActive = async (memberId: string, currentActive: boolean) => {
    try {
      await updateMassRoleMember(memberId, { active: !currentActive })

      // Optimistically update local state
      setMembers(prev => prev.map(m =>
        m.id === memberId ? { ...m, active: !currentActive } : m
      ))

      toast.success(currentActive ? 'Member deactivated' : 'Member activated')
    } catch (error) {
      toast.error('Failed to update member status')
      console.error(error)
    }
  }

  const handleDeleteMember = async () => {
    if (!deletingMemberId) return

    try {
      await deleteMassRoleMember(deletingMemberId)

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
    <form id={formId} onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      {/* Basic Information */}
      <FormSectionCard
        title="Basic Information"
        description="Core details for this mass role"
      >
        <FormInput
          id="name"
          label="Role Name"
          description="Name of the liturgical role (e.g., Lector, Eucharistic Minister, Altar Server)"
          inputType="text"
          value={name}
          onChange={(value) => setValue("name", value)}
          placeholder="Enter role name..."
          required
          error={errors.name?.message}
        />

        <FormInput
          id="description"
          label="Description"
          description="Brief description of this role's responsibilities"
          inputType="textarea"
          value={description}
          onChange={(value) => setValue("description", value)}
          placeholder="Describe the role's responsibilities..."
          rows={3}
          error={errors.description?.message}
        />

        <FormInput
          id="is_active"
          inputType="checkbox"
          label="Active"
          description="Inactive roles are hidden from selection but not deleted"
          value={isActive}
          onChange={(value: boolean) => setValue("is_active", value)}
        />
      </FormSectionCard>

      {/* Notes */}
      <FormSectionCard
        title="Notes"
        description="Internal notes and reminders (not shown to ministers)"
      >
        <FormInput
          id="note"
          label="Notes"
          inputType="textarea"
          value={note}
          onChange={(value) => setValue("note", value)}
          placeholder="Add any internal notes or reminders..."
          rows={3}
          error={errors.note?.message}
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

            {/* Active Members List */}
            {members.filter(m => m.active).length > 0 && (
              <div className="space-y-3">
                <h4 className="font-medium text-sm text-muted-foreground">
                  Active Members ({members.filter(m => m.active).length})
                </h4>
                <div className="space-y-3">
                  {members.filter(m => m.active).map((member) => (
                    <div
                      key={member.id}
                      className="p-4 border rounded-lg"
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 flex-wrap">
                            <h3 className="font-medium">
                              {member.person?.full_name || 'Unknown Person'}
                            </h3>
                            <Badge variant={member.membership_type === 'LEADER' ? 'default' : 'secondary'}>
                              {member.membership_type}
                            </Badge>
                          </div>
                          {member.person?.email && (
                            <p className="text-sm text-muted-foreground">
                              {member.person.email}
                            </p>
                          )}
                          {member.person?.phone_number && (
                            <p className="text-sm text-muted-foreground">
                              {member.person.phone_number}
                            </p>
                          )}
                        </div>
                        <div className="flex items-center gap-2">
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => handleToggleMemberActive(member.id, member.active)}
                          >
                            Deactivate
                          </Button>
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => openDeleteDialog(member.id)}
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Inactive Members List */}
            {members.filter(m => !m.active).length > 0 && (
              <div className="space-y-3">
                <h4 className="font-medium text-sm text-muted-foreground">
                  Inactive Members ({members.filter(m => !m.active).length})
                </h4>
                <div className="space-y-3">
                  {members.filter(m => !m.active).map((member) => (
                    <div
                      key={member.id}
                      className="p-4 border rounded-lg bg-muted/50 opacity-60"
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 flex-wrap">
                            <h3 className="font-medium">
                              {member.person?.full_name || 'Unknown Person'}
                            </h3>
                            <Badge variant="outline">
                              {member.membership_type}
                            </Badge>
                          </div>
                          {member.person?.email && (
                            <p className="text-sm text-muted-foreground">
                              {member.person.email}
                            </p>
                          )}
                          {member.person?.phone_number && (
                            <p className="text-sm text-muted-foreground">
                              {member.person.phone_number}
                            </p>
                          )}
                        </div>
                        <div className="flex items-center gap-2">
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => handleToggleMemberActive(member.id, member.active)}
                          >
                            Activate
                          </Button>
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => openDeleteDialog(member.id)}
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {members.length === 0 && (
              <div className="text-center py-8 text-muted-foreground">
                <Users className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>No members assigned to this role yet</p>
                <p className="text-sm mt-2">Use the form above to add people to this role</p>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Form Actions */}
      <FormBottomActions
        isEditing={isEditing}
        isLoading={isSubmitting}
        cancelHref={isEditing ? `/settings/mass-configuration/role-definitions/${massRole.id}` : '/settings/mass-configuration/role-definitions'}
        moduleName="Mass Role"
      />
    </form>

    {/* Add Member Dialog */}
    {isEditing && (
      <Dialog open={addMemberDialogOpen} onOpenChange={setAddMemberDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Member to {massRole?.name}</DialogTitle>
            <DialogDescription>
              Select a person and assign their membership type
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
              additionalVisibleFields={['email', 'phone_number', 'note']}
            />

            <FormInput
              id="membership_type"
              label="Membership Type"
              inputType="select"
              value={membershipType}
              onChange={(value) => setMembershipType(value as 'MEMBER' | 'LEADER')}
              options={[
                { value: 'MEMBER', label: 'Member' },
                { value: 'LEADER', label: 'Leader' }
              ]}
              required
            />
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
          members.find(m => m.id === deletingMemberId)?.person?.full_name
        }
        description="Are you sure you want to remove this person from this role?"
        onConfirm={handleDeleteMember}
      />
    )}
    </>
  )
}

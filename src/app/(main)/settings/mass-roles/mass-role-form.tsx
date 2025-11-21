'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { Badge } from '@/components/ui/badge'
import { SaveButton } from '@/components/save-button'
import { CancelButton } from '@/components/cancel-button'
import { PersonPickerField } from '@/components/person-picker-field'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Plus, X, Users } from 'lucide-react'
import { toast } from 'sonner'
import { createMassRole, updateMassRole, MassRoleWithRelations } from '@/lib/actions/mass-roles'
import { createMassRoleMember, updateMassRoleMember, deleteMassRoleMember } from '@/lib/actions/mass-role-members'
import { DeleteConfirmationDialog } from '@/components/delete-confirmation-dialog'
import { formatPersonName } from '@/lib/utils/formatters'
import type { Person } from '@/lib/types'

const massRoleSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  description: z.string().optional(),
  note: z.string().optional(),
  is_active: z.boolean(),
  display_order: z.string().optional()
})

type MassRoleFormData = z.infer<typeof massRoleSchema>

interface MassRoleFormProps {
  massRole?: MassRoleWithRelations
}

export function MassRoleForm({ massRole }: MassRoleFormProps) {
  const router = useRouter()
  const isEditing = !!massRole

  const [isSaving, setIsSaving] = useState(false)
  const [showPersonPicker, setShowPersonPicker] = useState(false)
  const [selectedPerson, setSelectedPerson] = useState<Person | null>(null)
  const [membershipType, setMembershipType] = useState<'MEMBER' | 'LEADER'>('MEMBER')
  const [isAddingMember, setIsAddingMember] = useState(false)
  const [deletingMemberId, setDeletingMemberId] = useState<string | null>(null)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)

  // Local state for members (optimistic updates)
  const [members, setMembers] = useState(massRole?.mass_role_members || [])

  const form = useForm<MassRoleFormData>({
    resolver: zodResolver(massRoleSchema),
    defaultValues: {
      name: massRole?.name || '',
      description: massRole?.description || '',
      note: massRole?.note || '',
      is_active: massRole?.is_active ?? true,
      display_order: massRole?.display_order?.toString() || ''
    }
  })

  const onSubmit = async (data: MassRoleFormData) => {
    try {
      setIsSaving(true)

      if (isEditing) {
        await updateMassRole(massRole.id, {
          name: data.name.trim(),
          description: data.description?.trim() || null,
          note: data.note?.trim() || null,
          is_active: data.is_active,
          display_order: data.display_order ? parseInt(data.display_order) : null
        })
        toast.success('Mass role updated successfully')
        router.push(`/settings/mass-roles/${massRole.id}`)
      } else {
        const newRole = await createMassRole({
          name: data.name.trim(),
          description: data.description?.trim(),
          note: data.note?.trim(),
          is_active: data.is_active,
          display_order: data.display_order ? parseInt(data.display_order) : undefined
        })
        toast.success('Mass role created successfully')
        router.push(`/settings/mass-roles/${newRole.id}`)
      }
    } catch (error) {
      toast.error(isEditing ? 'Failed to update mass role' : 'Failed to create mass role')
      console.error(error)
    } finally {
      setIsSaving(false)
    }
  }

  const handleAddMember = async () => {
    if (!selectedPerson || !massRole) return

    try {
      setIsAddingMember(true)
      const newMember = await createMassRoleMember({
        person_id: selectedPerson.id,
        mass_role_id: massRole.id,
        membership_type: membershipType,
        active: true
      })

      // Optimistically add the member to local state
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
          preferred_name: null,
          email: selectedPerson.email || null,
          phone_number: selectedPerson.phone_number || null
        }
      }])

      toast.success('Member added successfully')
      setSelectedPerson(null)
      setMembershipType('MEMBER')
    } catch (error) {
      toast.error('Failed to add member')
      console.error(error)
    } finally {
      setIsAddingMember(false)
    }
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

  const activeMembers = members.filter(m => m.active)
  const inactiveMembers = members.filter(m => !m.active)

  return (
    <>
      <Form {...form}>
        <form id="mass-role-form" onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          {/* Mass Role Information */}
          <Card>
            <CardHeader>
              <CardTitle>Mass Role Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Name *</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g., Lector, Usher, Server" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Description</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Brief description of the role"
                        rows={3}
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="note"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Note</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Additional notes or instructions"
                        rows={2}
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="display_order"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Display Order</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        placeholder="Optional ordering number"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="is_active"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center space-x-2 space-y-0">
                    <FormControl>
                      <Checkbox
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                    <FormLabel className="font-normal cursor-pointer">Active</FormLabel>
                  </FormItem>
                )}
              />
            </CardContent>
          </Card>

          {/* Member Management (Edit Mode Only) */}
          {isEditing && (
            <>
              {/* Add Member Section */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Plus className="h-5 w-5" />
                    Add Member to Role
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <PersonPickerField
                    label="Person"
                    value={selectedPerson}
                    onValueChange={setSelectedPerson}
                    showPicker={showPersonPicker}
                    onShowPickerChange={setShowPersonPicker}
                    placeholder="Select a person"
                  />

                  <div className="space-y-2">
                    <label className="text-sm font-medium">Membership Type</label>
                    <Select
                      value={membershipType}
                      onValueChange={(v) => setMembershipType(v as 'MEMBER' | 'LEADER')}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="MEMBER">Member</SelectItem>
                        <SelectItem value="LEADER">Leader</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <Button
                    type="button"
                    onClick={handleAddMember}
                    disabled={!selectedPerson || isAddingMember}
                  >
                    {isAddingMember ? 'Adding...' : 'Add Member'}
                  </Button>
                </CardContent>
              </Card>

              {/* Active Members List */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Users className="h-5 w-5" />
                    Active Members ({activeMembers.length})
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {activeMembers.length === 0 ? (
                    <div className="text-center py-8 text-muted-foreground">
                      No active members assigned to this role yet
                    </div>
                  ) : (
                    <div className="space-y-2">
                      {activeMembers.map((member) => (
                        <div
                          key={member.id}
                          className="flex items-center justify-between p-3 rounded-lg border bg-card"
                        >
                          <div className="flex items-center gap-3">
                            <span className="font-medium">
                              {member.person ?
                                `${member.person.first_name} ${member.person.last_name}` :
                                'Unknown Person'
                              }
                            </span>
                            <Badge variant={member.membership_type === 'LEADER' ? 'default' : 'secondary'}>
                              {member.membership_type}
                            </Badge>
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
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Inactive Members List */}
              {inactiveMembers.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle className="text-muted-foreground">
                      Inactive Members ({inactiveMembers.length})
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      {inactiveMembers.map((member) => (
                        <div
                          key={member.id}
                          className="flex items-center justify-between p-3 rounded-lg border bg-muted/50"
                        >
                          <div className="flex items-center gap-3 opacity-60">
                            <span className="font-medium">
                              {member.person ?
                                `${member.person.first_name} ${member.person.last_name}` :
                                'Unknown Person'
                              }
                            </span>
                            <Badge variant="outline">
                              {member.membership_type}
                            </Badge>
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
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}
            </>
          )}

          {/* Form Actions (Create Mode Only) */}
          {!isEditing && (
            <div className="flex justify-end gap-2">
              <CancelButton href="/settings/mass-roles" />
              <SaveButton isLoading={isSaving} />
            </div>
          )}
        </form>
      </Form>

      {/* Delete Member Confirmation Dialog */}
      <DeleteConfirmationDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        title="Remove Member"
        itemName={
          members.find(m => m.id === deletingMemberId)
            ? formatPersonName(members.find(m => m.id === deletingMemberId)!.person)
            : undefined
        }
        description="Are you sure you want to remove this person from this role?"
        onConfirm={handleDeleteMember}
      />
    </>
  )
}

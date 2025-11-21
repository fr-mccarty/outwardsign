'use client'

import { useEffect, useState } from 'react'
import { PageContainer } from '@/components/page-container'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { DeleteConfirmationDialog } from '@/components/delete-confirmation-dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Checkbox } from '@/components/ui/checkbox'
import { Plus, Pencil, Trash2, GripVertical, Users, X } from 'lucide-react'
import { ActiveInactiveBadge } from '@/components/active-inactive-badge'
import { useBreadcrumbs } from '@/components/breadcrumb-context'
import { toast } from 'sonner'
import {
  getMassRoles,
  createMassRole,
  updateMassRole,
  deleteMassRole,
  type CreateMassRoleData,
  type UpdateMassRoleData
} from '@/lib/actions/mass-roles'
import {
  getMassRoleMembersByRole,
  createMassRoleMember,
  updateMassRoleMember,
  deleteMassRoleMember,
  type MassRoleMemberWithDetails,
} from '@/lib/actions/mass-role-members'
import { PersonPickerField } from '@/components/person-picker-field'
import { Badge } from '@/components/ui/badge'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import type { MassRole, Person } from '@/lib/types'

export default function MassRolesPage() {
  const { setBreadcrumbs } = useBreadcrumbs()
  const [roles, setRoles] = useState<MassRole[]>([])
  const [loading, setLoading] = useState(true)
  const [formOpen, setFormOpen] = useState(false)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [editingRole, setEditingRole] = useState<MassRole | null>(null)
  const [deletingRole, setDeletingRole] = useState<MassRole | null>(null)
  const [submitting, setSubmitting] = useState(false)

  // Members dialog state
  const [membersDialogOpen, setMembersDialogOpen] = useState(false)
  const [selectedRole, setSelectedRole] = useState<MassRole | null>(null)
  const [members, setMembers] = useState<MassRoleMemberWithDetails[]>([])
  const [membersLoading, setMembersLoading] = useState(false)
  const [addMemberOpen, setAddMemberOpen] = useState(false)
  const [newMemberPerson, setNewMemberPerson] = useState<Person | null>(null)
  const [showPersonPicker, setShowPersonPicker] = useState(false)
  const [newMemberType, setNewMemberType] = useState<'MEMBER' | 'LEADER'>('MEMBER')
  const [addingMember, setAddingMember] = useState(false)
  const [deletingMember, setDeletingMember] = useState<MassRoleMemberWithDetails | null>(null)
  const [deleteMemberDialogOpen, setDeleteMemberDialogOpen] = useState(false)

  // Form state
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [note, setNote] = useState('')
  const [isActive, setIsActive] = useState(true)
  const [displayOrder, setDisplayOrder] = useState('')

  useEffect(() => {
    setBreadcrumbs([
      { label: 'Dashboard', href: '/dashboard' },
      { label: 'Settings', href: '/settings' },
      { label: 'Mass Roles' }
    ])
  }, [setBreadcrumbs])

  useEffect(() => {
    loadRoles()
  }, [])

  const loadRoles = async () => {
    try {
      setLoading(true)
      const data = await getMassRoles()
      setRoles(data)
    } catch (error) {
      toast.error('Failed to load mass roles')
      console.error(error)
    } finally {
      setLoading(false)
    }
  }

  const handleOpenCreate = () => {
    setEditingRole(null)
    setName('')
    setDescription('')
    setNote('')
    setIsActive(true)
    setDisplayOrder('')
    setFormOpen(true)
  }

  const handleOpenEdit = (role: MassRole) => {
    setEditingRole(role)
    setName(role.name)
    setDescription(role.description || '')
    setNote(role.note || '')
    setIsActive(role.is_active)
    setDisplayOrder(role.display_order?.toString() || '')
    setFormOpen(true)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!name.trim()) {
      toast.error('Name is required')
      return
    }

    try {
      setSubmitting(true)

      if (editingRole) {
        const updateData: UpdateMassRoleData = {
          name: name.trim(),
          description: description.trim() || null,
          note: note.trim() || null,
          is_active: isActive,
          display_order: displayOrder ? parseInt(displayOrder) : null
        }
        await updateMassRole(editingRole.id, updateData)
        toast.success('Mass role updated successfully')
      } else {
        const createData: CreateMassRoleData = {
          name: name.trim(),
          description: description.trim() || undefined,
          note: note.trim() || undefined,
          is_active: isActive,
          display_order: displayOrder ? parseInt(displayOrder) : undefined
        }
        await createMassRole(createData)
        toast.success('Mass role created successfully')
      }

      setFormOpen(false)
      loadRoles()
    } catch (error) {
      toast.error(editingRole ? 'Failed to update mass role' : 'Failed to create mass role')
      console.error(error)
    } finally {
      setSubmitting(false)
    }
  }

  const handleDelete = async () => {
    if (!deletingRole) return

    try {
      await deleteMassRole(deletingRole.id)
      toast.success('Mass role deleted successfully')
      setDeletingRole(null)
      loadRoles()
    } catch (error: any) {
      toast.error(error.message || 'Failed to delete mass role')
      console.error(error)
      throw error
    }
  }

  const openDeleteDialog = (role: MassRole) => {
    setDeletingRole(role)
    setDeleteDialogOpen(true)
  }

  // Members dialog handlers
  const openMembersDialog = async (role: MassRole) => {
    setSelectedRole(role)
    setMembersDialogOpen(true)
    setMembersLoading(true)
    try {
      const data = await getMassRoleMembersByRole(role.id)
      setMembers(data)
    } catch (error) {
      toast.error('Failed to load members')
      console.error(error)
    } finally {
      setMembersLoading(false)
    }
  }

  const handleAddMember = async () => {
    if (!newMemberPerson || !selectedRole) return

    try {
      setAddingMember(true)
      await createMassRoleMember({
        person_id: newMemberPerson.id,
        mass_role_id: selectedRole.id,
        membership_type: newMemberType,
      })
      toast.success('Member added successfully')

      // Refresh members list
      const data = await getMassRoleMembersByRole(selectedRole.id)
      setMembers(data)

      // Reset form
      setAddMemberOpen(false)
      setNewMemberPerson(null)
      setNewMemberType('MEMBER')
    } catch (error) {
      toast.error('Failed to add member')
      console.error(error)
    } finally {
      setAddingMember(false)
    }
  }

  const handleDeleteMember = async () => {
    if (!deletingMember || !selectedRole) return

    try {
      await deleteMassRoleMember(deletingMember.id)
      toast.success('Member removed successfully')

      // Refresh members list
      const data = await getMassRoleMembersByRole(selectedRole.id)
      setMembers(data)
      setDeletingMember(null)
    } catch (error) {
      toast.error('Failed to remove member')
      console.error(error)
      throw error
    }
  }

  const openDeleteMemberDialog = (member: MassRoleMemberWithDetails) => {
    setDeletingMember(member)
    setDeleteMemberDialogOpen(true)
  }

  return (
    <PageContainer
      title="Mass Roles"
      description="Manage liturgical roles for Mass ministries"
      actions={
        <Button onClick={handleOpenCreate}>
          <Plus className="h-4 w-4 mr-2" />
          Add Mass Role
        </Button>
      }
    >
      <Card>
        <CardHeader>
          <CardTitle>Mass Roles</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-8 text-muted-foreground">Loading...</div>
          ) : roles.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <p>No mass roles found</p>
              <Button onClick={handleOpenCreate} variant="outline" className="mt-4">
                <Plus className="h-4 w-4 mr-2" />
                Add Your First Mass Role
              </Button>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-12"></TableHead>
                  <TableHead>Name</TableHead>
                  <TableHead>Description</TableHead>
                  <TableHead className="w-24">Active</TableHead>
                  <TableHead className="w-28 text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {roles.map((role) => (
                  <TableRow key={role.id}>
                    <TableCell>
                      <GripVertical className="h-4 w-4 text-muted-foreground cursor-move" />
                    </TableCell>
                    <TableCell className="font-medium">{role.name}</TableCell>
                    <TableCell className="text-muted-foreground">
                      {role.description || '-'}
                    </TableCell>
                    <TableCell>
                      <ActiveInactiveBadge isActive={role.is_active} />
                    </TableCell>
                    <TableCell className="text-right space-x-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => openMembersDialog(role)}
                        title="Manage members"
                      >
                        <Users className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleOpenEdit(role)}
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => openDeleteDialog(role)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Create/Edit Dialog */}
      <Dialog open={formOpen} onOpenChange={setFormOpen}>
        <DialogContent>
          <form onSubmit={handleSubmit}>
            <DialogHeader>
              <DialogTitle>
                {editingRole ? 'Edit Mass Role' : 'Create Mass Role'}
              </DialogTitle>
              <DialogDescription>
                {editingRole
                  ? 'Update the mass role details below'
                  : 'Add a new liturgical role for Mass ministries'}
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="name">Name *</Label>
                <Input
                  id="name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g., Lector, Usher, Server"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Brief description of the role"
                  rows={3}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="note">Note</Label>
                <Textarea
                  id="note"
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  placeholder="Additional notes or instructions"
                  rows={2}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="displayOrder">Display Order</Label>
                <Input
                  id="displayOrder"
                  type="number"
                  value={displayOrder}
                  onChange={(e) => setDisplayOrder(e.target.value)}
                  placeholder="Optional ordering number"
                />
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="isActive"
                  checked={isActive}
                  onCheckedChange={(checked) => setIsActive(checked as boolean)}
                />
                <Label htmlFor="isActive" className="font-normal cursor-pointer">
                  Active
                </Label>
              </div>
            </div>
            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setFormOpen(false)}
                disabled={submitting}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={submitting}>
                {submitting ? 'Saving...' : editingRole ? 'Update' : 'Create'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <DeleteConfirmationDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        title="Delete Mass Role"
        itemName={deletingRole?.name}
        description={`Are you sure you want to delete "${deletingRole?.name}"? This action cannot be undone. This role cannot be deleted if it is being used in templates or assigned to people.`}
        onConfirm={handleDelete}
      />

      {/* Members Dialog */}
      <Dialog open={membersDialogOpen} onOpenChange={setMembersDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{selectedRole?.name} - Members</DialogTitle>
            <DialogDescription>
              Manage people assigned to this role
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            {/* Add Member Section */}
            {!addMemberOpen ? (
              <Button onClick={() => setAddMemberOpen(true)} variant="outline" size="sm">
                <Plus className="h-4 w-4 mr-2" />
                Add Member
              </Button>
            ) : (
              <Card>
                <CardContent className="pt-4 space-y-4">
                  <PersonPickerField
                    label="Person"
                    value={newMemberPerson}
                    onValueChange={setNewMemberPerson}
                    showPicker={showPersonPicker}
                    onShowPickerChange={setShowPersonPicker}
                    placeholder="Select a person"
                    required
                  />
                  <div className="space-y-2">
                    <Label htmlFor="memberType">Membership Type</Label>
                    <Select value={newMemberType} onValueChange={(v) => setNewMemberType(v as 'MEMBER' | 'LEADER')}>
                      <SelectTrigger id="memberType">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="MEMBER">Member</SelectItem>
                        <SelectItem value="LEADER">Leader</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      onClick={handleAddMember}
                      disabled={!newMemberPerson || addingMember}
                      size="sm"
                    >
                      {addingMember ? 'Adding...' : 'Add'}
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setAddMemberOpen(false)
                        setNewMemberPerson(null)
                        setNewMemberType('MEMBER')
                      }}
                    >
                      Cancel
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Members List */}
            {membersLoading ? (
              <div className="text-center py-8 text-muted-foreground">Loading members...</div>
            ) : members.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                No members assigned to this role yet
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead className="w-16"></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {members.map((member) => (
                    <TableRow key={member.id}>
                      <TableCell className="font-medium">
                        {member.person.preferred_name || `${member.person.first_name} ${member.person.last_name}`}
                      </TableCell>
                      <TableCell>
                        <Badge variant={member.membership_type === 'LEADER' ? 'default' : 'secondary'}>
                          {member.membership_type}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => openDeleteMemberDialog(member)}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* Delete Member Confirmation Dialog */}
      <DeleteConfirmationDialog
        open={deleteMemberDialogOpen}
        onOpenChange={setDeleteMemberDialogOpen}
        title="Remove Member"
        itemName={deletingMember?.person ? `${deletingMember.person.first_name} ${deletingMember.person.last_name}` : undefined}
        description={`Are you sure you want to remove this person from the ${selectedRole?.name} role?`}
        onConfirm={handleDeleteMember}
      />
    </PageContainer>
  )
}

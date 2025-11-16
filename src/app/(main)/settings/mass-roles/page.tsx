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
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Checkbox } from '@/components/ui/checkbox'
import { Plus, Pencil, Trash2, GripVertical } from 'lucide-react'
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
import type { MassRole } from '@/lib/types'

export default function MassRolesPage() {
  const { setBreadcrumbs } = useBreadcrumbs()
  const [roles, setRoles] = useState<MassRole[]>([])
  const [loading, setLoading] = useState(true)
  const [formOpen, setFormOpen] = useState(false)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [editingRole, setEditingRole] = useState<MassRole | null>(null)
  const [deletingRole, setDeletingRole] = useState<MassRole | null>(null)
  const [submitting, setSubmitting] = useState(false)

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
      setDeleteDialogOpen(false)
      loadRoles()
    } catch (error: any) {
      toast.error(error.message || 'Failed to delete mass role')
      console.error(error)
    }
  }

  const openDeleteDialog = (role: MassRole) => {
    setDeletingRole(role)
    setDeleteDialogOpen(true)
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
                  <TableHead className="w-28">Order</TableHead>
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
                      {role.is_active ? (
                        <span className="text-green-600">Active</span>
                      ) : (
                        <span className="text-muted-foreground">Inactive</span>
                      )}
                    </TableCell>
                    <TableCell>{role.display_order || '-'}</TableCell>
                    <TableCell className="text-right space-x-2">
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
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Mass Role?</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete "{deletingRole?.name}"? This action cannot be
              undone. This role cannot be deleted if it is being used in templates or assigned
              to people.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </PageContainer>
  )
}

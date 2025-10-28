'use client'

import { useEffect, useState } from 'react'
import { PageContainer } from "@/components/page-container"
import { Loading } from '@/components/loading'
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { FormField } from "@/components/ui/form-field"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { useBreadcrumbs } from '@/components/breadcrumb-context'
import { Plus, Edit, Trash2, Users, Save, X, UserPlus } from "lucide-react"
import { getGroups, createGroup, updateGroup, deleteGroup, type Group, type CreateGroupData, type UpdateGroupData } from '@/lib/actions/groups'
import { toast } from 'sonner'
import Link from 'next/link'

export default function GroupsPage() {
  const [groups, setGroups] = useState<Group[]>([])
  const [loading, setLoading] = useState(true)
  const [createDialogOpen, setCreateDialogOpen] = useState(false)
  const [editingGroup, setEditingGroup] = useState<Group | null>(null)
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    is_active: true
  })
  const [saving, setSaving] = useState(false)
  const { setBreadcrumbs } = useBreadcrumbs()

  useEffect(() => {
    setBreadcrumbs([
      { label: "Dashboard", href: "/dashboard" },
      { label: "Groups" }
    ])
  }, [setBreadcrumbs])

  useEffect(() => {
    loadGroups()
  }, [])

  const loadGroups = async () => {
    try {
      const data = await getGroups()
      setGroups(data)
    } catch (error) {
      console.error('Failed to load groups:', error)
      toast.error('Failed to load groups')
    } finally {
      setLoading(false)
    }
  }

  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      is_active: true
    })
  }

  const handleCreate = () => {
    resetForm()
    setEditingGroup(null)
    setCreateDialogOpen(true)
  }

  const handleEdit = (group: Group) => {
    setFormData({
      name: group.name,
      description: group.description || '',
      is_active: group.is_active
    })
    setEditingGroup(group)
    setCreateDialogOpen(true)
  }

  const handleDelete = async (group: Group) => {
    if (!confirm(`Are you sure you want to delete the group "${group.name}"?`)) {
      return
    }

    try {
      await deleteGroup(group.id)
      toast.success('Group deleted successfully')
      await loadGroups()
    } catch (error) {
      console.error('Failed to delete group:', error)
      toast.error('Failed to delete group')
    }
  }

  const handleSubmit = async () => {
    if (!formData.name.trim()) {
      toast.error('Group name is required')
      return
    }

    setSaving(true)
    try {
      if (editingGroup) {
        const updateData: UpdateGroupData = {}
        if (formData.name !== editingGroup.name) updateData.name = formData.name
        if (formData.description !== (editingGroup.description || '')) updateData.description = formData.description || undefined
        if (formData.is_active !== editingGroup.is_active) updateData.is_active = formData.is_active

        await updateGroup(editingGroup.id, updateData)
        toast.success('Group updated successfully')
      } else {
        const createData: CreateGroupData = {
          name: formData.name,
          description: formData.description || undefined,
          is_active: formData.is_active
        }
        await createGroup(createData)
        toast.success('Group created successfully')
      }
      
      setCreateDialogOpen(false)
      resetForm()
      await loadGroups()
    } catch (error) {
      console.error('Failed to save group:', error)
      toast.error('Failed to save group')
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <PageContainer 
        title="Groups"
        description="Loading groups..."
      >
        <Loading variant="skeleton-list" />
      </PageContainer>
    )
  }

  return (
    <PageContainer 
      title="Groups"
      description="Manage groups of people who serve together in liturgical ministries"
    >
      <div className="flex items-center justify-between mb-6">
        <div></div>
        <Button onClick={handleCreate}>
          <Plus className="h-4 w-4 mr-2" />
          Create Group
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Ministry Groups</CardTitle>
          <p className="text-sm text-muted-foreground">
            Create and manage groups of people who can be scheduled together for liturgical services.
          </p>
        </CardHeader>
        <CardContent>
          {groups.length === 0 ? (
            <div className="text-center py-8">
              <Users className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
              <p className="text-muted-foreground mb-4">No groups found</p>
              <Button onClick={handleCreate} variant="outline">
                <Plus className="h-4 w-4 mr-2" />
                Create Your First Group
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              {groups.map((group) => (
                <div
                  key={group.id}
                  className="flex items-center justify-between p-4 border rounded-lg"
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-primary/10 rounded-lg">
                        <Users className="h-5 w-5 text-primary" />
                      </div>
                      <div>
                        <h3 className="font-medium">
                          {group.name}
                          {!group.is_active && (
                            <span className="ml-2 px-2 py-1 text-xs bg-gray-100 text-gray-600 rounded">
                              Inactive
                            </span>
                          )}
                        </h3>
                        {group.description && (
                          <p className="text-sm text-muted-foreground">
                            {group.description}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      asChild
                    >
                      <Link href={`/groups/${group.id}`}>
                        <UserPlus className="h-4 w-4" />
                      </Link>
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleEdit(group)}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDelete(group)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Create/Edit Dialog */}
      <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>
              {editingGroup ? 'Edit Group' : 'Create New Group'}
            </DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4">
            <FormField
              id="name"
              label="Group Name"
              value={formData.name}
              onChange={(value) => setFormData({...formData, name: value})}
              placeholder="e.g., Choir, Youth Servers, Wedding Team"
              required
            />
            
            <FormField
              id="description"
              label="Description"
              inputType="textarea"
              value={formData.description}
              onChange={(value) => setFormData({...formData, description: value})}
              description="Optional description of the group's purpose or special notes"
            />
            
            <div className="flex items-center space-x-2">
              <Switch
                id="is_active"
                checked={formData.is_active}
                onCheckedChange={(checked) => setFormData({...formData, is_active: checked})}
              />
              <Label htmlFor="is_active">Active</Label>
            </div>
            
            <div className="flex gap-2 justify-end">
              <Button 
                variant="outline" 
                onClick={() => setCreateDialogOpen(false)}
                disabled={saving}
              >
                <X className="h-4 w-4 mr-2" />
                Cancel
              </Button>
              <Button onClick={handleSubmit} disabled={saving}>
                <Save className="h-4 w-4 mr-2" />
                {saving ? 'Saving...' : editingGroup ? 'Update' : 'Create'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </PageContainer>
  )
}
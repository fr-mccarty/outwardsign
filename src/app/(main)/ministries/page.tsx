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
import { Plus, Edit, Trash2, GripVertical, Save, X, Briefcase, RefreshCw } from "lucide-react"
import { getMinistries, createMinistry, updateMinistry, deleteMinistry, reorderMinistries, initializeDefaultMinistries, type Ministry, type CreateMinistryData, type UpdateMinistryData } from '@/lib/actions/ministries'
import { toast } from 'sonner'

export default function MinistriesPage() {
  const [ministries, setMinistries] = useState<Ministry[]>([])
  const [loading, setLoading] = useState(true)
  const [createDialogOpen, setCreateDialogOpen] = useState(false)
  const [editingMinistry, setEditingMinistry] = useState<Ministry | null>(null)
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    requirements: '',
    is_active: true
  })
  const [saving, setSaving] = useState(false)
  const [draggedItem, setDraggedItem] = useState<Ministry | null>(null)
  const { setBreadcrumbs } = useBreadcrumbs()

  useEffect(() => {
    setBreadcrumbs([
      { label: "Dashboard", href: "/dashboard" },
      { label: "Ministries" }
    ])
  }, [setBreadcrumbs])

  useEffect(() => {
    loadMinistries()
  }, [])

  const loadMinistries = async () => {
    try {
      const data = await getMinistries()
      setMinistries(data)
    } catch (error) {
      console.error('Failed to load ministries:', error)
      toast.error('Failed to load ministries')
    } finally {
      setLoading(false)
    }
  }

  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      requirements: '',
      is_active: true
    })
  }

  const handleCreate = () => {
    resetForm()
    setEditingMinistry(null)
    setCreateDialogOpen(true)
  }

  const handleEdit = (ministry: Ministry) => {
    setFormData({
      name: ministry.name,
      description: ministry.description || '',
      requirements: ministry.requirements || '',
      is_active: ministry.is_active
    })
    setEditingMinistry(ministry)
    setCreateDialogOpen(true)
  }

  const handleDelete = async (ministry: Ministry) => {
    if (!confirm(`Are you sure you want to delete the ministry "${ministry.name}"?`)) {
      return
    }

    try {
      await deleteMinistry(ministry.id)
      toast.success('Ministry deleted successfully')
      await loadMinistries()
    } catch (error) {
      console.error('Failed to delete ministry:', error)
      toast.error('Failed to delete ministry')
    }
  }

  const handleSubmit = async () => {
    if (!formData.name.trim()) {
      toast.error('Ministry name is required')
      return
    }

    setSaving(true)
    try {
      if (editingMinistry) {
        const updateData: UpdateMinistryData = {}
        if (formData.name !== editingMinistry.name) updateData.name = formData.name
        if (formData.description !== (editingMinistry.description || '')) updateData.description = formData.description || undefined
        if (formData.requirements !== (editingMinistry.requirements || '')) updateData.requirements = formData.requirements || undefined
        if (formData.is_active !== editingMinistry.is_active) updateData.is_active = formData.is_active

        await updateMinistry(editingMinistry.id, updateData)
        toast.success('Ministry updated successfully')
      } else {
        const createData: CreateMinistryData = {
          name: formData.name,
          description: formData.description || undefined,
          requirements: formData.requirements || undefined,
          is_active: formData.is_active
        }
        await createMinistry(createData)
        toast.success('Ministry created successfully')
      }
      
      setCreateDialogOpen(false)
      resetForm()
      await loadMinistries()
    } catch (error) {
      console.error('Failed to save ministry:', error)
      toast.error('Failed to save ministry')
    } finally {
      setSaving(false)
    }
  }

  const handleInitializeDefaults = async () => {
    if (!confirm('This will add default ministries if you don\'t have any yet. Continue?')) {
      return
    }

    setSaving(true)
    try {
      await initializeDefaultMinistries()
      toast.success('Default ministries initialized')
      await loadMinistries()
    } catch (error) {
      console.error('Failed to initialize default ministries:', error)
      toast.error('Failed to initialize default ministries')
    } finally {
      setSaving(false)
    }
  }

  const handleDragStart = (e: React.DragEvent, ministry: Ministry) => {
    setDraggedItem(ministry)
    e.dataTransfer.effectAllowed = 'move'
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    e.dataTransfer.dropEffect = 'move'
  }

  const handleDrop = async (e: React.DragEvent, targetMinistry: Ministry) => {
    e.preventDefault()
    
    if (!draggedItem || draggedItem.id === targetMinistry.id) {
      setDraggedItem(null)
      return
    }

    // Create new order
    const newOrder = [...ministries]
    const draggedIndex = newOrder.findIndex(m => m.id === draggedItem.id)
    const targetIndex = newOrder.findIndex(m => m.id === targetMinistry.id)

    // Remove dragged item and insert at new position
    newOrder.splice(draggedIndex, 1)
    newOrder.splice(targetIndex, 0, draggedItem)

    // Update local state immediately for smooth UX
    setMinistries(newOrder)
    setDraggedItem(null)

    try {
      // Update server
      await reorderMinistries(newOrder.map(m => m.id))
      toast.success('Ministries reordered successfully')
    } catch (error) {
      console.error('Failed to reorder ministries:', error)
      toast.error('Failed to reorder ministries')
      // Reload to get correct order
      await loadMinistries()
    }
  }

  if (loading) {
    return (
      <PageContainer 
        title="Ministries"
        description="Loading ministries..."
      >
        <Loading variant="skeleton-list" />
      </PageContainer>
    )
  }

  return (
    <PageContainer 
      title="Ministries"
      description="Manage liturgical ministry types and their requirements"
    >
      <div className="flex items-center justify-between mb-6">
        <div>
          {ministries.length === 0 && (
            <Button onClick={handleInitializeDefaults} variant="outline" disabled={saving}>
              <RefreshCw className="h-4 w-4 mr-2" />
              Initialize Default Ministries
            </Button>
          )}
        </div>
        <Button onClick={handleCreate}>
          <Plus className="h-4 w-4 mr-2" />
          Create Ministry
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Liturgical Ministries</CardTitle>
          <p className="text-sm text-muted-foreground">
            Define the types of liturgical ministries available for your events. Drag and drop to reorder them by priority.
          </p>
        </CardHeader>
        <CardContent>
          {ministries.length === 0 ? (
            <div className="text-center py-8">
              <Briefcase className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
              <p className="text-muted-foreground mb-4">No ministries found</p>
              <div className="space-y-2">
                <Button onClick={handleCreate} variant="outline">
                  <Plus className="h-4 w-4 mr-2" />
                  Create Your First Ministry
                </Button>
                <Button onClick={handleInitializeDefaults} variant="ghost" disabled={saving}>
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Or Initialize Common Ministries
                </Button>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              {ministries.map((ministry, index) => (
                <div
                  key={ministry.id}
                  draggable
                  onDragStart={(e) => handleDragStart(e, ministry)}
                  onDragOver={handleDragOver}
                  onDrop={(e) => handleDrop(e, ministry)}
                  className="flex items-center justify-between p-4 border rounded-lg cursor-move hover:border-primary/50 transition-colors"
                >
                  <div className="flex items-center gap-3 flex-1">
                    <div className="text-muted-foreground">
                      <GripVertical className="h-5 w-5" />
                    </div>
                    <div className="p-2 bg-primary/10 rounded-lg">
                      <Briefcase className="h-5 w-5 text-primary" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-muted-foreground font-mono w-6">
                          {index + 1}
                        </span>
                        <h3 className="font-medium">
                          {ministry.name}
                          {!ministry.is_active && (
                            <span className="ml-2 px-2 py-1 text-xs bg-gray-100 text-gray-600 rounded">
                              Inactive
                            </span>
                          )}
                        </h3>
                      </div>
                      {ministry.description && (
                        <p className="text-sm text-muted-foreground mt-1">
                          {ministry.description}
                        </p>
                      )}
                      {ministry.requirements && (
                        <p className="text-xs text-muted-foreground mt-1">
                          <strong>Requirements:</strong> {ministry.requirements}
                        </p>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleEdit(ministry)}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDelete(ministry)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
              
              <div className="text-center py-4 border-t">
                <p className="text-xs text-muted-foreground">
                  💡 Tip: Drag and drop ministries to reorder them by priority
                </p>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Create/Edit Dialog */}
      <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>
              {editingMinistry ? 'Edit Ministry' : 'Create New Ministry'}
            </DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4">
            <FormField
              id="name"
              label="Ministry Name"
              value={formData.name}
              onChange={(value) => setFormData({...formData, name: value})}
              placeholder="e.g., Lector, Usher, Cantor"
              required
            />
            
            <FormField
              id="description"
              label="Description"
              inputType="textarea"
              value={formData.description}
              onChange={(value) => setFormData({...formData, description: value})}
              placeholder="Brief description of what this ministry involves..."
              description="Explain the role and responsibilities"
            />
            
            <FormField
              id="requirements"
              label="Requirements"
              inputType="textarea"
              value={formData.requirements}
              onChange={(value) => setFormData({...formData, requirements: value})}
              placeholder="Training, skills, or qualifications needed..."
              description="Special requirements or qualifications needed"
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
                {saving ? 'Saving...' : editingMinistry ? 'Update' : 'Create'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </PageContainer>
  )
}
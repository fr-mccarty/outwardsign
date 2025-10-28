'use client'

import { useEffect, useState } from 'react'
import { PageContainer } from "@/components/page-container"
import { Loading } from '@/components/loading'
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { FormField } from "@/components/ui/form-field"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { useBreadcrumbs } from '@/components/breadcrumb-context'
import { Plus, Edit, Trash2, GripVertical, Save, X } from "lucide-react"
import { getCategories, createCategory, updateCategory, deleteCategory, reorderCategories, type Category, type CreateCategoryData, type UpdateCategoryData } from '@/lib/actions/categories'
import { toast } from 'sonner'

export default function CategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)
  const [createDialogOpen, setCreateDialogOpen] = useState(false)
  const [editingCategory, setEditingCategory] = useState<Category | null>(null)
  const [formData, setFormData] = useState({
    name: '',
    description: ''
  })
  const [saving, setSaving] = useState(false)
  const { setBreadcrumbs } = useBreadcrumbs()

  useEffect(() => {
    setBreadcrumbs([
      { label: "Dashboard", href: "/dashboard" },
      { label: "Settings", href: "/settings" },
      { label: "Categories" }
    ])
  }, [setBreadcrumbs])

  useEffect(() => {
    loadCategories()
  }, [])

  const loadCategories = async () => {
    try {
      const data = await getCategories()
      setCategories(data)
    } catch (error) {
      console.error('Failed to load categories:', error)
      toast.error('Failed to load categories')
    } finally {
      setLoading(false)
    }
  }

  const resetForm = () => {
    setFormData({ name: '', description: '' })
    setEditingCategory(null)
  }

  const handleCreate = () => {
    resetForm()
    setCreateDialogOpen(true)
  }

  const handleEdit = (category: Category) => {
    setFormData({
      name: category.name,
      description: category.description || ''
    })
    setEditingCategory(category)
    setCreateDialogOpen(true)
  }

  const handleSave = async () => {
    if (!formData.name.trim()) {
      toast.error('Category name is required')
      return
    }

    setSaving(true)
    try {
      if (editingCategory) {
        // Update existing category
        const updateData: UpdateCategoryData = {
          name: formData.name.trim(),
          description: formData.description.trim() || undefined
        }
        await updateCategory(editingCategory.id, updateData)
        toast.success('Category updated successfully')
      } else {
        // Create new category
        const createData: CreateCategoryData = {
          name: formData.name.trim(),
          description: formData.description.trim() || undefined
        }
        await createCategory(createData)
        toast.success('Category created successfully')
      }

      setCreateDialogOpen(false)
      resetForm()
      await loadCategories()
    } catch (error) {
      console.error('Failed to save category:', error)
      const errorMessage = error instanceof Error ? error.message : 'Failed to save category'
      toast.error(errorMessage)
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async (category: Category) => {
    if (!confirm(`Are you sure you want to delete the category "${category.name}"? This action cannot be undone.`)) {
      return
    }

    try {
      await deleteCategory(category.id)
      toast.success('Category deleted successfully')
      await loadCategories()
    } catch (error: unknown) {
      console.error('Failed to delete category:', error)
      toast.error(error instanceof Error ? error.message : 'Failed to delete category')
    }
  }

  const handleDragStart = (e: React.DragEvent, categoryId: string) => {
    e.dataTransfer.setData('text/plain', categoryId)
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
  }

  const handleDrop = async (e: React.DragEvent, targetCategoryId: string) => {
    e.preventDefault()
    const draggedCategoryId = e.dataTransfer.getData('text/plain')
    
    if (draggedCategoryId === targetCategoryId) return

    const draggedIndex = categories.findIndex(c => c.id === draggedCategoryId)
    const targetIndex = categories.findIndex(c => c.id === targetCategoryId)
    
    if (draggedIndex === -1 || targetIndex === -1) return

    // Reorder the array
    const newCategories = [...categories]
    const [draggedCategory] = newCategories.splice(draggedIndex, 1)
    newCategories.splice(targetIndex, 0, draggedCategory)

    // Update local state immediately for better UX
    setCategories(newCategories)

    try {
      // Update the sort order in the database
      const categoryIds = newCategories.map(c => c.id)
      await reorderCategories(categoryIds)
      toast.success('Categories reordered successfully')
    } catch (error) {
      console.error('Failed to reorder categories:', error)
      toast.error('Failed to reorder categories')
      // Reload categories to get the correct order
      await loadCategories()
    }
  }

  if (loading) {
    return (
      <PageContainer 
        title="Categories"
        description="Loading categories..."
      >
        <Loading variant="skeleton-list" />
      </PageContainer>
    )
  }

  return (
    <PageContainer 
      title="Categories"
      description="Manage your reading categories for better organization"
    >
      <div className="flex items-center justify-between mb-6">
        <div></div>
        <Button onClick={handleCreate}>
          <Plus className="h-4 w-4 mr-2" />
          Create Category
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Reading Categories</CardTitle>
          <p className="text-sm text-muted-foreground">
            Create and organize categories for your liturgical readings. Categories help classify readings by type (Gospel, First Reading), ceremony (Funeral, Wedding), liturgical season (Advent, Lent), or language.
          </p>
        </CardHeader>
        <CardContent>
          {categories.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-muted-foreground mb-4">No categories found</p>
              <Button onClick={handleCreate} variant="outline">
                <Plus className="h-4 w-4 mr-2" />
                Create your first category
              </Button>
            </div>
          ) : (
            <div className="space-y-2">
              <p className="text-sm text-muted-foreground mb-4">
                Drag and drop to reorder categories
              </p>
              {categories.map((category) => (
                <div
                  key={category.id}
                  draggable
                  onDragStart={(e) => handleDragStart(e, category.id)}
                  onDragOver={handleDragOver}
                  onDrop={(e) => handleDrop(e, category.id)}
                  className="flex items-center gap-4 p-4 border rounded-lg hover:bg-muted/50 cursor-move"
                >
                  <GripVertical className="h-5 w-5 text-muted-foreground" />
                  <div className="flex-1">
                    <h3 className="font-medium">{category.name}</h3>
                    {category.description && (
                      <p className="text-sm text-muted-foreground mt-1">
                        {category.description}
                      </p>
                    )}
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleEdit(category)}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDelete(category)}
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

      <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {editingCategory ? 'Edit Category' : 'Create New Category'}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <FormField
              id="name"
              label="Name"
              description="Enter a descriptive name for this category"
              required
              value={formData.name}
              onChange={(value) => setFormData(prev => ({ ...prev, name: value }))}
              placeholder="e.g., Gospel, First Reading, Funeral, Advent"
            />
            <FormField
              id="description"
              inputType="textarea"
              label="Description"
              description="Optional description to help explain this category's purpose"
              value={formData.description}
              onChange={(value) => setFormData(prev => ({ ...prev, description: value }))}
              placeholder="Brief description of this category..."
              rows={3}
            />
            <div className="flex justify-end gap-2">
              <Button
                variant="outline"
                onClick={() => {
                  setCreateDialogOpen(false)
                  resetForm()
                }}
                disabled={saving}
              >
                <X className="h-4 w-4 mr-2" />
                Cancel
              </Button>
              <Button onClick={handleSave} disabled={saving}>
                <Save className="h-4 w-4 mr-2" />
                {saving ? 'Saving...' : editingCategory ? 'Update' : 'Create'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </PageContainer>
  )
}
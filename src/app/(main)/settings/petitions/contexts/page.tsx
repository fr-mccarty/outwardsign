'use client'

import { useEffect, useState } from 'react'
import { Card, CardHeader, CardTitle, CardContent } from "@/components/content-card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { FormDialog } from "@/components/form-dialog"
import { ConfirmationDialog } from '@/components/confirmation-dialog'
import { Label } from "@/components/ui/label"
import { FormInput } from '@/components/form-input'
import { PageContainer } from '@/components/page-container'
import { Loading } from '@/components/loading'
import { Plus, Edit, Trash2 } from "lucide-react"
import { useBreadcrumbs } from '@/components/breadcrumb-context'
import { 
  getPetitionTemplates, 
  createPetitionTemplate, 
  updatePetitionTemplate, 
  deletePetitionTemplate,
  PetitionContextTemplate,
  CreateContextData,
  UpdateContextData,
  ensureDefaultContexts,
  cleanupInvalidContexts
} from '@/lib/actions/petition-templates'

export default function PetitionContextsPage() {
  const [contexts, setContexts] = useState<PetitionContextTemplate[]>([])
  const [loading, setLoading] = useState(true)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editingContext, setEditingContext] = useState<PetitionContextTemplate | null>(null)
  const [contextToDelete, setContextToDelete] = useState<PetitionContextTemplate | null>(null)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [formData, setFormData] = useState<CreateContextData>({
    title: '',
    description: '',
    context: ''
  })
  const { setBreadcrumbs } = useBreadcrumbs()

  useEffect(() => {
    setBreadcrumbs([
      { label: "Dashboard", href: "/dashboard" },
      { label: "Settings", href: "/settings" },
      { label: "Petition Settings", href: "/settings/petitions" },
      { label: "Contexts" }
    ])
  }, [setBreadcrumbs])

  useEffect(() => {
    loadContexts()
  }, [])

  const loadContexts = async () => {
    try {
      await cleanupInvalidContexts()
      await ensureDefaultContexts()
      const data = await getPetitionTemplates()
      setContexts(data)
    } catch (error) {
      console.error('Failed to load contexts:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleCreateContext = async () => {
    try {
      await createPetitionTemplate(formData)
      setDialogOpen(false)
      resetForm()
      loadContexts()
    } catch (error) {
      console.error('Failed to create context:', error)
    }
  }

  const handleUpdateContext = async () => {
    if (!editingContext) return
    try {
      const updateData: UpdateContextData = {
        id: editingContext.id,
        ...formData
      }
      await updatePetitionTemplate(updateData)
      setDialogOpen(false)
      setEditingContext(null)
      resetForm()
      loadContexts()
    } catch (error) {
      console.error('Failed to update context:', error)
    }
  }

  const handleOpenDeleteDialog = (context: PetitionContextTemplate) => {
    setContextToDelete(context)
    setDeleteDialogOpen(true)
  }

  const handleConfirmDelete = async () => {
    if (!contextToDelete) return

    try {
      await deletePetitionTemplate(contextToDelete.id)
      setContextToDelete(null)
      loadContexts()
    } catch (error) {
      console.error('Failed to delete context:', error)
      throw error
    }
  }

  const openEditDialog = (context: PetitionContextTemplate) => {
    setEditingContext(context)
    setFormData({
      title: context.title,
      description: context.description || '',
      context: context.context || ''
    })
    setDialogOpen(true)
  }

  const resetForm = () => {
    setFormData({
      title: '',
      description: '',
      context: ''
    })
    setEditingContext(null)
  }

  const openCreateDialog = () => {
    resetForm()
    setDialogOpen(true)
  }

  if (loading) {
    return (
      <PageContainer 
        title="Petition Contexts"
        description="Manage reusable contexts for different types of liturgical celebrations."
      >
        <Loading variant="skeleton-list" />
      </PageContainer>
    )
  }

  return (
    <PageContainer 
      title="Petition Contexts"
      description="Manage reusable contexts for different types of liturgical celebrations."
    >
      <div className="flex justify-end items-center mb-6">
        <Button onClick={openCreateDialog}>
          <Plus className="h-4 w-4 mr-2" />
          New Context
        </Button>
        <FormDialog
          open={dialogOpen}
          onOpenChange={setDialogOpen}
          title={editingContext ? 'Edit Context' : 'Create New Context'}
          onSubmit={editingContext ? handleUpdateContext : handleCreateContext}
          submitLabel={editingContext ? 'Update Context' : 'Create Context'}
          contentClassName="max-w-2xl max-h-[80vh] overflow-y-auto"
        >
          <div className="space-y-4">
            <FormInput
              id="title"
              label="Title"
              value={formData.title}
              onChange={(value) => setFormData({ ...formData, title: value })}
              placeholder="e.g., Christmas Mass, Easter Vigil"
              required
            />
            <FormInput
              id="description"
              label="Description"
              value={formData.description || ''}
              onChange={(value) => setFormData({ ...formData, description: value })}
              placeholder="Brief description of when to use this context"
            />
            <FormInput
              id="context"
              label="Template Text"
              inputType="textarea"
              value={formData.context || ''}
              onChange={(value) => setFormData({
                ...formData,
                context: value
              })}
              placeholder="Enter the template text for this context..."
              rows={12}
              className="font-mono text-sm"
            />
          </div>
        </FormDialog>
      </div>

      <div className="grid gap-6">
        {contexts
          .filter(context => {
            // Filter out contexts with empty titles
            return context.title && context.title.trim() !== ''
          })
          .map((context) => {
            return (
              <Card key={context.id}>
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div className="flex items-center gap-2">
                      <CardTitle className="text-lg">{context.title}</CardTitle>
                    </div>
                    <div className="flex gap-2">
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => openEditDialog(context)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleOpenDeleteDialog(context)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                  {context.description && (
                    <p className="text-sm text-muted-foreground">{context.description}</p>
                  )}
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {context.context && (
                      <div>
                        <Label className="text-xs font-medium text-muted-foreground">Petition Text Preview</Label>
                        <p className="text-sm mt-1 font-mono bg-muted p-2 rounded-md whitespace-pre-wrap">{context.context.slice(0, 200)}{context.context.length > 200 ? '...' : ''}</p>
                      </div>
                    )}
                    <div className="flex gap-2 flex-wrap">
                      <Badge variant="outline">
                        {context.context ? context.context.split('\n').filter(line => line.trim()).length : 0} petitions
                      </Badge>
                      <Badge variant="outline">
                        {context.context ? context.context.length : 0} characters
                      </Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )
          })}
      </div>

      {contexts.length === 0 && (
        <Card>
          <CardContent className="text-center py-8">
            <p className="text-muted-foreground">No contexts found. Create your first context to get started.</p>
          </CardContent>
        </Card>
      )}

      {/* Delete Confirmation Dialog */}
      <ConfirmationDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        title="Delete Context"
        itemName={contextToDelete?.title}
        onConfirm={handleConfirmDelete}
      />
    </PageContainer>
  )
}
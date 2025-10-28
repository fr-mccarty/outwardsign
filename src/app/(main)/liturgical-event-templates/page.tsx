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
import { Plus, Edit, Trash2, FileText, Save, X, RefreshCw, Clock, MapPin } from "lucide-react"
import { getTemplates, createTemplate, updateTemplate, deleteTemplate, initializeDefaultTemplates, type LiturgicalEventTemplate, type CreateTemplateData, type UpdateTemplateData, type MinistryRequirement } from '@/lib/actions/liturgical-event-templates'
import { getMinistries, type Ministry } from '@/lib/actions/ministries'
import { toast } from 'sonner'

export default function LiturgicalEventTemplatesPage() {
  const [templates, setTemplates] = useState<LiturgicalEventTemplate[]>([])
  const [ministries, setMinistries] = useState<Ministry[]>([])
  const [loading, setLoading] = useState(true)
  const [createDialogOpen, setCreateDialogOpen] = useState(false)
  const [editingTemplate, setEditingTemplate] = useState<LiturgicalEventTemplate | null>(null)
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    default_duration_hours: 1,
    default_location: '',
    default_readings_type: 'sunday',
    notes: '',
    is_active: true,
    ministry_requirements: [] as MinistryRequirement[]
  })
  const [saving, setSaving] = useState(false)
  const { setBreadcrumbs } = useBreadcrumbs()

  useEffect(() => {
    setBreadcrumbs([
      { label: "Dashboard", href: "/dashboard" },
      { label: "Event Templates" }
    ])
  }, [setBreadcrumbs])

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    try {
      const [templatesData, ministriesData] = await Promise.all([
        getTemplates(),
        getMinistries()
      ])
      setTemplates(templatesData)
      setMinistries(ministriesData)
    } catch (error) {
      console.error('Failed to load data:', error)
      toast.error('Failed to load data')
    } finally {
      setLoading(false)
    }
  }

  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      default_duration_hours: 1,
      default_location: '',
      default_readings_type: 'sunday',
      notes: '',
      is_active: true,
      ministry_requirements: []
    })
  }

  const handleCreate = () => {
    resetForm()
    setEditingTemplate(null)
    setCreateDialogOpen(true)
  }

  const handleEdit = (template: LiturgicalEventTemplate) => {
    setFormData({
      name: template.name,
      description: template.description || '',
      default_duration_hours: template.template_data.default_duration_hours || 1,
      default_location: template.template_data.default_location || '',
      default_readings_type: template.template_data.default_readings_type || 'sunday',
      notes: template.template_data.notes || '',
      is_active: template.is_active,
      ministry_requirements: template.template_data.ministry_requirements || []
    })
    setEditingTemplate(template)
    setCreateDialogOpen(true)
  }

  const handleDelete = async (template: LiturgicalEventTemplate) => {
    if (!confirm(`Are you sure you want to delete the template "${template.name}"?`)) {
      return
    }

    try {
      await deleteTemplate(template.id)
      toast.success('Template deleted successfully')
      await loadData()
    } catch (error) {
      console.error('Failed to delete template:', error)
      toast.error('Failed to delete template')
    }
  }

  const handleSubmit = async () => {
    if (!formData.name.trim()) {
      toast.error('Template name is required')
      return
    }

    setSaving(true)
    try {
      const templateData = {
        default_duration_hours: formData.default_duration_hours,
        default_location: formData.default_location || undefined,
        ministry_requirements: formData.ministry_requirements,
        default_readings_type: formData.default_readings_type,
        notes: formData.notes || undefined
      }

      if (editingTemplate) {
        const updateData: UpdateTemplateData = {
          name: formData.name,
          description: formData.description || undefined,
          template_data: templateData,
          is_active: formData.is_active
        }
        await updateTemplate(editingTemplate.id, updateData)
        toast.success('Template updated successfully')
      } else {
        const createData: CreateTemplateData = {
          name: formData.name,
          description: formData.description || undefined,
          template_data: templateData,
          is_active: formData.is_active
        }
        await createTemplate(createData)
        toast.success('Template created successfully')
      }
      
      setCreateDialogOpen(false)
      resetForm()
      await loadData()
    } catch (error) {
      console.error('Failed to save template:', error)
      toast.error('Failed to save template')
    } finally {
      setSaving(false)
    }
  }

  const handleInitializeDefaults = async () => {
    if (!confirm('This will add default templates if you don&apos;t have any yet. Continue?')) {
      return
    }

    setSaving(true)
    try {
      await initializeDefaultTemplates()
      toast.success('Default templates initialized')
      await loadData()
    } catch (error) {
      console.error('Failed to initialize default templates:', error)
      toast.error('Failed to initialize default templates')
    } finally {
      setSaving(false)
    }
  }

  const addMinistryRequirement = () => {
    if (ministries.length === 0) {
      toast.error('Please create some ministries first')
      return
    }
    
    const availableMinistries = ministries.filter(m => 
      !formData.ministry_requirements.some(req => req.ministry_id === m.id)
    )
    
    if (availableMinistries.length === 0) {
      toast.error('All ministries are already added')
      return
    }

    const ministry = availableMinistries[0]
    const newRequirement: MinistryRequirement = {
      ministry_id: ministry.id,
      ministry_name: ministry.name,
      required_count: 1,
      is_optional: false
    }
    
    setFormData({
      ...formData,
      ministry_requirements: [...formData.ministry_requirements, newRequirement]
    })
  }

  const updateMinistryRequirement = (index: number, updates: Partial<MinistryRequirement>) => {
    const requirements = [...formData.ministry_requirements]
    requirements[index] = { ...requirements[index], ...updates }
    setFormData({ ...formData, ministry_requirements: requirements })
  }

  const removeMinistryRequirement = (index: number) => {
    const requirements = [...formData.ministry_requirements]
    requirements.splice(index, 1)
    setFormData({ ...formData, ministry_requirements: requirements })
  }

  if (loading) {
    return (
      <PageContainer 
        title="Event Templates"
        description="Loading templates..."
      >
        <Loading variant="skeleton-list" />
      </PageContainer>
    )
  }

  return (
    <PageContainer 
      title="Event Templates"
      description="Manage liturgical event templates with ministry requirements"
    >
      <div className="flex items-center justify-between mb-6">
        <div>
          {templates.length === 0 && (
            <Button onClick={handleInitializeDefaults} variant="outline" disabled={saving}>
              <RefreshCw className="h-4 w-4 mr-2" />
              Initialize Default Templates
            </Button>
          )}
        </div>
        <Button onClick={handleCreate}>
          <Plus className="h-4 w-4 mr-2" />
          Create Template
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Liturgical Event Templates</CardTitle>
          <p className="text-sm text-muted-foreground">
            Create reusable templates for common liturgical events with predefined ministry requirements.
          </p>
        </CardHeader>
        <CardContent>
          {templates.length === 0 ? (
            <div className="text-center py-8">
              <FileText className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
              <p className="text-muted-foreground mb-4">No templates found</p>
              <div className="space-y-2">
                <Button onClick={handleCreate} variant="outline">
                  <Plus className="h-4 w-4 mr-2" />
                  Create Your First Template
                </Button>
                <Button onClick={handleInitializeDefaults} variant="ghost" disabled={saving}>
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Or Initialize Common Templates
                </Button>
              </div>
            </div>
          ) : (
            <div className="grid gap-4">
              {templates.map((template) => (
                <div
                  key={template.id}
                  className="flex items-center justify-between p-4 border rounded-lg"
                >
                  <div className="flex items-center gap-3 flex-1">
                    <div className="p-2 bg-primary/10 rounded-lg">
                      <FileText className="h-5 w-5 text-primary" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <h3 className="font-medium">
                          {template.name}
                          {!template.is_active && (
                            <span className="ml-2 px-2 py-1 text-xs bg-gray-100 text-gray-600 rounded">
                              Inactive
                            </span>
                          )}
                        </h3>
                      </div>
                      {template.description && (
                        <p className="text-sm text-muted-foreground mt-1">
                          {template.description}
                        </p>
                      )}
                      <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
                        {template.template_data.default_duration_hours && (
                          <div className="flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            {template.template_data.default_duration_hours}h
                          </div>
                        )}
                        {template.template_data.default_location && (
                          <div className="flex items-center gap-1">
                            <MapPin className="h-3 w-3" />
                            {template.template_data.default_location}
                          </div>
                        )}
                        <div>
                          {template.template_data.ministry_requirements?.length || 0} ministries
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleEdit(template)}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDelete(template)}
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
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>
              {editingTemplate ? 'Edit Template' : 'Create New Template'}
            </DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4 max-h-[60vh] overflow-y-auto">
            <div className="grid grid-cols-2 gap-4">
              <FormField
                id="name"
                label="Template Name"
                value={formData.name}
                onChange={(value) => setFormData({...formData, name: value})}
                placeholder="e.g., Sunday Mass, Wedding, Funeral"
                required
              />
              
              <FormField
                id="default_duration_hours"
                label="Default Duration (hours)"
                inputType="number"
                value={formData.default_duration_hours.toString()}
                onChange={(value) => setFormData({...formData, default_duration_hours: parseFloat(value) || 1})}
                min="0.5"
                max="12"
                step="0.5"
              />
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <FormField
                id="default_location"
                label="Default Location"
                value={formData.default_location}
                onChange={(value) => setFormData({...formData, default_location: value})}
                placeholder="e.g., Main Church, Chapel"
              />
              
              <FormField
                id="default_readings_type"
                label="Default Readings Type"
                inputType="select"
                value={formData.default_readings_type}
                onChange={(value) => setFormData({...formData, default_readings_type: value})}
                options={[
                  { value: 'sunday', label: 'Sunday' },
                  { value: 'weekday', label: 'Weekday' },
                  { value: 'special', label: 'Special' }
                ]}
              />
            </div>
            
            <FormField
              id="description"
              label="Description"
              inputType="textarea"
              value={formData.description}
              onChange={(value) => setFormData({...formData, description: value})}
              placeholder="Brief description of this template..."
            />
            
            <FormField
              id="notes"
              label="Notes"
              inputType="textarea"
              value={formData.notes}
              onChange={(value) => setFormData({...formData, notes: value})}
              placeholder="Additional notes for this template..."
            />
            
            {/* Ministry Requirements */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Label className="text-sm font-medium">Ministry Requirements</Label>
                <Button 
                  type="button"
                  variant="outline" 
                  size="sm"
                  onClick={addMinistryRequirement}
                  disabled={ministries.length === 0}
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Add Ministry
                </Button>
              </div>
              
              {formData.ministry_requirements.length === 0 ? (
                <p className="text-sm text-muted-foreground">
                  No ministry requirements added yet.
                </p>
              ) : (
                <div className="space-y-2">
                  {formData.ministry_requirements.map((req, index) => (
                    <div key={index} className="flex items-center gap-2 p-2 border rounded">
                      <FormField
                        id={`ministry-${index}`}
                        label="Ministry"
                        inputType="select"
                        value={req.ministry_id}
                        onChange={(value) => {
                          const ministry = ministries.find(m => m.id === value)
                          if (ministry) {
                            updateMinistryRequirement(index, {
                              ministry_id: value,
                              ministry_name: ministry.name
                            })
                          }
                        }}
                        options={ministries.map(m => ({ value: m.id, label: m.name }))}
                        className="flex-1"
                      />
                      <FormField
                        id={`count-${index}`}
                        label="Count"
                        inputType="number"
                        value={req.required_count.toString()}
                        onChange={(value) => updateMinistryRequirement(index, { required_count: parseInt(value) || 1 })}
                        min="1"
                        max="10"
                        className="w-20"
                      />
                      <div className="flex items-center gap-2">
                        <Switch
                          checked={req.is_optional}
                          onCheckedChange={(checked) => updateMinistryRequirement(index, { is_optional: checked })}
                        />
                        <Label className="text-xs">Optional</Label>
                      </div>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => removeMinistryRequirement(index)}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </div>
            
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
                {saving ? 'Saving...' : editingTemplate ? 'Update' : 'Create'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </PageContainer>
  )
}
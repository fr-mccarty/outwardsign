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
import { Plus, Edit, Trash2, User, Mail, Phone, Save, X } from "lucide-react"
import { getPeople, createPerson, updatePerson, deletePerson, type Person, type CreatePersonData, type UpdatePersonData } from '@/lib/actions/people'
import { toast } from 'sonner'

export default function PeoplePage() {
  const [people, setPeople] = useState<Person[]>([])
  const [loading, setLoading] = useState(true)
  const [createDialogOpen, setCreateDialogOpen] = useState(false)
  const [editingPerson, setEditingPerson] = useState<Person | null>(null)
  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    email: '',
    phone: '',
    notes: '',
    is_active: true
  })
  const [saving, setSaving] = useState(false)
  const { setBreadcrumbs } = useBreadcrumbs()

  useEffect(() => {
    setBreadcrumbs([
      { label: "Dashboard", href: "/dashboard" },
      { label: "People" }
    ])
  }, [setBreadcrumbs])

  useEffect(() => {
    loadPeople()
  }, [])

  const loadPeople = async () => {
    try {
      const data = await getPeople()
      setPeople(data)
    } catch (error) {
      console.error('Failed to load people:', error)
      toast.error('Failed to load people')
    } finally {
      setLoading(false)
    }
  }

  const resetForm = () => {
    setFormData({
      first_name: '',
      last_name: '',
      email: '',
      phone: '',
      notes: '',
      is_active: true
    })
  }

  const handleCreate = () => {
    resetForm()
    setEditingPerson(null)
    setCreateDialogOpen(true)
  }

  const handleEdit = (person: Person) => {
    setFormData({
      first_name: person.first_name,
      last_name: person.last_name,
      email: person.email || '',
      phone: person.phone || '',
      notes: person.notes || '',
      is_active: person.is_active
    })
    setEditingPerson(person)
    setCreateDialogOpen(true)
  }

  const handleDelete = async (person: Person) => {
    if (!confirm(`Are you sure you want to delete ${person.first_name} ${person.last_name}?`)) {
      return
    }

    try {
      await deletePerson(person.id)
      toast.success('Person deleted successfully')
      await loadPeople()
    } catch (error) {
      console.error('Failed to delete person:', error)
      toast.error('Failed to delete person')
    }
  }

  const handleSubmit = async () => {
    if (!formData.first_name.trim() || !formData.last_name.trim()) {
      toast.error('First name and last name are required')
      return
    }

    setSaving(true)
    try {
      if (editingPerson) {
        const updateData: UpdatePersonData = {}
        if (formData.first_name !== editingPerson.first_name) updateData.first_name = formData.first_name
        if (formData.last_name !== editingPerson.last_name) updateData.last_name = formData.last_name
        if (formData.email !== (editingPerson.email || '')) updateData.email = formData.email || undefined
        if (formData.phone !== (editingPerson.phone || '')) updateData.phone = formData.phone || undefined
        if (formData.notes !== (editingPerson.notes || '')) updateData.notes = formData.notes || undefined
        if (formData.is_active !== editingPerson.is_active) updateData.is_active = formData.is_active

        await updatePerson(editingPerson.id, updateData)
        toast.success('Person updated successfully')
      } else {
        const createData: CreatePersonData = {
          first_name: formData.first_name,
          last_name: formData.last_name,
          email: formData.email || undefined,
          phone: formData.phone || undefined,
          notes: formData.notes || undefined,
          is_active: formData.is_active
        }
        await createPerson(createData)
        toast.success('Person created successfully')
      }
      
      setCreateDialogOpen(false)
      resetForm()
      await loadPeople()
    } catch (error) {
      console.error('Failed to save person:', error)
      toast.error('Failed to save person')
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <PageContainer 
        title="People"
        description="Loading people..."
      >
        <Loading variant="skeleton-list" />
      </PageContainer>
    )
  }

  return (
    <PageContainer 
      title="People"
      description="Manage individuals who serve in liturgical ministries"
    >
      <div className="flex items-center justify-between mb-6">
        <div></div>
        <Button onClick={handleCreate}>
          <Plus className="h-4 w-4 mr-2" />
          Add Person
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>People Directory</CardTitle>
          <p className="text-sm text-muted-foreground">
            Manage contact information and availability for individuals who serve in various liturgical ministries.
          </p>
        </CardHeader>
        <CardContent>
          {people.length === 0 ? (
            <div className="text-center py-8">
              <User className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
              <p className="text-muted-foreground mb-4">No people found</p>
              <Button onClick={handleCreate} variant="outline">
                <Plus className="h-4 w-4 mr-2" />
                Add Your First Person
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              {people.map((person) => (
                <div
                  key={person.id}
                  className="flex items-center justify-between p-4 border rounded-lg"
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-primary/10 rounded-lg">
                        <User className="h-5 w-5 text-primary" />
                      </div>
                      <div>
                        <h3 className="font-medium">
                          {person.first_name} {person.last_name}
                          {!person.is_active && (
                            <span className="ml-2 px-2 py-1 text-xs bg-gray-100 text-gray-600 rounded">
                              Inactive
                            </span>
                          )}
                        </h3>
                        <div className="text-sm text-muted-foreground space-y-1">
                          {person.email && (
                            <div className="flex items-center gap-1">
                              <Mail className="h-3 w-3" />
                              {person.email}
                            </div>
                          )}
                          {person.phone && (
                            <div className="flex items-center gap-1">
                              <Phone className="h-3 w-3" />
                              {person.phone}
                            </div>
                          )}
                        </div>
                        {person.notes && (
                          <p className="text-xs text-muted-foreground mt-1">
                            {person.notes}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleEdit(person)}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDelete(person)}
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
              {editingPerson ? 'Edit Person' : 'Add New Person'}
            </DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <FormField
                id="first_name"
                label="First Name"
                value={formData.first_name}
                onChange={(value) => setFormData({...formData, first_name: value})}
                required
              />
              <FormField
                id="last_name"
                label="Last Name"
                value={formData.last_name}
                onChange={(value) => setFormData({...formData, last_name: value})}
                required
              />
            </div>
            
            <FormField
              id="email"
              label="Email"
              inputType="email"
              value={formData.email}
              onChange={(value) => setFormData({...formData, email: value})}
            />
            
            <FormField
              id="phone"
              label="Phone"
              inputType="tel"
              value={formData.phone}
              onChange={(value) => setFormData({...formData, phone: value})}
            />
            
            <FormField
              id="notes"
              label="Notes"
              inputType="textarea"
              value={formData.notes}
              onChange={(value) => setFormData({...formData, notes: value})}
              description="Any additional information about this person"
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
                {saving ? 'Saving...' : editingPerson ? 'Update' : 'Create'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </PageContainer>
  )
}
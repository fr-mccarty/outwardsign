'use client'

import { useState, useEffect } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { FormField } from "@/components/ui/form-field"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { Save, X } from "lucide-react"
import { createGroup, updateGroup, type Group, type CreateGroupData, type UpdateGroupData } from '@/lib/actions/groups'
import { toast } from 'sonner'

interface GroupFormDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  group?: Group | null
  onSuccess: (groupId: string) => void
}

export function GroupFormDialog({ open, onOpenChange, group, onSuccess }: GroupFormDialogProps) {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    is_active: true
  })
  const [saving, setSaving] = useState(false)

  // Update form data when group prop changes
  useEffect(() => {
    if (group) {
      setFormData({
        name: group.name,
        description: group.description || '',
        is_active: group.is_active
      })
    } else {
      setFormData({
        name: '',
        description: '',
        is_active: true
      })
    }
  }, [group, open])

  const handleSubmit = async () => {
    if (!formData.name.trim()) {
      toast.error('Group name is required')
      return
    }

    setSaving(true)
    try {
      if (group) {
        // Edit mode
        const updateData: UpdateGroupData = {}
        if (formData.name !== group.name) updateData.name = formData.name
        if (formData.description !== (group.description || '')) updateData.description = formData.description || undefined
        if (formData.is_active !== group.is_active) updateData.is_active = formData.is_active

        await updateGroup(group.id, updateData)
        toast.success('Group updated successfully')
        onSuccess(group.id)
      } else {
        // Create mode
        const createData: CreateGroupData = {
          name: formData.name,
          description: formData.description || undefined,
          is_active: formData.is_active
        }
        const newGroup = await createGroup(createData)
        toast.success('Group created successfully')
        onSuccess(newGroup.id)
      }

      onOpenChange(false)
    } catch (error) {
      console.error('Failed to save group:', error)
      toast.error('Failed to save group')
    } finally {
      setSaving(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>
            {group ? 'Edit Group' : 'Create New Group'}
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
              onClick={() => onOpenChange(false)}
              disabled={saving}
            >
              <X className="h-4 w-4 mr-2" />
              Cancel
            </Button>
            <Button onClick={handleSubmit} disabled={saving}>
              <Save className="h-4 w-4 mr-2" />
              {saving ? 'Saving...' : group ? 'Update' : 'Create'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}

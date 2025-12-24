'use client'

import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { FormInput } from "@/components/form-input"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { Save, X } from "lucide-react"
import { createGroup, updateGroup, type Group } from '@/lib/actions/groups'
import { createGroupSchema, type CreateGroupData, type UpdateGroupData } from '@/lib/schemas/groups'
import { toast } from 'sonner'
import { FORM_FIELDS_SPACING } from '@/lib/constants/form-spacing'

interface GroupFormDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  group?: Group | null
  onSuccess: (groupId: string) => void
}

export function GroupFormDialog({ open, onOpenChange, group, onSuccess }: GroupFormDialogProps) {
  const {
    watch,
    setValue,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting }
  } = useForm<CreateGroupData>({
    resolver: zodResolver(createGroupSchema),
    defaultValues: {
      name: '',
      description: '',
      is_active: true
    }
  })

  // Watch form values
  const name = watch('name')
  const description = watch('description')
  const is_active = watch('is_active')

  // Update form data when group prop changes
  useEffect(() => {
    if (group) {
      reset({
        name: group.name,
        description: group.description || '',
        is_active: group.is_active
      })
    } else {
      reset({
        name: '',
        description: '',
        is_active: true
      })
    }
  }, [group, open, reset])

  const onSubmit = async (data: CreateGroupData) => {
    try {
      if (group) {
        // Edit mode
        const updateData: UpdateGroupData = {
          name: data.name,
          description: data.description || undefined,
          is_active: data.is_active
        }

        await updateGroup(group.id, updateData)
        toast.success('Group updated successfully')
        onSuccess(group.id)
      } else {
        // Create mode
        const newGroup = await createGroup(data)
        toast.success('Group created successfully')
        onSuccess(newGroup.id)
      }

      onOpenChange(false)
    } catch (error) {
      console.error('Failed to save group:', error)
      toast.error('Failed to save group')
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

        <form onSubmit={handleSubmit(onSubmit)} className={FORM_FIELDS_SPACING}>
          <FormInput
            id="name"
            label="Group Name"
            value={name || ''}
            onChange={(value) => setValue('name', value)}
            placeholder="e.g., Choir, Youth Servers, Wedding Team"
            required
            error={errors.name?.message}
          />

          <FormInput
            id="description"
            label="Description"
            inputType="textarea"
            value={description || ''}
            onChange={(value) => setValue('description', value)}
            description="Optional description of the group's purpose or special notes"
            error={errors.description?.message}
          />

          <div className="flex items-center space-x-2">
            <Switch
              id="is_active"
              checked={is_active ?? true}
              onCheckedChange={(checked) => setValue('is_active', checked)}
            />
            <Label htmlFor="is_active">Active</Label>
          </div>

          <div className="flex gap-2 justify-end">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isSubmitting}
            >
              <X className="h-4 w-4 mr-2" />
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              <Save className="h-4 w-4 mr-2" />
              {isSubmitting ? 'Saving...' : group ? 'Update' : 'Create'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}

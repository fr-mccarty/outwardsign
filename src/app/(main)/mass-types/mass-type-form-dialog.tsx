'use client'

import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { toast } from 'sonner'
import { createMassType, updateMassType, type MassType } from '@/lib/actions/mass-types'
import {
  createMassTypeSchema,
  type CreateMassTypeData,
} from '@/lib/schemas/mass-types'
import { FormInput } from '@/components/form-input'

interface MassTypeFormDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  massType?: MassType
  onSuccess: () => void
}

export function MassTypeFormDialog({
  open,
  onOpenChange,
  massType,
  onSuccess,
}: MassTypeFormDialogProps) {
  const isEditing = !!massType

  // Initialize form with React Hook Form
  const {
    handleSubmit,
    formState: { errors, isSubmitting },
    setValue,
    watch,
    reset,
  } = useForm<CreateMassTypeData>({
    resolver: zodResolver(createMassTypeSchema),
    defaultValues: {
      name: '',
      description: '',
      active: true,
    },
  })

  // Reset form when dialog opens/closes or massType changes
  useEffect(() => {
    if (open) {
      if (massType) {
        reset({
          name: massType.name,
          description: massType.description || '',
          active: massType.active,
        })
      } else {
        // Reset to defaults for create
        reset({
          name: '',
          description: '',
          active: true,
        })
      }
    }
  }, [open, massType, reset])

  const onSubmit = async (data: CreateMassTypeData) => {
    try {
      if (isEditing) {
        await updateMassType(massType.id, data)
        toast.success('Mass type updated successfully')
      } else {
        await createMassType(data)
        toast.success('Mass type created successfully')
      }

      onSuccess()
    } catch (error) {
      console.error('Error saving mass type:', error)
      const errorMessage = error instanceof Error ? error.message : 'Failed to save mass type'
      toast.error(errorMessage)
    }
  }

  // Watch form values for controlled components
  const nameValue = watch('name')
  const descriptionValue = watch('description')
  const activeValue = watch('active')

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <form onSubmit={handleSubmit(onSubmit)}>
          <DialogHeader>
            <DialogTitle>{isEditing ? 'Edit Mass Type' : 'Create Mass Type'}</DialogTitle>
            <DialogDescription>
              {isEditing
                ? 'Update the mass type details below.'
                : 'Create a new mass type category for your parish.'}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            {/* Name */}
            <FormInput
              id="name"
              label="Name"
              required
              value={nameValue}
              onChange={(value) => setValue('name', value)}
              placeholder="e.g., Weekend, Daily, Adoration"
              error={errors.name?.message}
            />

            {/* Description */}
            <FormInput
              id="description"
              label="Description"
              description="(optional)"
              inputType="textarea"
              value={descriptionValue}
              onChange={(value) => setValue('description', value)}
              placeholder="Brief description of this mass type"
              rows={2}
              error={errors.description?.message}
            />

            {/* Active Checkbox */}
            <FormInput
              id="active"
              label="Active (show in mass times forms)"
              inputType="checkbox"
              value={activeValue}
              onChange={(value: boolean) => setValue('active', value)}
              error={errors.active?.message}
            />
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? 'Saving...' : isEditing ? 'Update' : 'Create'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

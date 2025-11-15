'use client'

import { useState } from 'react'
import { z } from 'zod'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { FormField } from "@/components/ui/form-field"
import { createMassRole } from '@/lib/actions/mass-roles'
import { toast } from 'sonner'
import type { MassRole } from '@/lib/types'

const roleSchema = z.object({
  name: z.string().min(1, "Mass role name is required"),
  description: z.string().optional(),
  note: z.string().optional(),
})

interface AddRoleModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onRoleCreated: (role: MassRole) => void
}

export function AddRoleModal({ open, onOpenChange, onRoleCreated }: AddRoleModalProps) {
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [note, setNote] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})

  const handleClose = () => {
    if (!isLoading) {
      setName('')
      setDescription('')
      setNote('')
      setErrors({})
      onOpenChange(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    e.stopPropagation() // Prevent parent form submission
    setIsLoading(true)
    setErrors({})

    try {
      // Validate with Zod
      const validationResult = roleSchema.safeParse({
        name,
        description: description || undefined,
        note: note || undefined,
      })

      if (!validationResult.success) {
        const fieldErrors: Record<string, string> = {}
        validationResult.error.issues.forEach((issue) => {
          if (issue.path[0]) {
            fieldErrors[issue.path[0].toString()] = issue.message
          }
        })
        setErrors(fieldErrors)
        toast.error('Please fix validation errors')
        setIsLoading(false)
        return
      }

      // Create mass role
      const newRole = await createMassRole({
        name,
        description: description || undefined,
        note: note || undefined,
      })

      toast.success('Mass role created successfully')
      onRoleCreated(newRole)
      handleClose()
    } catch (error) {
      console.error('Failed to create mass role:', error)
      toast.error('Failed to create mass role. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent>
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>Add New Mass Role</DialogTitle>
            <DialogDescription>
              Create a new liturgical mass role for your parish.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <FormField
              id="name"
              label="Mass Role Name"
              value={name}
              onChange={setName}
              required
              error={errors.name}
              description="e.g., Lector, Eucharistic Minister, Altar Server"
              placeholder="Enter mass role name"
              disabled={isLoading}
            />

            <FormField
              id="description"
              inputType="textarea"
              label="Description"
              value={description}
              onChange={setDescription}
              error={errors.description}
              description="Brief description of this mass role's responsibilities"
              placeholder="Enter mass role description"
              rows={3}
              disabled={isLoading}
            />

            <FormField
              id="note"
              inputType="textarea"
              label="Internal Note"
              value={note}
              onChange={setNote}
              error={errors.note}
              description="Internal notes for staff (not visible to ministers)"
              placeholder="Enter internal notes"
              rows={2}
              disabled={isLoading}
            />
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
              disabled={isLoading}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? 'Creating...' : 'Create Mass Role'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

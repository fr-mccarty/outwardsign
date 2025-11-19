"use client"

import { useState, useEffect } from "react"
import { z } from "zod"
import { FormField } from "@/components/ui/form-field"
import { FormSectionCard } from "@/components/form-section-card"
import { createMassRole, updateMassRole } from "@/lib/actions/mass-roles"
import { MassRole } from "@/lib/types"
import { useRouter } from "next/navigation"
import { toast } from 'sonner'
import { FormBottomActions } from "@/components/form-bottom-actions"

// Zod validation schema
const massRoleSchema = z.object({
  name: z.string().min(1, "Name is required"),
  description: z.string().optional(),
  note: z.string().optional(),
  is_active: z.boolean(),
})

interface MassRoleFormProps {
  massRole?: MassRole
  formId?: string
  onLoadingChange?: (loading: boolean) => void
}

export function MassRoleForm({ massRole, formId, onLoadingChange }: MassRoleFormProps) {
  const router = useRouter()
  const isEditing = !!massRole
  const [isLoading, setIsLoading] = useState(false)

  // Notify parent component of loading state changes
  useEffect(() => {
    onLoadingChange?.(isLoading)
  }, [isLoading, onLoadingChange])

  // State for all fields
  const [name, setName] = useState(massRole?.name || "")
  const [description, setDescription] = useState(massRole?.description || "")
  const [note, setNote] = useState(massRole?.note || "")
  const [isActive, setIsActive] = useState(massRole?.is_active ?? true)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      // Validate with Zod
      const massRoleData = massRoleSchema.parse({
        name,
        description: description || undefined,
        note: note || undefined,
        is_active: isActive,
      })

      if (isEditing) {
        await updateMassRole(massRole.id, massRoleData)
        toast.success('Mass role updated successfully')
        router.push(`/mass-roles/${massRole.id}`)
      } else {
        const newMassRole = await createMassRole(massRoleData)
        toast.success('Mass role created successfully')
        router.push(`/mass-roles/${newMassRole.id}`)
      }
    } catch (error) {
      if (error instanceof z.ZodError) {
        toast.error(error.issues[0].message)
      } else {
        console.error('Error saving mass role:', error)
        toast.error(isEditing ? 'Failed to update mass role' : 'Failed to create mass role')
      }
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <form id={formId} onSubmit={handleSubmit} className="space-y-6">
      {/* Basic Information */}
      <FormSectionCard
        title="Basic Information"
        description="Core details for this mass role"
      >
        <FormField
          id="name"
          label="Role Name"
          description="Name of the liturgical role (e.g., Lector, Eucharistic Minister, Altar Server)"
          inputType="text"
          value={name}
          onChange={setName}
          placeholder="Enter role name..."
          required
        />

        <FormField
          id="description"
          label="Description"
          description="Brief description of this role's responsibilities"
          inputType="textarea"
          value={description}
          onChange={setDescription}
          placeholder="Describe the role's responsibilities..."
          rows={3}
        />

        <FormField
          id="is_active"
          inputType="checkbox"
          label="Active"
          description="Inactive roles are hidden from selection but not deleted"
          value={isActive}
          onChange={setIsActive}
        />
      </FormSectionCard>

      {/* Notes */}
      <FormSectionCard
        title="Notes"
        description="Internal notes and reminders (not shown to ministers)"
      >
        <FormField
          id="note"
          label="Notes"
          inputType="textarea"
          value={note}
          onChange={setNote}
          placeholder="Add any internal notes or reminders..."
          rows={3}
        />
      </FormSectionCard>

      {/* Form Actions */}
      <FormBottomActions
        isEditing={isEditing}
        isLoading={isLoading}
        cancelHref={isEditing ? `/mass-roles/${massRole.id}` : '/mass-roles'}
        moduleName="Mass Role"
      />
    </form>
  )
}

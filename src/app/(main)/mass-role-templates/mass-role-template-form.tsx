"use client"

import { useState, useEffect } from "react"
import { z } from "zod"
import { FormField } from "@/components/ui/form-field"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { createMassRoleTemplate, updateMassRoleTemplate, type CreateMassRoleTemplateData, type MassRoleTemplate } from "@/lib/actions/mass-role-templates"
import { useRouter } from "next/navigation"
import { toast } from 'sonner'
import { FormBottomActions } from "@/components/form-bottom-actions"
import { MassRoleTemplateItemList } from "@/components/mass-role-template-item-list"

// Zod validation schema - parameters field removed (managed separately)
const massRoleTemplateSchema = z.object({
  name: z.string().min(1, "Template name is required"),
  description: z.string().optional(),
  note: z.string().optional(),
})

interface MassRoleTemplateFormProps {
  template?: MassRoleTemplate
  formId?: string
  onLoadingChange?: (loading: boolean) => void
}

export function MassRoleTemplateForm({ template, formId, onLoadingChange }: MassRoleTemplateFormProps) {
  const router = useRouter()
  const isEditing = !!template
  const [isLoading, setIsLoading] = useState(false)

  // Notify parent component of loading state changes
  useEffect(() => {
    onLoadingChange?.(isLoading)
  }, [isLoading, onLoadingChange])

  // Form state
  const [name, setName] = useState(template?.name || "")
  const [description, setDescription] = useState(template?.description || "")
  const [note, setNote] = useState(template?.note || "")

  // Validation errors
  const [errors, setErrors] = useState<Record<string, string>>({})

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setErrors({})

    try {
      // Validate with Zod
      const validationResult = massRoleTemplateSchema.safeParse({
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
        toast.error("Please fix validation errors")
        setIsLoading(false)
        return
      }

      // Prepare data (parameters not included - managed separately via drag-drop)
      const data: CreateMassRoleTemplateData = {
        name,
        description: description || undefined,
        note: note || undefined,
      }

      if (isEditing) {
        // Update existing template
        await updateMassRoleTemplate(template.id, data)
        toast.success('Template updated successfully')
        router.push(`/mass-role-templates/${template.id}`)
      } else {
        // Create new template
        const newTemplate = await createMassRoleTemplate(data)
        toast.success('Template created successfully')
        router.push(`/mass-role-templates/${newTemplate.id}`)
      }
    } catch (error) {
      console.error('Failed to save template:', error)
      toast.error('Failed to save template. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  // Determine cancel URL based on mode
  const cancelHref = isEditing
    ? `/mass-role-templates/${template.id}`
    : '/mass-role-templates'

  return (
    <form id={formId} onSubmit={handleSubmit} className="space-y-6">
      {/* Basic Information */}
      <Card>
        <CardHeader>
          <CardTitle>Template Information</CardTitle>
          <CardDescription>
            Define the basic details for this Mass role template
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <FormField
            id="name"
            label="Template Name"
            value={name}
            onChange={setName}
            required
            error={errors.name}
            description="A descriptive name for this template (e.g., 'Sunday Mass - Full Choir', 'Weekday Mass')"
            placeholder="Enter template name"
            disabled={isLoading}
          />

          <FormField
            id="description"
            inputType="textarea"
            label="Description"
            value={description}
            onChange={setDescription}
            error={errors.description}
            description="A brief description of when this template should be used"
            placeholder="Enter template description"
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
        </CardContent>
      </Card>

      {/* Template Roles - Only show if editing existing template */}
      {isEditing && template && (
        <MassRoleTemplateItemList templateId={template.id} />
      )}

      {/* Show helper text if creating new template */}
      {!isEditing && (
        <Card>
          <CardContent className="py-6 text-center text-muted-foreground">
            <p>Save the template first, then you can add roles to it.</p>
          </CardContent>
        </Card>
      )}

      <FormBottomActions
        isEditing={isEditing}
        isLoading={isLoading}
        cancelHref={cancelHref}
        saveLabel={isEditing ? 'Update Template' : 'Create Template'}
      />
    </form>
  )
}

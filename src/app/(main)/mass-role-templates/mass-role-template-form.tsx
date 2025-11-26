"use client"

import { useState, useEffect } from "react"
import { z } from "zod"
import { FormInput } from "@/components/form-input"
import { FormSectionCard } from "@/components/form-section-card"
import { createMassRoleTemplate, updateMassRoleTemplate, type CreateMassRoleTemplateData, type MassRoleTemplate } from "@/lib/actions/mass-role-templates"
import { useRouter } from "next/navigation"
import { toast } from 'sonner'
import { FormBottomActions } from "@/components/form-bottom-actions"
import { MassRoleTemplateItemList } from "@/components/mass-role-template-item-list"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import { LITURGICAL_CONTEXT_VALUES, LITURGICAL_CONTEXT_LABELS, LITURGICAL_CONTEXT_DESCRIPTIONS, type LiturgicalContext } from "@/lib/constants"

// Zod validation schema - parameters field removed (managed separately)
const massRoleTemplateSchema = z.object({
  name: z.string().min(1, "Template name is required"),
  description: z.string().optional(),
  note: z.string().optional(),
  liturgical_contexts: z.array(z.string()).optional(),
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
  const [liturgicalContexts, setLiturgicalContexts] = useState<LiturgicalContext[]>(
    template?.liturgical_contexts || []
  )

  // Validation errors
  const [errors, setErrors] = useState<Record<string, string>>({})

  // Toggle liturgical context
  const handleLiturgicalContextToggle = (context: LiturgicalContext, checked: boolean) => {
    if (checked) {
      setLiturgicalContexts([...liturgicalContexts, context])
    } else {
      setLiturgicalContexts(liturgicalContexts.filter(c => c !== context))
    }
  }

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
        liturgical_contexts: liturgicalContexts,
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
        liturgical_contexts: liturgicalContexts,
      }

      if (isEditing) {
        // Update existing template
        await updateMassRoleTemplate(template.id, data)
        toast.success('Template updated successfully')
        router.refresh() // Stay on edit page to show updated data
      } else {
        // Create new template
        const newTemplate = await createMassRoleTemplate(data)
        toast.success('Template created successfully')
        router.push(`/mass-role-templates/${newTemplate.id}/edit`)
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
      <FormSectionCard
        title="Template Information"
        description="Define the basic details for this Mass role template"
      >
        <FormInput
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

          <FormInput
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

          <FormInput
            id="note"
            inputType="textarea"
            label="Note"
            value={note}
            onChange={setNote}
            error={errors.note}
            description="Notes for staff (not visible to ministers)"
            placeholder="Enter notes"
            rows={2}
            disabled={isLoading}
          />
      </FormSectionCard>

      {/* Liturgical Contexts */}
      <FormSectionCard
        title="Liturgical Contexts"
        description="Select which types of liturgical celebrations this template applies to. This helps the scheduler automatically assign the right template based on the day's celebration."
      >
        <div className="space-y-4">
          {LITURGICAL_CONTEXT_VALUES.map((context) => (
            <div key={context} className="flex items-start space-x-3">
              <Checkbox
                id={`context-${context}`}
                checked={liturgicalContexts.includes(context)}
                onCheckedChange={(checked) =>
                  handleLiturgicalContextToggle(context, checked === true)
                }
                disabled={isLoading}
              />
              <div className="grid gap-0.5 leading-none">
                <Label
                  htmlFor={`context-${context}`}
                  className="font-medium cursor-pointer"
                >
                  {LITURGICAL_CONTEXT_LABELS[context].en}
                </Label>
                <p className="text-sm text-muted-foreground">
                  {LITURGICAL_CONTEXT_DESCRIPTIONS[context].en}
                </p>
              </div>
            </div>
          ))}
        </div>
      </FormSectionCard>

      {/* Template Roles - Only show if editing existing template */}
      {isEditing && template && (
        <MassRoleTemplateItemList templateId={template.id} />
      )}

      {/* Show helper text if creating new template */}
      {!isEditing && (
        <FormSectionCard
          title="Mass Roles"
          description="Add roles after saving the template"
        >
          <div className="py-6 text-center text-muted-foreground">
            <p>Save the template first, then you can add mass roles to it.</p>
          </div>
        </FormSectionCard>
      )}

      <FormBottomActions
        isEditing={isEditing}
        isLoading={isLoading}
        cancelHref={cancelHref}
        moduleName="Mass Role Template"
      />
    </form>
  )
}

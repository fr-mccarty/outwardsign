"use client"

import { useEffect } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { FormInput } from "@/components/form-input"
import { FormSectionCard } from "@/components/form-section-card"
import { createMassRoleTemplate, updateMassRoleTemplate, type MassRoleTemplate } from "@/lib/actions/mass-role-templates"
import { createMassRoleTemplateSchema, type CreateMassRoleTemplateData } from "@/lib/schemas/mass-role-templates"
import { useRouter } from "next/navigation"
import { toast } from 'sonner'
import { FormBottomActions } from "@/components/form-bottom-actions"
import { MassRoleTemplateItemList } from "@/components/mass-role-template-item-list"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import { LITURGICAL_CONTEXT_VALUES, LITURGICAL_CONTEXT_LABELS, LITURGICAL_CONTEXT_DESCRIPTIONS, type LiturgicalContext } from "@/lib/constants"

interface MassRoleTemplateFormProps {
  template?: MassRoleTemplate
  formId?: string
  onLoadingChange?: (loading: boolean) => void
}

export function MassRoleTemplateForm({ template, formId, onLoadingChange }: MassRoleTemplateFormProps) {
  const router = useRouter()
  const isEditing = !!template

  // Initialize form with React Hook Form
  const {
    handleSubmit,
    formState: { errors, isSubmitting },
    setValue,
    watch,
  } = useForm<CreateMassRoleTemplateData>({
    resolver: zodResolver(createMassRoleTemplateSchema),
    defaultValues: {
      name: template?.name || "",
      description: template?.description || "",
      note: template?.note || "",
      liturgical_contexts: template?.liturgical_contexts || [],
    },
  })

  // Watch form values
  const name = watch("name")
  const description = watch("description")
  const note = watch("note")
  const liturgicalContexts = watch("liturgical_contexts") || []

  // Notify parent component of loading state changes
  useEffect(() => {
    onLoadingChange?.(isSubmitting)
  }, [isSubmitting, onLoadingChange])

  // Toggle liturgical context
  const handleLiturgicalContextToggle = (context: LiturgicalContext, checked: boolean) => {
    if (checked) {
      setValue("liturgical_contexts", [...liturgicalContexts, context])
    } else {
      setValue("liturgical_contexts", liturgicalContexts.filter(c => c !== context))
    }
  }

  const onSubmit = async (data: CreateMassRoleTemplateData) => {
    try {
      if (isEditing) {
        // Update existing template
        await updateMassRoleTemplate(template.id, data)
        toast.success('Template updated successfully')
        router.refresh() // Stay on edit page to show updated data
      } else {
        // Create new template
        const newTemplate = await createMassRoleTemplate(data)
        toast.success('Template created successfully')
        router.push(`/settings/mass-configuration/role-patterns/${newTemplate.id}/edit`)
      }
    } catch (error) {
      console.error('Failed to save template:', error)
      toast.error('Failed to save template. Please try again.')
    }
  }

  // Determine cancel URL based on mode
  const cancelHref = isEditing
    ? `/settings/mass-configuration/role-patterns/${template.id}`
    : '/settings/mass-configuration/role-patterns'

  return (
    <form id={formId} onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      {/* Basic Information */}
      <FormSectionCard
        title="Template Information"
        description="Define the basic details for this Mass role template"
      >
        <FormInput
            id="name"
            label="Template Name"
            value={name}
            onChange={(value) => setValue("name", value)}
            required
            error={errors.name?.message}
            description="A descriptive name for this template (e.g., 'Sunday Mass - Full Choir', 'Weekday Mass')"
            placeholder="Enter template name"
            disabled={isSubmitting}
          />

          <FormInput
            id="description"
            inputType="textarea"
            label="Description"
            value={description}
            onChange={(value) => setValue("description", value)}
            error={errors.description?.message}
            description="A brief description of when this template should be used"
            placeholder="Enter template description"
            rows={3}
            disabled={isSubmitting}
          />

          <FormInput
            id="note"
            inputType="textarea"
            label="Note"
            value={note}
            onChange={(value) => setValue("note", value)}
            error={errors.note?.message}
            description="Notes for staff (not visible to ministers)"
            placeholder="Enter notes"
            rows={2}
            disabled={isSubmitting}
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
                disabled={isSubmitting}
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
        isLoading={isSubmitting}
        cancelHref={cancelHref}
        moduleName="Mass Role Template"
      />
    </form>
  )
}

"use client"

import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useRouter } from 'next/navigation'
import { ModuleFormWrapper } from '@/components/module-form-wrapper'
import { Button } from "@/components/ui/button"
import { FormInput } from '@/components/form-input'
import { FormBottomActions } from '@/components/form-bottom-actions'
import { UnsavedChangesDialog } from '@/components/unsaved-changes-dialog'
import { useUnsavedChanges } from '@/hooks/use-unsaved-changes'
import { FileText } from "lucide-react"
import { createPetitionTemplate, updatePetitionTemplate, PetitionContextTemplate } from '@/lib/actions/petition-templates'
import { PETITION_MODULE_VALUES, PETITION_MODULE_LABELS, PETITION_LANGUAGE_VALUES, PETITION_LANGUAGE_LABELS, DEFAULT_PETITIONS } from '@/lib/constants'
import { toast } from 'sonner'
import { FormSectionCard } from "@/components/form-section-card"
import { FORM_SECTIONS_SPACING } from "@/lib/constants/form-spacing"

const petitionTemplateSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  description: z.string().optional(),
  context: z.string().min(1, 'Template text is required'),
  module: z.string().optional(),
  language: z.string().min(1, 'Language is required'),
})

type PetitionTemplateFormValues = z.infer<typeof petitionTemplateSchema>

interface PetitionTemplateFormProps {
  template?: PetitionContextTemplate
}

export default function PetitionTemplateForm({ template }: PetitionTemplateFormProps) {
  const router = useRouter()
  const isEditing = !!template

  const form = useForm<PetitionTemplateFormValues>({
    resolver: zodResolver(petitionTemplateSchema),
    defaultValues: {
      title: template?.title || '',
      description: template?.description || '',
      context: template?.context || '',
      module: template?.module || '',
      language: template?.language || 'en',
    },
  })

  const handleLoadDefaultPetitions = () => {
    const language = form.getValues('language') as 'en' | 'es' | 'bilingual'
    const defaultText = language === 'bilingual'
      ? `${DEFAULT_PETITIONS.en}\n\n${DEFAULT_PETITIONS.es}`
      : DEFAULT_PETITIONS[language] || DEFAULT_PETITIONS.en
    form.setValue('context', defaultText)
    toast.success('Default petition text loaded')
  }

  // Unsaved changes warning
  const unsavedChanges = useUnsavedChanges({ isDirty: isEditing && form.formState.isDirty })

  return (
    <ModuleFormWrapper
      title={isEditing ? 'Edit Petition Template' : 'Create Petition Template'}
      description={isEditing ? 'Update your petition template' : 'Create a new petition template'}
      moduleName="Petition Template"
      viewPath="/settings/petitions"
      entity={template}
      buttonPlacement="inline"
    >
      {({ isLoading, setIsLoading }) => {
        const onSubmit = async (data: PetitionTemplateFormValues) => {
          setIsLoading(true)
          try {
            if (template) {
              await updatePetitionTemplate({ id: template.id, ...data, module: data.module || undefined, language: data.language || undefined })
              toast.success('Template updated successfully')
              router.push(`/settings/petitions/${template.id}`)
            } else {
              const newTemplate = await createPetitionTemplate({ ...data, module: data.module || undefined, language: data.language || undefined })
              toast.success('Template created successfully')
              router.push(`/settings/petitions/${newTemplate.id}`)
            }
          } catch (error) {
            console.error('Error saving template:', error)
            toast.error('Failed to save template')
            setIsLoading(false)
          }
        }

        return (
          <form onSubmit={form.handleSubmit(onSubmit)} className={FORM_SECTIONS_SPACING}>
            <FormSectionCard title="Template Information">
              <FormInput id="title" label="Template Title" value={form.watch('title')} onChange={(v) => form.setValue('title', v)} placeholder="e.g., Sunday Mass (English)" required error={form.formState.errors.title?.message} />
              <FormInput id="description" label="Description" value={form.watch('description') || ''} onChange={(v) => form.setValue('description', v)} placeholder="Brief description" error={form.formState.errors.description?.message} />
              <FormInput id="module" label="Module" inputType="select" value={form.watch('module') || ''} onChange={(v) => form.setValue('module', v)} options={PETITION_MODULE_VALUES.map(m => ({ value: m, label: PETITION_MODULE_LABELS[m].en }))} description="Which module should use this template? (Optional)" />
              <FormInput id="language" label="Language" inputType="select" value={form.watch('language')} onChange={(v) => form.setValue('language', v)} options={PETITION_LANGUAGE_VALUES.map(l => ({ value: l, label: PETITION_LANGUAGE_LABELS[l].en }))} required />
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-sm font-medium">Template Text<span className="text-destructive ml-1">*</span></label>
                  <Button type="button" variant="outline" size="sm" onClick={handleLoadDefaultPetitions}><FileText className="h-4 w-4 mr-2" />Insert Default Text</Button>
                </div>
                <FormInput id="context" label="" inputType="textarea" value={form.watch('context')} onChange={(v) => form.setValue('context', v)} placeholder="Enter template text..." rows={10} required error={form.formState.errors.context?.message} />
              </div>
            </FormSectionCard>
            <FormBottomActions
              isEditing={isEditing}
              isLoading={isLoading}
              cancelHref={template ? `/settings/petitions/${template.id}` : '/settings/petitions'}
              moduleName="Petition Template"
              isDirty={isEditing && form.formState.isDirty}
              onNavigate={unsavedChanges.handleNavigation}
            />

            <UnsavedChangesDialog
              open={unsavedChanges.showDialog}
              onConfirm={unsavedChanges.confirmNavigation}
              onCancel={unsavedChanges.cancelNavigation}
            />
          </form>
        )
      }}
    </ModuleFormWrapper>
  )
}

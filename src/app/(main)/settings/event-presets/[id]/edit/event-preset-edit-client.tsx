'use client'

import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useRouter } from 'next/navigation'
import { ModuleFormWrapper } from '@/components/module-form-wrapper'
import { FormInput } from '@/components/form-input'
import { FormSectionCard } from '@/components/form-section-card'
import { FormBottomActions } from '@/components/form-bottom-actions'
import { UnsavedChangesDialog } from '@/components/unsaved-changes-dialog'
import { useUnsavedChanges } from '@/hooks/use-unsaved-changes'
import { BreadcrumbSetter } from '@/components/breadcrumb-setter'
import { updatePreset } from '@/lib/actions/event-presets'
import type { EventPresetWithRelations } from '@/lib/types'
import { toast } from 'sonner'
import { useTranslations } from 'next-intl'
import { FORM_SECTIONS_SPACING } from "@/lib/constants/form-spacing"

// Validation schema
const eventPresetSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  description: z.string().optional(),
})

type EventPresetFormValues = z.infer<typeof eventPresetSchema>

interface EventPresetEditClientProps {
  preset: EventPresetWithRelations
}

export function EventPresetEditClient({ preset }: EventPresetEditClientProps) {
  const router = useRouter()
  const t = useTranslations()

  // Initialize form with React Hook Form
  const form = useForm<EventPresetFormValues>({
    resolver: zodResolver(eventPresetSchema),
    defaultValues: {
      name: preset.name,
      description: preset.description || '',
    },
  })

  const breadcrumbs = [
    { label: t('nav.dashboard'), href: '/dashboard' },
    { label: t('nav.settings'), href: '/settings' },
    { label: t('settings.eventPresets'), href: '/settings/event-presets' },
    { label: preset.name, href: `/settings/event-presets/${preset.id}` },
    { label: t('common.edit') },
  ]

  // Unsaved changes warning
  const unsavedChanges = useUnsavedChanges({ isDirty: form.formState.isDirty })

  return (
    <ModuleFormWrapper
      title={t('settings.editEventPreset')}
      description={t('settings.updateEventPresetDetails')}
      moduleName="Event Preset"
      viewPath="/settings/event-presets"
      entity={preset}
      buttonPlacement="inline"
    >
      {({ isLoading, setIsLoading }) => {
        const onSubmit = async (data: EventPresetFormValues) => {
          setIsLoading(true)

          try {
            const result = await updatePreset(preset.id, {
              name: data.name,
              description: data.description || null,
            })

            if (result.success) {
              toast.success(t('settings.presetUpdatedSuccess'))
              router.push(`/settings/event-presets/${preset.id}`)
            } else {
              toast.error(result.error || t('settings.presetUpdatedError'))
              setIsLoading(false)
            }
          } catch (error) {
            console.error('Error updating preset:', error)
            toast.error(t('settings.presetUpdatedError'))
            setIsLoading(false)
          }
        }

        return (
          <>
            <BreadcrumbSetter breadcrumbs={breadcrumbs} />
            <form onSubmit={form.handleSubmit(onSubmit)} className={FORM_SECTIONS_SPACING}>
              <FormSectionCard title={t('settings.presetInformation')}>
                <FormInput
                  id="name"
                  label={t('common.name')}
                  value={form.watch('name')}
                  onChange={(value) => form.setValue('name', value)}
                  placeholder={t('settings.presetNamePlaceholder')}
                  required
                  error={form.formState.errors.name?.message}
                />

                <FormInput
                  id="description"
                  label={t('common.description')}
                  inputType="textarea"
                  value={form.watch('description') || ''}
                  onChange={(value) => form.setValue('description', value)}
                  placeholder={t('settings.presetDescriptionPlaceholder')}
                  rows={4}
                  error={form.formState.errors.description?.message}
                />
              </FormSectionCard>

              <FormBottomActions
                isEditing={true}
                isLoading={isLoading}
                cancelHref={`/settings/event-presets/${preset.id}`}
                moduleName={t('settings.eventPreset')}
                isDirty={form.formState.isDirty}
                onNavigate={unsavedChanges.handleNavigation}
              />

              <UnsavedChangesDialog
                open={unsavedChanges.showDialog}
                onConfirm={unsavedChanges.confirmNavigation}
                onCancel={unsavedChanges.cancelNavigation}
              />
            </form>
          </>
        )
      }}
    </ModuleFormWrapper>
  )
}

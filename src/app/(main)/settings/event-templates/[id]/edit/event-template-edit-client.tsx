'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useRouter } from 'next/navigation'
import { PageContainer } from '@/components/page-container'
import { FormInput } from '@/components/form-input'
import { FormSectionCard } from '@/components/form-section-card'
import { FormBottomActions } from '@/components/form-bottom-actions'
import { BreadcrumbSetter } from '@/components/breadcrumb-setter'
import { updateTemplate } from '@/lib/actions/master-event-templates'
import type { MasterEventTemplateWithRelations } from '@/lib/types'
import { toast } from 'sonner'
import { useTranslations } from 'next-intl'

// Validation schema
const eventTemplateSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  description: z.string().optional(),
})

type EventTemplateFormValues = z.infer<typeof eventTemplateSchema>

interface EventTemplateEditClientProps {
  template: MasterEventTemplateWithRelations
}

export function EventTemplateEditClient({ template }: EventTemplateEditClientProps) {
  const router = useRouter()
  const t = useTranslations()
  const [loading, setLoading] = useState(false)

  // Initialize form with React Hook Form
  const form = useForm<EventTemplateFormValues>({
    resolver: zodResolver(eventTemplateSchema),
    defaultValues: {
      name: template.name,
      description: template.description || '',
    },
  })

  const onSubmit = async (data: EventTemplateFormValues) => {
    setLoading(true)

    try {
      const result = await updateTemplate(template.id, {
        name: data.name,
        description: data.description || null,
      })

      if (result.success) {
        toast.success(t('settings.templateUpdatedSuccess'))
        router.push(`/settings/event-templates/${template.id}`)
      } else {
        toast.error(result.error || t('settings.templateUpdatedError'))
      }
    } catch (error) {
      console.error('Error updating template:', error)
      toast.error(t('settings.templateUpdatedError'))
    } finally {
      setLoading(false)
    }
  }

  const breadcrumbs = [
    { label: t('nav.dashboard'), href: '/dashboard' },
    { label: t('nav.settings'), href: '/settings' },
    { label: t('settings.eventTemplates'), href: '/settings/event-templates' },
    { label: template.name, href: `/settings/event-templates/${template.id}` },
    { label: t('common.edit') },
  ]

  return (
    <PageContainer
      title={t('settings.editEventTemplate')}
      description={t('settings.updateEventTemplateDetails')}
    >
      <BreadcrumbSetter breadcrumbs={breadcrumbs} />
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <FormSectionCard title={t('settings.templateInformation')}>
          <FormInput
            id="name"
            label={t('common.name')}
            value={form.watch('name')}
            onChange={(value) => form.setValue('name', value)}
            placeholder={t('settings.templateNamePlaceholder')}
            required
            error={form.formState.errors.name?.message}
          />

          <FormInput
            id="description"
            label={t('common.description')}
            inputType="textarea"
            value={form.watch('description') || ''}
            onChange={(value) => form.setValue('description', value)}
            placeholder={t('settings.templateDescriptionPlaceholder')}
            rows={4}
            error={form.formState.errors.description?.message}
          />
        </FormSectionCard>

        <FormBottomActions
          isEditing={true}
          isLoading={loading}
          cancelHref={`/settings/event-templates/${template.id}`}
          moduleName={t('settings.eventTemplate')}
        />
      </form>
    </PageContainer>
  )
}

'use client'

import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { ModuleFormWrapper } from '@/components/module-form-wrapper'
import { FormInput } from '@/components/form-input'
import { FormBottomActions } from '@/components/form-bottom-actions'
import { FormSectionCard } from '@/components/form-section-card'
import { UnsavedChangesDialog } from '@/components/unsaved-changes-dialog'
import { useUnsavedChanges } from '@/hooks/use-unsaved-changes'
import { createCategoryTag, updateCategoryTag } from '@/lib/actions/category-tags'
import type { CategoryTag, CreateCategoryTagData, UpdateCategoryTagData } from '@/lib/types'
import { toast } from 'sonner'
import { FORM_SECTIONS_SPACING } from "@/lib/constants/form-spacing"

const tagSchema = z.object({
  name: z.string().min(1, 'Name is required').max(100),
  slug: z.string().max(100).optional(),
})

type TagFormData = z.infer<typeof tagSchema>

interface CategoryTagFormWrapperProps {
  tag?: CategoryTag
}

export function CategoryTagFormWrapper({ tag }: CategoryTagFormWrapperProps) {
  const router = useRouter()
  const isEditing = !!tag

  const form = useForm<TagFormData>({
    resolver: zodResolver(tagSchema),
    defaultValues: {
      name: tag?.name || '',
      slug: tag?.slug || '',
    },
  })

  // Unsaved changes warning
  const unsavedChanges = useUnsavedChanges({ isDirty: isEditing && form.formState.isDirty })

  return (
    <ModuleFormWrapper
      title={isEditing ? 'Edit Tag' : 'Create Tag'}
      description={isEditing ? 'Update category tag' : 'Add new tag for categorizing content'}
      moduleName="Category Tag"
      viewPath="/settings/category-tags"
      entity={tag}
      buttonPlacement="inline"
    >
      {({ isLoading, setIsLoading }) => {
        const handleSubmit = async (data: TagFormData) => {
          try {
            setIsLoading(true)
            if (isEditing) {
              await updateCategoryTag(tag.id, data as UpdateCategoryTagData)
              toast.success('Tag updated successfully')
            } else {
              await createCategoryTag(data as CreateCategoryTagData)
              toast.success('Tag created successfully')
            }
            router.push('/settings/category-tags')
          } catch (error: any) {
            console.error('Error saving tag:', error)
            toast.error(error.message || 'Failed to save tag')
            setIsLoading(false)
          }
        }

        return (
          <form onSubmit={form.handleSubmit(handleSubmit)} className={FORM_SECTIONS_SPACING}>
            <FormSectionCard title="Tag Information">
              <FormInput
                id="name"
                label="Name"
                value={form.watch('name')}
                onChange={(v) => form.setValue('name', v, { shouldDirty: true })}
                placeholder="e.g., Wedding, First Reading, Hope"
                description="Display name for the tag"
                required
                error={form.formState.errors.name?.message}
              />
              <FormInput
                id="slug"
                label="Slug (optional)"
                value={form.watch('slug') || ''}
                onChange={(v) => form.setValue('slug', v, { shouldDirty: true })}
                placeholder="e.g., wedding, first-reading, hope"
                description="URL-safe identifier. Auto-generated from name if not provided."
                error={form.formState.errors.slug?.message}
              />
            </FormSectionCard>

            <FormBottomActions
              isEditing={isEditing}
              isLoading={isLoading}
              cancelHref="/settings/category-tags"
              moduleName="Tag"
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

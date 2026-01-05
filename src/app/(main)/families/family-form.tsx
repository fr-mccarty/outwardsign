'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { FormInput } from '@/components/form-input'
import { FormBottomActions } from '@/components/form-bottom-actions'
import { UnsavedChangesDialog } from '@/components/unsaved-changes-dialog'
import { useUnsavedChanges } from '@/hooks/use-unsaved-changes'
import {
  createFamily,
  updateFamily,
  type FamilyWithMembers
} from '@/lib/actions/families'
import { toast } from 'sonner'
import { useTranslations } from 'next-intl'
import { FORM_SECTIONS_SPACING } from "@/lib/constants/form-spacing"

// Form schema factory - creates schema with translations
const createFamilyFormSchema = (t: any) => z.object({
  family_name: z.string().min(1, t('forms.required', { field: t('families.familyName') })).trim(),
  active: z.boolean(),
})

type FamilyFormValues = z.infer<ReturnType<typeof createFamilyFormSchema>>

interface FamilyFormProps {
  family?: FamilyWithMembers
}

/**
 * FamilyForm Component
 *
 * Unified form for creating and editing families.
 * Uses the isEditing pattern to determine mode based on presence of family prop.
 */
export function FamilyForm({ family }: FamilyFormProps) {
  const router = useRouter()
  const t = useTranslations()
  const isEditing = !!family

  const [isSubmitting, setIsSubmitting] = useState(false)

  const form = useForm<FamilyFormValues>({
    resolver: zodResolver(createFamilyFormSchema(t)),
    defaultValues: {
      family_name: family?.family_name || '',
      active: family?.active ?? true
    }
  })

  // Unsaved changes warning
  const unsavedChanges = useUnsavedChanges({ isDirty: isEditing && form.formState.isDirty })

  const onSubmit = async (data: FamilyFormValues) => {
    setIsSubmitting(true)
    try {
      if (isEditing && family) {
        await updateFamily(family.id, data)
        toast.success(t('families.familyUpdated'))
        router.push(`/families/${family.id}`)
      } else {
        const newFamily = await createFamily(data)
        toast.success(t('families.familyCreated'))
        router.push(`/families/${newFamily.id}`)
      }
    } catch (error: any) {
      console.error('Failed to save family:', error)
      toast.error(error.message || t('families.errorCreating'))
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className={FORM_SECTIONS_SPACING}>
      <FormInput
        id="family_name"
        label={t('families.familyName')}
        value={form.watch('family_name')}
        onChange={(v) => form.setValue('family_name', v, { shouldDirty: true })}
        placeholder={t('families.familyNamePlaceholder')}
        required
        autoFocus
        error={form.formState.errors.family_name?.message}
      />

      <FormInput
        id="active"
        inputType="checkbox"
        label={t('common.active')}
        description="Inactive families will be hidden from scheduling and pickers"
        value={form.watch('active')}
        onChange={(v: boolean) => form.setValue('active', v, { shouldDirty: true })}
      />

      <FormBottomActions
        isEditing={isEditing}
        isLoading={isSubmitting}
        cancelHref={isEditing && family ? `/families/${family.id}` : '/families'}
        moduleName={t('families.title')}
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
}

'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Switch } from '@/components/ui/switch'
import { FormBottomActions } from '@/components/form-bottom-actions'
import {
  createFamily,
  updateFamily,
  type FamilyWithMembers
} from '@/lib/actions/families'
import { toast } from 'sonner'
import { useTranslations } from 'next-intl'

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
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <FormField
          control={form.control}
          name="family_name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{t('families.familyName')}</FormLabel>
              <FormControl>
                <Input
                  {...field}
                  placeholder={t('families.familyNamePlaceholder')}
                  autoFocus
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="active"
          render={({ field }) => (
            <FormItem className="flex flex-row items-center justify-between rounded-lg border border-border p-4">
              <div className="space-y-0.5">
                <FormLabel className="text-base">{t('common.active')}</FormLabel>
                <div className="text-sm text-muted-foreground">
                  Inactive families will be hidden from scheduling and pickers
                </div>
              </div>
              <FormControl>
                <Switch
                  checked={field.value}
                  onCheckedChange={field.onChange}
                />
              </FormControl>
            </FormItem>
          )}
        />

        <FormBottomActions
          isEditing={isEditing}
          isLoading={isSubmitting}
          cancelHref={isEditing && family ? `/families/${family.id}` : '/families'}
          moduleName={t('families.title')}
        />
      </form>
    </Form>
  )
}

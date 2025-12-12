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

// Form schema - defined here to avoid type inference issues with .default()
const familyFormSchema = z.object({
  family_name: z.string().min(1, 'Family name is required').trim(),
  active: z.boolean(),
})

type FamilyFormValues = z.infer<typeof familyFormSchema>

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
  const isEditing = !!family

  const [isSubmitting, setIsSubmitting] = useState(false)

  const form = useForm<FamilyFormValues>({
    resolver: zodResolver(familyFormSchema),
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
        toast.success('Family updated successfully')
        router.push(`/families/${family.id}`)
      } else {
        const newFamily = await createFamily(data)
        toast.success('Family created successfully')
        router.push(`/families/${newFamily.id}`)
      }
    } catch (error: any) {
      console.error('Failed to save family:', error)
      toast.error(error.message || 'Failed to save family')
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
              <FormLabel>Family Name</FormLabel>
              <FormControl>
                <Input
                  {...field}
                  placeholder="e.g., Smith Family, The Johnsons"
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
                <FormLabel className="text-base">Active</FormLabel>
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
          moduleName="Family"
        />
      </form>
    </Form>
  )
}

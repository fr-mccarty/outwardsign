'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage, FormDescription } from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Checkbox } from '@/components/ui/checkbox'
import { SaveButton } from '@/components/save-button'
import { CancelButton } from '@/components/cancel-button'
import { toast } from 'sonner'
import { createMassTime, updateMassTime } from '@/lib/actions/mass-times'
import type { MassTimeWithRelations } from '@/lib/actions/mass-times'

// Validation schema
const massTimeTemplateSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  description: z.string().optional(),
  is_active: z.boolean(),
})

type MassTimeTemplateFormValues = z.infer<typeof massTimeTemplateSchema>

interface MassTimeFormProps {
  massTime?: MassTimeWithRelations
}

export function MassTimeForm({ massTime }: MassTimeFormProps) {
  const router = useRouter()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const isEditing = !!massTime

  // Initialize form with default values
  const form = useForm<MassTimeTemplateFormValues>({
    resolver: zodResolver(massTimeTemplateSchema),
    defaultValues: {
      name: massTime?.name || '',
      description: massTime?.description || '',
      is_active: massTime?.is_active !== undefined ? massTime.is_active : false,
    },
  })

  const onSubmit = async (data: MassTimeTemplateFormValues) => {
    setIsSubmitting(true)
    try {
      if (isEditing) {
        await updateMassTime(massTime.id, {
          name: data.name,
          description: data.description || null,
          is_active: data.is_active,
        })
        toast.success('Mass times template updated successfully')
        router.push(`/mass-times/${massTime.id}`)
      } else {
        const newTemplate = await createMassTime({
          name: data.name,
          description: data.description,
          is_active: data.is_active,
        })
        toast.success('Mass times template created successfully')
        router.push(`/mass-times/${newTemplate.id}`)
      }
    } catch (error) {
      console.error('Error saving mass times template:', error)
      toast.error(isEditing ? 'Failed to update template' : 'Failed to create template')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        {/* Template Information */}
        <Card>
          <CardHeader>
            <CardTitle>Template Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Template Name</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="e.g., Regular Schedule, Summer Schedule, Advent Schedule"
                      {...field}
                    />
                  </FormControl>
                  <FormDescription>
                    The name of this mass times template
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Details about when this template applies"
                      rows={3}
                      {...field}
                    />
                  </FormControl>
                  <FormDescription>
                    Optional details about when and how this template is used
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="is_active"
              render={({ field }) => (
                <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                  <FormControl>
                    <Checkbox checked={field.value} onCheckedChange={field.onChange} />
                  </FormControl>
                  <div className="space-y-1 leading-none">
                    <FormLabel>Active Template</FormLabel>
                    <FormDescription>
                      Mark this template as currently active. Typically only one template should be active at a time.
                    </FormDescription>
                  </div>
                </FormItem>
              )}
            />
          </CardContent>
        </Card>

        {/* Form Actions */}
        <div className="flex gap-4">
          <SaveButton isLoading={isSubmitting} />
          <CancelButton href={isEditing ? `/mass-times/${massTime.id}` : '/mass-times'} />
        </div>
      </form>
    </Form>
  )
}

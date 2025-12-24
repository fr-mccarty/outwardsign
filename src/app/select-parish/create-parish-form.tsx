'use client'

import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { createParish, populateInitialParishData } from '@/lib/actions/setup'
import { setSelectedParish } from '@/lib/auth/parish'
import { Button } from '@/components/ui/button'
import { FormInput } from '@/components/form-input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/content-card'
import { toast } from 'sonner'
import { createParishSchema, type CreateParishData } from '@/lib/schemas/parishes'
import { FORM_FIELDS_SPACING } from '@/lib/constants/form-spacing'

interface CreateParishFormProps {
  onCancel: () => void
  onSuccess: () => void
}

export function CreateParishForm({ onCancel, onSuccess }: CreateParishFormProps) {
  const router = useRouter()

  const {
    handleSubmit,
    setValue,
    watch,
    formState: { errors, isSubmitting }
  } = useForm<CreateParishData>({
    resolver: zodResolver(createParishSchema),
    defaultValues: {
      name: '',
      city: '',
      state: ''
    }
  })

  const formData = watch()

  const onSubmit = async (data: CreateParishData) => {
    try {
      const result = await createParish(data)

      // Populate initial parish data (readings, petition templates, group roles, mass roles)
      try {
        await populateInitialParishData(result.parish.id)
      } catch (seedError) {
        console.error('Error seeding parish data:', seedError)
        // Continue anyway - parish is created, just missing seed data
        toast.error('Parish created but some initial data failed to load')
      }

      toast.success('Parish created successfully!')

      // Set the new parish as selected
      await setSelectedParish(result.parish.id)

      // Call success callback
      onSuccess()

      // Redirect to dashboard
      router.push('/dashboard')
    } catch (error) {
      console.error('Error creating parish:', error)
      toast.error(error instanceof Error ? error.message : 'Failed to create parish')
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Create New Parish</CardTitle>
        <CardDescription>
          Create a new parish and become its administrator
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className={FORM_FIELDS_SPACING}>
          <FormInput
            id="name"
            label="Parish Name"
            value={formData.name}
            onChange={(value) => setValue('name', value)}
            placeholder="St. Mary's Catholic Church"
            required
            error={errors.name?.message}
          />

          <FormInput
            id="city"
            label="City"
            value={formData.city}
            onChange={(value) => setValue('city', value)}
            placeholder="New York"
            required
            error={errors.city?.message}
          />

          <FormInput
            id="state"
            label="State"
            value={formData.state}
            onChange={(value) => setValue('state', value)}
            placeholder="NY"
            maxLength={2}
            required
            error={errors.state?.message}
          />

          <div className="flex gap-2 pt-4">
            <Button type="submit" disabled={isSubmitting} className="flex-1">
              {isSubmitting ? 'Creating...' : 'Create Parish'}
            </Button>
            <Button type="button" variant="outline" onClick={onCancel}>
              Cancel
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}
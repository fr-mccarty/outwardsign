'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { createParish, populateInitialParishData, updateParishSettings } from '@/lib/actions/setup'
import { setSelectedParish } from '@/lib/auth/parish'
import { Button } from '@/components/ui/button'
import { FormInput } from '@/components/form-input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/content-card'
import { toast } from 'sonner'
import { createParishSchema, type CreateParishData } from '@/lib/schemas/parishes'
import { FORM_FIELDS_SPACING } from '@/lib/constants/form-spacing'
import { TIMEZONE_OPTIONS, PRIMARY_LANGUAGE_OPTIONS, DEFAULT_TIMEZONE, DEFAULT_PRIMARY_LANGUAGE } from '@/lib/constants'

interface CreateParishFormProps {
  onCancel: () => void
  onSuccess: () => void
}

export function CreateParishForm({ onCancel, onSuccess }: CreateParishFormProps) {
  const router = useRouter()
  const [timezone, setTimezone] = useState(DEFAULT_TIMEZONE)
  const [primaryLanguage, setPrimaryLanguage] = useState(DEFAULT_PRIMARY_LANGUAGE)

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
      state: '',
      country: ''
    }
  })

  const formData = watch()

  const onSubmit = async (data: CreateParishData) => {
    try {
      const result = await createParish(data)

      // Update parish settings with timezone and language
      try {
        await updateParishSettings(result.parish.id, {
          timezone,
          primary_language: primaryLanguage,
        })
      } catch (settingsError) {
        console.error('Error updating parish settings:', settingsError)
        // Continue anyway - parish is created with defaults
      }

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
        <CardTitle>Create Your Parish</CardTitle>
        <CardDescription>
          Enter your parish information to get started. You&apos;ll be assigned as the parish administrator.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className={FORM_FIELDS_SPACING}>
          <FormInput
            id="name"
            label="Parish Name"
            value={formData.name}
            onChange={(value) => setValue('name', value)}
            placeholder="e.g., St. Mary's Catholic Church"
            required
            autoFocus
            error={errors.name?.message}
          />

          <FormInput
            id="city"
            label="City"
            value={formData.city}
            onChange={(value) => setValue('city', value)}
            placeholder="e.g., Boston"
            required
            error={errors.city?.message}
          />

          <FormInput
            id="state"
            label="State"
            value={formData.state || ''}
            onChange={(value) => setValue('state', value)}
            placeholder="e.g., Massachusetts"
            error={errors.state?.message}
          />

          <FormInput
            id="country"
            label="Country"
            value={formData.country}
            onChange={(value) => setValue('country', value)}
            placeholder="e.g., United States"
            required
            error={errors.country?.message}
          />

          <FormInput
            id="timezone"
            label="Timezone"
            inputType="select"
            value={timezone}
            onChange={setTimezone}
            options={[...TIMEZONE_OPTIONS]}
          />

          <FormInput
            id="primaryLanguage"
            label="Primary Language"
            inputType="select"
            value={primaryLanguage}
            onChange={setPrimaryLanguage}
            options={[...PRIMARY_LANGUAGE_OPTIONS]}
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
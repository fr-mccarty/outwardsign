'use client'

import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useRouter } from 'next/navigation'
import { PageContainer } from '@/components/page-container'
import { FormSectionCard } from '@/components/form-section-card'
import { Label } from "@/components/ui/label"
import { FormInput } from '@/components/form-input'
import { SaveButton } from '@/components/save-button'
import { updateUserSettings, type UserSettings } from '@/lib/actions/user-settings'
import {
  updateUserSettingsSchema,
  type UpdateUserSettingsData
} from '@/lib/schemas/user-settings'
import { toast } from 'sonner'
import { formatDatePretty } from '@/lib/utils/formatters'
import { User } from '@supabase/supabase-js'

interface UserSettingsClientProps {
  user: User
  userSettings: UserSettings
}

export function UserSettingsClient({
  user,
  userSettings
}: UserSettingsClientProps) {
  const router = useRouter()

  const {
    handleSubmit,
    formState: { errors, isSubmitting },
    setValue,
    watch,
  } = useForm<UpdateUserSettingsData>({
    resolver: zodResolver(updateUserSettingsSchema),
    defaultValues: {
      language: (userSettings.language as 'en' | 'es' | 'fr' | 'la') || 'en',
    },
  })

  const language = watch('language')

  const onSubmit = async (data: UpdateUserSettingsData) => {
    try {
      await updateUserSettings(data)
      toast.success('Settings saved successfully')
      router.refresh()
    } catch (error) {
      console.error('Error saving settings:', error)
      toast.error('Failed to save settings. Please try again.')
    }
  }

  const saveButton = (
    <SaveButton
      isLoading={isSubmitting}
      onClick={handleSubmit(onSubmit)}
      type="button"
    >
      Save Changes
    </SaveButton>
  )

  return (
    <PageContainer
      title="User Preferences"
      description="Customize your liturgical planning experience"
      actions={saveButton}
    >
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <FormSectionCard title="Language and Preferences">
          <FormInput
            id="language"
            label="Preferred Language"
            description="Your interface language preference"
            inputType="select"
            value={language || 'en'}
            onChange={(value) => setValue('language', value as 'en' | 'es' | 'fr' | 'la')}
            error={errors.language?.message}
            options={[
              { value: 'en', label: 'English' },
              { value: 'es', label: 'Espa\u00f1ol (Spanish)' },
              { value: 'fr', label: 'Fran\u00e7ais (French)' },
              { value: 'la', label: 'Latina (Latin)' }
            ]}
          />
        </FormSectionCard>

        <FormSectionCard title="Account Information">
          <div className="space-y-4">
            <div>
              <Label className="text-muted-foreground">Email</Label>
              <p className="mt-1 font-medium">{user.email}</p>
            </div>

            <div>
              <Label className="text-muted-foreground">User ID</Label>
              <p className="mt-1 text-sm font-mono text-muted-foreground">{user.id}</p>
            </div>

            <div>
              <Label className="text-muted-foreground">Account Created</Label>
              <p className="mt-1 text-sm">{formatDatePretty(user.created_at)}</p>
            </div>

            <div>
              <Label className="text-muted-foreground">Settings Last Updated</Label>
              <p className="mt-1 text-sm">{formatDatePretty(userSettings.updated_at)}</p>
            </div>
          </div>
        </FormSectionCard>

        <div className="flex justify-end">
          {saveButton}
        </div>
      </form>
    </PageContainer>
  )
}

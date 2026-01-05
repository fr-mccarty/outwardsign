'use client'

import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useRouter } from 'next/navigation'
import { ModuleFormWrapper } from '@/components/module-form-wrapper'
import { FormSectionCard } from '@/components/form-section-card'
import { Label } from "@/components/ui/label"
import { FormInput } from '@/components/form-input'
import { FormBottomActions } from '@/components/form-bottom-actions'
import { updateUserSettings, type UserSettings } from '@/lib/actions/user-settings'
import { updateUserSettingsSchema, type UpdateUserSettingsData } from '@/lib/schemas/user-settings'
import { toast } from 'sonner'
import { formatDatePretty } from '@/lib/utils/formatters'
import { User } from '@supabase/supabase-js'
import { FORM_SECTIONS_SPACING } from "@/lib/constants/form-spacing"

interface UserSettingsClientProps {
  user: User
  userSettings: UserSettings
}

export function UserSettingsClient({ user, userSettings }: UserSettingsClientProps) {
  const router = useRouter()

  const { handleSubmit, formState: { errors }, setValue, watch } = useForm<UpdateUserSettingsData>({
    resolver: zodResolver(updateUserSettingsSchema),
    defaultValues: {
      language: (userSettings.language as 'en' | 'es' | 'fr' | 'la') || 'en',
    },
  })

  return (
    <ModuleFormWrapper
      title="User Preferences"
      description="Customize your liturgical planning experience"
      moduleName="User Settings"
      viewPath="/settings"
      buttonPlacement="inline"
    >
      {({ isLoading, setIsLoading }) => {
        const onSubmit = async (data: UpdateUserSettingsData) => {
          setIsLoading(true)
          try {
            await updateUserSettings(data)
            toast.success('Settings saved successfully')
            router.refresh()
          } catch (error) {
            console.error('Error saving settings:', error)
            toast.error('Failed to save settings')
          } finally {
            setIsLoading(false)
          }
        }

        return (
          <form onSubmit={handleSubmit(onSubmit)} className={FORM_SECTIONS_SPACING}>
            <FormSectionCard title="Language and Preferences">
              <FormInput
                id="language"
                label="Preferred Language"
                description="Your interface language preference"
                inputType="select"
                value={watch('language') || 'en'}
                onChange={(value) => setValue('language', value as 'en' | 'es' | 'fr' | 'la', { shouldDirty: true })}
                error={errors.language?.message}
                options={[
                  { value: 'en', label: 'English' },
                  { value: 'es', label: 'Español (Spanish)' },
                  { value: 'fr', label: 'Français (French)' },
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

            <FormBottomActions
              isEditing={true}
              isLoading={isLoading}
              cancelHref="/settings"
              moduleName="User Settings"
            />
          </form>
        )
      }}
    </ModuleFormWrapper>
  )
}

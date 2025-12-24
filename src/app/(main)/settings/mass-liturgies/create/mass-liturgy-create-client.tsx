'use client'

import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { ModuleFormWrapper } from '@/components/module-form-wrapper'
import { ContentCard } from '@/components/content-card'
import { Button } from '@/components/ui/button'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { FormInput } from '@/components/form-input'
import { Label } from '@/components/ui/label'
import { createEventType } from '@/lib/actions/event-types'
import {
  createEventTypeSchema,
  type CreateEventTypeData,
} from '@/lib/schemas/event-types'
import { toast } from 'sonner'
import { IconSelector } from '@/components/icon-selector'
import { useTranslations } from 'next-intl'
import { Info } from 'lucide-react'

export function MassLiturgyCreateClient() {
  const router = useRouter()
  const t = useTranslations('masses')

  const {
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
  } = useForm<CreateEventTypeData>({
    resolver: zodResolver(createEventTypeSchema),
    defaultValues: {
      name: '',
      icon: 'Calendar',
      system_type: 'mass-liturgy',
    },
  })

  const name = watch('name')
  const icon = watch('icon')

  return (
    <ModuleFormWrapper
      title={t('createTitle')}
      description={t('createDescription')}
      moduleName="Mass Type"
      viewPath="/settings/mass-liturgies"
      buttonPlacement="inline"
      beforeContent={
        <Alert className="mb-6">
          <Info className="h-4 w-4" />
          <AlertDescription>
            <p>{t('createExplanation')}</p>
          </AlertDescription>
        </Alert>
      }
    >
      {({ isLoading, setIsLoading, cancelHref }) => {
        const onSubmit = async (data: CreateEventTypeData) => {
          setIsLoading(true)
          try {
            const eventType = await createEventType({
              name: data.name,
              icon: data.icon,
              system_type: 'mass-liturgy',
            })
            toast.success('Mass type created successfully')
            router.push(`/settings/event-types/${eventType.slug}`)
          } catch (error) {
            console.error('Failed to create mass type:', error)
            toast.error('Failed to create mass type')
            setIsLoading(false)
          }
        }

        return (
          <form onSubmit={handleSubmit(onSubmit)}>
            <ContentCard>
              <div className="space-y-4">
                <div className="space-y-2">
                  <FormInput
                    id="name"
                    label={t('nameLabel')}
                    value={name}
                    onChange={(value) => setValue('name', value)}
                    error={errors.name?.message}
                    required
                    placeholder={t('namePlaceholder')}
                  />
                  <p className="text-sm text-muted-foreground">{t('nameHelp')}</p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="icon">{t('iconLabel')}</Label>
                  <IconSelector
                    value={icon}
                    onChange={(value) => setValue('icon', value)}
                  />
                  <p className="text-sm text-muted-foreground">{t('iconHelp')}</p>
                  {errors.icon && (
                    <p className="text-sm text-destructive">{errors.icon.message}</p>
                  )}
                </div>
              </div>

              <div className="flex gap-2 mt-6">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => router.push(cancelHref)}
                  disabled={isLoading}
                >
                  Cancel
                </Button>
                <Button type="submit" disabled={isLoading}>
                  {isLoading ? 'Creating...' : t('createTitle')}
                </Button>
              </div>
            </ContentCard>
          </form>
        )
      }}
    </ModuleFormWrapper>
  )
}

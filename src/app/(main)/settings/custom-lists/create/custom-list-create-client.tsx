'use client'

import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { ModuleFormWrapper } from '@/components/module-form-wrapper'
import { ContentCard } from '@/components/content-card'
import { Button } from '@/components/ui/button'
import { FormInput } from '@/components/form-input'
import { createCustomList } from '@/lib/actions/custom-lists'
import {
  createCustomListSchema,
  type CreateCustomListData,
} from '@/lib/schemas/custom-lists'
import { toast } from 'sonner'

export function CustomListCreateClient() {
  const router = useRouter()

  const {
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
  } = useForm<CreateCustomListData>({
    resolver: zodResolver(createCustomListSchema),
    defaultValues: {
      name: '',
    },
  })

  const name = watch('name')

  return (
    <ModuleFormWrapper
      title="Create Custom List"
      description="Create a new custom list for event field options"
      moduleName="Custom List"
      viewPath="/settings/custom-lists"
      buttonPlacement="inline"
    >
      {({ isLoading, setIsLoading, cancelHref }) => {
        const onSubmit = async (data: CreateCustomListData) => {
          setIsLoading(true)
          try {
            const customList = await createCustomList({
              name: data.name,
            })
            toast.success('Custom list created successfully')
            router.push(`/settings/custom-lists/${customList.id}`)
          } catch (error) {
            console.error('Failed to create custom list:', error)
            toast.error('Failed to create custom list')
            setIsLoading(false)
          }
        }

        return (
          <form onSubmit={handleSubmit(onSubmit)}>
            <ContentCard>
              <div className="space-y-4">
                <FormInput
                  id="name"
                  label="List Name"
                  value={name}
                  onChange={(value) => setValue('name', value)}
                  error={errors.name?.message}
                  required
                  placeholder="e.g., Wedding Songs, Funeral Readings, Baptism Locations..."
                />
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
                  {isLoading ? 'Creating...' : 'Create Custom List'}
                </Button>
              </div>
            </ContentCard>
          </form>
        )
      }}
    </ModuleFormWrapper>
  )
}

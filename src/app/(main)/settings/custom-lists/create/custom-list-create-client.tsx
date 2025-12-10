'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { PageContainer } from '@/components/page-container'
import { ContentCard } from '@/components/content-card'
import { Button } from '@/components/ui/button'
import { FormInput } from '@/components/form-input'
import { createCustomList } from '@/lib/actions/custom-lists'
import {
  createCustomListSchema,
  type CreateCustomListData,
} from '@/lib/schemas/custom-lists'
import { toast } from 'sonner'
import { useBreadcrumbs } from '@/components/breadcrumb-context'

export function CustomListCreateClient() {
  const router = useRouter()
  const { setBreadcrumbs } = useBreadcrumbs()
  const [isSubmitting, setIsSubmitting] = useState(false)

  useEffect(() => {
    setBreadcrumbs([
      { label: 'Dashboard', href: '/dashboard' },
      { label: 'Settings', href: '/settings' },
      { label: 'Custom Lists', href: '/settings/custom-lists' },
      { label: 'Create' }
    ])
  }, [setBreadcrumbs])

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

  const onSubmit = async (data: CreateCustomListData) => {
    setIsSubmitting(true)
    try {
      const customList = await createCustomList({
        name: data.name,
      })
      toast.success('Custom list created successfully')
      router.push(`/settings/custom-lists/${customList.id}`)
    } catch (error) {
      console.error('Failed to create custom list:', error)
      toast.error('Failed to create custom list')
      setIsSubmitting(false)
    }
  }

  const handleCancel = () => {
    router.push('/settings/custom-lists')
  }

  return (
    <PageContainer
      title="Create Custom List"
      description="Create a new custom list for event field options"
    >
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
              onClick={handleCancel}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? 'Creating...' : 'Create Custom List'}
            </Button>
          </div>
        </ContentCard>
      </form>
    </PageContainer>
  )
}

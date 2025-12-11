'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Button } from '@/components/ui/button'
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage, FormDescription } from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Loader2 } from 'lucide-react'
import { PageContainer } from '@/components/page-container'
import { ContentCard } from '@/components/content-card'
import { createCategoryTag, updateCategoryTag } from '@/lib/actions/category-tags'
import type { CategoryTag, CreateCategoryTagData, UpdateCategoryTagData } from '@/lib/types'
import { toast } from 'sonner'
import { useBreadcrumbs } from '@/components/breadcrumb-context'

const tagSchema = z.object({
  name: z.string().min(1, 'Name is required').max(100),
  slug: z.string().max(100).optional(),
})

type TagFormData = z.infer<typeof tagSchema>

interface CategoryTagFormWrapperProps {
  tag?: CategoryTag
}

export function CategoryTagFormWrapper({ tag }: CategoryTagFormWrapperProps) {
  const router = useRouter()
  const { setBreadcrumbs } = useBreadcrumbs()
  const [saving, setSaving] = useState(false)
  const isEditing = !!tag

  useEffect(() => {
    setBreadcrumbs([
      { label: 'Dashboard', href: '/dashboard' },
      { label: 'Settings', href: '/settings' },
      { label: 'Category Tags', href: '/settings/category-tags' },
      { label: isEditing ? 'Edit' : 'Create' }
    ])
  }, [setBreadcrumbs, isEditing])

  const form = useForm<TagFormData>({
    resolver: zodResolver(tagSchema),
    defaultValues: {
      name: tag?.name || '',
      slug: tag?.slug || '',
    },
  })

  const handleSubmit = async (data: TagFormData) => {
    try {
      setSaving(true)
      if (isEditing) {
        await updateCategoryTag(tag.id, data as UpdateCategoryTagData)
        toast.success('Tag updated successfully')
      } else {
        await createCategoryTag(data as CreateCategoryTagData)
        toast.success('Tag created successfully')
      }
      router.push('/settings/category-tags')
    } catch (error: any) {
      console.error('Error saving tag:', error)
      toast.error(error.message || 'Failed to save tag')
    } finally {
      setSaving(false)
    }
  }

  const handleCancel = () => {
    router.push('/settings/category-tags')
  }

  return (
    <PageContainer
      title={isEditing ? 'Edit Tag' : 'Create Tag'}
      description={isEditing ? 'Update category tag' : 'Add new tag for categorizing content'}
    >
      <ContentCard>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
            {/* Name */}
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    Name <span className="text-destructive">*</span>
                  </FormLabel>
                  <FormControl>
                    <Input placeholder="e.g., Wedding, First Reading, Hope" {...field} />
                  </FormControl>
                  <FormDescription>
                    Display name for the tag
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Slug (optional) */}
            <FormField
              control={form.control}
              name="slug"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Slug (optional)</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="e.g., wedding, first-reading, hope"
                      {...field}
                    />
                  </FormControl>
                  <FormDescription>
                    URL-safe identifier. Auto-generated from name if not provided.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Action buttons */}
            <div className="flex justify-end gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={handleCancel}
                disabled={saving}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={saving}>
                {saving ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>{isEditing ? 'Update' : 'Create'} Tag</>
                )}
              </Button>
            </div>
          </form>
        </Form>
      </ContentCard>
    </PageContainer>
  )
}

'use client'

import { useState } from 'react'
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
import { createContentTag, updateContentTag } from '@/lib/actions/content-tags'
import type { ContentTag, CreateContentTagData, UpdateContentTagData } from '@/lib/types'
import { toast } from 'sonner'

const tagSchema = z.object({
  name: z.string().min(1, 'Name is required').max(100),
  slug: z.string().max(100).optional(),
  sort_order: z.number().int().min(0).optional(),
})

type TagFormData = z.infer<typeof tagSchema>

interface ContentTagFormWrapperProps {
  tag?: ContentTag
}

export function ContentTagFormWrapper({ tag }: ContentTagFormWrapperProps) {
  const router = useRouter()
  const [saving, setSaving] = useState(false)
  const isEditing = !!tag

  const form = useForm<TagFormData>({
    resolver: zodResolver(tagSchema),
    defaultValues: {
      name: tag?.name || '',
      slug: tag?.slug || '',
      sort_order: tag?.sort_order,
    },
  })

  const handleSubmit = async (data: TagFormData) => {
    try {
      setSaving(true)
      if (isEditing) {
        await updateContentTag(tag.id, data as UpdateContentTagData)
        toast.success('Tag updated successfully')
      } else {
        await createContentTag(data as CreateContentTagData)
        toast.success('Tag created successfully')
      }
      router.push('/settings/content-tags')
    } catch (error: any) {
      console.error('Error saving tag:', error)
      toast.error(error.message || 'Failed to save tag')
    } finally {
      setSaving(false)
    }
  }

  const handleCancel = () => {
    router.push('/settings/content-tags')
  }

  return (
    <PageContainer
      title={isEditing ? 'Edit Tag' : 'Create Tag'}
      description={isEditing ? 'Update content tag' : 'Add new tag for categorizing content'}
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

            {/* Sort Order (optional) */}
            <FormField
              control={form.control}
              name="sort_order"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Sort Order (optional)</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      placeholder="e.g., 1, 11, 31, 51"
                      {...field}
                      onChange={(e) => field.onChange(e.target.value ? parseInt(e.target.value, 10) : undefined)}
                      value={field.value || ''}
                    />
                  </FormControl>
                  <FormDescription>
                    Determines display order. Categories: 1-10 (Sacrament), 11-30 (Section), 31-50 (Theme), 51-60 (Testament). Auto-calculated if not provided.
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

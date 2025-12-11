'use client'

import { useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Button } from '@/components/ui/button'
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage, FormDescription } from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Loader2 } from 'lucide-react'
import { getContentTags } from '@/lib/actions/content-tags'
import type { ContentWithTags, ContentTag, CreateContentData, UpdateContentData } from '@/lib/types'
import { toast } from 'sonner'
import { MultiSelect } from '@/components/multi-select'

const contentSchema = z.object({
  title: z.string().min(1, 'Title is required').max(200),
  body: z.string().min(1, 'Content is required').max(10000),
  language: z.enum(['en', 'es']),
  description: z.string().max(200).nullable().optional(),
  tag_ids: z.array(z.string().uuid()).optional(),
})

type ContentFormData = z.infer<typeof contentSchema>

interface ContentFormProps {
  content?: ContentWithTags | null // If provided, edit mode; otherwise, create mode
  onSave: (data: CreateContentData | UpdateContentData) => Promise<void>
  onCancel: () => void
  defaultTags?: string[] // Pre-selected tag IDs (from picker filters)
  defaultLanguage?: 'en' | 'es'
}

export function ContentForm({
  content,
  onSave,
  onCancel,
  defaultTags = [],
  defaultLanguage = 'en',
}: ContentFormProps) {
  const [saving, setSaving] = useState(false)
  const [allTags, setAllTags] = useState<ContentTag[]>([])
  const [loadingTags, setLoadingTags] = useState(false)

  const isEditing = !!content

  const form = useForm<ContentFormData>({
    resolver: zodResolver(contentSchema),
    defaultValues: {
      title: content?.title || '',
      body: content?.body || '',
      language: content?.language || defaultLanguage,
      description: content?.description || '',
      tag_ids: content?.tags?.map((tag) => tag.id) || defaultTags,
    },
  })

  // Load tags when component mounts
  useEffect(() => {
    async function loadTags() {
      try {
        setLoadingTags(true)
        const tags = await getContentTags('sort_order')
        setAllTags(tags)
      } catch (error) {
        console.error('Error loading tags:', error)
        toast.error('Failed to load tags')
      } finally {
        setLoadingTags(false)
      }
    }
    loadTags()
  }, [])

  const handleSubmit = async (data: ContentFormData) => {
    try {
      setSaving(true)
      await onSave(data)
    } catch (error) {
      console.error('Error saving content:', error)
      toast.error('Failed to save content')
    } finally {
      setSaving(false)
    }
  }

  // Convert tags to options for MultiSelect
  const tagOptions = allTags.map((tag) => ({
    value: tag.id,
    label: tag.name,
  }))

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
        {/* Title */}
        <FormField
          control={form.control}
          name="title"
          render={({ field }) => (
            <FormItem>
              <FormLabel>
                Title <span className="text-destructive">*</span>
              </FormLabel>
              <FormControl>
                <Input
                  placeholder="e.g., Wisdom 3:1-6, 9"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Body */}
        <FormField
          control={form.control}
          name="body"
          render={({ field }) => (
            <FormItem>
              <FormLabel>
                Content <span className="text-destructive">*</span>
              </FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Enter the reading, prayer, or ceremony text..."
                  rows={10}
                  {...field}
                />
              </FormControl>
              <FormDescription>
                Supports plain text and basic markdown formatting
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Language */}
        <FormField
          control={form.control}
          name="language"
          render={({ field }) => (
            <FormItem>
              <FormLabel>
                Language <span className="text-destructive">*</span>
              </FormLabel>
              <Select onValueChange={field.onChange} value={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select language" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="en">English</SelectItem>
                  <SelectItem value="es">Spanish</SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Description (optional) */}
        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Description (optional)</FormLabel>
              <FormControl>
                <Input
                  placeholder="Brief preview text shown in picker"
                  {...field}
                  value={field.value || ''}
                />
              </FormControl>
              <FormDescription>
                Optional short description to help identify this content
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Tags */}
        <FormField
          control={form.control}
          name="tag_ids"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Tags</FormLabel>
              <FormControl>
                <MultiSelect
                  options={tagOptions}
                  selected={field.value || []}
                  onChange={field.onChange}
                  placeholder={loadingTags ? 'Loading tags...' : 'Select tags'}
                  disabled={loadingTags}
                />
              </FormControl>
              <FormDescription>
                Select tags to categorize this content
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
            onClick={onCancel}
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
              <>{isEditing ? 'Update' : 'Create'} Content</>
            )}
          </Button>
        </div>
      </form>
    </Form>
  )
}

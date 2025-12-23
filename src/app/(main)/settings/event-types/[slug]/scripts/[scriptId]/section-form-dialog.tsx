'use client'

import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Switch } from '@/components/ui/switch'
import type { Section, InputFieldDefinition } from '@/lib/types/event-types'
import { createSection, updateSection } from '@/lib/actions/sections'
import { toast } from 'sonner'
import { useTranslations } from 'next-intl'

// Schema for section form
const sectionFormSchema = z.object({
  name: z.string().min(1, 'Section name is required'),
  content: z.string().min(1, 'Section content is required'),
  page_break_after: z.boolean(),
})

type SectionFormValues = z.infer<typeof sectionFormSchema>

interface SectionFormDialogProps {
  scriptId: string
  section: Section | null
  inputFields: InputFieldDefinition[]
  open: boolean
  onOpenChange: (open: boolean) => void
  onClose: () => void
  onSaved: (section: Section) => void
}

export function SectionFormDialog({
  scriptId,
  section,
  inputFields,
  open,
  onOpenChange,
  onClose,
  onSaved,
}: SectionFormDialogProps) {
  const t = useTranslations()

  const form = useForm<SectionFormValues>({
    resolver: zodResolver(sectionFormSchema),
    defaultValues: {
      name: '',
      content: '',
      page_break_after: false,
    },
  })

  // Reset form when dialog opens/closes or section changes
  useEffect(() => {
    if (open && section) {
      form.reset({
        name: section.name,
        content: section.content,
        page_break_after: section.page_break_after,
      })
    } else if (!open) {
      form.reset({
        name: '',
        content: '',
        page_break_after: false,
      })
    }
  }, [open, section, form])

  const handleSave = async (data: SectionFormValues) => {
    try {
      let savedSection: Section

      if (section) {
        // Update existing section
        savedSection = await updateSection(section.id, {
          name: data.name.trim(),
          content: data.content.trim(),
          page_break_after: data.page_break_after,
        })
        toast.success(t('eventType.scripts.sections.updateSuccess'))
      } else {
        // Create new section
        savedSection = await createSection(scriptId, {
          name: data.name.trim(),
          content: data.content.trim(),
          page_break_after: data.page_break_after,
        })
        toast.success(t('eventType.scripts.sections.createSuccess'))
      }

      onSaved(savedSection)
      onClose()
    } catch (error) {
      console.error('Failed to save section:', error)
      const errorMessage = error instanceof Error
        ? error.message
        : section
          ? t('eventType.scripts.sections.updateError')
          : t('eventType.scripts.sections.createError')
      toast.error(errorMessage)
    }
  }

  const handleInsertPlaceholder = (placeholder: string) => {
    const currentContent = form.getValues('content')
    // Insert placeholder at end
    form.setValue('content', currentContent + placeholder, { shouldDirty: true })
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {section
              ? t('eventType.scripts.sections.editSection')
              : t('eventType.scripts.sections.addSection')}
          </DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSave)} className="space-y-4">
            {/* Section Name */}
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t('eventType.scripts.sections.sectionName')}</FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      placeholder={t('eventType.scripts.sections.sectionNamePlaceholder')}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Section Content */}
            <FormField
              control={form.control}
              name="content"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t('eventType.scripts.sections.content')}</FormLabel>
                  <FormControl>
                    <Textarea
                      {...field}
                      placeholder={t('eventType.scripts.sections.contentPlaceholder')}
                      rows={10}
                      className="font-mono text-sm"
                    />
                  </FormControl>
                  <p className="text-xs text-muted-foreground mt-1">
                    {t('eventType.scripts.sections.contentHint')}
                  </p>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Quick Placeholder Insertion */}
            {inputFields.length > 0 && (
              <div>
                <FormLabel>{t('eventType.scripts.sections.insertPlaceholder')}</FormLabel>
                <div className="flex flex-wrap gap-2 mt-2">
                  {inputFields.slice(0, 6).map((field) => (
                    <Button
                      key={field.id}
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => handleInsertPlaceholder(`{{${field.property_name}}}`)}
                    >
                      {field.name}
                    </Button>
                  ))}
                  {inputFields.length > 6 && (
                    <p className="text-xs text-muted-foreground self-center">
                      {t('eventType.scripts.sections.morePlaceholders', { count: inputFields.length - 6 })}
                    </p>
                  )}
                </div>
              </div>
            )}

            {/* Page Break */}
            <FormField
              control={form.control}
              name="page_break_after"
              render={({ field }) => (
                <FormItem className="flex items-center justify-between border rounded-md p-3">
                  <div>
                    <FormLabel>{t('eventType.scripts.sections.pageBreak')}</FormLabel>
                    <p className="text-xs text-muted-foreground">
                      {t('eventType.scripts.sections.pageBreakHint')}
                    </p>
                  </div>
                  <FormControl>
                    <Switch
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                </FormItem>
              )}
            />

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  onClose()
                }}
              >
                {t('common.cancel')}
              </Button>
              <Button type="submit" disabled={form.formState.isSubmitting}>
                {t('common.save')}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}

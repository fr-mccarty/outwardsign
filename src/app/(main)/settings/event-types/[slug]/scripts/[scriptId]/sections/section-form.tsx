'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
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
import { Copy, Check, ArrowLeft } from 'lucide-react'
import type { Section, InputFieldDefinition } from '@/lib/types/event-types'
import { createSection, updateSection } from '@/lib/actions/sections'
import { toast } from 'sonner'
import { useTranslations } from 'next-intl'
import Link from 'next/link'
import { FORM_SECTIONS_SPACING } from "@/lib/constants/form-spacing"

const sectionFormSchema = z.object({
  name: z.string().min(1, 'Section name is required'),
  content: z.string().min(1, 'Section content is required'),
  page_break_after: z.boolean(),
})

type SectionFormValues = z.infer<typeof sectionFormSchema>

interface SectionFormProps {
  scriptId: string
  section?: Section | null
  inputFields: InputFieldDefinition[]
  backUrl: string
}

export function SectionForm({
  scriptId,
  section,
  inputFields,
  backUrl,
}: SectionFormProps) {
  const t = useTranslations()
  const router = useRouter()
  const [copiedId, setCopiedId] = useState<string | null>(null)

  const form = useForm<SectionFormValues>({
    resolver: zodResolver(sectionFormSchema),
    defaultValues: {
      name: section?.name || '',
      content: section?.content || '',
      page_break_after: section?.page_break_after || false,
    },
  })

  const handleSave = async (data: SectionFormValues) => {
    try {
      if (section) {
        await updateSection(section.id, {
          name: data.name.trim(),
          content: data.content.trim(),
          page_break_after: data.page_break_after,
        })
        toast.success(t('eventType.scripts.sections.updateSuccess'))
      } else {
        await createSection(scriptId, {
          name: data.name.trim(),
          content: data.content.trim(),
          page_break_after: data.page_break_after,
        })
        toast.success(t('eventType.scripts.sections.createSuccess'))
      }
      router.push(backUrl)
      router.refresh()
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
    form.setValue('content', currentContent + placeholder, { shouldDirty: true })
  }

  const copyToClipboard = async (text: string, fieldId: string) => {
    try {
      await navigator.clipboard.writeText(text)
      setCopiedId(fieldId)
      toast.success(t('eventType.scripts.placeholders.copied'))
      setTimeout(() => setCopiedId(null), 2000)
    } catch (error) {
      console.error('Failed to copy:', error)
      toast.error(t('eventType.scripts.placeholders.copyError'))
    }
  }

  const formatFieldType = (type: string) => {
    return type.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())
  }

  return (
    <div className="space-y-6">
      {/* Back button */}
      <div>
        <Button variant="outline" asChild>
          <Link href={backUrl}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            {t('common.back')}
          </Link>
        </Button>
      </div>

      {/* Two-column layout: Form on left, Reference panel on right */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Form (2/3 width) */}
        <div className="lg:col-span-2">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(handleSave)} className={FORM_SECTIONS_SPACING}>
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
                        rows={20}
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

              {/* Actions */}
              <div className="flex gap-3">
                <Button type="submit" disabled={form.formState.isSubmitting}>
                  {t('common.save')}
                </Button>
                <Button type="button" variant="outline" asChild>
                  <Link href={backUrl}>{t('common.cancel')}</Link>
                </Button>
              </div>
            </form>
          </Form>
        </div>

        {/* Right Column: Placeholder Reference Panel (1/3 width) */}
        <div className="lg:col-span-1">
          <div className="border rounded-md p-4 bg-card sticky top-4">
            <h3 className="text-sm font-semibold mb-3">{t('eventType.scripts.placeholders.title')}</h3>
            <p className="text-xs text-muted-foreground mb-4">
              {t('eventType.scripts.placeholders.description')}
            </p>

            {inputFields.length === 0 ? (
              <p className="text-xs text-muted-foreground text-center py-4">
                {t('eventType.scripts.placeholders.noFields')}
              </p>
            ) : (
              <div className="space-y-3 max-h-[600px] overflow-y-auto">
                {inputFields.map((field) => (
                  <div
                    key={field.id}
                    className="border rounded-md p-3 space-y-2 hover:bg-accent/50 transition-colors"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1 min-w-0">
                        <div className="font-medium text-sm">{field.name}</div>
                        <div className="text-xs text-muted-foreground">
                          {formatFieldType(field.type)}
                        </div>
                      </div>
                    </div>

                    {/* Click to insert or copy */}
                    <div className="flex items-center gap-2">
                      <Button
                        type="button"
                        variant="secondary"
                        size="sm"
                        className="flex-1 justify-start font-mono text-xs"
                        onClick={() => handleInsertPlaceholder(`{{${field.property_name}}}`)}
                      >
                        {`{{${field.property_name}}}`}
                      </Button>
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7 flex-shrink-0"
                        onClick={() => copyToClipboard(`{{${field.property_name}}}`, field.id)}
                      >
                        {copiedId === field.id ? (
                          <Check className="h-3 w-3 text-green-500" />
                        ) : (
                          <Copy className="h-3 w-3" />
                        )}
                      </Button>
                    </div>

                    {/* For person fields, show nested properties */}
                    {field.type === 'person' && (
                      <div className="text-xs text-muted-foreground space-y-1 pl-2 border-l-2 border-muted">
                        <div className="flex items-center gap-2">
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            className="flex-1 justify-start font-mono text-xs h-7 px-2"
                            onClick={() => handleInsertPlaceholder(`{{${field.property_name}.full_name}}`)}
                          >
                            {`.full_name`}
                          </Button>
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            className="h-6 w-6 flex-shrink-0"
                            onClick={() => copyToClipboard(`{{${field.property_name}.full_name}}`, `${field.id}-full_name`)}
                          >
                            {copiedId === `${field.id}-full_name` ? (
                              <Check className="h-3 w-3 text-green-500" />
                            ) : (
                              <Copy className="h-3 w-3" />
                            )}
                          </Button>
                        </div>
                        <div className="flex items-center gap-2">
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            className="flex-1 justify-start font-mono text-xs h-7 px-2"
                            onClick={() => handleInsertPlaceholder(`{{${field.property_name}.first_name}}`)}
                          >
                            {`.first_name`}
                          </Button>
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            className="h-6 w-6 flex-shrink-0"
                            onClick={() => copyToClipboard(`{{${field.property_name}.first_name}}`, `${field.id}-first_name`)}
                          >
                            {copiedId === `${field.id}-first_name` ? (
                              <Check className="h-3 w-3 text-green-500" />
                            ) : (
                              <Copy className="h-3 w-3" />
                            )}
                          </Button>
                        </div>
                        <div className="flex items-center gap-2">
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            className="flex-1 justify-start font-mono text-xs h-7 px-2"
                            onClick={() => handleInsertPlaceholder(`{{${field.property_name}.last_name}}`)}
                          >
                            {`.last_name`}
                          </Button>
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            className="h-6 w-6 flex-shrink-0"
                            onClick={() => copyToClipboard(`{{${field.property_name}.last_name}}`, `${field.id}-last_name`)}
                          >
                            {copiedId === `${field.id}-last_name` ? (
                              <Check className="h-3 w-3 text-green-500" />
                            ) : (
                              <Copy className="h-3 w-3" />
                            )}
                          </Button>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

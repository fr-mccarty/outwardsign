'use client'

import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Switch } from '@/components/ui/switch'
import { MultiSelect } from '@/components/multi-select'
import { SaveButton } from '@/components/save-button'
import { CancelButton } from '@/components/cancel-button'
import type { EventTypeWithRelations, InputFieldDefinition, InputFieldType } from '@/lib/types/event-types'
import {
  createInputFieldDefinition,
  updateInputFieldDefinition,
} from '@/lib/actions/input-field-definitions'
import { getActiveGroups, type Group } from '@/lib/actions/groups'
import { toast } from 'sonner'
import { useTranslations } from 'next-intl'
import { FORM_SECTIONS_SPACING } from "@/lib/constants/form-spacing"

interface FieldFormDialogProps {
  eventType: EventTypeWithRelations
  field: InputFieldDefinition | null
  open: boolean
  onOpenChange: (open: boolean) => void
  onClose: () => void
  onSaved: (field: InputFieldDefinition) => void
}

const FIELD_TYPES: { value: InputFieldType; label: string }[] = [
  { value: 'person', label: 'Person' },
  { value: 'group', label: 'Group' },
  { value: 'location', label: 'Location' },
  { value: 'list_item', label: 'List Item' },
  { value: 'document', label: 'Document' },
  { value: 'text', label: 'Text' },
  { value: 'rich_text', label: 'Rich Text' },
  { value: 'content', label: 'Content' },
  { value: 'petition', label: 'Petition' },
  { value: 'calendar_event', label: 'Calendar Event' },
  { value: 'date', label: 'Date' },
  { value: 'time', label: 'Time' },
  { value: 'datetime', label: 'Date & Time' },
  { value: 'number', label: 'Number' },
  { value: 'yes_no', label: 'Yes/No' },
  { value: 'mass-intention', label: 'Mass Intention' },
  { value: 'spacer', label: 'Spacer' },
]

// Generate property_name from field name
function generatePropertyName(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, '') // Remove special chars
    .trim()
    .replace(/\s+/g, '_') // Replace spaces with underscores
    .replace(/^[0-9]/, 'field_$&') // Prepend 'field_' if starts with number
}

export function FieldFormDialog({
  eventType,
  field,
  open,
  onOpenChange,
  onClose,
  onSaved,
}: FieldFormDialogProps) {
  const t = useTranslations()
  const [isSaving, setIsSaving] = useState(false)
  const [groups, setGroups] = useState<Group[]>([])

  const formSchema = z.object({
    name: z.string().min(1, 'Field name is required'),
    property_name: z.string().regex(/^[a-z][a-z0-9_]*$/, 'Must start with a letter, lowercase, underscores only'),
    type: z.enum([
      'person', 'group', 'location', 'list_item', 'document', 'text', 'rich_text',
      'content', 'petition', 'calendar_event', 'date', 'time', 'datetime', 'number',
      'yes_no', 'mass-intention', 'spacer'
    ]),
    required: z.boolean(),
    is_key_person: z.boolean(),
    is_primary: z.boolean(),
    list_id: z.string().nullable().optional(),
    input_filter_tags: z.array(z.string()).optional(),
  })

  type FormValues = z.infer<typeof formSchema>

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: '',
      property_name: '',
      type: 'text',
      required: false,
      is_key_person: false,
      is_primary: false,
      list_id: null,
      input_filter_tags: [],
    },
  })

  // Load active groups when dialog opens
  useEffect(() => {
    if (open) {
      loadGroups()
    }
  }, [open])

  const loadGroups = async () => {
    try {
      const activeGroups = await getActiveGroups()
      setGroups(activeGroups)
    } catch (error) {
      console.error('Failed to load groups:', error)
      toast.error('Failed to load groups')
    }
  }

  // Reset form when dialog opens with field data
  useEffect(() => {
    if (open) {
      if (field) {
        form.reset({
          name: field.name,
          property_name: field.property_name,
          type: field.type,
          required: field.required,
          is_key_person: field.is_key_person,
          is_primary: field.is_primary,
          list_id: field.list_id,
          input_filter_tags: field.input_filter_tags || [],
        })
      } else {
        form.reset({
          name: '',
          property_name: '',
          type: 'text',
          required: false,
          is_key_person: false,
          is_primary: false,
          list_id: null,
          input_filter_tags: [],
        })
      }
    }
  }, [open, field, form])

  // Auto-generate property_name from name field
  const watchName = form.watch('name')
  useEffect(() => {
    if (!field && watchName) {
      // Only auto-generate for new fields
      const generatedPropertyName = generatePropertyName(watchName)
      // Don't mark as dirty for auto-generation
      form.setValue('property_name', generatedPropertyName)
    }
  }, [watchName, field, form])

  const watchType = form.watch('type')

  const onSubmit = async (values: FormValues) => {
    setIsSaving(true)

    try {
      // Validate type-specific flags
      if (values.is_key_person && values.type !== 'person') {
        throw new Error('is_key_person can only be true for person type fields')
      }
      if (values.is_primary && values.type !== 'calendar_event') {
        throw new Error('is_primary can only be true for calendar_event type fields')
      }

      let savedField: InputFieldDefinition

      if (field) {
        // Update existing field
        savedField = await updateInputFieldDefinition(field.id, {
          name: values.name,
          property_name: values.property_name,
          type: values.type,
          required: values.required,
          is_key_person: values.is_key_person,
          is_primary: values.is_primary,
          list_id: values.list_id || null,
          input_filter_tags: values.input_filter_tags || [],
        })
        toast.success(t('eventType.fields.updateSuccess'))
      } else {
        // Create new field
        savedField = await createInputFieldDefinition({
          event_type_id: eventType.id,
          name: values.name,
          property_name: values.property_name,
          type: values.type,
          required: values.required,
          is_key_person: values.is_key_person,
          is_primary: values.is_primary,
          list_id: values.list_id || null,
          input_filter_tags: values.input_filter_tags || [],
        })
        toast.success(t('eventType.fields.createSuccess'))
      }

      onSaved(savedField)
      onClose()
    } catch (error) {
      console.error('Failed to save field:', error)
      const errorMessage = error instanceof Error ? error.message : t('eventType.fields.saveError')
      toast.error(errorMessage)
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {field ? t('eventType.fields.editField') : t('eventType.fields.addField')}
          </DialogTitle>
          <DialogDescription>
            {field
              ? t('eventType.fields.editFieldDescription')
              : t('eventType.fields.addFieldDescription')}
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className={FORM_SECTIONS_SPACING}>
            {/* Field Name */}
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t('eventType.fields.form.nameLabel')}</FormLabel>
                  <FormControl>
                    <Input
                      placeholder={t('eventType.fields.form.namePlaceholder')}
                      {...field}
                    />
                  </FormControl>
                  <FormDescription>
                    {t('eventType.fields.form.nameHelp')}
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Property Name */}
            <FormField
              control={form.control}
              name="property_name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t('eventType.fields.form.propertyNameLabel')}</FormLabel>
                  <FormControl>
                    <Input {...field} className="font-mono text-sm" />
                  </FormControl>
                  <FormDescription>
                    {t('eventType.fields.form.propertyNameHelp')}
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Field Type */}
            <FormField
              control={form.control}
              name="type"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t('eventType.fields.form.typeLabel')}</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder={t('eventType.fields.form.typePlaceholder')} />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {FIELD_TYPES.map((type) => (
                        <SelectItem key={type.value} value={type.value}>
                          {type.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormDescription>
                    {t('eventType.fields.form.typeHelp')}
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Required Toggle */}
            <FormField
              control={form.control}
              name="required"
              render={({ field }) => (
                <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                  <div className="space-y-0.5">
                    <FormLabel className="text-base">
                      {t('eventType.fields.form.requiredLabel')}
                    </FormLabel>
                    <FormDescription>
                      {t('eventType.fields.form.requiredHelp')}
                    </FormDescription>
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

            {/* Key Person Toggle (only for person type) */}
            {watchType === 'person' && (
              <FormField
                control={form.control}
                name="is_key_person"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                    <div className="space-y-0.5">
                      <FormLabel className="text-base">
                        {t('eventType.fields.form.keyPersonLabel')}
                      </FormLabel>
                      <FormDescription>
                        {t('eventType.fields.form.keyPersonHelp')}
                      </FormDescription>
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
            )}

            {/* Primary Toggle (only for calendar_event type) */}
            {watchType === 'calendar_event' && (
              <FormField
                control={form.control}
                name="is_primary"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                    <div className="space-y-0.5">
                      <FormLabel className="text-base">
                        {t('eventType.fields.form.primaryLabel')}
                      </FormLabel>
                      <FormDescription>
                        {t('eventType.fields.form.primaryHelp')}
                      </FormDescription>
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
            )}

            {/* Group Filtering (only for person type) */}
            {watchType === 'person' && (
              <FormField
                control={form.control}
                name="input_filter_tags"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Filter by Ministry Groups (Optional)</FormLabel>
                    <FormControl>
                      <MultiSelect
                        options={groups.map(group => ({
                          value: group.id,
                          label: group.name,
                        }))}
                        selected={field.value || []}
                        onChange={field.onChange}
                        placeholder="Select groups to suggest for this role..."
                        disabled={isSaving}
                      />
                    </FormControl>
                    <FormDescription>
                      When assigning this role, people from these groups will be suggested first.
                      Anyone can still be selected.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}

            {/* Form Actions */}
            <div className="flex justify-end gap-2 pt-4">
              <CancelButton onClick={onClose} disabled={isSaving} />
              <SaveButton isLoading={isSaving} />
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}

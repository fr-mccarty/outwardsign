'use client'

import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { FormInput } from '@/components/form-input'
import { Checkbox } from '@/components/ui/checkbox'
import { Label } from '@/components/ui/label'
import {
  createInputFieldDefinition,
  updateInputFieldDefinition,
} from '@/lib/actions/input-field-definitions'
import {
  createInputFieldDefinitionSchema,
  type CreateInputFieldDefinitionData,
} from '@/lib/schemas/input-field-definitions'
import { toast } from 'sonner'
import type { InputFieldDefinition, InputFieldType } from '@/lib/types'
import { getCustomLists } from '@/lib/actions/custom-lists'
import { getActiveEventTypes } from '@/lib/actions/event-types'
import type { CustomList, DynamicEventType } from '@/lib/types'

// Field type options
const FIELD_TYPE_OPTIONS: { value: InputFieldType; label: string }[] = [
  { value: 'person', label: 'Person' },
  { value: 'group', label: 'Group' },
  { value: 'location', label: 'Location' },
  { value: 'event_link', label: 'Event Link' },
  { value: 'list_item', label: 'List Item' },
  { value: 'document', label: 'Document' },
  { value: 'content', label: 'Content' },
  { value: 'text', label: 'Text' },
  { value: 'rich_text', label: 'Rich Text' },
  { value: 'date', label: 'Date' },
  { value: 'time', label: 'Time' },
  { value: 'datetime', label: 'Date & Time' },
  { value: 'number', label: 'Number' },
  { value: 'yes_no', label: 'Yes/No' },
]

interface InputFieldEditorDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  eventTypeId: string
  field?: InputFieldDefinition
  onSuccess: () => void
}

export function InputFieldEditorDialog({
  open,
  onOpenChange,
  eventTypeId,
  field,
  onSuccess,
}: InputFieldEditorDialogProps) {
  const isEditing = !!field
  const [customLists, setCustomLists] = useState<CustomList[]>([])
  const [eventTypes, setEventTypes] = useState<DynamicEventType[]>([])

  const {
    handleSubmit,
    formState: { errors, isSubmitting },
    setValue,
    watch,
    reset,
  } = useForm<CreateInputFieldDefinitionData>({
    resolver: zodResolver(createInputFieldDefinitionSchema),
    defaultValues: {
      event_type_id: eventTypeId,
      name: '',
      type: 'text',
      required: false,
      is_key_person: false,
      list_id: null,
      event_type_filter_id: null,
    },
  })

  const name = watch('name')
  const type = watch('type')
  const required = watch('required')
  const isKeyPerson = watch('is_key_person')
  const listId = watch('list_id')
  const eventTypeFilterId = watch('event_type_filter_id')

  // Load custom lists and event types on mount
  useEffect(() => {
    if (open) {
      Promise.all([getCustomLists(), getActiveEventTypes()]).then(
        ([lists, types]) => {
          setCustomLists(lists)
          setEventTypes(types)
        }
      )
    }
  }, [open])

  // Initialize form when dialog opens or field changes
  useEffect(() => {
    if (open) {
      if (field) {
        reset({
          event_type_id: eventTypeId,
          name: field.name,
          type: field.type,
          required: field.required,
          is_key_person: field.is_key_person,
          list_id: field.list_id,
          event_type_filter_id: field.event_type_filter_id,
        })
      } else {
        reset({
          event_type_id: eventTypeId,
          name: '',
          type: 'text',
          required: false,
          is_key_person: false,
          list_id: null,
          event_type_filter_id: null,
        })
      }
    }
  }, [field, open, reset, eventTypeId])

  const onSubmit = async (data: CreateInputFieldDefinitionData) => {
    try {
      if (isEditing) {
        await updateInputFieldDefinition(field.id, {
          name: data.name,
          type: data.type,
          required: data.required,
          is_key_person: data.is_key_person,
          list_id: data.list_id,
          event_type_filter_id: data.event_type_filter_id,
        })
        toast.success('Field updated successfully')
      } else {
        await createInputFieldDefinition(data)
        toast.success('Field created successfully')
      }
      onSuccess()
    } catch (error) {
      console.error('Failed to save field:', error)
      toast.error(`Failed to ${isEditing ? 'update' : 'create'} field`)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <form onSubmit={handleSubmit(onSubmit)}>
          <DialogHeader>
            <DialogTitle>
              {isEditing ? 'Edit Input Field' : 'Create Input Field'}
            </DialogTitle>
            <DialogDescription>
              {isEditing
                ? 'Update the field details below.'
                : 'Add a new input field for this event type.'}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <FormInput
              id="name"
              label="Field Name"
              value={name}
              onChange={(value) => setValue('name', value)}
              error={errors.name?.message}
              required
              placeholder="e.g., Bride, Deceased, Opening Song"
            />

            <FormInput
              id="type"
              label="Field Type"
              inputType="select"
              value={type}
              onChange={(value) => setValue('type', value as InputFieldType)}
              error={errors.type?.message}
              required
              options={FIELD_TYPE_OPTIONS}
            />

            {/* Show "Key Person" checkbox only for person type */}
            {type === 'person' && (
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="is_key_person"
                  checked={isKeyPerson ?? false}
                  onCheckedChange={(checked) =>
                    setValue('is_key_person', checked as boolean)
                  }
                />
                <Label htmlFor="is_key_person" className="text-sm cursor-pointer">
                  Key Person (searchable in list view)
                </Label>
              </div>
            )}

            {/* Show list selector for list_item type */}
            {type === 'list_item' && (
              <FormInput
                id="list_id"
                label="Custom List"
                inputType="select"
                value={listId || ''}
                onChange={(value) => setValue('list_id', value || null)}
                error={errors.list_id?.message}
                placeholder="Select a custom list"
                options={customLists.map((list) => ({
                  value: list.id,
                  label: list.name,
                }))}
              />
            )}

            {/* Show event type filter for event_link type */}
            {type === 'event_link' && (
              <FormInput
                id="event_type_filter_id"
                label="Event Type Filter"
                inputType="select"
                value={eventTypeFilterId || ''}
                onChange={(value) => setValue('event_type_filter_id', value || null)}
                error={errors.event_type_filter_id?.message}
                placeholder="Select event type to filter by"
                options={eventTypes.map((et) => ({
                  value: et.id,
                  label: et.name,
                }))}
              />
            )}

            <div className="flex items-center space-x-2">
              <Checkbox
                id="required"
                checked={required ?? false}
                onCheckedChange={(checked) =>
                  setValue('required', checked as boolean)
                }
              />
              <Label htmlFor="required" className="text-sm cursor-pointer">
                Required field
              </Label>
            </div>
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? 'Saving...' : isEditing ? 'Update' : 'Create'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

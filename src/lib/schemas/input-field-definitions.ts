import { z } from 'zod'

// Input field type enum
export const inputFieldTypeSchema = z.enum([
  'person',
  'group',
  'location',
  'event_link',
  'list_item',
  'document',
  'content',
  'petition',
  'text',
  'rich_text',
  'date',
  'time',
  'datetime',
  'number',
  'yes_no',
])

// Create input field definition schema
export const createInputFieldDefinitionSchema = z
  .object({
    event_type_id: z.string().uuid('Invalid event type ID'),
    name: z.string().min(1, 'Field name is required'),
    type: inputFieldTypeSchema,
    required: z.boolean(),
    list_id: z.string().uuid().nullable().optional(),
    event_type_filter_id: z.string().uuid().nullable().optional(),
    filter_tags: z.array(z.string()).nullable().optional(),
    is_key_person: z.boolean().optional(),
  })
  .refine(
    (data) => {
      // is_key_person can only be true for person type
      if (data.is_key_person && data.type !== 'person') {
        return false
      }
      return true
    },
    {
      message: 'Key Person flag is only valid for person type fields',
      path: ['is_key_person'],
    }
  )

// Update input field definition schema (all fields optional)
export const updateInputFieldDefinitionSchema = z.object({
  name: z.string().min(1, 'Field name is required').optional(),
  type: inputFieldTypeSchema.optional(),
  required: z.boolean().optional(),
  list_id: z.string().uuid().nullable().optional(),
  event_type_filter_id: z.string().uuid().nullable().optional(),
  filter_tags: z.array(z.string()).nullable().optional(),
  is_key_person: z.boolean().optional(),
})

// Export types using z.infer
export type CreateInputFieldDefinitionData = z.infer<
  typeof createInputFieldDefinitionSchema
>
export type UpdateInputFieldDefinitionData = z.infer<
  typeof updateInputFieldDefinitionSchema
>

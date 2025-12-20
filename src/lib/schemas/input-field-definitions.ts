import { z } from 'zod'

// Input field type enum
export const inputFieldTypeSchema = z.enum([
  'person',
  'group',
  'location',
  'list_item',
  'document',
  'content',
  'petition',
  'calendar_event',
  'text',
  'rich_text',
  'date',
  'time',
  'datetime',
  'number',
  'yes_no',
  'mass-intention',
  'spacer',
])

// Property name validation pattern: lowercase letters, numbers, and underscores, starting with a letter
const propertyNamePattern = /^[a-z][a-z0-9_]*$/

// Create input field definition schema
export const createInputFieldDefinitionSchema = z
  .object({
    event_type_id: z.string().uuid('Invalid event type ID'),
    name: z.string().min(1, 'Field name is required'),
    property_name: z
      .string()
      .min(1, 'Property name is required')
      .regex(
        propertyNamePattern,
        'Property name must start with a lowercase letter and contain only lowercase letters, numbers, and underscores'
      ),
    type: inputFieldTypeSchema,
    required: z.boolean(),
    list_id: z.string().uuid().nullable().optional(),
    input_filter_tags: z.array(z.string()).nullable().optional(),
    is_key_person: z.boolean().optional(),
    is_primary: z.boolean().optional(),
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
  .refine(
    (data) => {
      // is_primary can only be true for calendar_event type
      if (data.is_primary && data.type !== 'calendar_event') {
        return false
      }
      return true
    },
    {
      message: 'Primary flag is only valid for calendar_event type fields',
      path: ['is_primary'],
    }
  )

// Update input field definition schema (all fields optional)
export const updateInputFieldDefinitionSchema = z.object({
  name: z.string().min(1, 'Field name is required').optional(),
  property_name: z
    .string()
    .min(1, 'Property name is required')
    .regex(
      propertyNamePattern,
      'Property name must start with a lowercase letter and contain only lowercase letters, numbers, and underscores'
    )
    .optional(),
  type: inputFieldTypeSchema.optional(),
  required: z.boolean().optional(),
  list_id: z.string().uuid().nullable().optional(),
  tags: z.array(z.string()).nullable().optional(),
  is_key_person: z.boolean().optional(),
  is_primary: z.boolean().optional(),
})

// Export types using z.infer
export type CreateInputFieldDefinitionData = z.infer<
  typeof createInputFieldDefinitionSchema
>
export type UpdateInputFieldDefinitionData = z.infer<
  typeof updateInputFieldDefinitionSchema
>

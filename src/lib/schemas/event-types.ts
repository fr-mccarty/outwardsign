import { z } from 'zod'

// Create event type schema
export const createEventTypeSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  description: z.string().optional().nullable(),
  is_active: z.boolean().optional().nullable(),
  display_order: z.number().optional().nullable(),
})

// Update event type schema (all fields optional)
export const updateEventTypeSchema = createEventTypeSchema.partial()

// Export types using z.infer
export type CreateEventTypeData = z.infer<typeof createEventTypeSchema>
export type UpdateEventTypeData = z.infer<typeof updateEventTypeSchema>

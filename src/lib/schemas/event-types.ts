import { z } from 'zod'

// Create event type schema
export const createEventTypeSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  description: z.string().optional().nullable(),
  icon: z.string().min(1, 'Icon is required'),
  slug: z.string().optional().nullable(),
})

// Update event type schema (all fields optional)
export const updateEventTypeSchema = z.object({
  name: z.string().min(1, 'Name is required').optional(),
  description: z.string().optional().nullable(),
  icon: z.string().min(1, 'Icon is required').optional(),
  slug: z.string().optional().nullable(),
})

// Export types using z.infer
export type CreateEventTypeData = z.infer<typeof createEventTypeSchema>
export type UpdateEventTypeData = z.infer<typeof updateEventTypeSchema>

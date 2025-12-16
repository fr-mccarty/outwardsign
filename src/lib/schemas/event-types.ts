import { z } from 'zod'

// Create event type schema
export const createEventTypeSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  description: z.string().optional().nullable(),
  icon: z.string().min(1, 'Icon is required'),
  slug: z.string().optional().nullable(),
  category: z.enum(['sacrament', 'mass', 'special_liturgy', 'event'], {
    message: 'Category is required',
  }),
})

// Update event type schema (all fields optional)
export const updateEventTypeSchema = z.object({
  name: z.string().min(1, 'Name is required').optional(),
  description: z.string().optional().nullable(),
  icon: z.string().min(1, 'Icon is required').optional(),
  slug: z.string().optional().nullable(),
  category: z.enum(['sacrament', 'mass', 'special_liturgy', 'event']).optional(),
})

// Export types using z.infer
export type CreateEventTypeData = z.infer<typeof createEventTypeSchema>
export type UpdateEventTypeData = z.infer<typeof updateEventTypeSchema>

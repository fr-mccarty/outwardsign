import { z } from 'zod'

// Create parish schema
export const createParishSchema = z.object({
  name: z.string().min(1, 'Parish name is required').trim(),
  city: z.string().min(1, 'City is required').trim(),
  state: z.string().length(2, 'State must be 2 characters').trim(),
})

// Update parish schema (all fields optional but still validated if provided)
export const updateParishSchema = z.object({
  name: z.string().min(1, 'Parish name is required').trim().optional(),
  city: z.string().min(1, 'City is required').trim().optional(),
  state: z.string().length(2, 'State must be 2 characters').trim().optional(),
})

// Export types using z.infer
export type CreateParishData = z.infer<typeof createParishSchema>
export type UpdateParishData = z.infer<typeof updateParishSchema>

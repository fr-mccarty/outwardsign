import { z } from 'zod'

// Slug validation: lowercase letters, numbers, and hyphens only
const slugSchema = z.string()
  .min(3, 'Slug must be at least 3 characters')
  .max(50, 'Slug must be less than 50 characters')
  .regex(/^[a-z0-9-]+$/, 'Slug can only contain lowercase letters, numbers, and hyphens')
  .regex(/^[a-z]/, 'Slug must start with a letter')
  .regex(/[a-z0-9]$/, 'Slug must end with a letter or number')

// Create parish schema
export const createParishSchema = z.object({
  name: z.string().min(1, 'Parish name is required').trim(),
  city: z.string().min(1, 'City is required').trim(),
  state: z.string().trim().optional(),
  country: z.string().min(1, 'Country is required').trim(),
  slug: slugSchema.optional(),
})

// Update parish schema (all fields optional but still validated if provided)
export const updateParishSchema = z.object({
  name: z.string().min(1, 'Parish name is required').trim().optional(),
  city: z.string().min(1, 'City is required').trim().optional(),
  state: z.string().trim().optional(),
  country: z.string().min(1, 'Country is required').trim().optional(),
  slug: slugSchema.optional(),
})

// Export types using z.infer
export type CreateParishData = z.infer<typeof createParishSchema>
export type UpdateParishData = z.infer<typeof updateParishSchema>

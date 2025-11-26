import { z } from 'zod'

// Create location schema
export const createLocationSchema = z.object({
  name: z.string().min(1, 'Location name is required'),
  description: z.string().optional().nullable(),
  street: z.string().optional().nullable(),
  city: z.string().optional().nullable(),
  state: z.string().optional().nullable(),
  country: z.string().optional().nullable(),
  phone_number: z.string().optional().nullable(),
})

// Update location schema (all fields optional)
export const updateLocationSchema = createLocationSchema.partial()

// Export types using z.infer
export type CreateLocationData = z.infer<typeof createLocationSchema>
export type UpdateLocationData = z.infer<typeof updateLocationSchema>

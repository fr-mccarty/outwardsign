import { z } from 'zod'

// Create occasion schema
export const createOccasionSchema = z.object({
  label: z.string().min(1, 'Label is required'),
  date: z.string().optional().nullable(),
  time: z.string().optional().nullable(),
  location_id: z.string().optional().nullable(),
  is_primary: z.boolean().optional(),
  position: z.number().optional(),
})

// Update occasion schema (all fields optional)
export const updateOccasionSchema = createOccasionSchema.partial()

// Export types using z.infer
export type CreateOccasionData = z.infer<typeof createOccasionSchema>
export type UpdateOccasionData = z.infer<typeof updateOccasionSchema>

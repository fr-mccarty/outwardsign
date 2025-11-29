import { z } from 'zod'

// Create person schema
export const createPersonSchema = z.object({
  first_name: z.string().min(1, 'First name is required'),
  first_name_pronunciation: z.string().optional().nullable(),
  last_name: z.string().min(1, 'Last name is required'),
  last_name_pronunciation: z.string().optional().nullable(),
  phone_number: z.string().optional().nullable(),
  email: z.string().email('Invalid email address').optional().nullable().or(z.literal('')),
  street: z.string().optional().nullable(),
  city: z.string().optional().nullable(),
  state: z.string().optional().nullable(),
  zipcode: z.string().optional().nullable(),
  sex: z.enum(['Male', 'Female']).optional().nullable(),
  note: z.string().optional().nullable(),
  avatar_url: z.string().optional().nullable(),  // Storage path to profile photo
  mass_times_template_item_ids: z.array(z.string()).optional().nullable(),
})

// Update person schema (all fields optional)
export const updatePersonSchema = createPersonSchema.partial()

// Export types using z.infer
export type CreatePersonData = z.infer<typeof createPersonSchema>
export type UpdatePersonData = z.infer<typeof updatePersonSchema>

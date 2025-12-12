import { z } from 'zod'

// Create family schema
export const createFamilySchema = z.object({
  family_name: z.string().min(1, 'Family name is required').trim(),
  active: z.boolean().default(true),
})

// Update family schema (all fields optional)
export const updateFamilySchema = z.object({
  family_name: z.string().min(1, 'Family name is required').trim().optional(),
  active: z.boolean().optional(),
})

// Add family member schema
export const addFamilyMemberSchema = z.object({
  person_id: z.string().uuid('Invalid person ID'),
  relationship: z.string().trim().optional().nullable(),
  is_primary_contact: z.boolean().optional(),
})

// Update family member schema
export const updateFamilyMemberSchema = z.object({
  relationship: z.string().trim().optional().nullable(),
  is_primary_contact: z.boolean().optional(),
})

// Export types using z.infer
export type CreateFamilyData = z.infer<typeof createFamilySchema>
export type UpdateFamilyData = z.infer<typeof updateFamilySchema>
export type AddFamilyMemberData = z.infer<typeof addFamilyMemberSchema>
export type UpdateFamilyMemberData = z.infer<typeof updateFamilyMemberSchema>

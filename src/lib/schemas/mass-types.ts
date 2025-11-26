import { z } from 'zod'

// Create mass type schema
export const createMassTypeSchema = z.object({
  name: z.string().min(1, 'Name is required').trim(),
  description: z.string().trim().optional(),
  display_order: z.number().int().min(0).optional(),
  active: z.boolean().optional(),
})

// Update mass type schema (all fields optional)
export const updateMassTypeSchema = z.object({
  name: z.string().min(1, 'Name is required').trim().optional(),
  description: z.string().trim().nullable().optional(),
  display_order: z.number().int().min(0).optional(),
  active: z.boolean().optional(),
})

// Export types using z.infer
export type CreateMassTypeData = z.infer<typeof createMassTypeSchema>
export type UpdateMassTypeData = z.infer<typeof updateMassTypeSchema>

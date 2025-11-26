import { z } from 'zod'

// Create mass role schema
export const createMassRoleSchema = z.object({
  name: z.string().min(1, "Name is required"),
  description: z.string().optional(),
  note: z.string().optional(),
  is_active: z.boolean().optional(),
  display_order: z.number().optional(),
})

// Update mass role schema (all fields optional, allows nulls)
export const updateMassRoleSchema = z.object({
  name: z.string().min(1, "Name is required").optional(),
  description: z.string().optional().nullable(),
  note: z.string().optional().nullable(),
  is_active: z.boolean().optional(),
  display_order: z.number().optional().nullable(),
})

// Export types using z.infer
export type CreateMassRoleData = z.infer<typeof createMassRoleSchema>
export type UpdateMassRoleData = z.infer<typeof updateMassRoleSchema>

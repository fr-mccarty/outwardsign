import { z } from 'zod'
import { LITURGICAL_CONTEXT_VALUES } from '@/lib/constants'

// Create mass role template schema
export const createMassRoleTemplateSchema = z.object({
  name: z.string().min(1, "Template name is required"),
  description: z.string().optional(),
  note: z.string().optional(),
  liturgical_contexts: z.array(z.enum(LITURGICAL_CONTEXT_VALUES)).optional(),
})

// Update mass role template schema (all fields optional)
export const updateMassRoleTemplateSchema = createMassRoleTemplateSchema.partial()

// Export types using z.infer
export type CreateMassRoleTemplateData = z.infer<typeof createMassRoleTemplateSchema>
export type UpdateMassRoleTemplateData = z.infer<typeof updateMassRoleTemplateSchema>

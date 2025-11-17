import { z } from 'zod'
import { MODULE_STATUS_VALUES } from '@/lib/constants'

// Zod validation schemas
export const createPresentationSchema = z.object({
  presentation_event_id: z.string().uuid().optional().nullable(),
  child_id: z.string().uuid().optional().nullable(),
  mother_id: z.string().uuid().optional().nullable(),
  father_id: z.string().uuid().optional().nullable(),
  coordinator_id: z.string().uuid().optional().nullable(),
  is_baptized: z.boolean().optional(),
  status: z.enum(MODULE_STATUS_VALUES).optional().nullable(),
  note: z.string().optional().nullable(),
  presentation_template_id: z.string().optional().nullable(),
})

export const updatePresentationSchema = createPresentationSchema.partial()

// Export types from schemas
export type CreatePresentationData = z.infer<typeof createPresentationSchema>
export type UpdatePresentationData = z.infer<typeof updatePresentationSchema>

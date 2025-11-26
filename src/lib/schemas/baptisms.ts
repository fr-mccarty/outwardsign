import { z } from 'zod'
import { MODULE_STATUS_VALUES } from '@/lib/constants'

// Create baptism schema
export const createBaptismSchema = z.object({
  status: z.enum(MODULE_STATUS_VALUES).optional().nullable(),
  baptism_event_id: z.string().uuid().optional().nullable(),
  child_id: z.string().uuid().optional().nullable(),
  mother_id: z.string().uuid().optional().nullable(),
  father_id: z.string().uuid().optional().nullable(),
  sponsor_1_id: z.string().uuid().optional().nullable(),
  sponsor_2_id: z.string().uuid().optional().nullable(),
  presider_id: z.string().uuid().optional().nullable(),
  baptism_template_id: z.string().optional().nullable(),
  note: z.string().optional().nullable(),
})

// Update baptism schema (all fields optional)
export const updateBaptismSchema = createBaptismSchema.partial()

// Export types using z.infer
export type CreateBaptismData = z.infer<typeof createBaptismSchema>
export type UpdateBaptismData = z.infer<typeof updateBaptismSchema>

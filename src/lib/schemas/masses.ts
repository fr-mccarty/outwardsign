import { z } from 'zod'
import { MASS_STATUS_VALUES, LITURGICAL_COLOR_VALUES } from '@/lib/constants'

// Create mass schema
export const createMassSchema = z.object({
  status: z.enum(MASS_STATUS_VALUES).optional().nullable(),
  event_id: z.string().uuid().optional().nullable(),
  presider_id: z.string().uuid().optional().nullable(),
  homilist_id: z.string().uuid().optional().nullable(),
  liturgical_event_id: z.string().uuid().optional().nullable(),
  mass_roles_template_id: z.string().uuid().optional().nullable(),
  mass_template_id: z.string().optional().nullable(),
  liturgical_color: z.enum(LITURGICAL_COLOR_VALUES).optional().nullable(),
  petitions: z.string().optional().nullable(),
  announcements: z.string().optional().nullable(),
  note: z.string().optional().nullable(),
})

// Update mass schema (all fields optional)
export const updateMassSchema = createMassSchema.partial()

// Export types using z.infer
export type CreateMassData = z.infer<typeof createMassSchema>
export type UpdateMassData = z.infer<typeof updateMassSchema>

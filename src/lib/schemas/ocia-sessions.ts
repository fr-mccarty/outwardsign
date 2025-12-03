import { z } from 'zod'
import { MODULE_STATUS_VALUES } from '@/lib/constants'

export const createOciaSessionSchema = z.object({
  name: z.string().min(1, 'Session name is required'),
  ocia_event_id: z.string().uuid().nullable(),
  coordinator_id: z.string().uuid().nullable(),
  status: z.enum(MODULE_STATUS_VALUES).optional(),
  note: z.string().nullable(),
  ocia_template_id: z.string().nullable(),
})

export const updateOciaSessionSchema = createOciaSessionSchema.partial()

export type CreateOciaSessionData = z.infer<typeof createOciaSessionSchema>
export type UpdateOciaSessionData = z.infer<typeof updateOciaSessionSchema>

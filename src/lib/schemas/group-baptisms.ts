import { z } from 'zod'
import { MODULE_STATUS_VALUES } from '@/lib/constants'

export const createGroupBaptismSchema = z.object({
  name: z.string().min(1, 'Group name is required'),
  group_baptism_event_id: z.string().uuid().nullable(),
  presider_id: z.string().uuid().nullable(),
  status: z.enum(MODULE_STATUS_VALUES).optional(),
  note: z.string().nullable(),
  group_baptism_template_id: z.string().nullable(),
})

export const updateGroupBaptismSchema = createGroupBaptismSchema.partial()

export type CreateGroupBaptismData = z.infer<typeof createGroupBaptismSchema>
export type UpdateGroupBaptismData = z.infer<typeof updateGroupBaptismSchema>

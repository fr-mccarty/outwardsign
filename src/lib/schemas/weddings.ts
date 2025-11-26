import { z } from 'zod'
import { MODULE_STATUS_VALUES } from '@/lib/constants'

// Create wedding schema
export const createWeddingSchema = z.object({
  status: z.enum(MODULE_STATUS_VALUES).optional().nullable(),
  wedding_event_id: z.string().uuid().optional().nullable(),
  reception_event_id: z.string().uuid().optional().nullable(),
  rehearsal_event_id: z.string().uuid().optional().nullable(),
  rehearsal_dinner_event_id: z.string().uuid().optional().nullable(),
  bride_id: z.string().uuid().optional().nullable(),
  groom_id: z.string().uuid().optional().nullable(),
  coordinator_id: z.string().uuid().optional().nullable(),
  presider_id: z.string().uuid().optional().nullable(),
  homilist_id: z.string().uuid().optional().nullable(),
  lead_musician_id: z.string().uuid().optional().nullable(),
  cantor_id: z.string().uuid().optional().nullable(),
  witness_1_id: z.string().uuid().optional().nullable(),
  witness_2_id: z.string().uuid().optional().nullable(),
  first_reader_id: z.string().uuid().optional().nullable(),
  second_reader_id: z.string().uuid().optional().nullable(),
  psalm_reader_id: z.string().uuid().optional().nullable(),
  gospel_reader_id: z.string().uuid().optional().nullable(),
  petition_reader_id: z.string().uuid().optional().nullable(),
  first_reading_id: z.string().uuid().optional().nullable(),
  psalm_id: z.string().uuid().optional().nullable(),
  second_reading_id: z.string().uuid().optional().nullable(),
  gospel_reading_id: z.string().uuid().optional().nullable(),
  psalm_is_sung: z.boolean().optional().nullable(),
  petitions_read_by_second_reader: z.boolean().optional().nullable(),
  petitions: z.string().optional().nullable(),
  announcements: z.string().optional().nullable(),
  notes: z.string().optional().nullable(),
  wedding_template_id: z.string().optional().nullable(),
})

// Update wedding schema (all fields optional)
export const updateWeddingSchema = createWeddingSchema.partial()

// Export types using z.infer
export type CreateWeddingData = z.infer<typeof createWeddingSchema>
export type UpdateWeddingData = z.infer<typeof updateWeddingSchema>

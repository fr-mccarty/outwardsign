import { z } from 'zod'
import { MODULE_STATUS_VALUES } from '@/lib/constants'

// Create quinceanera schema
export const createQuinceaneraSchema = z.object({
  status: z.enum(MODULE_STATUS_VALUES).optional().nullable(),
  quinceanera_event_id: z.string().uuid().optional().nullable(),
  quinceanera_reception_id: z.string().uuid().optional().nullable(),
  quinceanera_id: z.string().uuid().optional().nullable(),
  family_contact_id: z.string().uuid().optional().nullable(),
  coordinator_id: z.string().uuid().optional().nullable(),
  presider_id: z.string().uuid().optional().nullable(),
  homilist_id: z.string().uuid().optional().nullable(),
  lead_musician_id: z.string().uuid().optional().nullable(),
  cantor_id: z.string().uuid().optional().nullable(),
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
  note: z.string().optional().nullable(),
  quinceanera_template_id: z.string().optional().nullable(),
})

// Update quinceanera schema (all fields optional)
export const updateQuinceaneraSchema = createQuinceaneraSchema.partial()

// Export types using z.infer
export type CreateQuinceaneraData = z.infer<typeof createQuinceaneraSchema>
export type UpdateQuinceaneraData = z.infer<typeof updateQuinceaneraSchema>

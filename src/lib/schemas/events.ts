import { z } from 'zod'
import { LITURGICAL_LANGUAGE_VALUES } from '@/lib/constants'

// Create event schema
export const createEventSchema = z.object({
  name: z.string().min(1, 'Event name is required'),
  description: z.string().optional().nullable(),
  responsible_party_id: z.string().uuid().optional().nullable(),
  event_type_id: z.string().uuid().optional().nullable(),
  related_event_type: z.enum([
    'wedding',
    'funeral',
    'baptism',
    'presentation',
    'quinceanera',
    'mass',
  ]).optional().nullable(),
  start_date: z.string().optional().nullable(),
  start_time: z.string().optional().nullable(),
  end_date: z.string().optional().nullable(),
  end_time: z.string().optional().nullable(),
  timezone: z.string().optional().nullable(),
  location_id: z.string().uuid().optional().nullable(),
  language: z.enum(LITURGICAL_LANGUAGE_VALUES).optional().nullable(),
  event_template_id: z.string().optional().nullable(),
  note: z.string().optional().nullable(),
})

// Update event schema (all fields optional)
export const updateEventSchema = createEventSchema.partial()

// Export types using z.infer
export type CreateEventData = z.infer<typeof createEventSchema>
export type UpdateEventData = z.infer<typeof updateEventSchema>

import { z } from 'zod'
import { MASS_INTENTION_STATUS_VALUES } from '@/lib/constants'

// Create mass intention schema
export const createMassIntentionSchema = z.object({
  mass_offered_for: z.string().min(1, 'Please enter what the Mass is offered for'),
  status: z.enum(MASS_INTENTION_STATUS_VALUES).optional().nullable(),
  date_requested: z.string().optional().nullable(),
  date_received: z.string().optional().nullable(),
  stipend_in_cents: z.number().optional().nullable(),
  note: z.string().optional().nullable(),
  requested_by_id: z.string().uuid().optional().nullable(),
  master_event_id: z.string().uuid().optional().nullable(),  // References master_events table
  mass_intention_template_id: z.string().optional().nullable(),
})

// Update mass intention schema (all fields optional except required validations)
export const updateMassIntentionSchema = z.object({
  mass_offered_for: z.string().min(1, 'Please enter what the Mass is offered for').optional().nullable(),
  status: z.enum(MASS_INTENTION_STATUS_VALUES).optional().nullable(),
  date_requested: z.string().optional().nullable(),
  date_received: z.string().optional().nullable(),
  stipend_in_cents: z.number().optional().nullable(),
  note: z.string().optional().nullable(),
  requested_by_id: z.string().uuid().optional().nullable(),
  master_event_id: z.string().uuid().optional().nullable(),  // References master_events table
  mass_intention_template_id: z.string().optional().nullable(),
})

// Export types using z.infer
export type CreateMassIntentionData = z.infer<typeof createMassIntentionSchema>
export type UpdateMassIntentionData = z.infer<typeof updateMassIntentionSchema>

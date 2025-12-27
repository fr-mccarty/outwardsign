import { z } from 'zod'
import { MASS_STATUS_VALUES, LITURGICAL_COLOR_VALUES } from '@/lib/constants'
import type {
  ParishEvent,
  ParishEventWithRelations,
  Person,
  MassIntention,
  CalendarEvent,
  EventType,
  ParishEventStatus,
} from '@/lib/types'

// ========================================
// MASS-SPECIFIC INTERFACES
// ========================================
// These interfaces are defined here instead of in lib/actions/masses.ts
// because "use server" files can only export async functions

export interface MassFilterParams {
  search?: string
  status?: ParishEventStatus | 'all'
  start_date?: string
  end_date?: string
  sort?: 'date_asc' | 'date_desc' | 'created_asc' | 'created_desc'
  offset?: number
  limit?: number
}

export interface MassStats {
  total: number
  upcoming: number
  past: number
  filtered: number
}

// MassWithNames wraps ParishEvent with additional calendar/person info
export interface MassWithNames extends ParishEvent {
  event_type?: EventType
  primary_calendar_event?: CalendarEvent
  presider?: Person | null
  homilist?: Person | null
}

// MassWithRelations provides full data for view pages
export interface MassWithRelations extends ParishEventWithRelations {
  // Additional mass-specific relations
  mass_intention?: (MassIntention & {
    requested_by?: Person | null
  }) | null
}

// Type for role assignment with resolved person
export interface ParishEventRoleWithRelations {
  id: string
  master_event_id: string
  role_id: string
  person_id: string
  notes?: string | null
  created_at: string
  updated_at: string
  deleted_at?: string | null
  person?: Person | null
}

// Create a role assignment for a mass
export interface CreateMassRoleData {
  master_event_id: string
  role_id: string
  person_id: string
  notes?: string
}

// ========================================
// ZOD SCHEMAS
// ========================================

// Create mass schema
export const createMassSchema = z.object({
  status: z.enum(MASS_STATUS_VALUES).optional().nullable(),
  event_id: z.string().uuid().optional().nullable(),
  presider_id: z.string().uuid().optional().nullable(),
  homilist_id: z.string().uuid().optional().nullable(),
  liturgical_event_id: z.string().uuid().optional().nullable(),
  mass_template_id: z.string().optional().nullable(),
  event_type_id: z.string().uuid().optional().nullable(),
  field_values: z.record(z.string(), z.any()).optional().nullable(),
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

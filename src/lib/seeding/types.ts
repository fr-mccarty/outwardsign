/**
 * Shared types for seeding functions
 *
 * Used by both:
 * - Dev seeder (scripts/dev-seed.ts)
 * - Production seeder (src/lib/actions/seed-data.ts)
 */

import type { SupabaseClient } from '@supabase/supabase-js'

export interface SamplePerson {
  firstName: string
  lastName: string
  email: string
  phone: string
  sex: 'MALE' | 'FEMALE'
  city?: string
  state?: string
  avatarFile?: string // Only used by dev seeder
}

export interface FamilyDefinition {
  familyName: string
  active: boolean
  members: Array<{
    firstName: string
    lastName: string
    relationship: string
    isPrimaryContact: boolean
  }>
}

export interface SeederContext {
  supabase: SupabaseClient
  parishId: string
}

export interface SeederResult {
  success: boolean
  message?: string
  counts: {
    people: number
    families: number
    groupMemberships: number
    masses: number
    massIntentions: number
    weddings: number
    funerals: number
    readings: number
  }
}

export interface CreatedPerson {
  id: string
  first_name: string
  last_name: string
  full_name: string
}

export interface CreatedFamily {
  id: string
  family_name: string
}

/**
 * Shared types for dev seeders
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
  avatarFile?: string
}

export interface DevSeederContext {
  supabase: SupabaseClient
  parishId: string
  devUserEmail: string
}

export interface DevSeederResult {
  success: boolean
  message?: string
  data?: Record<string, unknown>
}

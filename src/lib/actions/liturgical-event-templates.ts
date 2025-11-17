'use server'

import { createClient } from '@/lib/supabase/server'
// redirect import removed - not used
import { revalidatePath } from 'next/cache'
import { requireSelectedParish } from '@/lib/auth/parish'
import { ensureJWTClaims } from '@/lib/auth/jwt-claims'

export interface LiturgicalEventTemplate {
  id: string
  parish_id: string
  name: string
  description?: string
  template_data: TemplateData
  is_active: boolean
  created_at: string
  updated_at: string
}

export interface TemplateData {
  default_duration_hours?: number
  default_location?: string
  ministry_requirements: MinistryRequirement[]
  default_readings_type?: string // 'sunday' | 'weekday' | 'special'
  notes?: string
}

export interface MinistryRequirement {
  ministry_id: string
  ministry_name: string // For display purposes
  required_count: number
  is_optional: boolean
  notes?: string
}

export interface CreateTemplateData {
  name: string
  description?: string
  template_data: TemplateData
  is_active?: boolean
}

export interface UpdateTemplateData {
  name?: string
  description?: string
  template_data?: TemplateData
  is_active?: boolean
}

export async function getTemplates(): Promise<LiturgicalEventTemplate[]> {
  const selectedParishId = await requireSelectedParish()
  await ensureJWTClaims()
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('liturgical_event_templates')
    .select('*')
    .order('name', { ascending: true })

  if (error) {
    console.error('Error fetching templates:', error)
    throw new Error('Failed to fetch templates')
  }

  return data || []
}

export async function getTemplate(id: string): Promise<LiturgicalEventTemplate | null> {
  const selectedParishId = await requireSelectedParish()
  await ensureJWTClaims()
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('liturgical_event_templates')
    .select('*')
    .eq('id', id)
    .single()

  if (error) {
    if (error.code === 'PGRST116') {
      return null // Not found
    }
    console.error('Error fetching template:', error)
    throw new Error('Failed to fetch template')
  }

  return data
}

export async function createTemplate(data: CreateTemplateData): Promise<LiturgicalEventTemplate> {
  const selectedParishId = await requireSelectedParish()
  await ensureJWTClaims()
  const supabase = await createClient()

  const { data: template, error } = await supabase
    .from('liturgical_event_templates')
    .insert([
      {
        parish_id: selectedParishId,
        name: data.name,
        description: data.description || null,
        template_data: data.template_data,
        is_active: data.is_active ?? true,
      }
    ])
    .select()
    .single()

  if (error) {
    console.error('Error creating template:', error)
    throw new Error('Failed to create template')
  }

  revalidatePath('/liturgical-event-templates')
  return template
}

export async function updateTemplate(id: string, data: UpdateTemplateData): Promise<LiturgicalEventTemplate> {
  const selectedParishId = await requireSelectedParish()
  await ensureJWTClaims()
  const supabase = await createClient()

  const updateData: Record<string, unknown> = {}
  if (data.name !== undefined) updateData.name = data.name
  if (data.description !== undefined) updateData.description = data.description || null
  if (data.template_data !== undefined) updateData.template_data = data.template_data
  if (data.is_active !== undefined) updateData.is_active = data.is_active

  const { data: template, error } = await supabase
    .from('liturgical_event_templates')
    .update(updateData)
    .eq('id', id)
    .select()
    .single()

  if (error) {
    console.error('Error updating template:', error)
    throw new Error('Failed to update template')
  }

  revalidatePath('/liturgical-event-templates')
  return template
}

export async function deleteTemplate(id: string): Promise<void> {
  const selectedParishId = await requireSelectedParish()
  await ensureJWTClaims()
  const supabase = await createClient()

  const { error } = await supabase
    .from('liturgical_event_templates')
    .delete()
    .eq('id', id)

  if (error) {
    console.error('Error deleting template:', error)
    throw new Error('Failed to delete template')
  }

  revalidatePath('/liturgical-event-templates')
}

export async function getActiveTemplates(): Promise<LiturgicalEventTemplate[]> {
  const selectedParishId = await requireSelectedParish()
  await ensureJWTClaims()
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('liturgical_event_templates')
    .select('*')
    .eq('is_active', true)
    .order('name', { ascending: true })

  if (error) {
    console.error('Error fetching active templates:', error)
    throw new Error('Failed to fetch active templates')
  }

  return data || []
}

// Initialize default templates for common liturgical events
export async function initializeDefaultTemplates(): Promise<LiturgicalEventTemplate[]> {
  const selectedParishId = await requireSelectedParish()
  await ensureJWTClaims()
  const supabase = await createClient()

  // Check if parish already has templates
  const { data: existing } = await supabase
    .from('liturgical_event_templates')
    .select('id')
    .limit(1)

  if (existing && existing.length > 0) {
    // Parish already has templates, return existing ones
    return getTemplates()
  }

  // Get parish's ministries to create template requirements
  const { data: ministries } = await supabase
    .from('ministries')
    .select('id, name')
    .eq('is_active', true)
    .order('sort_order', { ascending: true })

  const ministryReqs = ministries ? ministries.slice(0, 4).map(ministry => ({
    ministry_id: ministry.id,
    ministry_name: ministry.name,
    required_count: 1,
    is_optional: false
  })) : []

  // Create default templates
  const defaultTemplates = [
    {
      name: 'Sunday Mass',
      description: 'Standard Sunday liturgical celebration',
      template_data: {
        default_duration_hours: 1.5,
        default_location: 'Main Church',
        ministry_requirements: ministryReqs,
        default_readings_type: 'sunday',
        notes: 'Standard Sunday Mass with full ministry team'
      }
    },
    {
      name: 'Weekday Mass',
      description: 'Simple weekday liturgical celebration',
      template_data: {
        default_duration_hours: 0.5,
        default_location: 'Chapel',
        ministry_requirements: ministryReqs.slice(0, 2), // Fewer requirements
        default_readings_type: 'weekday',
        notes: 'Simple weekday Mass with minimal ministry needs'
      }
    },
    {
      name: 'Wedding',
      description: 'Wedding ceremony template',
      template_data: {
        default_duration_hours: 1,
        default_location: 'Main Church',
        ministry_requirements: ministryReqs,
        default_readings_type: 'special',
        notes: 'Wedding ceremony with full ministry support'
      }
    },
    {
      name: 'Funeral',
      description: 'Funeral Mass template',
      template_data: {
        default_duration_hours: 1,
        default_location: 'Main Church',
        ministry_requirements: ministryReqs,
        default_readings_type: 'special',
        notes: 'Funeral Mass with appropriate ministry team'
      }
    }
  ]

  const { data: templates, error } = await supabase
    .from('liturgical_event_templates')
    .insert(
      defaultTemplates.map(template => ({
        ...template,
        parish_id: selectedParishId,
        is_active: true,
      }))
    )
    .select()

  if (error) {
    console.error('Error creating default templates:', error)
    throw new Error('Failed to create default templates')
  }

  revalidatePath('/liturgical-event-templates')
  return templates || []
}
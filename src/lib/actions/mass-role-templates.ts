'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { requireSelectedParish } from '@/lib/auth/parish'
import { ensureJWTClaims } from '@/lib/auth/jwt-claims'
import type { LiturgicalContext } from '@/lib/constants'
import { createMassRoleTemplateSchema, updateMassRoleTemplateSchema, type CreateMassRoleTemplateData, type UpdateMassRoleTemplateData } from '@/lib/schemas/mass-role-templates'

// Types
export interface MassRoleTemplate {
  id: string
  parish_id: string
  name: string
  description: string | null
  note: string | null
  liturgical_contexts: LiturgicalContext[]
  created_at: string
  updated_at: string
}

export interface MassRoleTemplateWithItems extends MassRoleTemplate {
  items: Array<{
    id: string
    mass_role_id: string
    count: number
    position: number
    mass_role: {
      id: string
      name: string
      description: string | null
    }
  }>
}

// Note: Import CreateMassRoleTemplateData and UpdateMassRoleTemplateData from '@/lib/schemas/mass-role-templates' instead

// Get all mass role templates for the current parish
export async function getMassRoleTemplates(): Promise<MassRoleTemplate[]> {
  const selectedParishId = await requireSelectedParish()
  await ensureJWTClaims()
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('mass_roles_templates')
    .select('*')
    .eq('parish_id', selectedParishId)
    .order('name', { ascending: true })

  if (error) {
    console.error('Error fetching mass role templates:', error)
    throw new Error('Failed to fetch mass role templates')
  }

  return data || []
}

// Get all mass role templates with their items for the current parish
export async function getMassRoleTemplatesWithItems(): Promise<MassRoleTemplateWithItems[]> {
  const selectedParishId = await requireSelectedParish()
  await ensureJWTClaims()
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('mass_roles_templates')
    .select(`
      *,
      items:mass_roles_template_items(
        id,
        mass_role_id,
        count,
        position,
        mass_role:mass_roles(id, name, description)
      )
    `)
    .eq('parish_id', selectedParishId)
    .order('name', { ascending: true })

  if (error) {
    console.error('Error fetching mass role templates with items:', error)
    throw new Error('Failed to fetch mass role templates with items')
  }

  return data || []
}

// Get a single mass role template by ID
export async function getMassRoleTemplate(id: string): Promise<MassRoleTemplate | null> {
  const selectedParishId = await requireSelectedParish()
  await ensureJWTClaims()
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('mass_roles_templates')
    .select('*')
    .eq('id', id)
    .eq('parish_id', selectedParishId)
    .single()

  if (error) {
    if (error.code === 'PGRST116') {
      return null
    }
    console.error('Error fetching mass role template:', error)
    throw new Error('Failed to fetch mass role template')
  }

  return data
}

// Create a new mass role template
export async function createMassRoleTemplate(data: CreateMassRoleTemplateData): Promise<MassRoleTemplate> {
  const selectedParishId = await requireSelectedParish()
  await ensureJWTClaims()

  // Validate data with schema
  createMassRoleTemplateSchema.parse(data)

  const supabase = await createClient()

  const { data: template, error } = await supabase
    .from('mass_roles_templates')
    .insert({
      parish_id: selectedParishId,
      name: data.name,
      description: data.description || null,
      note: data.note || null,
      liturgical_contexts: data.liturgical_contexts || [],
    })
    .select()
    .single()

  if (error) {
    console.error('Error creating mass role template:', error)
    throw new Error('Failed to create mass role template')
  }

  revalidatePath('/mass-role-templates')
  return template
}

// Update an existing mass role template
export async function updateMassRoleTemplate(id: string, data: UpdateMassRoleTemplateData): Promise<MassRoleTemplate> {
  const selectedParishId = await requireSelectedParish()
  await ensureJWTClaims()

  // Validate data with schema
  updateMassRoleTemplateSchema.parse(data)

  const supabase = await createClient()

  // Build update object from only defined values (filters out undefined)
  const updateData = Object.fromEntries(
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    Object.entries(data).filter(([_key, value]) => value !== undefined)
  )

  const { data: template, error } = await supabase
    .from('mass_roles_templates')
    .update(updateData)
    .eq('id', id)
    .eq('parish_id', selectedParishId)
    .select()
    .single()

  if (error) {
    console.error('Error updating mass role template:', error)
    throw new Error('Failed to update mass role template')
  }

  revalidatePath('/mass-role-templates')
  revalidatePath(`/mass-role-templates/${id}`)
  revalidatePath(`/mass-role-templates/${id}/edit`)
  return template
}

// Delete a mass role template
export async function deleteMassRoleTemplate(id: string): Promise<void> {
  const selectedParishId = await requireSelectedParish()
  await ensureJWTClaims()
  const supabase = await createClient()

  const { error } = await supabase
    .from('mass_roles_templates')
    .delete()
    .eq('id', id)
    .eq('parish_id', selectedParishId)

  if (error) {
    console.error('Error deleting mass role template:', error)
    throw new Error('Failed to delete mass role template')
  }

  revalidatePath('/mass-role-templates')
}

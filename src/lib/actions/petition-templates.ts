'use server'

import { createClient } from '@/lib/supabase/server'
import { requireSelectedParish } from '@/lib/auth/parish'
import { ensureJWTClaims } from '@/lib/auth/jwt-claims'
import sundayEnglish from '@/lib/default-petition-templates/sunday-english'
import sundaySpanish from '@/lib/default-petition-templates/sunday-spanish'
import daily from '@/lib/default-petition-templates/daily'
import weddingEnglish from '@/lib/default-petition-templates/wedding-english'
import weddingSpanish from '@/lib/default-petition-templates/wedding-spanish'
import funeralEnglish from '@/lib/default-petition-templates/funeral-english'
import funeralSpanish from '@/lib/default-petition-templates/funeral-spanish'
import quinceaneraEnglish from '@/lib/default-petition-templates/quinceanera-english'
import quinceaneraSpanish from '@/lib/default-petition-templates/quinceanera-spanish'
import presentationEnglish from '@/lib/default-petition-templates/presentation-english'
import presentationSpanish from '@/lib/default-petition-templates/presentation-spanish'
import {
  createAuthenticatedClient,
} from './server-action-utils'

export interface PetitionContextTemplate {
  id: string
  title: string
  description?: string
  context: string // JSON string containing the full context data
  parish_id: string
  module?: string
  language?: string
  is_default?: boolean
  created_at: string
  updated_at: string
}

// Note: Import ContextData from '@/lib/petition-context-utils' instead

export interface CreateContextData {
  title: string
  description?: string
  context: string
  module?: string
  language?: string
}

export interface UpdateContextData extends CreateContextData {
  id: string
}

// Helper function to check if user is admin
async function requireAdminRole() {
  const parishId = await requireSelectedParish()
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    throw new Error('User not authenticated')
  }

  const { data: userParish } = await supabase
    .from('parish_users')
    .select('roles')
    .eq('parish_id', parishId)
    .eq('user_id', user.id)
    .single()

  if (!userParish || !userParish.roles.includes('admin')) {
    throw new Error('Unauthorized: Admin role required')
  }
}

export async function getPetitionTemplates(filters?: { module?: string; language?: string }): Promise<PetitionContextTemplate[]> {
  const { supabase, parishId } = await createAuthenticatedClient()

  let query = supabase
    .from('petition_templates')
    .select('*')
    .eq('parish_id', parishId)

  // Apply filters if provided
  if (filters?.module) {
    query = query.eq('module', filters.module)
  }
  if (filters?.language) {
    query = query.eq('language', filters.language)
  }

  const { data, error } = await query.order('title', { ascending: true })

  if (error) {
    throw new Error('Failed to fetch petition contexts')
  }

  return data || []
}

export async function createPetitionTemplate(contextData: CreateContextData): Promise<PetitionContextTemplate> {
  const parishId = await requireSelectedParish()
  await ensureJWTClaims()
  await requireAdminRole() // Check admin permissions
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('petition_templates')
    .insert([
      {
        parish_id: parishId,
        title: contextData.title,
        description: contextData.description,
        context: contextData.context,
        module: contextData.module,
        language: contextData.language || 'en',
        is_default: false
      }
    ])
    .select()
    .single()

  if (error) {
    throw new Error('Failed to create petition context')
  }

  return data
}

export async function updatePetitionTemplate(contextData: UpdateContextData): Promise<PetitionContextTemplate> {
  const parishId = await requireSelectedParish()
  await ensureJWTClaims()
  await requireAdminRole() // Check admin permissions
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('petition_templates')
    .update({
      title: contextData.title,
      description: contextData.description,
      context: contextData.context,
      module: contextData.module,
      language: contextData.language
    })
    .eq('id', contextData.id)
    .eq('parish_id', parishId)
    .select()
    .single()

  if (error) {
    throw new Error('Failed to update petition context')
  }

  return data
}

export async function deletePetitionTemplate(contextId: string): Promise<void> {
  const parishId = await requireSelectedParish()
  await ensureJWTClaims()
  await requireAdminRole() // Check admin permissions
  const supabase = await createClient()

  const { error } = await supabase
    .from('petition_templates')
    .delete()
    .eq('id', contextId)
    .eq('parish_id', parishId)

  if (error) {
    throw new Error('Failed to delete petition context')
  }
}

export async function getPetitionTemplate(contextId: string): Promise<PetitionContextTemplate | null> {
  const { supabase, parishId } = await createAuthenticatedClient()

  const { data, error } = await supabase
    .from('petition_templates')
    .select('*')
    .eq('id', contextId)
    .eq('parish_id', parishId)
    .single()

  if (error) {
    return null
  }

  return data
}

export async function getPetitionTemplateById(contextId: string): Promise<PetitionContextTemplate | null> {
  return getPetitionTemplate(contextId)
}


// Function to clean up invalid contexts
export async function cleanupInvalidContexts(): Promise<void> {
  const { supabase, parishId } = await createAuthenticatedClient()

  // Remove contexts with empty titles or invalid context data
  await supabase
    .from('petition_templates')
    .delete()
    .eq('parish_id', parishId)
    .or('title.is.null,title.eq.,context.is.null,context.eq.')
}

// Function to ensure parish has default contexts
export async function ensureDefaultContexts(): Promise<void> {
  const { supabase, parishId } = await createAuthenticatedClient()

  // Check if parish already has any contexts (simple count check)
  const { data: existingContexts } = await supabase
    .from('petition_templates')
    .select('id')
    .eq('parish_id', parishId)
    .limit(1)

  if (existingContexts && existingContexts.length > 0) {
    return // Parish already has valid contexts
  }

  // Create default contexts from template files
  const defaultContexts = [
    sundayEnglish,
    sundaySpanish,
    daily,
    weddingEnglish,
    weddingSpanish,
    funeralEnglish,
    funeralSpanish,
    quinceaneraEnglish,
    quinceaneraSpanish,
    presentationEnglish,
    presentationSpanish
  ]

  for (const template of defaultContexts) {
    await supabase
      .from('petition_templates')
      .insert([
        {
          parish_id: parishId,
          title: template.title,
          description: template.description,
          context: template.content,
          module: template.module,
          language: template.language,
          is_default: template.is_default
        }
      ])
  }
}

'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { requireSelectedParish } from '@/lib/auth/parish'
import { ensureJWTClaims } from '@/lib/auth/jwt-claims'
import { requireManageParishSettings } from '@/lib/auth/permissions'
import type {
  Section,
  CreateSectionData,
  UpdateSectionData
} from '@/lib/types'
import { logError } from '@/lib/utils/console'
import { sanitizeSectionContent } from '@/lib/utils/sanitize'

/**
 * Get all sections for a script
 */
export async function getSections(scriptId: string): Promise<Section[]> {
  await requireSelectedParish()
  await ensureJWTClaims()
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('sections')
    .select('*')
    .eq('script_id', scriptId)
    .is('deleted_at', null)
    .order('order', { ascending: true })

  if (error) {
    logError('Error fetching sections: ' + (error instanceof Error ? error.message : JSON.stringify(error)))
    throw new Error('Failed to fetch sections')
  }

  return data || []
}

/**
 * Get a single section by ID
 */
export async function getSection(id: string): Promise<Section | null> {
  await requireSelectedParish()
  await ensureJWTClaims()
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('sections')
    .select('*')
    .eq('id', id)
    .is('deleted_at', null)
    .single()

  if (error) {
    if (error.code === 'PGRST116') {
      return null // Not found
    }
    logError('Error fetching section: ' + (error instanceof Error ? error.message : JSON.stringify(error)))
    throw new Error('Failed to fetch section')
  }

  return data
}

/**
 * Create a new section
 */
export async function createSection(scriptId: string, data: CreateSectionData): Promise<Section> {
  const selectedParishId = await requireSelectedParish()
  await ensureJWTClaims()
  const supabase = await createClient()

  // Check permissions (admin only)
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    throw new Error('User not authenticated')
  }
  await requireManageParishSettings(user.id, selectedParishId)

  // Get max order for this script
  const { data: existingSections } = await supabase
    .from('sections')
    .select('order')
    .eq('script_id', scriptId)
    .is('deleted_at', null)
    .order('order', { ascending: false })
    .limit(1)

  const maxOrder = existingSections?.[0]?.order ?? -1
  const newOrder = maxOrder + 1

  // Sanitize content (strip HTML tags, preserve markdown and custom syntax)
  const sanitizedContent = sanitizeSectionContent(data.content)

  // Insert section
  const { data: section, error } = await supabase
    .from('sections')
    .insert([
      {
        script_id: scriptId,
        name: data.name,
        section_type: data.section_type ?? 'text',
        content: sanitizedContent,
        page_break_after: data.page_break_after ?? false,
        order: newOrder
      }
    ])
    .select()
    .single()

  if (error) {
    logError('Error creating section: ' + (error instanceof Error ? error.message : JSON.stringify(error)))
    throw new Error('Failed to create section')
  }

  // Get script and event_type_id for revalidation
  const { data: script } = await supabase
    .from('scripts')
    .select('event_type_id')
    .eq('id', scriptId)
    .single()

  if (script) {
    revalidatePath(`/settings/event-types/${script.event_type_id}/scripts`)
    revalidatePath(`/settings/event-types/${script.event_type_id}/scripts/${scriptId}`)
  }

  return section
}

/**
 * Update an existing section
 */
export async function updateSection(id: string, data: UpdateSectionData): Promise<Section> {
  const selectedParishId = await requireSelectedParish()
  await ensureJWTClaims()
  const supabase = await createClient()

  // Check permissions (admin only)
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    throw new Error('User not authenticated')
  }
  await requireManageParishSettings(user.id, selectedParishId)

  // Build update object from only defined values
  const updateData = Object.fromEntries(
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    Object.entries(data).filter(([_key, value]) => value !== undefined)
  )

  // Sanitize content if provided (strip HTML tags, preserve markdown and custom syntax)
  if (updateData.content !== undefined) {
    updateData.content = sanitizeSectionContent(updateData.content)
  }

  const { data: section, error } = await supabase
    .from('sections')
    .update(updateData)
    .eq('id', id)
    .is('deleted_at', null)
    .select()
    .single()

  if (error) {
    logError('Error updating section: ' + (error instanceof Error ? error.message : JSON.stringify(error)))
    throw new Error('Failed to update section')
  }

  // Get script and event_type_id for revalidation
  const { data: script } = await supabase
    .from('scripts')
    .select('event_type_id')
    .eq('id', section.script_id)
    .single()

  if (script) {
    revalidatePath(`/settings/event-types/${script.event_type_id}/scripts`)
    revalidatePath(`/settings/event-types/${script.event_type_id}/scripts/${section.script_id}`)
  }

  return section
}

/**
 * Delete a section
 */
export async function deleteSection(id: string): Promise<void> {
  const selectedParishId = await requireSelectedParish()
  await ensureJWTClaims()
  const supabase = await createClient()

  // Check permissions (admin only)
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    throw new Error('User not authenticated')
  }
  await requireManageParishSettings(user.id, selectedParishId)

  // Get script_id for revalidation
  const { data: section } = await supabase
    .from('sections')
    .select('script_id')
    .eq('id', id)
    .is('deleted_at', null)
    .single()

  if (!section) {
    throw new Error('Section not found')
  }

  // Hard delete
  const { error } = await supabase
    .from('sections')
    .delete()
    .eq('id', id)

  if (error) {
    logError('Error deleting section: ' + (error instanceof Error ? error.message : JSON.stringify(error)))
    throw new Error('Failed to delete section')
  }

  // Get script and event_type_id for revalidation
  const { data: script } = await supabase
    .from('scripts')
    .select('event_type_id')
    .eq('id', section.script_id)
    .single()

  if (script) {
    revalidatePath(`/settings/event-types/${script.event_type_id}/scripts`)
    revalidatePath(`/settings/event-types/${script.event_type_id}/scripts/${section.script_id}`)
  }
}

/**
 * Reorder sections
 * Updates the order field for all provided sections
 */
export async function reorderSections(scriptId: string, orderedIds: string[]): Promise<void> {
  const selectedParishId = await requireSelectedParish()
  await ensureJWTClaims()
  const supabase = await createClient()

  // Check permissions (admin only)
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    throw new Error('User not authenticated')
  }
  await requireManageParishSettings(user.id, selectedParishId)

  // Update each section's order
  const updates = orderedIds.map((id, index) =>
    supabase
      .from('sections')
      .update({ order: index })
      .eq('id', id)
      .eq('script_id', scriptId)
  )

  await Promise.all(updates)

  // Get script and event_type_id for revalidation
  const { data: script } = await supabase
    .from('scripts')
    .select('event_type_id')
    .eq('id', scriptId)
    .single()

  if (script) {
    revalidatePath(`/settings/event-types/${script.event_type_id}/scripts`)
    revalidatePath(`/settings/event-types/${script.event_type_id}/scripts/${scriptId}`)
  }
}

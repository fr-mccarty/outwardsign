'use server'

import { Person } from '@/lib/types'
import { createPersonSchema, updatePersonSchema, CreatePersonData, UpdatePersonData } from '@/lib/schemas/people'
import {
  createAuthenticatedClient,
  createAuthenticatedClientWithPermissions,
  handleSupabaseError,
  isNotFoundError,
  revalidateEntity,
  buildPaginatedResult,
  buildUpdateData,
  type PaginatedResult,
} from '@/lib/actions/server-action-utils'

/**
 * Build robust search conditions for people queries
 * Normalizes search input to handle periods, spaces, and phone formatting
 */
function buildPeopleSearchConditions(search: string): string[] {
  // Normalize the search string: trim and collapse multiple spaces
  const normalized = search.trim().replace(/\s+/g, ' ')

  // Create search conditions array
  const searchConditions: string[] = []

  // 1. Standard field searches (case-insensitive, original search)
  searchConditions.push(`first_name.ilike.%${normalized}%`)
  searchConditions.push(`last_name.ilike.%${normalized}%`)
  searchConditions.push(`email.ilike.%${normalized}%`)

  // 2. Phone number search - strip all non-numeric characters for flexible matching
  // This allows "5551234567" to match "(555) 123-4567" or "555-123-4567"
  const numericSearch = normalized.replace(/\D/g, '')
  if (numericSearch.length >= 3) {
    // Only search phone if we have at least 3 digits
    searchConditions.push(`phone_number.ilike.%${numericSearch}%`)
  }

  // 3. Full-name search - treat periods, dashes, commas as spaces
  // This handles searches like "John.Doe" or "John-Doe" by converting them to "John Doe"
  // Also strips periods from database fields to match "fr. josh mccarty" with "fr. josh."
  const cleanSearch = normalized.replace(/[.\-,]/g, ' ').replace(/\s+/g, ' ').trim()
  if (cleanSearch !== normalized && cleanSearch.length > 0) {
    // Search in concatenated first_name + space + last_name, stripping periods from both
    // PostgreSQL replace() function removes periods from database fields
    // This matches "fr josh mccarty" search with "fr. josh. mccarty" in database
    searchConditions.push(`replace(replace(concat(first_name,' ',last_name),'.',''),'-','').ilike.%${cleanSearch.replace(/[\s]+/g, '%')}%`)
  }

  // 4. Handle searches with separators (spaces, periods, dashes, commas)
  // Replace common separators with wildcard to match any separator or no separator
  const separatorPattern = normalized.replace(/[\s.\-,]+/g, '%')
  if (separatorPattern !== normalized && !separatorPattern.includes('%%')) {
    searchConditions.push(`first_name.ilike.%${separatorPattern}%`)
    searchConditions.push(`last_name.ilike.%${separatorPattern}%`)
  }

  // 5. If search contains space, period, dash, or comma - treat as "FirstName LastName" pattern
  if (/[\s.\-,]/.test(normalized)) {
    // Split by any separator
    const parts = normalized.split(/[\s.\-,]+/).filter(p => p.length > 0)

    if (parts.length >= 2) {
      const firstPart = parts[0]
      const lastPart = parts.slice(1).join(' ')

      // Match first_name starting with first part AND last_name starting with last part
      searchConditions.push(`and(first_name.ilike.${firstPart}%,last_name.ilike.${lastPart}%)`)

      // Also try reversed (in case they typed "LastName FirstName")
      searchConditions.push(`and(first_name.ilike.${lastPart}%,last_name.ilike.${firstPart}%)`)
    }
  }

  return searchConditions
}

export interface PersonFilterParams {
  search?: string
  sort?: 'name_asc' | 'name_desc' | 'created_asc' | 'created_desc'
  offset?: number
  limit?: number
}

export interface PaginatedParams {
  offset?: number
  limit?: number
  search?: string
}

export async function getPeople(filters?: PersonFilterParams): Promise<Person[]> {
  const { supabase, parishId } = await createAuthenticatedClient()

  const offset = filters?.offset || 0
  const limit = filters?.limit || 50

  let query = supabase
    .from('people')
    .select('*')
    .eq('parish_id', parishId)

  if (filters?.search) {
    const searchConditions = buildPeopleSearchConditions(filters.search)
    query = query.or(searchConditions.join(','))
  }

  // Apply sorting
  const sort = filters?.sort || 'name_asc'
  switch (sort) {
    case 'name_asc':
      query = query.order('last_name', { ascending: true }).order('first_name', { ascending: true })
      break
    case 'name_desc':
      query = query.order('last_name', { ascending: false }).order('first_name', { ascending: false })
      break
    case 'created_asc':
      query = query.order('created_at', { ascending: true })
      break
    case 'created_desc':
      query = query.order('created_at', { ascending: false })
      break
    default:
      query = query.order('last_name', { ascending: true }).order('first_name', { ascending: true })
  }

  query = query.range(offset, offset + limit - 1)

  const { data, error } = await query

  if (error) handleSupabaseError(error, 'fetching', 'people')

  return data || []
}

export async function getPeoplePaginated(params?: PaginatedParams): Promise<PaginatedResult<Person>> {
  const { supabase, parishId } = await createAuthenticatedClient()

  const offset = params?.offset || 0
  const limit = params?.limit || 10
  const search = params?.search || ''

  let query = supabase
    .from('people')
    .select('*', { count: 'exact' })
    .eq('parish_id', parishId)

  if (search) {
    const searchConditions = buildPeopleSearchConditions(search)
    query = query.or(searchConditions.join(','))
  }

  query = query
    .order('last_name', { ascending: true })
    .order('first_name', { ascending: true })
    .range(offset, offset + limit - 1)

  const { data, error, count } = await query

  if (error) handleSupabaseError(error, 'fetching', 'paginated people')

  return buildPaginatedResult(data, count, offset, limit)
}

export async function getPerson(id: string): Promise<Person | null> {
  const { supabase, parishId } = await createAuthenticatedClient()

  const { data, error } = await supabase
    .from('people')
    .select('*')
    .eq('parish_id', parishId)
    .eq('id', id)
    .single()

  if (error) {
    if (isNotFoundError(error)) return null
    handleSupabaseError(error, 'fetching', 'person')
  }

  return data
}

export async function createPerson(data: CreatePersonData): Promise<Person> {
  const { supabase, parishId } = await createAuthenticatedClientWithPermissions()

  const validatedData = createPersonSchema.parse(data)

  const { data: person, error } = await supabase
    .from('people')
    .insert([
      {
        parish_id: parishId,
        first_name: validatedData.first_name,
        first_name_pronunciation: validatedData.first_name_pronunciation || null,
        last_name: validatedData.last_name,
        last_name_pronunciation: validatedData.last_name_pronunciation || null,
        phone_number: validatedData.phone_number || null,
        email: validatedData.email || null,
        street: validatedData.street || null,
        city: validatedData.city || null,
        state: validatedData.state || null,
        zipcode: validatedData.zipcode || null,
        sex: validatedData.sex || null,
        note: validatedData.note || null,
        mass_times_template_item_ids: validatedData.mass_times_template_item_ids || [],
      }
    ])
    .select()
    .single()

  if (error) handleSupabaseError(error, 'creating', 'person')

  revalidateEntity('people', person.id)

  return person
}

export async function updatePerson(id: string, data: UpdatePersonData): Promise<Person> {
  const { supabase } = await createAuthenticatedClientWithPermissions()

  const validatedData = updatePersonSchema.parse(data)
  const updateData = buildUpdateData(validatedData)

  const { data: person, error } = await supabase
    .from('people')
    .update(updateData)
    .eq('id', id)
    .select()
    .single()

  if (error) handleSupabaseError(error, 'updating', 'person')

  revalidateEntity('people', id)
  return person
}

export async function deletePerson(id: string): Promise<void> {
  const { supabase } = await createAuthenticatedClientWithPermissions()

  const { error } = await supabase
    .from('people')
    .delete()
    .eq('id', id)

  if (error) handleSupabaseError(error, 'deleting', 'person')

  revalidateEntity('people')
}

// ============================================================================
// PEOPLE WITH GROUP ROLES (for mass role picker)
// ============================================================================

export interface PersonWithGroupRoles extends Person {
  group_members?: Array<{
    id: string
    group_id: string
    roles?: string[] | null
    group?: {
      id: string
      name: string
    }
  }>
}

export async function getPeopleWithRolesPaginated(params?: PaginatedParams): Promise<PaginatedResult<PersonWithGroupRoles>> {
  const { supabase, parishId } = await createAuthenticatedClient()

  const offset = params?.offset || 0
  const limit = params?.limit || 10
  const search = params?.search || ''

  let query = supabase
    .from('people')
    .select(`
      *,
      group_members!inner (
        id,
        group_id,
        roles,
        group:groups (
          id,
          name
        )
      )
    `, { count: 'exact' })
    .eq('parish_id', parishId)

  if (search) {
    const searchConditions = buildPeopleSearchConditions(search)
    query = query.or(searchConditions.join(','))
  }

  query = query
    .order('last_name', { ascending: true })
    .order('first_name', { ascending: true })
    .range(offset, offset + limit - 1)

  const { data, error, count } = await query

  if (error) handleSupabaseError(error, 'fetching', 'paginated people with roles')

  return buildPaginatedResult(data, count, offset, limit)
}

// ============================================================================
// PERSON AVATAR MANAGEMENT
// ============================================================================

const AVATAR_BUCKET = 'person-avatars'

/**
 * Upload a person's avatar image to Supabase Storage
 * @param personId - ID of the person
 * @param base64Data - Base64 encoded image data (already cropped on client)
 * @param fileExtension - File extension (jpg, png, or webp)
 * @returns Storage path to be stored in avatar_url field
 */
export async function uploadPersonAvatar(
  personId: string,
  base64Data: string,
  fileExtension: string
): Promise<string> {
  const { supabase, parishId } = await createAuthenticatedClientWithPermissions()

  // Verify the person belongs to the user's parish
  const { data: person, error: personError } = await supabase
    .from('people')
    .select('id, parish_id')
    .eq('id', personId)
    .eq('parish_id', parishId)
    .single()

  if (personError || !person) {
    throw new Error('Person not found or access denied')
  }

  // Delete existing avatar files to prevent orphaned files
  const { data: existingFiles } = await supabase.storage
    .from(AVATAR_BUCKET)
    .list(parishId, { search: personId })

  if (existingFiles && existingFiles.length > 0) {
    const filesToDelete = existingFiles
      .filter(f => f.name.startsWith(personId))
      .map(f => `${parishId}/${f.name}`)

    if (filesToDelete.length > 0) {
      await supabase.storage.from(AVATAR_BUCKET).remove(filesToDelete)
    }
  }

  // Convert base64 to buffer (remove data URL prefix if present)
  const base64Clean = base64Data.replace(/^data:image\/\w+;base64,/, '')
  const buffer = Buffer.from(base64Clean, 'base64')

  const contentTypeMap: Record<string, string> = {
    jpg: 'image/jpeg',
    jpeg: 'image/jpeg',
    png: 'image/png',
    webp: 'image/webp',
  }
  const contentType = contentTypeMap[fileExtension.toLowerCase()] || 'image/jpeg'

  const storagePath = `${parishId}/${personId}.${fileExtension.toLowerCase()}`
  const { error: uploadError } = await supabase.storage
    .from(AVATAR_BUCKET)
    .upload(storagePath, buffer, { contentType, upsert: true })

  if (uploadError) handleSupabaseError(uploadError, 'uploading', 'avatar')

  const { error: updateError } = await supabase
    .from('people')
    .update({ avatar_url: storagePath })
    .eq('id', personId)

  if (updateError) handleSupabaseError(updateError, 'updating', 'person avatar_url')

  revalidateEntity('people', personId)

  return storagePath
}

/**
 * Delete a person's avatar from Supabase Storage
 * @param personId - ID of the person
 */
export async function deletePersonAvatar(personId: string): Promise<void> {
  const { supabase, parishId } = await createAuthenticatedClientWithPermissions()

  const { data: person, error: fetchError } = await supabase
    .from('people')
    .select('id, avatar_url, parish_id')
    .eq('id', personId)
    .eq('parish_id', parishId)
    .single()

  if (fetchError || !person) {
    throw new Error('Person not found or access denied')
  }

  // Delete file from storage if it exists (continue even if fails)
  if (person.avatar_url) {
    await supabase.storage.from(AVATAR_BUCKET).remove([person.avatar_url])
  }

  const { error: updateError } = await supabase
    .from('people')
    .update({ avatar_url: null })
    .eq('id', personId)

  if (updateError) handleSupabaseError(updateError, 'clearing', 'person avatar_url')

  revalidateEntity('people', personId)
}

/**
 * Generate a temporary signed URL for viewing a private avatar image
 * @param storagePath - Storage path from person.avatar_url (e.g., "parish_id/person_id.jpg")
 * @returns Signed URL string with 1-hour expiry
 */
export async function getPersonAvatarSignedUrl(storagePath: string): Promise<string | null> {
  if (!storagePath) return null

  const { supabase, parishId } = await createAuthenticatedClient()

  // Security check: only access avatars from current parish
  const pathParishId = storagePath.split('/')[0]
  if (pathParishId !== parishId) {
    throw new Error('Access denied: Cannot access avatar from another parish')
  }

  const { data, error } = await supabase.storage
    .from(AVATAR_BUCKET)
    .createSignedUrl(storagePath, 3600)

  if (error) return null

  return data.signedUrl
}

/**
 * Batch generate signed URLs for multiple avatars
 * @param storagePaths - Array of storage paths
 * @returns Record mapping storage paths to signed URLs
 */
export async function getPersonAvatarSignedUrls(
  storagePaths: string[]
): Promise<Record<string, string>> {
  if (!storagePaths || storagePaths.length === 0) return {}

  const { supabase, parishId } = await createAuthenticatedClient()

  // Filter paths to only include those from the current parish
  const validPaths = storagePaths.filter(path => path.split('/')[0] === parishId)

  if (validPaths.length === 0) return {}

  const { data, error } = await supabase.storage
    .from(AVATAR_BUCKET)
    .createSignedUrls(validPaths, 3600)

  if (error) return {}

  const result: Record<string, string> = {}
  data?.forEach((item) => {
    if (item.signedUrl && item.path) {
      result[item.path] = item.signedUrl
    }
  })

  return result
}

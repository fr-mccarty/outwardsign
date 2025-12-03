'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { requireSelectedParish } from '@/lib/auth/parish'
import { ensureJWTClaims } from '@/lib/auth/jwt-claims'
import { requireEditSharedResources } from '@/lib/auth/permissions'
import { Person } from '@/lib/types'
import { createPersonSchema, updatePersonSchema, CreatePersonData, UpdatePersonData } from '@/lib/schemas/people'

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
  massRoleId?: string // Filter by mass role membership
}

export interface PaginatedResult<T> {
  items: T[]
  totalCount: number
  page: number
  limit: number
  totalPages: number
}

export async function getPeople(filters?: PersonFilterParams): Promise<Person[]> {
  const selectedParishId = await requireSelectedParish()
  await ensureJWTClaims()
  const supabase = await createClient()

  // Calculate pagination
  const offset = filters?.offset || 0
  const limit = filters?.limit || 50

  let query = supabase
    .from('people')
    .select('*')
    .eq('parish_id', selectedParishId)

  // Apply search filter
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

  // Apply pagination
  query = query.range(offset, offset + limit - 1)

  const { data, error } = await query

  if (error) {
    console.error('Error fetching people:', error)
    throw new Error('Failed to fetch people')
  }

  return data || []
}

export async function getPeoplePaginated(params?: PaginatedParams): Promise<PaginatedResult<Person>> {
  const selectedParishId = await requireSelectedParish()
  await ensureJWTClaims()
  const supabase = await createClient()

  const offset = params?.offset || 0
  const limit = params?.limit || 10
  const search = params?.search || ''
  const massRoleId = params?.massRoleId

  // Build base query - if filtering by mass role, join with mass_role_members
  let query
  if (massRoleId) {
    query = supabase
      .from('people')
      .select(`
        *,
        mass_role_members!inner(mass_role_id, active)
      `, { count: 'exact' })
      .eq('parish_id', selectedParishId)
      .eq('mass_role_members.mass_role_id', massRoleId)
      .eq('mass_role_members.active', true)
  } else {
    query = supabase
      .from('people')
      .select('*', { count: 'exact' })
      .eq('parish_id', selectedParishId)
  }

  // Apply search filter
  if (search) {
    const searchConditions = buildPeopleSearchConditions(search)
    query = query.or(searchConditions.join(','))
  }

  // Apply ordering, pagination
  query = query
    .order('last_name', { ascending: true })
    .order('first_name', { ascending: true })
    .range(offset, offset + limit - 1)

  const { data, error, count } = await query

  if (error) {
    console.error('Error fetching paginated people:', error)
    throw new Error('Failed to fetch paginated people')
  }

  const totalCount = count || 0
  const totalPages = Math.ceil(totalCount / limit)
  const page = Math.floor(offset / limit) + 1

  return {
    items: data || [],
    totalCount,
    page,
    limit,
    totalPages,
  }
}

export async function getPerson(id: string): Promise<Person | null> {
  const selectedParishId = await requireSelectedParish()
  await ensureJWTClaims()
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('people')
    .select('*')
    .eq('parish_id', selectedParishId)
    .eq('id', id)
    .single()

  if (error) {
    if (error.code === 'PGRST116') {
      return null // Not found
    }
    console.error('Error fetching person:', error)
    throw new Error('Failed to fetch person')
  }

  return data
}

export async function createPerson(data: CreatePersonData): Promise<Person> {
  const selectedParishId = await requireSelectedParish()
  await ensureJWTClaims()
  const supabase = await createClient()

  // Check permissions
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    throw new Error('Not authenticated')
  }
  await requireEditSharedResources(user.id, selectedParishId)

  // Validate data
  const validatedData = createPersonSchema.parse(data)

  const { data: person, error } = await supabase
    .from('people')
    .insert([
      {
        parish_id: selectedParishId,
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

  if (error) {
    console.error('Error creating person:', error)
    throw new Error(`Failed to create person: ${error.message}`)
  }

  revalidatePath('/people')
  revalidatePath(`/people/${person.id}`)

  return person
}

export async function updatePerson(id: string, data: UpdatePersonData): Promise<Person> {
  const selectedParishId = await requireSelectedParish()
  await ensureJWTClaims()
  const supabase = await createClient()

  // Check permissions
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    throw new Error('Not authenticated')
  }
  await requireEditSharedResources(user.id, selectedParishId)

  // Validate data
  const validatedData = updatePersonSchema.parse(data)

  const updateData: Record<string, unknown> = {}
  if (validatedData.first_name !== undefined) updateData.first_name = validatedData.first_name
  if (validatedData.first_name_pronunciation !== undefined) updateData.first_name_pronunciation = validatedData.first_name_pronunciation || null
  if (validatedData.last_name !== undefined) updateData.last_name = validatedData.last_name
  if (validatedData.last_name_pronunciation !== undefined) updateData.last_name_pronunciation = validatedData.last_name_pronunciation || null
  if (validatedData.phone_number !== undefined) updateData.phone_number = validatedData.phone_number || null
  if (validatedData.email !== undefined) updateData.email = validatedData.email || null
  if (validatedData.street !== undefined) updateData.street = validatedData.street || null
  if (validatedData.city !== undefined) updateData.city = validatedData.city || null
  if (validatedData.state !== undefined) updateData.state = validatedData.state || null
  if (validatedData.zipcode !== undefined) updateData.zipcode = validatedData.zipcode || null
  if (validatedData.sex !== undefined) updateData.sex = validatedData.sex || null
  if (validatedData.note !== undefined) updateData.note = validatedData.note || null
  if (validatedData.mass_times_template_item_ids !== undefined) updateData.mass_times_template_item_ids = validatedData.mass_times_template_item_ids || []

  const { data: person, error } = await supabase
    .from('people')
    .update(updateData)
    .eq('id', id)
    .select()
    .single()

  if (error) {
    console.error('Error updating person:', error)
    throw new Error('Failed to update person')
  }

  revalidatePath('/people')
  revalidatePath(`/people/${id}`)
  return person
}

export async function deletePerson(id: string): Promise<void> {
  const selectedParishId = await requireSelectedParish()
  await ensureJWTClaims()
  const supabase = await createClient()

  // Check permissions
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    throw new Error('Not authenticated')
  }
  await requireEditSharedResources(user.id, selectedParishId)

  const { error } = await supabase
    .from('people')
    .delete()
    .eq('id', id)

  if (error) {
    console.error('Error deleting person:', error)
    throw new Error('Failed to delete person')
  }

  revalidatePath('/people')
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
  const selectedParishId = await requireSelectedParish()
  await ensureJWTClaims()
  const supabase = await createClient()

  const offset = params?.offset || 0
  const limit = params?.limit || 10
  const search = params?.search || ''

  // Build base query with group_members relation
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
    .eq('parish_id', selectedParishId)

  // Apply search filter
  if (search) {
    const searchConditions = buildPeopleSearchConditions(search)
    query = query.or(searchConditions.join(','))
  }

  // Apply ordering, pagination
  query = query
    .order('last_name', { ascending: true })
    .order('first_name', { ascending: true })
    .range(offset, offset + limit - 1)

  const { data, error, count } = await query

  if (error) {
    console.error('Error fetching paginated people with roles:', error)
    throw new Error('Failed to fetch paginated people with roles')
  }

  const totalCount = count || 0
  const totalPages = Math.ceil(totalCount / limit)
  const page = Math.floor(offset / limit) + 1

  return {
    items: data || [],
    totalCount,
    page,
    limit,
    totalPages,
  }
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
  const selectedParishId = await requireSelectedParish()
  await ensureJWTClaims()
  const supabase = await createClient()

  // Check permissions
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    throw new Error('Not authenticated')
  }
  await requireEditSharedResources(user.id, selectedParishId)

  // Verify the person belongs to the user's parish
  const { data: person, error: personError } = await supabase
    .from('people')
    .select('id, parish_id')
    .eq('id', personId)
    .eq('parish_id', selectedParishId)
    .single()

  if (personError || !person) {
    throw new Error('Person not found or access denied')
  }

  // Delete existing avatar files to prevent orphaned files
  const { data: existingFiles } = await supabase.storage
    .from(AVATAR_BUCKET)
    .list(selectedParishId, {
      search: personId,
    })

  if (existingFiles && existingFiles.length > 0) {
    const filesToDelete = existingFiles
      .filter(f => f.name.startsWith(personId))
      .map(f => `${selectedParishId}/${f.name}`)

    if (filesToDelete.length > 0) {
      await supabase.storage.from(AVATAR_BUCKET).remove(filesToDelete)
    }
  }

  // Convert base64 to buffer
  // Remove data URL prefix if present (e.g., "data:image/jpeg;base64,")
  const base64Clean = base64Data.replace(/^data:image\/\w+;base64,/, '')
  const buffer = Buffer.from(base64Clean, 'base64')

  // Determine content type
  const contentTypeMap: Record<string, string> = {
    jpg: 'image/jpeg',
    jpeg: 'image/jpeg',
    png: 'image/png',
    webp: 'image/webp',
  }
  const contentType = contentTypeMap[fileExtension.toLowerCase()] || 'image/jpeg'

  // Upload file to storage
  const storagePath = `${selectedParishId}/${personId}.${fileExtension.toLowerCase()}`
  const { error: uploadError } = await supabase.storage
    .from(AVATAR_BUCKET)
    .upload(storagePath, buffer, {
      contentType,
      upsert: true,
    })

  if (uploadError) {
    console.error('Error uploading avatar:', uploadError)
    throw new Error('Failed to upload avatar')
  }

  // Update person record with storage path
  const { error: updateError } = await supabase
    .from('people')
    .update({ avatar_url: storagePath })
    .eq('id', personId)

  if (updateError) {
    console.error('Error updating person avatar_url:', updateError)
    throw new Error('Failed to update person record')
  }

  revalidatePath('/people')
  revalidatePath(`/people/${personId}`)

  return storagePath
}

/**
 * Delete a person's avatar from Supabase Storage
 * @param personId - ID of the person
 */
export async function deletePersonAvatar(personId: string): Promise<void> {
  const selectedParishId = await requireSelectedParish()
  await ensureJWTClaims()
  const supabase = await createClient()

  // Check permissions
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    throw new Error('Not authenticated')
  }
  await requireEditSharedResources(user.id, selectedParishId)

  // Fetch person to get current avatar_url
  const { data: person, error: fetchError } = await supabase
    .from('people')
    .select('id, avatar_url, parish_id')
    .eq('id', personId)
    .eq('parish_id', selectedParishId)
    .single()

  if (fetchError || !person) {
    throw new Error('Person not found or access denied')
  }

  // Delete file from storage if it exists
  if (person.avatar_url) {
    const { error: deleteError } = await supabase.storage
      .from(AVATAR_BUCKET)
      .remove([person.avatar_url])

    if (deleteError) {
      console.error('Error deleting avatar from storage:', deleteError)
      // Continue to update database even if storage delete fails
    }
  }

  // Update person record to clear avatar_url
  const { error: updateError } = await supabase
    .from('people')
    .update({ avatar_url: null })
    .eq('id', personId)

  if (updateError) {
    console.error('Error clearing person avatar_url:', updateError)
    throw new Error('Failed to update person record')
  }

  revalidatePath('/people')
  revalidatePath(`/people/${personId}`)
}

/**
 * Generate a temporary signed URL for viewing a private avatar image
 * @param storagePath - Storage path from person.avatar_url (e.g., "parish_id/person_id.jpg")
 * @returns Signed URL string with 1-hour expiry
 */
export async function getPersonAvatarSignedUrl(storagePath: string): Promise<string | null> {
  if (!storagePath) {
    return null
  }

  const selectedParishId = await requireSelectedParish()
  await ensureJWTClaims()
  const supabase = await createClient()

  // Extract parish_id from storage path for security check
  const pathParishId = storagePath.split('/')[0]
  if (pathParishId !== selectedParishId) {
    throw new Error('Access denied: Cannot access avatar from another parish')
  }

  // Generate signed URL with 1-hour expiry
  const { data, error } = await supabase.storage
    .from(AVATAR_BUCKET)
    .createSignedUrl(storagePath, 3600) // 1 hour in seconds

  if (error) {
    console.error('Error generating signed URL:', error)
    return null
  }

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
  if (!storagePaths || storagePaths.length === 0) {
    return {}
  }

  const selectedParishId = await requireSelectedParish()
  await ensureJWTClaims()
  const supabase = await createClient()

  // Filter paths to only include those from the current parish
  const validPaths = storagePaths.filter(path => {
    const pathParishId = path.split('/')[0]
    return pathParishId === selectedParishId
  })

  if (validPaths.length === 0) {
    return {}
  }

  // Generate signed URLs in batch
  const { data, error } = await supabase.storage
    .from(AVATAR_BUCKET)
    .createSignedUrls(validPaths, 3600) // 1 hour in seconds

  if (error) {
    console.error('Error generating signed URLs:', error)
    return {}
  }

  // Build result map
  const result: Record<string, string> = {}
  data?.forEach((item) => {
    if (item.signedUrl && item.path) {
      result[item.path] = item.signedUrl
    }
  })

  return result
}

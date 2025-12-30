/**
 * Dev Seeder: Sample People
 *
 * Extends the shared seeding module with dev-specific functionality:
 * - Creates dev user person record with portal access
 * - Uploads avatar images (requires Node.js fs)
 *
 * Core people creation is handled by the shared module.
 */

import * as fs from 'fs'
import * as path from 'path'
import type { DevSeederContext } from './types'
import { logSuccess, logError, logInfo, logWarning } from '../../src/lib/utils/console'

// Re-export SAMPLE_PEOPLE from shared module for backwards compatibility
export { SAMPLE_PEOPLE } from '../../src/lib/seeding'

/**
 * Creates a person record for the dev user with parishioner portal access.
 * This is dev-specific and not part of the shared seeding module.
 */
export async function createDevUserPerson(ctx: DevSeederContext) {
  const { supabase, parishId, devUserEmail } = ctx

  logInfo('')
  logInfo('Creating dev user person record for parishioner portal...')

  // Fetch weekend mass time template items for assigning to people
  const { data: sundayTemplate } = await supabase
    .from('mass_times_templates')
    .select('id')
    .eq('parish_id', parishId)
    .eq('day_of_week', 'SUNDAY')
    .single()

  let weekendMassTimeItems: Array<{ id: string }> = []

  if (sundayTemplate) {
    const { data: massTimeItems } = await supabase
      .from('mass_times_template_items')
      .select('id')
      .eq('mass_times_template_id', sundayTemplate.id)

    if (massTimeItems && massTimeItems.length > 0) {
      weekendMassTimeItems = massTimeItems
    }
  }

  const { data: existingDevPerson } = await supabase
    .from('people')
    .select('id, full_name, email, parishioner_portal_enabled')
    .eq('email', devUserEmail)
    .eq('parish_id', parishId)
    .maybeSingle()

  if (existingDevPerson) {
    logSuccess(`Dev person already exists: ${existingDevPerson.full_name}`)
    if (!existingDevPerson.parishioner_portal_enabled) {
      await supabase
        .from('people')
        .update({ parishioner_portal_enabled: true })
        .eq('id', existingDevPerson.id)
      logSuccess('Parishioner portal access enabled')
    }
  } else {
    const { data: devPerson, error: devPersonError } = await supabase
      .from('people')
      .insert({
        parish_id: parishId,
        first_name: 'Outward Sign',
        last_name: 'Developer',
        email: devUserEmail,
        phone_number: '(555) 555-5555',
        sex: 'MALE',
        parishioner_portal_enabled: true,
        preferred_communication_channel: 'email',
        preferred_language: 'en',
        mass_times_template_item_ids: weekendMassTimeItems.length > 0 ? [weekendMassTimeItems[0].id] : []
      })
      .select()
      .single()

    if (devPersonError) {
      logError(`Error creating dev person: ${devPersonError.message}`)
    } else {
      logSuccess(`Dev person created: ${devPerson.full_name}`)
    }
  }

  return { success: true }
}

/**
 * Uploads avatar images for sample people.
 * This is dev-specific because it uses Node.js fs module.
 */
export async function uploadAvatars(ctx: DevSeederContext) {
  const { supabase, parishId } = ctx

  // Import shared sample data
  const { SAMPLE_PEOPLE } = await import('../../src/lib/seeding')

  logInfo('')
  logInfo('Uploading sample avatar images...')

  const peopleWithAvatars = SAMPLE_PEOPLE.filter(p => p.avatarFile)

  for (const samplePerson of peopleWithAvatars) {
    const { data: person } = await supabase
      .from('people')
      .select('id')
      .eq('parish_id', parishId)
      .eq('first_name', samplePerson.firstName)
      .eq('last_name', samplePerson.lastName)
      .single()

    if (!person) {
      logWarning(`Could not find ${samplePerson.firstName} ${samplePerson.lastName}`)
      continue
    }

    const imagePath = path.join(process.cwd(), 'public', 'team', samplePerson.avatarFile!)

    if (!fs.existsSync(imagePath)) {
      logWarning(`Image file not found: ${imagePath}`)
      continue
    }

    const imageBuffer = fs.readFileSync(imagePath)
    const fileExtension = path.extname(samplePerson.avatarFile!)
    const storagePath = `${parishId}/${person.id}${fileExtension}`

    const { error: uploadError } = await supabase.storage
      .from('person-avatars')
      .upload(storagePath, imageBuffer, {
        contentType: fileExtension === '.webp' ? 'image/webp' : 'image/jpeg',
        upsert: true
      })

    if (uploadError) {
      logError(`Error uploading avatar for ${samplePerson.firstName} ${samplePerson.lastName}: ${uploadError.message}`)
      continue
    }

    await supabase
      .from('people')
      .update({ avatar_url: storagePath })
      .eq('id', person.id)

    logSuccess(`Uploaded avatar for ${samplePerson.firstName} ${samplePerson.lastName}`)
  }

  return { success: true }
}

// DEPRECATED: Use shared module's seedPeople instead
// Keeping for backwards compatibility during transition
export { seedPeople } from '../../src/lib/seeding/seed-functions'

/**
 * Dev Seeder: Sample People
 *
 * Creates 20 sample people for development/testing.
 * Also creates dev user person record with portal access.
 */

import * as fs from 'fs'
import * as path from 'path'
import type { DevSeederContext, SamplePerson } from './types'
import { logSuccess, logError, logInfo, logWarning } from '../../src/lib/utils/console'

export const SAMPLE_PEOPLE: SamplePerson[] = [
  { firstName: 'John', lastName: 'Doe', email: 'john.doe@example.com', phone: '(555) 123-4567', sex: 'MALE', avatarFile: 'fr-josh.webp' },
  { firstName: 'Jane', lastName: 'Smith', email: 'jane.smith@example.com', phone: '(555) 987-6543', sex: 'FEMALE' },
  { firstName: 'Bob', lastName: 'Johnson', email: 'bob.johnson@example.com', phone: '(555) 246-8101', sex: 'MALE' },
  { firstName: 'Maria', lastName: 'Garcia', email: 'maria.garcia@example.com', phone: '(555) 369-1214', sex: 'FEMALE' },
  { firstName: 'Michael', lastName: 'Chen', email: 'michael.chen@example.com', phone: '(555) 482-1357', sex: 'MALE' },
  { firstName: 'Sarah', lastName: 'Williams', email: 'sarah.williams@example.com', phone: '(555) 159-2634', sex: 'FEMALE' },
  { firstName: 'David', lastName: 'Martinez', email: 'david.martinez@example.com', phone: '(555) 753-9514', sex: 'MALE' },
  { firstName: 'Emily', lastName: 'Taylor', email: 'emily.taylor@example.com', phone: '(555) 951-7532', sex: 'FEMALE' },
  { firstName: 'James', lastName: 'Anderson', email: 'james.anderson@example.com', phone: '(555) 357-1593', sex: 'MALE', avatarFile: 'joe.webp' },
  { firstName: 'Lisa', lastName: 'Brown', email: 'lisa.brown@example.com', phone: '(555) 753-8642', sex: 'FEMALE' },
  { firstName: 'Robert', lastName: 'Wilson', email: 'robert.wilson@example.com', phone: '(555) 951-3578', sex: 'MALE' },
  { firstName: 'Patricia', lastName: 'Moore', email: 'patricia.moore@example.com', phone: '(555) 159-7534', sex: 'FEMALE' },
  { firstName: 'Thomas', lastName: 'Lee', email: 'thomas.lee@example.com', phone: '(555) 357-9512', sex: 'MALE' },
  { firstName: 'Jennifer', lastName: 'White', email: 'jennifer.white@example.com', phone: '(555) 753-1596', sex: 'FEMALE' },
  { firstName: 'Christopher', lastName: 'Harris', email: 'christopher.harris@example.com', phone: '(555) 951-7538', sex: 'MALE' },
  { firstName: 'Linda', lastName: 'Clark', email: 'linda.clark@example.com', phone: '(555) 159-3574', sex: 'FEMALE' },
  { firstName: 'Daniel', lastName: 'Rodriguez', email: 'daniel.rodriguez@example.com', phone: '(555) 357-7539', sex: 'MALE' },
  { firstName: 'Barbara', lastName: 'Lewis', email: 'barbara.lewis@example.com', phone: '(555) 753-9516', sex: 'FEMALE' },
  { firstName: 'Matthew', lastName: 'Walker', email: 'matthew.walker@example.com', phone: '(555) 951-1597', sex: 'MALE' },
  { firstName: 'Nancy', lastName: 'Hall', email: 'nancy.hall@example.com', phone: '(555) 159-7535', sex: 'FEMALE' },
]

export async function seedPeople(ctx: DevSeederContext) {
  const { supabase, parishId, devUserEmail } = ctx

  logInfo('Creating sample people...')

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

  // Create sample people
  const { data: people, error: peopleError } = await supabase
    .from('people')
    .insert(
      SAMPLE_PEOPLE.map((person, index) => ({
        parish_id: parishId,
        first_name: person.firstName,
        last_name: person.lastName,
        email: person.email,
        phone_number: person.phone,
        sex: person.sex,
        mass_times_template_item_ids: weekendMassTimeItems.length > 0 ? [weekendMassTimeItems[index % weekendMassTimeItems.length].id] : []
      }))
    )
    .select()

  if (peopleError) {
    logWarning(`Error creating people: ${peopleError.message}`)
  } else {
    logSuccess(`${people?.length || 0} people created:`)
    for (const person of people || []) {
      logInfo(`      - ${person.full_name} (${person.email})`)
    }
  }

  // Create dev user person record with portal access
  logInfo('')
  logInfo('Creating dev user person record for parishioner portal...')

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

  return { success: true, people }
}

export async function uploadAvatars(ctx: DevSeederContext) {
  const { supabase, parishId } = ctx

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

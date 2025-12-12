/**
 * Dev Seeder: Families and Family Members
 *
 * Creates 15 sample families with realistic family structures.
 * Links sample people as family members with relationships.
 */

import type { DevSeederContext } from './types'

interface FamilyDefinition {
  familyName: string
  active: boolean
  members: Array<{
    firstName: string
    lastName: string
    relationship: string
    isPrimaryContact: boolean
  }>
}

// 15 families with various structures
const SAMPLE_FAMILIES: FamilyDefinition[] = [
  {
    familyName: 'Doe Family',
    active: true,
    members: [
      { firstName: 'John', lastName: 'Doe', relationship: 'Father', isPrimaryContact: true },
      { firstName: 'Jane', lastName: 'Smith', relationship: 'Mother', isPrimaryContact: false },
    ]
  },
  {
    familyName: 'Johnson Family',
    active: true,
    members: [
      { firstName: 'Bob', lastName: 'Johnson', relationship: 'Father', isPrimaryContact: true },
    ]
  },
  {
    familyName: 'Garcia-Martinez Family',
    active: true,
    members: [
      { firstName: 'Maria', lastName: 'Garcia', relationship: 'Mother', isPrimaryContact: true },
      { firstName: 'David', lastName: 'Martinez', relationship: 'Father', isPrimaryContact: false },
    ]
  },
  {
    familyName: 'Chen Family',
    active: true,
    members: [
      { firstName: 'Michael', lastName: 'Chen', relationship: 'Head of Household', isPrimaryContact: true },
    ]
  },
  {
    familyName: 'Williams-Taylor Family',
    active: true,
    members: [
      { firstName: 'Sarah', lastName: 'Williams', relationship: 'Wife', isPrimaryContact: true },
      { firstName: 'Emily', lastName: 'Taylor', relationship: 'Daughter', isPrimaryContact: false },
    ]
  },
  {
    familyName: 'Anderson Family',
    active: true,
    members: [
      { firstName: 'James', lastName: 'Anderson', relationship: 'Father', isPrimaryContact: true },
      { firstName: 'Lisa', lastName: 'Brown', relationship: 'Mother', isPrimaryContact: false },
    ]
  },
  {
    familyName: 'Wilson-Moore Family',
    active: true,
    members: [
      { firstName: 'Robert', lastName: 'Wilson', relationship: 'Husband', isPrimaryContact: true },
      { firstName: 'Patricia', lastName: 'Moore', relationship: 'Wife', isPrimaryContact: false },
    ]
  },
  {
    familyName: 'Lee Family',
    active: true,
    members: [
      { firstName: 'Thomas', lastName: 'Lee', relationship: 'Father', isPrimaryContact: true },
    ]
  },
  {
    familyName: 'White-Harris Family',
    active: true,
    members: [
      { firstName: 'Jennifer', lastName: 'White', relationship: 'Mother', isPrimaryContact: true },
      { firstName: 'Christopher', lastName: 'Harris', relationship: 'Father', isPrimaryContact: false },
    ]
  },
  {
    familyName: 'Clark Family',
    active: true,
    members: [
      { firstName: 'Linda', lastName: 'Clark', relationship: 'Head of Household', isPrimaryContact: true },
    ]
  },
  {
    familyName: 'Rodriguez-Lewis Family',
    active: true,
    members: [
      { firstName: 'Daniel', lastName: 'Rodriguez', relationship: 'Husband', isPrimaryContact: true },
      { firstName: 'Barbara', lastName: 'Lewis', relationship: 'Wife', isPrimaryContact: false },
    ]
  },
  {
    familyName: 'Walker-Hall Family',
    active: true,
    members: [
      { firstName: 'Matthew', lastName: 'Walker', relationship: 'Father', isPrimaryContact: true },
      { firstName: 'Nancy', lastName: 'Hall', relationship: 'Mother', isPrimaryContact: false },
    ]
  },
  {
    familyName: 'Extended Garcia Family',
    active: true,
    members: [
      { firstName: 'Maria', lastName: 'Garcia', relationship: 'Grandmother', isPrimaryContact: true },
    ]
  },
  {
    familyName: 'Smith-Johnson Family',
    active: false, // Inactive family for testing
    members: [
      { firstName: 'Jane', lastName: 'Smith', relationship: 'Mother', isPrimaryContact: true },
      { firstName: 'Bob', lastName: 'Johnson', relationship: 'Stepfather', isPrimaryContact: false },
    ]
  },
  {
    familyName: 'The Browns',
    active: true,
    members: [
      { firstName: 'Lisa', lastName: 'Brown', relationship: 'Head of Household', isPrimaryContact: true },
    ]
  },
]

export async function seedFamilies(
  ctx: DevSeederContext,
  people: Array<{ id: string; first_name: string; last_name: string }>
) {
  const { supabase, parishId } = ctx

  console.log('👨‍👩‍👧‍👦 Creating sample families...')

  // Create a map to find people by name
  const peopleByName = new Map<string, { id: string; first_name: string; last_name: string }>()
  for (const person of people) {
    const key = `${person.first_name}|${person.last_name}`
    peopleByName.set(key, person)
  }

  const createdFamilies: Array<{ id: string; family_name: string }> = []
  let totalMemberships = 0

  for (const familyDef of SAMPLE_FAMILIES) {
    // Create the family
    const { data: family, error: familyError } = await supabase
      .from('families')
      .insert({
        parish_id: parishId,
        family_name: familyDef.familyName,
        active: familyDef.active,
      })
      .select()
      .single()

    if (familyError) {
      console.error(`   ⚠️  Warning: Error creating family "${familyDef.familyName}":`, familyError.message)
      continue
    }

    createdFamilies.push(family)

    // Add family members
    for (const memberDef of familyDef.members) {
      const personKey = `${memberDef.firstName}|${memberDef.lastName}`
      const person = peopleByName.get(personKey)

      if (!person) {
        console.log(`      ⚠️  Person not found: ${memberDef.firstName} ${memberDef.lastName}`)
        continue
      }

      const { error: memberError } = await supabase
        .from('family_members')
        .insert({
          family_id: family.id,
          person_id: person.id,
          relationship: memberDef.relationship,
          is_primary_contact: memberDef.isPrimaryContact,
        })

      if (memberError) {
        if (memberError.code === '23505') {
          // Unique constraint - person already in this family
          console.log(`      ⚠️  ${memberDef.firstName} ${memberDef.lastName} already in family`)
        } else {
          console.error(`      ⚠️  Error adding member:`, memberError.message)
        }
      } else {
        totalMemberships++
      }
    }
  }

  console.log(`   ✅ ${createdFamilies.length} families created`)
  console.log(`   ✅ ${totalMemberships} family memberships created`)

  // Log some details
  const activeCount = createdFamilies.filter(f =>
    SAMPLE_FAMILIES.find(sf => sf.familyName === f.family_name)?.active
  ).length
  const inactiveCount = createdFamilies.length - activeCount

  console.log(`      - ${activeCount} active families`)
  console.log(`      - ${inactiveCount} inactive families`)

  return { families: createdFamilies, membershipsCreated: totalMemberships }
}

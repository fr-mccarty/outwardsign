/**
 * Dev Seeders Index
 *
 * Exports all dev seeder functions for use by dev-seed.ts
 *
 * Note: Locations, Groups, and Special Liturgies are created by the
 * onboarding seeder (src/lib/onboarding-seeding/). The dev seeder
 * only augments with people, masses, families, and readings.
 *
 * Note: Scripture readings are seeded via seedReadingsForParish from
 * content-seed.ts, not from this folder.
 */

export { seedPeople, uploadAvatars, SAMPLE_PEOPLE } from './seed-people'
export { seedGroupMemberships } from './seed-groups'
export { seedMasses } from './seed-masses'
export { seedFamilies } from './seed-families'
export { seedMassIntentions } from './seed-mass-intentions'
export { seedWeddingsAndFunerals } from './seed-weddings-funerals'
export type { DevSeederContext, SamplePerson, DevSeederResult } from './types'

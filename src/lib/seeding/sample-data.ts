/**
 * Sample Data Definitions
 *
 * Shared data used by both dev seeder and production seeder.
 * This ensures consistent sample data across all seeding scenarios.
 */

import type { SamplePerson, FamilyDefinition } from './types'

// =====================================================
// Sample People (20 people)
// =====================================================

export const SAMPLE_PEOPLE: SamplePerson[] = [
  { firstName: 'John', lastName: 'Doe', email: 'john.doe@example.com', phone: '(555) 123-4567', sex: 'MALE', city: 'Austin', state: 'TX', avatarFile: 'fr-josh.webp' },
  { firstName: 'Jane', lastName: 'Smith', email: 'jane.smith@example.com', phone: '(555) 987-6543', sex: 'FEMALE', city: 'Austin', state: 'TX' },
  { firstName: 'Bob', lastName: 'Johnson', email: 'bob.johnson@example.com', phone: '(555) 246-8101', sex: 'MALE', city: 'Round Rock', state: 'TX' },
  { firstName: 'Maria', lastName: 'Garcia', email: 'maria.garcia@example.com', phone: '(555) 369-1214', sex: 'FEMALE', city: 'Austin', state: 'TX' },
  { firstName: 'Michael', lastName: 'Chen', email: 'michael.chen@example.com', phone: '(555) 482-1357', sex: 'MALE', city: 'Cedar Park', state: 'TX' },
  { firstName: 'Sarah', lastName: 'Williams', email: 'sarah.williams@example.com', phone: '(555) 159-2634', sex: 'FEMALE', city: 'Austin', state: 'TX' },
  { firstName: 'David', lastName: 'Martinez', email: 'david.martinez@example.com', phone: '(555) 753-9514', sex: 'MALE', city: 'Pflugerville', state: 'TX' },
  { firstName: 'Emily', lastName: 'Taylor', email: 'emily.taylor@example.com', phone: '(555) 951-7532', sex: 'FEMALE', city: 'Austin', state: 'TX' },
  { firstName: 'James', lastName: 'Anderson', email: 'james.anderson@example.com', phone: '(555) 357-1593', sex: 'MALE', city: 'Georgetown', state: 'TX', avatarFile: 'joe.webp' },
  { firstName: 'Lisa', lastName: 'Brown', email: 'lisa.brown@example.com', phone: '(555) 753-8642', sex: 'FEMALE', city: 'Austin', state: 'TX' },
  { firstName: 'Robert', lastName: 'Wilson', email: 'robert.wilson@example.com', phone: '(555) 951-3578', sex: 'MALE', city: 'Leander', state: 'TX' },
  { firstName: 'Patricia', lastName: 'Moore', email: 'patricia.moore@example.com', phone: '(555) 159-7534', sex: 'FEMALE', city: 'Austin', state: 'TX' },
  { firstName: 'Thomas', lastName: 'Lee', email: 'thomas.lee@example.com', phone: '(555) 357-9512', sex: 'MALE', city: 'Round Rock', state: 'TX' },
  { firstName: 'Jennifer', lastName: 'White', email: 'jennifer.white@example.com', phone: '(555) 753-1596', sex: 'FEMALE', city: 'Austin', state: 'TX' },
  { firstName: 'Christopher', lastName: 'Harris', email: 'christopher.harris@example.com', phone: '(555) 951-7538', sex: 'MALE', city: 'Cedar Park', state: 'TX' },
  { firstName: 'Linda', lastName: 'Clark', email: 'linda.clark@example.com', phone: '(555) 159-3574', sex: 'FEMALE', city: 'Austin', state: 'TX' },
  { firstName: 'Daniel', lastName: 'Rodriguez', email: 'daniel.rodriguez@example.com', phone: '(555) 357-7539', sex: 'MALE', city: 'Pflugerville', state: 'TX' },
  { firstName: 'Barbara', lastName: 'Lewis', email: 'barbara.lewis@example.com', phone: '(555) 753-9516', sex: 'FEMALE', city: 'Austin', state: 'TX' },
  { firstName: 'Matthew', lastName: 'Walker', email: 'matthew.walker@example.com', phone: '(555) 951-1597', sex: 'MALE', city: 'Georgetown', state: 'TX' },
  { firstName: 'Nancy', lastName: 'Hall', email: 'nancy.hall@example.com', phone: '(555) 159-7535', sex: 'FEMALE', city: 'Austin', state: 'TX' },
]

// =====================================================
// Sample Families (15 families)
// =====================================================

export const SAMPLE_FAMILIES: FamilyDefinition[] = [
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

// =====================================================
// Mass Intention Templates
// =====================================================

export const INTENTION_TEXTS = [
  'For the repose of the soul of',
  'For the healing of',
  'In thanksgiving for blessings received by',
  'For the intentions of',
  'For peace and comfort for the family of',
  'In memory of',
  'For the special intentions of',
  'For the health and well-being of',
]

// =====================================================
// Mass Hymn Selections
// =====================================================

export const ENTRANCE_HYMNS = ['Holy God We Praise Thy Name', 'All Are Welcome', 'Here I Am Lord', 'Amazing Grace']
export const OFFERTORY_HYMNS = ['We Bring the Sacrifice of Praise', 'Take and Eat', 'Gift of Finest Wheat', 'Come to the Feast']
export const COMMUNION_HYMNS = ['I Am the Bread of Life', 'One Bread One Body', 'Eat This Bread', 'Here Is My Body']
export const RECESSIONAL_HYMNS = ['Go Make a Difference', 'City of God', 'We Are Called', 'Go Forth']

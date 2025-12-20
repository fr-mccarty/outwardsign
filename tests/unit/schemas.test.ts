/**
 * Unit tests for Zod Validation Schemas
 *
 * Tests form validation schemas that were previously tested implicitly through E2E.
 * These tests run in milliseconds vs seconds for equivalent E2E tests.
 */

import { describe, it, expect } from 'vitest'
import { createPersonSchema, updatePersonSchema } from '@/lib/schemas/people'
import { createLocationSchema, updateLocationSchema } from '@/lib/schemas/locations'
import { createEventSchema } from '@/lib/schemas/events'
import {
  createInputFieldDefinitionSchema,
  inputFieldTypeSchema,
} from '@/lib/schemas/input-field-definitions'

// ============================================================================
// PERSON SCHEMA
// ============================================================================

describe('createPersonSchema', () => {
  it('accepts valid person data', () => {
    const result = createPersonSchema.safeParse({
      first_name: 'John',
      last_name: 'Smith',
    })
    expect(result.success).toBe(true)
  })

  it('accepts person with all optional fields', () => {
    const result = createPersonSchema.safeParse({
      first_name: 'John',
      last_name: 'Smith',
      first_name_pronunciation: 'jawn',
      last_name_pronunciation: 'smith',
      phone_number: '555-1234',
      email: 'john@example.com',
      street: '123 Main St',
      city: 'Springfield',
      state: 'IL',
      zipcode: '62701',
      sex: 'MALE',  // Constants use uppercase
      note: 'A note',
    })
    expect(result.success).toBe(true)
  })

  it('rejects empty first name', () => {
    const result = createPersonSchema.safeParse({
      first_name: '',
      last_name: 'Smith',
    })
    expect(result.success).toBe(false)
    if (!result.success) {
      expect(result.error.issues[0].message).toBe('First name is required')
    }
  })

  it('rejects empty last name', () => {
    const result = createPersonSchema.safeParse({
      first_name: 'John',
      last_name: '',
    })
    expect(result.success).toBe(false)
    if (!result.success) {
      expect(result.error.issues[0].message).toBe('Last name is required')
    }
  })

  it('rejects missing required fields', () => {
    const result = createPersonSchema.safeParse({})
    expect(result.success).toBe(false)
  })

  it('validates email format', () => {
    const validEmail = createPersonSchema.safeParse({
      first_name: 'John',
      last_name: 'Smith',
      email: 'john@example.com',
    })
    expect(validEmail.success).toBe(true)

    const invalidEmail = createPersonSchema.safeParse({
      first_name: 'John',
      last_name: 'Smith',
      email: 'not-an-email',
    })
    expect(invalidEmail.success).toBe(false)
  })

  it('accepts empty email string', () => {
    // Empty string is allowed (treated as no email)
    const result = createPersonSchema.safeParse({
      first_name: 'John',
      last_name: 'Smith',
      email: '',
    })
    expect(result.success).toBe(true)
  })

  it('accepts valid sex values', () => {
    // SEX_VALUES uses uppercase: ['MALE', 'FEMALE']
    const male = createPersonSchema.safeParse({
      first_name: 'John',
      last_name: 'Smith',
      sex: 'MALE',
    })
    expect(male.success).toBe(true)

    const female = createPersonSchema.safeParse({
      first_name: 'Jane',
      last_name: 'Smith',
      sex: 'FEMALE',
    })
    expect(female.success).toBe(true)
  })
})

describe('updatePersonSchema', () => {
  it('accepts partial updates', () => {
    const result = updatePersonSchema.safeParse({
      first_name: 'John',
    })
    expect(result.success).toBe(true)
  })

  it('accepts empty object (no changes)', () => {
    const result = updatePersonSchema.safeParse({})
    expect(result.success).toBe(true)
  })
})

// ============================================================================
// LOCATION SCHEMA
// ============================================================================

describe('createLocationSchema', () => {
  it('accepts valid location data', () => {
    const result = createLocationSchema.safeParse({
      name: 'St. Mary Church',
    })
    expect(result.success).toBe(true)
  })

  it('accepts location with all fields', () => {
    const result = createLocationSchema.safeParse({
      name: 'St. Mary Church',
      description: 'A beautiful church',
      street: '123 Main St',
      city: 'Springfield',
      state: 'IL',
      country: 'USA',
      phone_number: '555-1234',
    })
    expect(result.success).toBe(true)
  })

  it('rejects empty name', () => {
    const result = createLocationSchema.safeParse({
      name: '',
    })
    expect(result.success).toBe(false)
    if (!result.success) {
      expect(result.error.issues[0].message).toBe('Location name is required')
    }
  })

  it('rejects missing name', () => {
    const result = createLocationSchema.safeParse({
      city: 'Springfield',
    })
    expect(result.success).toBe(false)
  })
})

describe('updateLocationSchema', () => {
  it('accepts partial updates', () => {
    const result = updateLocationSchema.safeParse({
      city: 'New City',
    })
    expect(result.success).toBe(true)
  })
})

// ============================================================================
// EVENT SCHEMA
// ============================================================================

describe('createEventSchema', () => {
  it('accepts valid event data', () => {
    const result = createEventSchema.safeParse({
      name: 'Christmas Mass',
    })
    expect(result.success).toBe(true)
  })

  it('accepts event with all fields', () => {
    // LITURGICAL_LANGUAGE_VALUES uses language codes: ['en', 'es', 'la']
    const result = createEventSchema.safeParse({
      name: 'Christmas Mass',
      description: 'Annual celebration',
      start_date: '2025-12-25',
      start_time: '10:00:00',
      end_date: '2025-12-25',
      end_time: '11:00:00',
      language: 'en',
    })
    expect(result.success).toBe(true)
  })

  it('rejects empty name', () => {
    const result = createEventSchema.safeParse({
      name: '',
    })
    expect(result.success).toBe(false)
    if (!result.success) {
      expect(result.error.issues[0].message).toBe('Event name is required')
    }
  })

  it('validates UUID format for optional IDs', () => {
    const validUuid = createEventSchema.safeParse({
      name: 'Test Event',
      location_id: '550e8400-e29b-41d4-a716-446655440000',
    })
    expect(validUuid.success).toBe(true)

    const invalidUuid = createEventSchema.safeParse({
      name: 'Test Event',
      location_id: 'not-a-uuid',
    })
    expect(invalidUuid.success).toBe(false)
  })

  it('accepts valid language values', () => {
    // LITURGICAL_LANGUAGE_VALUES = ['en', 'es', 'la']
    const english = createEventSchema.safeParse({
      name: 'Test',
      language: 'en',
    })
    expect(english.success).toBe(true)

    const spanish = createEventSchema.safeParse({
      name: 'Test',
      language: 'es',
    })
    expect(spanish.success).toBe(true)

    const latin = createEventSchema.safeParse({
      name: 'Test',
      language: 'la',
    })
    expect(latin.success).toBe(true)
  })
})

// ============================================================================
// INPUT FIELD DEFINITION SCHEMA
// ============================================================================

describe('inputFieldTypeSchema', () => {
  it('accepts all valid field types', () => {
    const validTypes = [
      'person', 'group', 'location', 'list_item', 'document',
      'content', 'petition', 'calendar_event', 'text', 'rich_text',
      'date', 'time', 'datetime', 'number', 'yes_no', 'mass-intention', 'spacer'
    ]

    for (const type of validTypes) {
      const result = inputFieldTypeSchema.safeParse(type)
      expect(result.success).toBe(true)
    }
  })

  it('rejects invalid field types', () => {
    const result = inputFieldTypeSchema.safeParse('invalid_type')
    expect(result.success).toBe(false)
  })
})

describe('createInputFieldDefinitionSchema', () => {
  const validUuid = '550e8400-e29b-41d4-a716-446655440000'

  it('accepts valid input field definition', () => {
    const result = createInputFieldDefinitionSchema.safeParse({
      event_type_id: validUuid,
      name: 'Bride',
      property_name: 'bride',
      type: 'person',
      required: true,
    })
    expect(result.success).toBe(true)
  })

  it('validates property_name format', () => {
    // Valid property names
    const valid = createInputFieldDefinitionSchema.safeParse({
      event_type_id: validUuid,
      name: 'Field',
      property_name: 'valid_name_123',
      type: 'text',
      required: false,
    })
    expect(valid.success).toBe(true)

    // Invalid: starts with number
    const startsWithNumber = createInputFieldDefinitionSchema.safeParse({
      event_type_id: validUuid,
      name: 'Field',
      property_name: '123_invalid',
      type: 'text',
      required: false,
    })
    expect(startsWithNumber.success).toBe(false)

    // Invalid: contains uppercase
    const hasUppercase = createInputFieldDefinitionSchema.safeParse({
      event_type_id: validUuid,
      name: 'Field',
      property_name: 'Invalid',
      type: 'text',
      required: false,
    })
    expect(hasUppercase.success).toBe(false)

    // Invalid: contains spaces
    const hasSpaces = createInputFieldDefinitionSchema.safeParse({
      event_type_id: validUuid,
      name: 'Field',
      property_name: 'invalid name',
      type: 'text',
      required: false,
    })
    expect(hasSpaces.success).toBe(false)
  })

  it('validates is_key_person only for person type', () => {
    // Valid: is_key_person with person type
    const validKeyPerson = createInputFieldDefinitionSchema.safeParse({
      event_type_id: validUuid,
      name: 'Bride',
      property_name: 'bride',
      type: 'person',
      required: true,
      is_key_person: true,
    })
    expect(validKeyPerson.success).toBe(true)

    // Invalid: is_key_person with non-person type
    const invalidKeyPerson = createInputFieldDefinitionSchema.safeParse({
      event_type_id: validUuid,
      name: 'Notes',
      property_name: 'notes',
      type: 'text',
      required: false,
      is_key_person: true,
    })
    expect(invalidKeyPerson.success).toBe(false)
  })

  it('validates is_primary only for calendar_event type', () => {
    // Valid: is_primary with calendar_event type
    const validPrimary = createInputFieldDefinitionSchema.safeParse({
      event_type_id: validUuid,
      name: 'Ceremony',
      property_name: 'ceremony',
      type: 'calendar_event',
      required: true,
      is_primary: true,
    })
    expect(validPrimary.success).toBe(true)

    // Invalid: is_primary with non-calendar_event type
    const invalidPrimary = createInputFieldDefinitionSchema.safeParse({
      event_type_id: validUuid,
      name: 'Bride',
      property_name: 'bride',
      type: 'person',
      required: true,
      is_primary: true,
    })
    expect(invalidPrimary.success).toBe(false)
  })

  it('rejects missing required fields', () => {
    const result = createInputFieldDefinitionSchema.safeParse({
      name: 'Field',
    })
    expect(result.success).toBe(false)
  })
})

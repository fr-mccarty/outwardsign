/**
 * Unit tests for Formatter Functions
 *
 * Tests pure formatting functions that don't require database access.
 * These tests replace implicit E2E testing of formatted output.
 */

import { describe, it, expect } from 'vitest'
import {
  generateSlug,
  capitalizeFirstLetter,
  formatPersonLastName,
  formatPersonFirstName,
  formatPersonWithPhone,
  formatPersonWithPronunciation,
  formatPersonWithPronunciationWithPhone,
  formatPersonWithRole,
  formatPersonWithEmail,
  formatTime,
  toLocalDateString,
  formatDateForFilename,
  getDayOfWeekNumber,
  getDayCount,
  formatLocationWithAddress,
  formatLocationName,
  formatAddress,
  getEventName,
  formatEventWithLocation,
  getWeddingPageTitle,
  getFuneralPageTitle,
  getBaptismPageTitle,
  getMassPageTitle,
  getQuinceaneraPageTitle,
  getPresentationPageTitle,
  getMassIntentionPageTitle,
  getEventPageTitle,
  getPersonPageTitle,
  getGroupPageTitle,
  getWeddingFilename,
  getFuneralFilename,
  getBaptismFilename,
  getMassFilename,
  getQuinceaneraFilename,
  getPresentationFilename,
  getMassIntentionFilename,
  getEventFilename,
  getPersonFilename,
  getGroupFilename,
} from '@/lib/utils/formatters'

// ============================================================================
// STRING FORMATTING
// ============================================================================

describe('generateSlug', () => {
  it('converts to lowercase and replaces spaces with hyphens', () => {
    expect(generateSlug('Wedding Songs')).toBe('wedding-songs')
    expect(generateSlug('Wedding Ceremony')).toBe('wedding-ceremony')
  })

  it('removes special characters', () => {
    expect(generateSlug('Special @#$ Characters!')).toBe('special-characters')
  })

  it('handles multiple spaces', () => {
    expect(generateSlug('   Multiple   Spaces   ')).toBe('multiple-spaces')
  })

  it('handles empty and whitespace-only strings', () => {
    expect(generateSlug('')).toBe('')
    expect(generateSlug('   ')).toBe('')
  })
})

describe('capitalizeFirstLetter', () => {
  it('capitalizes first letter', () => {
    expect(capitalizeFirstLetter('person')).toBe('Person')
    expect(capitalizeFirstLetter('mass role')).toBe('Mass role')
  })

  it('handles empty string', () => {
    expect(capitalizeFirstLetter('')).toBe('')
  })
})

// ============================================================================
// PERSON FORMATTING
// ============================================================================

describe('formatPersonLastName', () => {
  it('returns last name', () => {
    expect(formatPersonLastName({ last_name: 'Smith' })).toBe('Smith')
  })

  it('handles null/undefined', () => {
    expect(formatPersonLastName(null)).toBe('')
    expect(formatPersonLastName(undefined)).toBe('')
  })
})

describe('formatPersonFirstName', () => {
  it('returns first name', () => {
    expect(formatPersonFirstName({ first_name: 'John' })).toBe('John')
  })

  it('handles null/undefined', () => {
    expect(formatPersonFirstName(null)).toBe('')
    expect(formatPersonFirstName(undefined)).toBe('')
  })
})

describe('formatPersonWithPhone', () => {
  it('formats person with phone', () => {
    expect(formatPersonWithPhone({ full_name: 'John Smith', phone_number: '555-1234' }))
      .toBe('John Smith — 555-1234')
  })

  it('returns just name without phone', () => {
    expect(formatPersonWithPhone({ full_name: 'John Smith', phone_number: null }))
      .toBe('John Smith')
  })

  it('handles null person', () => {
    expect(formatPersonWithPhone(null)).toBe('')
  })
})

describe('formatPersonWithPronunciation', () => {
  it('formats with pronunciation when different', () => {
    expect(formatPersonWithPronunciation({
      full_name: 'John Smith',
      full_name_pronunciation: 'jawn smith'
    })).toBe('John Smith (jawn smith)')
  })

  it('omits pronunciation when same as name', () => {
    expect(formatPersonWithPronunciation({
      full_name: 'John Smith',
      full_name_pronunciation: 'John Smith'
    })).toBe('John Smith')
  })

  it('omits pronunciation when null', () => {
    expect(formatPersonWithPronunciation({
      full_name: 'John Smith',
      full_name_pronunciation: null
    })).toBe('John Smith')
  })

  it('handles null person', () => {
    expect(formatPersonWithPronunciation(null)).toBe('')
  })
})

describe('formatPersonWithPronunciationWithPhone', () => {
  it('formats with both pronunciation and phone', () => {
    expect(formatPersonWithPronunciationWithPhone({
      full_name: 'John Smith',
      full_name_pronunciation: 'jawn smith',
      phone_number: '555-1234'
    })).toBe('John Smith (jawn smith) — 555-1234')
  })

  it('formats with only phone', () => {
    expect(formatPersonWithPronunciationWithPhone({
      full_name: 'John Smith',
      full_name_pronunciation: null,
      phone_number: '555-1234'
    })).toBe('John Smith — 555-1234')
  })

  it('formats with only pronunciation', () => {
    expect(formatPersonWithPronunciationWithPhone({
      full_name: 'John Smith',
      full_name_pronunciation: 'jawn smith',
      phone_number: null
    })).toBe('John Smith (jawn smith)')
  })

  it('formats with neither', () => {
    expect(formatPersonWithPronunciationWithPhone({
      full_name: 'John Smith',
      full_name_pronunciation: null,
      phone_number: null
    })).toBe('John Smith')
  })
})

describe('formatPersonWithRole', () => {
  it('formats with role', () => {
    expect(formatPersonWithRole({ full_name: 'John Smith' }, 'Lector'))
      .toBe('John Smith (Lector)')
  })

  it('formats without role', () => {
    expect(formatPersonWithRole({ full_name: 'John Smith' }, null))
      .toBe('John Smith')
  })

  it('handles null person', () => {
    expect(formatPersonWithRole(null, 'Lector')).toBe('')
  })
})

describe('formatPersonWithEmail', () => {
  it('formats with email', () => {
    expect(formatPersonWithEmail({ full_name: 'John Smith', email: 'john@example.com' }))
      .toBe('John Smith - john@example.com')
  })

  it('formats without email', () => {
    expect(formatPersonWithEmail({ full_name: 'John Smith', email: null }))
      .toBe('John Smith')
  })
})

// ============================================================================
// TIME FORMATTING
// ============================================================================

describe('formatTime', () => {
  it('formats time in 12-hour format', () => {
    expect(formatTime('14:30:00')).toBe('2:30 PM')
    expect(formatTime('09:15')).toBe('9:15 AM')
    expect(formatTime('00:00:00')).toBe('12:00 AM')
    expect(formatTime('12:00:00')).toBe('12:00 PM')
  })

  it('handles null/undefined/empty', () => {
    expect(formatTime(null)).toBe('')
    expect(formatTime(undefined)).toBe('')
    expect(formatTime('')).toBe('')
  })
})

describe('toLocalDateString', () => {
  it('converts Date to YYYY-MM-DD format', () => {
    const date = new Date(2025, 0, 15) // Jan 15, 2025
    expect(toLocalDateString(date)).toBe('2025-01-15')
  })

  it('pads single-digit months and days', () => {
    const date = new Date(2025, 4, 5) // May 5, 2025
    expect(toLocalDateString(date)).toBe('2025-05-05')
  })
})

describe('formatDateForFilename', () => {
  it('formats date as YYYYMMDD', () => {
    expect(formatDateForFilename('2025-12-25')).toBe('20251225')
  })

  it('handles null/undefined', () => {
    expect(formatDateForFilename(null)).toBe('NoDate')
    expect(formatDateForFilename(undefined)).toBe('NoDate')
  })
})

describe('getDayOfWeekNumber', () => {
  it('maps day names to numbers', () => {
    expect(getDayOfWeekNumber('SUNDAY')).toBe(0)
    expect(getDayOfWeekNumber('MONDAY')).toBe(1)
    expect(getDayOfWeekNumber('SATURDAY')).toBe(6)
  })

  it('returns null for invalid input', () => {
    expect(getDayOfWeekNumber('INVALID')).toBe(null)
  })
})

describe('getDayCount', () => {
  it('returns inclusive day count', () => {
    expect(getDayCount('2025-01-01', '2025-01-05')).toBe(5)
    expect(getDayCount('2025-01-01', '2025-01-01')).toBe(1)
  })

  it('handles empty inputs', () => {
    expect(getDayCount('', '2025-01-05')).toBe(0)
    expect(getDayCount('2025-01-01', '')).toBe(0)
  })
})

// ============================================================================
// LOCATION FORMATTING
// ============================================================================

describe('formatLocationWithAddress', () => {
  it('formats location with full address', () => {
    expect(formatLocationWithAddress({
      name: 'St. Mary Church',
      street: '123 Main St',
      city: 'Springfield',
      state: 'IL'
    })).toBe('St. Mary Church (123 Main St, Springfield, IL)')
  })

  it('formats location with partial address', () => {
    expect(formatLocationWithAddress({
      name: 'St. Mary Church',
      city: 'Springfield',
      state: null
    })).toBe('St. Mary Church (Springfield)')
  })

  it('formats location without address', () => {
    expect(formatLocationWithAddress({
      name: 'St. Mary Church',
      street: null,
      city: null,
      state: null
    })).toBe('St. Mary Church')
  })

  it('handles null location', () => {
    expect(formatLocationWithAddress(null)).toBe('')
  })
})

describe('formatLocationName', () => {
  it('returns location name', () => {
    expect(formatLocationName({ name: 'St. Mary Church' })).toBe('St. Mary Church')
  })

  it('handles null location', () => {
    expect(formatLocationName(null)).toBe('')
  })
})

describe('formatAddress', () => {
  it('formats address parts', () => {
    expect(formatAddress({
      street: '123 Main St',
      city: 'Springfield',
      state: 'IL'
    })).toBe('123 Main St, Springfield, IL')
  })

  it('handles partial address', () => {
    expect(formatAddress({ city: 'Springfield', state: 'IL' }))
      .toBe('Springfield, IL')
  })

  it('handles null location', () => {
    expect(formatAddress(null)).toBe('')
  })
})

// ============================================================================
// EVENT FORMATTING
// ============================================================================

describe('getEventName', () => {
  it('returns event name when available', () => {
    expect(getEventName({ name: 'Christmas Mass' })).toBe('Christmas Mass')
  })

  it('returns event type when no name', () => {
    expect(getEventName({ event_type: 'WEDDING' })).toBe('WEDDING')
  })

  it('returns fallback for empty event', () => {
    expect(getEventName({})).toBe('Event')
    expect(getEventName(null)).toBe('Event')
  })
})

describe('formatEventWithLocation', () => {
  it('formats event with location in English', () => {
    expect(formatEventWithLocation(
      { name: 'Wedding' },
      { name: 'St. Mary Church' },
      'en'
    )).toBe('Wedding at St. Mary Church')
  })

  it('formats event with location in Spanish', () => {
    expect(formatEventWithLocation(
      { name: 'Boda' },
      { name: 'Iglesia Santa María' },
      'es'
    )).toBe('Boda en Iglesia Santa María')
  })

  it('returns event name without location', () => {
    expect(formatEventWithLocation({ name: 'Wedding' }, null))
      .toBe('Wedding')
  })
})

// ============================================================================
// PAGE TITLE GENERATORS
// ============================================================================

describe('getWeddingPageTitle', () => {
  it('formats with both last names', () => {
    expect(getWeddingPageTitle({
      bride: { last_name: 'Smith' },
      groom: { last_name: 'Jones' }
    })).toBe('Smith-Jones-Wedding')
  })

  it('formats with only bride last name', () => {
    expect(getWeddingPageTitle({
      bride: { last_name: 'Smith' },
      groom: null
    })).toBe('Smith-Wedding')
  })

  it('formats with only groom last name', () => {
    expect(getWeddingPageTitle({
      bride: null,
      groom: { last_name: 'Jones' }
    })).toBe('Jones-Wedding')
  })

  it('returns fallback for empty wedding', () => {
    expect(getWeddingPageTitle({ bride: null, groom: null })).toBe('Wedding')
  })
})

describe('getFuneralPageTitle', () => {
  it('formats with full name', () => {
    expect(getFuneralPageTitle({
      deceased: { first_name: 'John', last_name: 'Smith' }
    })).toBe('John Smith-Funeral')
  })

  it('formats with only last name', () => {
    expect(getFuneralPageTitle({
      deceased: { last_name: 'Smith' }
    })).toBe('Smith-Funeral')
  })

  it('returns fallback for empty funeral', () => {
    expect(getFuneralPageTitle({ deceased: null })).toBe('Funeral')
  })
})

describe('getBaptismPageTitle', () => {
  it('formats with full name', () => {
    expect(getBaptismPageTitle({
      child: { first_name: 'Jane', last_name: 'Smith' }
    })).toBe('Jane Smith-Baptism')
  })

  it('formats with only first name', () => {
    expect(getBaptismPageTitle({
      child: { first_name: 'Jane' }
    })).toBe('Jane-Baptism')
  })

  it('returns fallback for empty baptism', () => {
    expect(getBaptismPageTitle({ child: null })).toBe('Baptism')
  })
})

describe('getMassPageTitle', () => {
  it('formats with presider and date', () => {
    const result = getMassPageTitle({
      presider: { first_name: 'John', last_name: 'Smith' },
      event: { start_date: '2024-12-25' }
    })
    expect(result).toContain('John Smith')
    expect(result).toContain('Mass')
  })

  it('formats with only presider', () => {
    expect(getMassPageTitle({
      presider: { first_name: 'John', last_name: 'Smith' },
      event: null
    })).toBe('John Smith-Mass')
  })

  it('returns fallback for empty mass', () => {
    expect(getMassPageTitle({ presider: null, event: null })).toBe('Mass')
  })
})

describe('getQuinceaneraPageTitle', () => {
  it('formats with last name', () => {
    expect(getQuinceaneraPageTitle({
      quinceanera: { last_name: 'Garcia' }
    })).toBe('Garcia-Quinceañera')
  })

  it('returns fallback for empty', () => {
    expect(getQuinceaneraPageTitle({ quinceanera: null })).toBe('Quinceañera')
  })
})

describe('getPresentationPageTitle', () => {
  it('formats with last name', () => {
    expect(getPresentationPageTitle({
      child: { last_name: 'Martinez' }
    })).toBe('Martinez-Presentation')
  })

  it('returns fallback for empty', () => {
    expect(getPresentationPageTitle({ child: null })).toBe('Presentation')
  })
})

describe('getMassIntentionPageTitle', () => {
  it('formats with intention text', () => {
    expect(getMassIntentionPageTitle({
      mass_offered_for: 'For John Doe'
    })).toBe('For John Doe-Mass Intention')
  })

  it('truncates long intention text', () => {
    const longText = 'A'.repeat(60)
    const result = getMassIntentionPageTitle({ mass_offered_for: longText })
    expect(result).toContain('...')
    expect(result.length).toBeLessThan(70)
  })

  it('returns fallback for empty', () => {
    expect(getMassIntentionPageTitle({ mass_offered_for: null })).toBe('Mass Intention')
  })
})

describe('getEventPageTitle', () => {
  it('returns event name', () => {
    expect(getEventPageTitle({ name: 'Christmas Mass' })).toBe('Christmas Mass')
  })

  it('returns fallback for empty', () => {
    expect(getEventPageTitle({ name: null })).toBe('Event')
  })
})

describe('getPersonPageTitle', () => {
  it('formats full name', () => {
    expect(getPersonPageTitle({ first_name: 'John', last_name: 'Smith' }))
      .toBe('John Smith')
  })

  it('formats partial name', () => {
    expect(getPersonPageTitle({ first_name: 'John' })).toBe('John')
    expect(getPersonPageTitle({ last_name: 'Smith' })).toBe('Smith')
  })

  it('returns fallback for empty', () => {
    expect(getPersonPageTitle({})).toBe('Person')
  })
})

describe('getGroupPageTitle', () => {
  it('returns group name', () => {
    expect(getGroupPageTitle({ name: 'Lectors' })).toBe('Lectors')
  })

  it('returns fallback for empty', () => {
    expect(getGroupPageTitle({ name: '' })).toBe('Group')
  })
})

// ============================================================================
// FILENAME GENERATORS
// ============================================================================

describe('getWeddingFilename', () => {
  it('formats filename with names and date', () => {
    expect(getWeddingFilename({
      bride: { last_name: 'Smith' },
      groom: { last_name: 'Jones' },
      wedding_event: { start_date: '2025-12-25' }
    }, 'pdf')).toBe('Smith-Jones-20251225.pdf')
  })

  it('uses fallbacks for missing data', () => {
    expect(getWeddingFilename({
      bride: null,
      groom: null,
      wedding_event: null
    }, 'docx')).toBe('Bride-Groom-NoDate.docx')
  })
})

describe('getFuneralFilename', () => {
  it('formats filename', () => {
    expect(getFuneralFilename({
      deceased: { last_name: 'Smith' },
      funeral_event: { start_date: '2025-12-25' }
    }, 'pdf')).toBe('Smith-Funeral-20251225.pdf')
  })
})

describe('getBaptismFilename', () => {
  it('formats filename', () => {
    expect(getBaptismFilename({
      child: { last_name: 'Martinez' },
      baptism_event: { start_date: '2025-12-25' }
    }, 'pdf')).toBe('Martinez-Baptism-20251225.pdf')
  })
})

describe('getMassFilename', () => {
  it('formats filename', () => {
    expect(getMassFilename({
      presider: { first_name: 'John', last_name: 'Smith' },
      event: { start_date: '2025-12-25' }
    }, 'pdf')).toBe('Mass-John-Smith-20251225.pdf')
  })
})

describe('getQuinceaneraFilename', () => {
  it('formats filename', () => {
    expect(getQuinceaneraFilename({
      quinceanera: { last_name: 'Garcia' },
      quinceanera_event: { start_date: '2025-12-25' }
    }, 'pdf')).toBe('Garcia-Quinceanera-20251225.pdf')
  })
})

describe('getPresentationFilename', () => {
  it('formats filename', () => {
    expect(getPresentationFilename({
      child: { last_name: 'Martinez' },
      presentation_event: { start_date: '2025-12-25' }
    }, 'pdf')).toBe('presentation-Martinez-20251225.pdf')
  })
})

describe('getMassIntentionFilename', () => {
  it('formats filename with sanitized text', () => {
    const result = getMassIntentionFilename({
      mass_offered_for: 'For John Doe',
      date_requested: '2025-12-25'
    }, 'pdf')
    expect(result).toContain('MassIntention')
    expect(result).toContain('20251225')
    expect(result).toContain('.pdf')
  })
})

describe('getEventFilename', () => {
  it('formats filename with sanitized name', () => {
    expect(getEventFilename({
      name: 'Christmas Mass',
      start_date: '2025-12-25'
    }, 'pdf')).toBe('Event-Christmas-Mass-20251225.pdf')
  })
})

describe('getPersonFilename', () => {
  it('formats filename with full name', () => {
    expect(getPersonFilename({ first_name: 'John', last_name: 'Smith' }, 'pdf'))
      .toBe('John-Smith.pdf')
  })

  it('returns fallback for empty', () => {
    expect(getPersonFilename({}, 'pdf')).toBe('Person.pdf')
  })
})

describe('getGroupFilename', () => {
  it('formats filename', () => {
    expect(getGroupFilename({ name: 'Lectors' }, 'pdf')).toBe('Lectors.pdf')
  })

  it('returns fallback for empty', () => {
    expect(getGroupFilename({ name: '' }, 'docx')).toBe('Group.docx')
  })
})

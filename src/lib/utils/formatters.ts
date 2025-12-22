/**
 * Formatters - Shared Utility Functions
 *
 * Pure utility functions for formatting data across all sacraments
 */

import { DEFAULT_TIMEZONE } from '@/lib/constants'

// ============================================================================
// STRING FORMATTING FUNCTIONS
// ============================================================================

/**
 * Generate a URL-safe slug from a string
 *
 * Converts text to lowercase, removes special characters, replaces spaces
 * with hyphens, and cleans up multiple/trailing hyphens.
 *
 * @param text - The text to convert to a slug
 * @returns URL-safe slug string
 *
 * @example
 * generateSlug('Wedding Songs') // "wedding-songs"
 * generateSlug('Wedding Ceremony') // "wedding-ceremony"
 * generateSlug('   Multiple   Spaces   ') // "multiple-spaces"
 * generateSlug('Special @#$ Characters!') // "special-characters"
 */
export function generateSlug(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '') // Remove special characters
    .replace(/\s+/g, '-')      // Replace spaces with hyphens
    .replace(/-+/g, '-')       // Replace multiple hyphens with single
    .replace(/^-+|-+$/g, '')   // Trim hyphens from start/end
}

/**
 * Capitalize first letter of a string
 *
 * @example
 * capitalizeFirstLetter('person') // "Person"
 * capitalizeFirstLetter('mass role') // "Mass role"
 * capitalizeFirstLetter('') // ""
 */
export function capitalizeFirstLetter(str: string): string {
  if (!str) return ''
  return str.charAt(0).toUpperCase() + str.slice(1)
}

// ============================================================================
// PERSON FORMATTING FUNCTIONS
// ============================================================================

/**
 * Format person last name only
 *
 * @example
 * formatPersonLastName(person) // "Smith"
 * formatPersonLastName(null) // ""
 */
export function formatPersonLastName(person?: { last_name: string } | null): string {
  return person?.last_name || ''
}

/**
 * Format person first name only
 *
 * @example
 * formatPersonFirstName(person) // "John"
 * formatPersonFirstName(null) // ""
 */
export function formatPersonFirstName(person?: { first_name: string } | null): string {
  return person?.first_name || ''
}

/**
 * Format person with phone number
 * Uses database-generated full_name field
 *
 * @example
 * formatPersonWithPhone(person) // "John Smith — 555-1234"
 * formatPersonWithPhone(person) // "John Smith" (no phone)
 */
export function formatPersonWithPhone(
  person?: { full_name: string; phone_number?: string | null } | null
): string {
  if (!person) return ''
  return person.phone_number ? `${person.full_name} — ${person.phone_number}` : person.full_name
}

/**
 * Format person with pronunciation (no phone)
 * Uses database-generated full_name and full_name_pronunciation fields
 *
 * Used for primary participants in liturgical ceremonies (bride, groom, deceased, child, quinceanera)
 * to help presiders correctly pronounce names during the ceremony.
 *
 * @example
 * formatPersonWithPronunciation(person) // "John Smith (jawn smith)"
 * formatPersonWithPronunciation(person) // "John Smith" (no pronunciation or pronunciation same as name)
 */
export function formatPersonWithPronunciation(
  person?: {
    full_name: string
    full_name_pronunciation?: string | null
  } | null
): string {
  if (!person) return ''

  let result = person.full_name

  // Add pronunciation if different from full_name
  if (person.full_name_pronunciation && person.full_name_pronunciation !== person.full_name) {
    result += ` (${person.full_name_pronunciation})`
  }

  return result
}

/**
 * Format person with pronunciation and phone number
 * Uses database-generated full_name and full_name_pronunciation fields
 *
 * Used for primary participants in liturgical ceremonies (bride, groom, deceased, child, quinceanera)
 * to help presiders correctly pronounce names during the ceremony.
 *
 * @example
 * formatPersonWithPronunciationWithPhone(person) // "John Smith (jawn smith) — 555-1234"
 * formatPersonWithPronunciationWithPhone(person) // "John Smith (jawn smith)" (pronunciation only, no phone)
 * formatPersonWithPronunciationWithPhone(person) // "John Smith — 555-1234" (phone only, no pronunciation)
 * formatPersonWithPronunciationWithPhone(person) // "John Smith" (neither)
 */
export function formatPersonWithPronunciationWithPhone(
  person?: {
    full_name: string
    full_name_pronunciation?: string | null
    phone_number?: string | null
  } | null
): string {
  if (!person) return ''

  let result = person.full_name

  // Add pronunciation if different from full_name
  if (person.full_name_pronunciation && person.full_name_pronunciation !== person.full_name) {
    result += ` (${person.full_name_pronunciation})`
  }

  // Add phone if available
  if (person.phone_number) {
    result += ` — ${person.phone_number}`
  }

  return result
}

/**
 * Format person with role
 * Uses database-generated full_name field
 *
 * @param person - Person object with name
 * @param role - Role label to display
 * @returns Formatted string with name and role
 *
 * @example
 * formatPersonWithRole(person, 'Lector') // "John Smith (Lector)"
 * formatPersonWithRole(person, 'Best Man') // "John Smith (Best Man)"
 */
export function formatPersonWithRole(
  person?: { full_name: string } | null,
  role?: string | null
): string {
  if (!person) return ''
  return role ? `${person.full_name} (${role})` : person.full_name
}

/**
 * Format person with email
 * Uses database-generated full_name field
 *
 * @example
 * formatPersonWithEmail(person) // "John Smith - john@example.com"
 * formatPersonWithEmail(person) // "John Smith" (no email)
 */
export function formatPersonWithEmail(
  person?: { full_name: string; email?: string | null } | null
): string {
  if (!person) return ''
  return person.email ? `${person.full_name} - ${person.email}` : person.full_name
}

/**
 * Format date with flexible options
 *
 * @param date - Date string to format
 * @param language - Language for formatting ('en' or 'es')
 * @param options - Formatting options
 * @returns Formatted date string
 *
 * @example
 * formatDate('2025-12-25', 'en') // "December 25, 2025"
 * formatDate('2025-12-25', 'en', { includeWeekday: true }) // "Thursday, December 25, 2025"
 * formatDate('2025-12-25', 'en', { format: 'short' }) // "Dec 25, 2025"
 * formatDate('2025-12-25', 'en', { format: 'numeric' }) // "12/25/2025"
 * formatDate('2025-12-25', 'es') // "25 de diciembre de 2025"
 */
export function formatDate(
  date?: string | null,
  language: 'en' | 'es' = 'en',
  options?: {
    includeWeekday?: boolean
    format?: 'long' | 'short' | 'numeric'
  }
): string {
  if (!date) return ''

  const dateObj = new Date(date)
  const format = options?.format || 'long'
  const includeWeekday = options?.includeWeekday || false

  if (format === 'numeric') {
    return dateObj.toLocaleDateString(language === 'es' ? 'es-ES' : 'en-US', {
      timeZone: DEFAULT_TIMEZONE
    })
  }

  const dateOptions: Intl.DateTimeFormatOptions = {
    month: format === 'short' ? 'short' : 'long',
    day: 'numeric',
    year: 'numeric',
    timeZone: DEFAULT_TIMEZONE,
  }

  if (includeWeekday) {
    dateOptions.weekday = 'long'
  }

  return dateObj.toLocaleDateString(language === 'es' ? 'es-ES' : 'en-US', dateOptions)
}

/**
 * Format time in 12-hour format
 *
 * @param time - Time string (format: "HH:MM:SS" or "HH:MM")
 * @param language - Language for AM/PM labels ('en' or 'es')
 * @returns Formatted time string
 *
 * @example
 * formatTime('14:30:00') // "2:30 PM"
 * formatTime('09:15') // "9:15 AM"
 * formatTime('14:30:00', 'es') // "2:30 PM" (AM/PM is international)
 */
export function formatTime(time?: string | null): string {
  if (!time) return ''

  // Parse time (format: "16:21:00" or "16:21")
  const [hours, minutes] = time.split(':').map(Number)

  // Convert to 12-hour format with AM/PM (no seconds)
  const period = hours >= 12 ? 'PM' : 'AM'
  const displayHours = hours % 12 || 12
  const displayMinutes = minutes.toString().padStart(2, '0')

  return `${displayHours}:${displayMinutes} ${period}`
}

/**
 * Format event date and time (legacy function - kept for backward compatibility)
 * Returns format: "Tuesday, July 15, 2025 at 11:00 AM"
 *
 * @example
 * formatEventDateTime(event) // "Tuesday, July 15, 2025 at 11:00 AM"
 * formatEventDateTime({ start_date: '2025-12-25' }) // "Thursday, December 25, 2025"
 */
export function formatEventDateTime(event?: { start_date?: string | null; start_time?: string | null } | null): string {
  if (!event?.start_date) return ''

  const date = formatDate(event.start_date, 'en', { includeWeekday: true })

  if (!event.start_time) return date

  const time = formatTime(event.start_time)

  return `${date} at ${time}`
}

/**
 * Format event date and time in compact format for list views
 *
 * @param event - Event with start_date and optional start_time
 * @param language - Language for formatting ('en' or 'es')
 * @returns Compact formatted date/time string
 *
 * @example
 * formatEventDateTimeCompact(event, 'en') // "Sun, Dec 25, 2025 at 10:00 AM"
 * formatEventDateTimeCompact(event, 'es') // "dom, 25 dic 2025 a las 10:00 AM"
 * formatEventDateTimeCompact({ start_date: '2025-12-25' }, 'en') // "Sun, Dec 25, 2025"
 */
export function formatEventDateTimeCompact(
  event?: { start_date?: string | null; start_time?: string | null } | null,
  language: 'en' | 'es' = 'en'
): string {
  if (!event?.start_date) return ''

  const dateObj = new Date(event.start_date)
  const dateOptions: Intl.DateTimeFormatOptions = {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  }

  const date = dateObj.toLocaleDateString(language === 'es' ? 'es-ES' : 'en-US', dateOptions)

  if (!event.start_time) return date

  const time = formatTime(event.start_time)
  const connector = language === 'es' ? 'a las' : 'at'

  return `${date} ${connector} ${time}`
}

/**
 * Convert a Date object to a YYYY-MM-DD string using LOCAL timezone
 *
 * 🔴 CRITICAL: Use this instead of date.toISOString().split('T')[0]
 *
 * The toISOString() method converts to UTC, which can shift the date by a day
 * in western timezones. For example, if you're in EST (UTC-5) at 10 PM on
 * January 15th, toISOString() returns a UTC time that could be January 16th.
 *
 * This function uses local date methods (getFullYear, getMonth, getDate) to
 * ensure the date string matches what the user sees on their calendar.
 *
 * @param date - Date object to convert
 * @returns Date string in YYYY-MM-DD format using local timezone
 *
 * @example
 * // User in EST timezone at 10 PM on January 15th
 * const date = new Date('2025-01-15T22:00:00-05:00')
 *
 * // ❌ WRONG - Returns "2025-01-16" (UTC shifted the date)
 * date.toISOString().split('T')[0]
 *
 * // ✅ CORRECT - Returns "2025-01-15" (local date preserved)
 * toLocalDateString(date)
 */
export function toLocalDateString(date: Date): string {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

/**
 * Format date as numeric (e.g., "7/15/2025")
 *
 * @param date - Date string or Date object
 * @returns Formatted date string
 *
 * @example
 * formatDateNumeric('2025-07-15') // "7/15/2025"
 * formatDateNumeric(new Date()) // "7/15/2025"
 */
export function formatDateNumeric(date: string | Date): string {
  try {
    const dateObj = typeof date === 'string' ? new Date(date) : date
    return dateObj.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'numeric',
      day: 'numeric',
      timeZone: DEFAULT_TIMEZONE
    })
  } catch (error) {
    console.error('Error formatting date:', error)
    return String(date)
  }
}

/**
 * Format date as short (e.g., "Jul 15, 2025")
 *
 * @param date - Date string or Date object
 * @returns Formatted date string
 *
 * @example
 * formatDateShort('2025-07-15') // "Jul 15, 2025"
 */
export function formatDateShort(date: string | Date): string {
  try {
    const dateObj = typeof date === 'string' ? new Date(date) : date
    return dateObj.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      timeZone: DEFAULT_TIMEZONE
    })
  } catch (error) {
    console.error('Error formatting date:', error)
    return String(date)
  }
}

/**
 * Format date as pretty (e.g., "July 15, 2025")
 *
 * @param date - Date string or Date object
 * @returns Formatted date string
 *
 * @example
 * formatDatePretty('2025-07-15') // "July 15, 2025"
 */
export function formatDatePretty(date: string | Date): string {
  try {
    const dateObj = typeof date === 'string' ? new Date(date) : date
    return dateObj.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      timeZone: DEFAULT_TIMEZONE
    })
  } catch (error) {
    console.error('Error formatting date:', error)
    return String(date)
  }
}

/**
 * Format date as long (e.g., "Tuesday, July 15, 2025")
 *
 * @param date - Date string or Date object
 * @returns Formatted date string
 *
 * @example
 * formatDateLong('2025-07-15') // "Tuesday, July 15, 2025"
 */
export function formatDateLong(date: string | Date): string {
  try {
    const dateObj = typeof date === 'string' ? new Date(date) : date
    return dateObj.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      timeZone: DEFAULT_TIMEZONE
    })
  } catch (error) {
    console.error('Error formatting date:', error)
    return String(date)
  }
}

/**
 * Format date as relative time (e.g., "in 2 months", "3 days ago", "today")
 *
 * @param date - Date string or Date object
 * @returns Formatted relative date string
 *
 * @example
 * formatDateRelative('2025-07-15') // "in 2 months"
 * formatDateRelative('2025-05-13') // "yesterday"
 * formatDateRelative('2025-05-14') // "today"
 */
export function formatDateRelative(date: string | Date): string {
  try {
    const dateObj = typeof date === 'string' ? new Date(date) : date
    const now = new Date()

    // Reset hours to compare dates only
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())
    const compareDate = new Date(dateObj.getFullYear(), dateObj.getMonth(), dateObj.getDate())

    const diffTime = compareDate.getTime() - today.getTime()
    const diffDays = Math.round(diffTime / (1000 * 60 * 60 * 24))

    // Today
    if (diffDays === 0) return 'today'

    // Tomorrow/Yesterday
    if (diffDays === 1) return 'tomorrow'
    if (diffDays === -1) return 'yesterday'

    // Within a week
    if (diffDays > 0 && diffDays < 7) {
      return `in ${diffDays} day${diffDays !== 1 ? 's' : ''}`
    }
    if (diffDays < 0 && diffDays > -7) {
      return `${Math.abs(diffDays)} day${diffDays !== -1 ? 's' : ''} ago`
    }

    // Within a month (use weeks)
    const diffWeeks = Math.round(diffDays / 7)
    if (diffDays > 0 && diffDays < 30) {
      return `in ${diffWeeks} week${diffWeeks !== 1 ? 's' : ''}`
    }
    if (diffDays < 0 && diffDays > -30) {
      return `${Math.abs(diffWeeks)} week${diffWeeks !== -1 ? 's' : ''} ago`
    }

    // Within a year (use months)
    const diffMonths = Math.round(diffDays / 30)
    if (diffDays > 0 && diffDays < 365) {
      return `in ${diffMonths} month${diffMonths !== 1 ? 's' : ''}`
    }
    if (diffDays < 0 && diffDays > -365) {
      return `${Math.abs(diffMonths)} month${diffMonths !== -1 ? 's' : ''} ago`
    }

    // Use years
    const diffYears = Math.round(diffDays / 365)
    if (diffDays > 0) {
      return `in ${diffYears} year${diffYears !== 1 ? 's' : ''}`
    }
    return `${Math.abs(diffYears)} year${diffYears !== -1 ? 's' : ''} ago`
  } catch (error) {
    console.error('Error formatting relative date:', error)
    return String(date)
  }
}

/**
 * Map day of week string to numeric value
 *
 * @param dayOfWeek - Day of week string (e.g., "SUNDAY", "MONDAY")
 * @returns Day of week number (0=Sunday, 6=Saturday) or null if invalid
 *
 * @example
 * getDayOfWeekNumber('SUNDAY') // 0
 * getDayOfWeekNumber('MONDAY') // 1
 */
export function getDayOfWeekNumber(dayOfWeek: string): number | null {
  const mapping: Record<string, number> = {
    SUNDAY: 0,
    MONDAY: 1,
    TUESDAY: 2,
    WEDNESDAY: 3,
    THURSDAY: 4,
    FRIDAY: 5,
    SATURDAY: 6,
  }
  return mapping[dayOfWeek] ?? null
}

/**
 * Calculate number of days between two dates (inclusive)
 *
 * @param startDate - Start date string (YYYY-MM-DD)
 * @param endDate - End date string (YYYY-MM-DD)
 * @returns Number of days between dates (inclusive)
 *
 * @example
 * getDayCount('2025-01-01', '2025-01-05') // 5
 */
export function getDayCount(startDate: string, endDate: string): number {
  if (!startDate || !endDate) return 0
  const start = new Date(startDate)
  const end = new Date(endDate)
  const diffTime = Math.abs(end.getTime() - start.getTime())
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1
}

// ============================================================================
// LOCATION FORMATTING FUNCTIONS
// ============================================================================

/**
 * Format location name with address details in parentheses
 *
 * @example
 * formatLocationWithAddress(location) // "St. Mary Church (123 Main St, Springfield, IL)"
 * formatLocationWithAddress(location) // "St. Mary Church" (if no address details)
 * formatLocationWithAddress(null) // ""
 */
export function formatLocationWithAddress(location?: {
  name: string
  street?: string | null
  city?: string | null
  state?: string | null
} | null): string {
  if (!location) return ''

  const addressParts = [location.street, location.city, location.state].filter(Boolean)

  if (addressParts.length > 0) {
    return `${location.name} (${addressParts.join(', ')})`
  }

  return location.name
}

/**
 * Format location name only (no address)
 *
 * @example
 * formatLocationName(location) // "St. Mary Church"
 * formatLocationName(null) // ""
 */
export function formatLocationName(location?: { name: string } | null): string {
  return location?.name || ''
}

/**
 * Format address without location name
 *
 * @example
 * formatAddress(location) // "123 Main St, Springfield, IL"
 * formatAddress(location) // "" (if no address details)
 */
export function formatAddress(location?: {
  street?: string | null
  city?: string | null
  state?: string | null
} | null): string {
  if (!location) return ''

  const addressParts = [location.street, location.city, location.state].filter(Boolean)
  return addressParts.join(', ')
}

// ============================================================================
// EVENT FORMATTING FUNCTIONS
// ============================================================================

/**
 * Get event name with fallback to event type label
 *
 * @param event - Event object with optional name and event_type
 * @param language - Language for event type label ('en' or 'es')
 * @returns Event name or translated event type
 *
 * @example
 * getEventName({ name: 'Christmas Mass' }) // "Christmas Mass"
 * getEventName({ event_type: 'WEDDING_CEREMONY' }, 'en') // "Wedding Ceremony"
 * getEventName({}, 'en') // "Event"
 */
export function getEventName(
  event?: { name?: string | null; event_type?: string } | null
): string {
  if (!event) return 'Event'
  if (event.name) return event.name

  // Import EVENT_TYPE_LABELS would create circular dependency
  // so we handle this at the call site or return the raw event_type
  return event.event_type || 'Event'
}

/**
 * Format event with location
 *
 * @param event - Event object with optional name
 * @param location - Location object
 * @param language - Language for formatting ('en' or 'es')
 * @returns Event name with location
 *
 * @example
 * formatEventWithLocation(event, location, 'en') // "Wedding Ceremony at St. Mary Church"
 * formatEventWithLocation(event, location, 'es') // "Ceremonia de Boda en Iglesia Santa María"
 */
export function formatEventWithLocation(
  event?: { name?: string | null } | null,
  location?: { name: string } | null,
  language: 'en' | 'es' = 'en'
): string {
  if (!event && !location) return ''

  const eventName = event?.name || 'Event'
  if (!location) return eventName

  const connector = language === 'es' ? 'en' : 'at'
  return `${eventName} ${connector} ${location.name}`
}

/**
 * Get event subtitle (date/time) for English template
 * Used in liturgical document headers
 *
 * @param event - Event object with start_date and start_time
 * @returns Formatted date/time or fallback message
 *
 * @example
 * formatEventSubtitleEnglish(event) // "Tuesday, July 15, 2025 at 11:00 AM"
 * formatEventSubtitleEnglish({}) // "Missing Date and Time"
 */
export function formatEventSubtitleEnglish(event?: { start_date?: string | null; start_time?: string | null } | null): string {
  if (event?.start_date && event?.start_time) {
    return formatEventDateTime(event)
  }
  return 'Missing Date and Time'
}

/**
 * Get event subtitle (date/time) for Spanish template
 * Used in liturgical document headers
 *
 * @param event - Event object with start_date and start_time
 * @returns Formatted date/time or fallback message
 *
 * @example
 * formatEventSubtitleSpanish(event) // "martes, 15 de julio de 2025 a las 11:00 AM"
 * formatEventSubtitleSpanish({}) // "Falta Fecha y Hora"
 */
export function formatEventSubtitleSpanish(event?: { start_date?: string | null; start_time?: string | null } | null): string {
  if (event?.start_date && event?.start_time) {
    // Use bilingual date formatter with Spanish locale
    const date = formatDate(event.start_date, 'es', { includeWeekday: true })
    const time = formatTime(event.start_time)
    return `${date} a las ${time}`
  }
  return 'Falta Fecha y Hora'
}

// ============================================================================
// PAGE TITLE GENERATOR FUNCTIONS
// ============================================================================

/**
 * Get wedding page title
 *
 * Format: "LastName-LastName-Wedding" or "Wedding"
 *
 * @example
 * getWeddingPageTitle(wedding) // "Smith-Jones-Wedding"
 * getWeddingPageTitle(wedding) // "Smith-Wedding" (if only one last name)
 * getWeddingPageTitle({}) // "Wedding"
 */
export function getWeddingPageTitle(wedding: {
  bride?: { last_name?: string } | null
  groom?: { last_name?: string } | null
}): string {
  const brideLast = wedding.bride?.last_name
  const groomLast = wedding.groom?.last_name

  if (brideLast && groomLast) {
    return `${brideLast}-${groomLast}-Wedding`
  } else if (brideLast) {
    return `${brideLast}-Wedding`
  } else if (groomLast) {
    return `${groomLast}-Wedding`
  }

  return 'Wedding'
}

/**
 * Get funeral page title
 *
 * Format: "John Doe-Funeral" or "Funeral"
 *
 * @example
 * getFuneralPageTitle(funeral) // "John Smith-Funeral"
 * getFuneralPageTitle({}) // "Funeral"
 */
export function getFuneralPageTitle(funeral: {
  deceased?: { first_name?: string; last_name?: string } | null
}): string {
  const deceased = funeral.deceased

  if (deceased?.last_name) {
    const fullName = deceased.first_name
      ? `${deceased.first_name} ${deceased.last_name}`
      : deceased.last_name
    return `${fullName}-Funeral`
  }

  return 'Funeral'
}

/**
 * Get baptism page title
 *
 * Format: "Jane Smith-Baptism" or "Baptism"
 *
 * @example
 * getBaptismPageTitle(baptism) // "Jane Smith-Baptism"
 * getBaptismPageTitle(baptism) // "Jane-Baptism" (first name only)
 * getBaptismPageTitle({}) // "Baptism"
 */
export function getBaptismPageTitle(baptism: {
  child?: { first_name?: string; last_name?: string } | null
}): string {
  const child = baptism.child

  if (child?.last_name) {
    const fullName = child.first_name ? `${child.first_name} ${child.last_name}` : child.last_name
    return `${fullName.trim()}-Baptism`
  } else if (child?.first_name) {
    return `${child.first_name}-Baptism`
  }

  return 'Baptism'
}

/**
 * Get mass page title
 *
 * Format: "Fr. John Smith-12/25/2024-Mass" or "Mass"
 *
 * @example
 * getMassPageTitle(mass) // "Fr. John Smith-12/25/2024-Mass"
 * getMassPageTitle(mass) // "Fr. John Smith-Mass" (no date)
 * getMassPageTitle(mass) // "12/25/2024-Mass" (no presider)
 * getMassPageTitle({}) // "Mass"
 */
export function getMassPageTitle(mass: {
  presider?: { first_name?: string; last_name?: string } | null
  event?: { start_date?: string } | null
  people_event_assignments?: Array<{
    person?: { first_name?: string; last_name?: string } | null
    field_definition?: { property_name?: string } | null
  }> | null
  calendar_events?: Array<{ start_datetime?: string }> | null
}): string {
  // Try to get presider from people_event_assignments (new pattern)
  const presiderAssignment = mass.people_event_assignments?.find(
    a => a.field_definition?.property_name === 'presider'
  )
  const presider = presiderAssignment?.person || mass.presider

  const presiderName = presider
    ? `${presider.first_name} ${presider.last_name}`
    : null

  // Try to get date from calendar_events (new pattern) or event (old pattern)
  const calendarEventDate = mass.calendar_events?.[0]?.start_datetime
  const eventDate = mass.event?.start_date || calendarEventDate
  const formattedDate = eventDate
    ? new Date(eventDate).toLocaleDateString()
    : null

  if (presiderName && formattedDate) {
    return `${presiderName}-${formattedDate}-Mass`
  } else if (presiderName) {
    return `${presiderName}-Mass`
  } else if (formattedDate) {
    return `${formattedDate}-Mass`
  }

  return 'Mass'
}

/**
 * Get quinceañera page title
 *
 * Format: "LastName-Quinceañera" or "Quinceañera"
 *
 * @example
 * getQuinceaneraPageTitle(quinceanera) // "Garcia-Quinceañera"
 * getQuinceaneraPageTitle({}) // "Quinceañera"
 */
export function getQuinceaneraPageTitle(quinceanera: {
  quinceanera?: { last_name?: string } | null
}): string {
  const lastName = quinceanera.quinceanera?.last_name

  if (lastName) {
    return `${lastName}-Quinceañera`
  }

  return 'Quinceañera'
}

/**
 * Get presentation page title
 *
 * Format: "LastName-Presentation" or "Presentation"
 *
 * @example
 * getPresentationPageTitle(presentation) // "Martinez-Presentation"
 * getPresentationPageTitle({}) // "Presentation"
 */
export function getPresentationPageTitle(presentation: {
  child?: { last_name?: string } | null
}): string {
  const lastName = presentation.child?.last_name

  if (lastName) {
    return `${lastName}-Presentation`
  }

  return 'Presentation'
}

/**
 * Get mass intention page title
 *
 * Format: "For John Doe-Mass Intention" or "Mass Intention"
 * (truncates to 50 characters if needed)
 *
 * @example
 * getMassIntentionPageTitle(intention) // "For John Doe-Mass Intention"
 * getMassIntentionPageTitle(intention) // "For the repose of the soul of...-Mass Intention"
 * getMassIntentionPageTitle({}) // "Mass Intention"
 */
export function getMassIntentionPageTitle(intention: {
  mass_offered_for?: string | null
}): string {
  if (intention.mass_offered_for) {
    const truncatedText = intention.mass_offered_for.substring(0, 50)
    const suffix = intention.mass_offered_for.length > 50 ? '...' : ''
    return `${truncatedText}${suffix}-Mass Intention`
  }

  return 'Mass Intention'
}

/**
 * Get event page title
 *
 * Format: Uses event name directly
 *
 * @example
 * getEventPageTitle(event) // "Christmas Mass"
 * getEventPageTitle({}) // "Event"
 */
export function getEventPageTitle(event: {
  name?: string | null
}): string {
  return event.name || 'Event'
}

/**
 * Get person page title
 *
 * Format: "FirstName LastName" or "Person"
 *
 * @example
 * getPersonPageTitle(person) // "John Smith"
 * getPersonPageTitle({}) // "Person"
 */
export function getPersonPageTitle(person: {
  first_name?: string
  last_name?: string
}): string {
  if (person.first_name || person.last_name) {
    return [person.first_name, person.last_name].filter(Boolean).join(' ')
  }
  return 'Person'
}

// ============================================================================
// FILENAME GENERATOR FUNCTIONS
// ============================================================================

/**
 * Format date for filename (YYYYMMDD format)
 *
 * @example
 * formatDateForFilename("2025-12-25") // "20251225"
 * formatDateForFilename(null) // "NoDate"
 */
export function formatDateForFilename(date?: string | null): string {
  if (!date) return 'NoDate'
  // Input is already YYYY-MM-DD format, just remove the dashes
  return date.replace(/-/g, '')
}

/**
 * Get wedding filename for downloads
 *
 * Format: "LastName-LastName-YYYYMMDD.ext"
 *
 * @example
 * getWeddingFilename(wedding, 'pdf') // "Smith-Jones-20251225.pdf"
 * getWeddingFilename(wedding, 'docx') // "Bride-Groom-NoDate.docx"
 */
export function getWeddingFilename(
  wedding: {
    bride?: { last_name?: string } | null
    groom?: { last_name?: string } | null
    wedding_event?: { start_date?: string } | null
  },
  extension: string
): string {
  const brideLastName = wedding.bride?.last_name || 'Bride'
  const groomLastName = wedding.groom?.last_name || 'Groom'
  const weddingDate = formatDateForFilename(wedding.wedding_event?.start_date)
  return `${brideLastName}-${groomLastName}-${weddingDate}.${extension}`
}

/**
 * Get funeral filename for downloads
 *
 * Format: "LastName-Funeral-YYYYMMDD.ext"
 *
 * @example
 * getFuneralFilename(funeral, 'pdf') // "Smith-Funeral-20251225.pdf"
 */
export function getFuneralFilename(
  funeral: {
    deceased?: { last_name?: string } | null
    funeral_event?: { start_date?: string } | null
  },
  extension: string
): string {
  const deceasedLastName = funeral.deceased?.last_name || 'Deceased'
  const funeralDate = formatDateForFilename(funeral.funeral_event?.start_date)
  return `${deceasedLastName}-Funeral-${funeralDate}.${extension}`
}

/**
 * Get baptism filename for downloads
 *
 * Format: "LastName-Baptism-YYYYMMDD.ext"
 *
 * @example
 * getBaptismFilename(baptism, 'pdf') // "Martinez-Baptism-20251225.pdf"
 */
export function getBaptismFilename(
  baptism: {
    child?: { last_name?: string } | null
    baptism_event?: { start_date?: string } | null
  },
  extension: string
): string {
  const childLastName = baptism.child?.last_name || 'Child'
  const baptismDate = formatDateForFilename(baptism.baptism_event?.start_date)
  return `${childLastName}-Baptism-${baptismDate}.${extension}`
}

/**
 * Get mass filename for downloads
 *
 * Format: "Mass-FirstName-LastName-YYYYMMDD.ext"
 *
 * @example
 * getMassFilename(mass, 'pdf') // "Mass-John-Smith-20251225.pdf"
 */
export function getMassFilename(
  mass: {
    presider?: { first_name?: string; last_name?: string } | null
    event?: { start_date?: string } | null
  },
  extension: string
): string {
  const presiderName = mass.presider
    ? `${mass.presider.first_name}-${mass.presider.last_name}`
    : 'Presider'
  const massDate = formatDateForFilename(mass.event?.start_date)
  return `Mass-${presiderName}-${massDate}.${extension}`
}

/**
 * Get quinceañera filename for downloads
 *
 * Format: "LastName-Quinceanera-YYYYMMDD.ext"
 *
 * @example
 * getQuinceaneraFilename(quinceanera, 'pdf') // "Garcia-Quinceanera-20251225.pdf"
 */
export function getQuinceaneraFilename(
  quinceanera: {
    quinceanera?: { last_name?: string } | null
    quinceanera_event?: { start_date?: string } | null
  },
  extension: string
): string {
  const quinceaneraLastName = quinceanera.quinceanera?.last_name || 'Quinceanera'
  const quinceaneraDate = formatDateForFilename(quinceanera.quinceanera_event?.start_date)
  return `${quinceaneraLastName}-Quinceanera-${quinceaneraDate}.${extension}`
}

/**
 * Get presentation filename for downloads
 *
 * Format: "presentation-LastName-YYYYMMDD.ext"
 *
 * @example
 * getPresentationFilename(presentation, 'pdf') // "presentation-Martinez-20251225.pdf"
 */
export function getPresentationFilename(
  presentation: {
    child?: { last_name?: string } | null
    presentation_event?: { start_date?: string } | null
  },
  extension: string
): string {
  const childLastName = presentation.child?.last_name || 'Child'
  const presentationDate = formatDateForFilename(presentation.presentation_event?.start_date)
  return `presentation-${childLastName}-${presentationDate}.${extension}`
}

/**
 * Get mass intention filename for downloads
 *
 * Format: "MassIntention-SanitizedText-YYYYMMDD.ext"
 *
 * @example
 * getMassIntentionFilename(intention, 'pdf') // "MassIntention-For-John-Doe-20251225.pdf"
 */
export function getMassIntentionFilename(
  intention: {
    mass_offered_for?: string | null
    date_requested?: string | null
  },
  extension: string
): string {
  const intentionFor = intention.mass_offered_for
    ?.substring(0, 30)
    .replace(/[^a-z0-9]/gi, '-') || 'Intention'
  const dateRequested = formatDateForFilename(intention.date_requested)
  return `MassIntention-${intentionFor}-${dateRequested}.${extension}`
}

/**
 * Get event filename for downloads
 *
 * Format: "Event-SanitizedName-YYYYMMDD.ext"
 *
 * @example
 * getEventFilename(event, 'pdf') // "Event-Christmas-Mass-20251225.pdf"
 */
export function getEventFilename(
  event: {
    name?: string | null
    start_date?: string | null
  },
  extension: string
): string {
  const sanitizedName = event.name
    ?.replace(/[^a-z0-9]/gi, '-')
    .substring(0, 30) || 'Event'
  const eventDate = formatDateForFilename(event.start_date)
  return `Event-${sanitizedName}-${eventDate}.${extension}`
}

/**
 * Get person filename for downloads
 *
 * Format: "FirstName-LastName.ext" or "Person.ext"
 *
 * @example
 * getPersonFilename(person, 'pdf') // "John-Smith.pdf"
 * getPersonFilename({}, 'pdf') // "Person.pdf"
 */
export function getPersonFilename(
  person: {
    first_name?: string
    last_name?: string
  },
  extension: string
): string {
  const firstName = person.first_name?.replace(/[^a-z0-9]/gi, '-') || ''
  const lastName = person.last_name?.replace(/[^a-z0-9]/gi, '-') || ''

  if (firstName && lastName) {
    return `${firstName}-${lastName}.${extension}`
  } else if (firstName) {
    return `${firstName}.${extension}`
  } else if (lastName) {
    return `${lastName}.${extension}`
  }

  return `Person.${extension}`
}

/**
 * Get group page title
 *
 * Format: "GroupName"
 *
 * @example
 * getGroupPageTitle(group) // "Lectors"
 * getGroupPageTitle({ name: '' }) // "Group"
 */
export function getGroupPageTitle(group: {
  name?: string
}): string {
  return group.name || 'Group'
}

/**
 * Get group filename for downloads
 *
 * Format: "GroupName.ext"
 *
 * @example
 * getGroupFilename(group, 'pdf') // "Lectors.pdf"
 * getGroupFilename({ name: '' }, 'docx') // "Group.docx"
 */
export function getGroupFilename(
  group: {
    name?: string
  },
  extension: string
): string {
  const groupName = group.name?.replace(/[^a-z0-9]/gi, '-') || 'Group'
  return `${groupName}.${extension}`
}

/**
 * Generate filename for dynamic event script exports
 *
 * Format: "LastName-ScriptName.ext"
 * Uses key person field from event type to determine last name.
 * Falls back to "Event" if no key person field or no person assigned.
 *
 * @param event - Event with relations (must include event_type with input_field_definitions and resolved_fields)
 * @param scriptName - Name of the script being exported
 * @param extension - File extension (pdf, docx, txt)
 * @returns Filename string
 *
 * @example
 * generateDynamicEventScriptFilename(event, 'English Program', 'pdf')
 * // "Garcia-English-Program.pdf"
 *
 * generateDynamicEventScriptFilename(event, 'Ceremony Script', 'docx')
 * // "Smith-Ceremony-Script.docx"
 *
 * generateDynamicEventScriptFilename(eventWithoutKeyPerson, 'Program', 'txt')
 * // "Event-Program.txt"
 */
export function generateDynamicEventScriptFilename(
  event: any,  // Using any for flexibility with different event type structures
  scriptName: string,
  extension: string
): string {
  // Find key person field from event type definition (if available)
  const keyPersonField = event.event_type?.input_field_definitions?.find(
    (field: any) => field.is_key_person === true && field.type === 'person'
  )

  let lastName = 'Event'

  if (keyPersonField && event.resolved_fields) {
    const personFieldValue = event.resolved_fields[keyPersonField.name]
    if (personFieldValue?.resolved_value?.last_name) {
      lastName = personFieldValue.resolved_value.last_name
    }
  }

  // Clean script name (remove special characters, replace spaces with hyphens)
  const cleanScriptName = scriptName
    .replace(/[^a-zA-Z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-+|-+$/g, '')

  return `${lastName}-${cleanScriptName}.${extension}`
}

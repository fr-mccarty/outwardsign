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
 * formatPersonWithPhone(person) // "John Smith (555-1234)"
 * formatPersonWithPhone(person) // "John Smith" (no phone)
 */
export function formatPersonWithPhone(
  person?: { full_name: string; phone_number?: string | null } | null
): string {
  if (!person) return ''
  return person.phone_number ? `${person.full_name} — ${person.phone_number}` : person.full_name
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
// READING FORMATTING FUNCTIONS
// ============================================================================

/**
 * Get reading pericope with empty string fallback
 *
 * @example
 * getReadingPericope(reading) // "Genesis 1:1-5"
 * getReadingPericope(null) // ""
 */
export function getReadingPericope(reading?: { pericope?: string | null } | null): string {
  return reading?.pericope || ''
}

/**
 * Get reading title with empty string fallback
 *
 * @example
 * getReadingTitle(reading) // "First Reading"
 * getReadingTitle(null) // ""
 */
export function getReadingTitle(reading?: { title?: string | null } | null): string {
  return reading?.title || ''
}

/**
 * Format reading with lector name
 * Uses database-generated full_name field
 *
 * @param reading - Reading object with pericope
 * @param lector - Person object for lector
 * @returns Formatted reading with lector
 *
 * @example
 * formatReadingWithLector(reading, lector) // "Genesis 1:1-5 (John Smith)"
 * formatReadingWithLector(reading, null) // "Genesis 1:1-5"
 */
export function formatReadingWithLector(
  reading?: { pericope?: string | null } | null,
  lector?: { full_name: string } | null
): string {
  const pericope = getReadingPericope(reading)
  if (!pericope) return ''

  if (lector) {
    return `${pericope} (${lector.full_name})`
  }

  return pericope
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
}): string {
  const presiderName = mass.presider
    ? `${mass.presider.first_name} ${mass.presider.last_name}`
    : null

  const eventDate = mass.event?.start_date
    ? new Date(mass.event.start_date).toLocaleDateString()
    : null

  if (presiderName && eventDate) {
    return `${presiderName}-${eventDate}-Mass`
  } else if (presiderName) {
    return `${presiderName}-Mass`
  } else if (eventDate) {
    return `${eventDate}-Mass`
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
  return new Date(date).toISOString().split('T')[0].replace(/-/g, '')
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

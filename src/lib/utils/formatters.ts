/**
 * Formatters - Shared Utility Functions
 *
 * Pure utility functions for formatting data across all sacraments
 */

/**
 * Format person name
 */
export function formatPersonName(person?: { first_name: string; last_name: string } | null): string {
  return person ? `${person.first_name} ${person.last_name}` : ''
}

/**
 * Format person with phone number
 */
export function formatPersonWithPhone(
  person?: { first_name: string; last_name: string; phone_number?: string } | null
): string {
  if (!person) return ''
  const name = `${person.first_name} ${person.last_name}`
  return person.phone_number ? `${name} (${person.phone_number})` : name
}

/**
 * Format event date and time
 * Returns format: "Tuesday, July 15, 2025 at 11:00 AM"
 */
export function formatEventDateTime(event?: { start_date?: string; start_time?: string } | null): string {
  if (!event?.start_date) return ''

  // Format date as "Tuesday, July 15, 2025"
  const dateObj = new Date(event.start_date)
  const date = dateObj.toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  })

  if (!event.start_time) return date

  // Parse time (format: "16:21:00" or "16:21")
  const [hours, minutes] = event.start_time.split(':').map(Number)

  // Convert to 12-hour format with AM/PM (no seconds)
  const period = hours >= 12 ? 'PM' : 'AM'
  const displayHours = hours % 12 || 12
  const displayMinutes = minutes.toString().padStart(2, '0')
  const time = `${displayHours}:${displayMinutes} ${period}`

  return `${date} at ${time}`
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

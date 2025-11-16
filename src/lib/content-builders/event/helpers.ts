/**
 * Event Template Helpers
 *
 * Shared helper functions used across all event templates
 * ALL fallback logic and conditional checks should be in this file, NOT in templates
 */

import { EventWithRelations } from '@/lib/actions/events'
import { Location } from '@/lib/types'
import { EVENT_TYPE_LABELS } from '@/lib/constants'

// ============================================================================
// EVENT TYPE HELPERS
// ============================================================================

/**
 * Get localized event type label
 */
export function getEventTypeLabel(eventType: string, language: 'en' | 'es'): string {
  return EVENT_TYPE_LABELS[eventType]?.[language] || eventType
}

// ============================================================================
// LOCATION HELPERS
// ============================================================================

/**
 * Format location text with name and optional address details
 *
 * @example
 * formatLocationText(location) // "St. Mary Church (123 Main St, Springfield, IL)"
 * formatLocationText(location) // "St. Mary Church" (if no address details)
 */
export function formatLocationText(location: Location | null | undefined): string {
  if (!location) return ''

  const addressParts = [location.street, location.city, location.state].filter(Boolean)

  if (addressParts.length > 0) {
    return `${location.name} (${addressParts.join(', ')})`
  }

  return location.name
}

/**
 * Format just the address without the location name
 */
export function formatLocationAddress(location: Location | null | undefined): string {
  if (!location) return ''

  const addressParts = [location.street, location.city, location.state].filter(Boolean)
  return addressParts.join(', ')
}

// ============================================================================
// DATE/TIME HELPERS
// ============================================================================

/**
 * Format date in long format (e.g., "Monday, January 15, 2024")
 */
export function formatEventDate(dateString: string | null | undefined, language: 'en' | 'es'): string {
  if (!dateString) return ''

  const locale = language === 'es' ? 'es-ES' : 'en-US'
  const date = new Date(dateString)

  return date.toLocaleDateString(locale, {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  })
}

/**
 * Format time (e.g., "3:00 PM")
 * Converts military time (16:00:00) to 12-hour format (4:00 PM)
 */
export function formatEventTime(timeString: string | null | undefined): string {
  if (!timeString) return ''

  // Parse time (format: "16:21:00" or "16:21")
  const [hours, minutes] = timeString.split(':').map(Number)

  // Convert to 12-hour format with AM/PM (no seconds)
  const period = hours >= 12 ? 'PM' : 'AM'
  const displayHours = hours % 12 || 12
  const displayMinutes = minutes.toString().padStart(2, '0')

  return `${displayHours}:${displayMinutes} ${period}`
}

/**
 * Format date and time together
 */
export function formatEventDateTime(event: EventWithRelations, language: 'en' | 'es'): string {
  const datePart = formatEventDate(event.start_date, language)
  const timePart = formatEventTime(event.start_time)

  if (datePart && timePart) {
    return `${datePart} at ${timePart}`
  }

  return datePart || timePart || ''
}

/**
 * Check if event has end date/time
 */
export function hasEndDateTime(event: EventWithRelations): boolean {
  return !!(event.end_date || event.end_time)
}

/**
 * Format end date and time
 */
export function formatEventEndDateTime(event: EventWithRelations, language: 'en' | 'es'): string {
  const datePart = formatEventDate(event.end_date, language)
  const timePart = formatEventTime(event.end_time)

  if (datePart && timePart) {
    return `${datePart} at ${timePart}`
  }

  return datePart || timePart || ''
}

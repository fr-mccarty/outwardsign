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

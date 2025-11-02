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
 */
export function formatEventDateTime(event?: { start_date?: string; start_time?: string } | null): string {
  if (!event?.start_date) return ''
  const date = new Date(event.start_date).toLocaleDateString()
  return event.start_time ? `${date} at ${event.start_time}` : date
}

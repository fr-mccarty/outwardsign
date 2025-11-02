/**
 * Formats event date and time for display
 * @param date - Date string in YYYY-MM-DD format
 * @param time - Time string in HH:MM format
 * @returns Formatted date and time string
 */
export function formatEventDateTime(date: string, time: string): string {
  try {
    const dateObj = new Date(`${date}T${time}`)

    // Format: "Monday, January 1, 2024 at 2:00 PM"
    const formattedDate = dateObj.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })

    const formattedTime = dateObj.toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    })

    return `${formattedDate} at ${formattedTime}`
  } catch (error) {
    console.error('Error formatting date/time:', error)
    return `${date} ${time}`
  }
}

/**
 * Formats a date string for display
 * @param date - Date string in YYYY-MM-DD format
 * @returns Formatted date string
 */
export function formatDate(date: string): string {
  try {
    const dateObj = new Date(date)
    return dateObj.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  } catch (error) {
    console.error('Error formatting date:', error)
    return date
  }
}

/**
 * Formats a time string for display
 * @param time - Time string in HH:MM format
 * @returns Formatted time string
 */
export function formatTime(time: string): string {
  try {
    // Create a date object with an arbitrary date to parse the time
    const dateObj = new Date(`2000-01-01T${time}`)
    return dateObj.toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    })
  } catch (error) {
    console.error('Error formatting time:', error)
    return time
  }
}

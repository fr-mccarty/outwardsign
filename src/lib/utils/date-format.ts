/**
 * Formats a date as numeric (e.g., "7/15/2025")
 * @param date - Date string or Date object
 * @returns Formatted date string
 */
export function formatDateNumeric(date: string | Date): string {
  try {
    const dateObj = typeof date === 'string' ? new Date(date) : date
    return dateObj.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'numeric',
      day: 'numeric'
    })
  } catch (error) {
    console.error('Error formatting date:', error)
    return String(date)
  }
}

/**
 * Formats a date as short (e.g., "Jul 15, 2025")
 * @param date - Date string or Date object
 * @returns Formatted date string
 */
export function formatDateShort(date: string | Date): string {
  try {
    const dateObj = typeof date === 'string' ? new Date(date) : date
    return dateObj.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  } catch (error) {
    console.error('Error formatting date:', error)
    return String(date)
  }
}

/**
 * Formats a date as pretty (e.g., "July 15, 2025")
 * @param date - Date string or Date object
 * @returns Formatted date string
 */
export function formatDatePretty(date: string | Date): string {
  try {
    const dateObj = typeof date === 'string' ? new Date(date) : date
    return dateObj.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  } catch (error) {
    console.error('Error formatting date:', error)
    return String(date)
  }
}

/**
 * Formats a date as long (e.g., "Tuesday, July 15, 2025")
 * @param date - Date string or Date object
 * @returns Formatted date string
 */
export function formatDateLong(date: string | Date): string {
  try {
    const dateObj = typeof date === 'string' ? new Date(date) : date
    return dateObj.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  } catch (error) {
    console.error('Error formatting date:', error)
    return String(date)
  }
}

/**
 * Formats a date as relative time (e.g., "in 2 months", "3 days ago", "today")
 * @param date - Date string or Date object
 * @returns Formatted relative date string
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
 * @deprecated Use formatDatePretty instead
 */
export function formatDate(date: string): string {
  return formatDatePretty(date)
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

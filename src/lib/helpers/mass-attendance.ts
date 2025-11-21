import { getMassTimesWithItems, type MassTimesTemplateWithItems } from '@/lib/actions/mass-times-templates'
import { formatTime } from '@/lib/utils/formatters'
import { LITURGICAL_DAYS_OF_WEEK_LABELS, type LiturgicalDayOfWeek } from '@/lib/constants'

export interface MassTimeOption {
  id: string
  label: string
  displayDayKey: LiturgicalDayOfWeek // The uppercase key for sorting (e.g., "SATURDAY", "SUNDAY")
  displayDayName: string // The localized display name (e.g., "Saturday", "Sunday")
  templateName: string
  dayOfWeek: string
  time: string
  dayType: 'IS_DAY' | 'DAY_BEFORE'
}

/**
 * Get the day key and display name based on template day and day_type
 * If day_type is DAY_BEFORE, returns the previous day
 * Example: Sunday template with DAY_BEFORE -> SATURDAY / "Saturday"
 */
function getDisplayDay(templateDayOfWeek: string, dayType: 'IS_DAY' | 'DAY_BEFORE'): { key: LiturgicalDayOfWeek; name: string } {
  if (dayType === 'IS_DAY') {
    const key = templateDayOfWeek as LiturgicalDayOfWeek
    return {
      key,
      name: LITURGICAL_DAYS_OF_WEEK_LABELS[key]?.en || templateDayOfWeek
    }
  }

  // Map for getting the previous day
  const previousDayMap: Record<string, LiturgicalDayOfWeek> = {
    'SUNDAY': 'SATURDAY',
    'MONDAY': 'SUNDAY',
    'TUESDAY': 'MONDAY',
    'WEDNESDAY': 'TUESDAY',
    'THURSDAY': 'WEDNESDAY',
    'FRIDAY': 'THURSDAY',
    'SATURDAY': 'FRIDAY',
    'MOVABLE': 'MOVABLE' // For movable feasts, keep as movable
  }

  const key = previousDayMap[templateDayOfWeek] || templateDayOfWeek as LiturgicalDayOfWeek
  return {
    key,
    name: key === 'MOVABLE' ? 'Day Before' : LITURGICAL_DAYS_OF_WEEK_LABELS[key]?.en || key
  }
}

/**
 * Get all available mass times across all active templates with formatted labels
 * Returns options like "Saturday - 5:00 PM" or "Sunday - 10:00 AM"
 */
export async function getAllMassTimeOptions(): Promise<MassTimeOption[]> {
  try {
    const templates = await getMassTimesWithItems({ is_active: true })
    const options: MassTimeOption[] = []

    for (const template of templates) {
      if (template.items) {
        for (const item of template.items) {
          const displayDay = getDisplayDay(template.day_of_week, item.day_type as 'IS_DAY' | 'DAY_BEFORE')

          options.push({
            id: item.id,
            label: `${displayDay.name} - ${formatTime(item.time)}`,
            displayDayKey: displayDay.key,
            displayDayName: displayDay.name,
            templateName: template.name,
            dayOfWeek: template.day_of_week,
            time: item.time,
            dayType: item.day_type as 'IS_DAY' | 'DAY_BEFORE',
          })
        }
      }
    }

    return options
  } catch (error) {
    console.error('Error fetching mass time options:', error)
    return []
  }
}

/**
 * Get formatted labels for selected mass time IDs
 * Used to display which masses a person attends
 * Returns array of formatted strings like ["Sunday - 10:00 AM (Day Of)", "Saturday - 5:00 PM (Day Before)"]
 */
export async function getFormattedMassAttendance(massTimeIds: string[]): Promise<string[]> {
  if (!massTimeIds || massTimeIds.length === 0) {
    return []
  }

  try {
    const allOptions = await getAllMassTimeOptions()
    const selectedOptions = allOptions.filter(option => massTimeIds.includes(option.id))
    return selectedOptions.map(option => option.label)
  } catch (error) {
    console.error('Error formatting mass attendance:', error)
    return []
  }
}

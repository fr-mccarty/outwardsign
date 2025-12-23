import { getEventWithRelations } from '@/lib/actions/master-events'
import { buildMassRosterContent } from '@/lib/content-builders/mass-liturgy-roster'
import { createWordRoute } from '@/lib/api/document-routes'
import { formatDateForFilename } from '@/lib/utils/formatters'

export const GET = createWordRoute({
  entityName: 'Mass Roster',
  fetchEntity: getEventWithRelations,
  buildContent: buildMassRosterContent,
  getFilename: (mass) => {
    // Get date from first calendar event
    const primaryCalendarEvent = mass.calendar_events?.find(ce => ce.show_on_calendar) || mass.calendar_events?.[0]
    const dateStr = formatDateForFilename(primaryCalendarEvent?.start_datetime)
    return `Mass-Roster-${dateStr}.docx`
  }
})

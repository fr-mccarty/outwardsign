import { requireParishionerAuth } from '@/lib/parishioner-auth/middleware'
import { CalendarView } from './calendar-view'
import { getCalendarEvents } from './actions'

export default async function ParishionerCalendarPage() {
  const { personId } = await requireParishionerAuth()

  // Get events for next 90 days
  const startDate = new Date().toISOString().split('T')[0]
  const endDate = new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]

  const events = await getCalendarEvents(personId, startDate, endDate)

  return (
    <div className="container mx-auto p-4 max-w-6xl">
      <CalendarView events={events} />
    </div>
  )
}

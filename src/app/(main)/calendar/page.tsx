import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { getCalendarEventsForCalendar } from '@/lib/actions/parish-events'
import { CalendarClient } from './calendar-client'

interface CalendarPageProps {
  searchParams: Promise<{
    view?: string
    date?: string
  }>
}

export default async function CalendarPage({ searchParams }: CalendarPageProps) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  // Fetch all occasions for calendar display
  const occasions = await getCalendarEventsForCalendar()

  const params = await searchParams
  const view = (params.view || 'month') as 'month' | 'week' | 'day'
  const dateParam = params.date

  return (
    <CalendarClient
      occasions={occasions}
      initialView={view}
      initialDate={dateParam}
    />
  )
}

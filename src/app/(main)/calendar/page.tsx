import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { getEvents } from '@/lib/actions/events'
import { CalendarClient } from './calendar-client'

interface CalendarPageProps {
  searchParams: {
    view?: string
  }
}

export default async function CalendarPage({ searchParams }: CalendarPageProps) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  // Fetch all events
  const events = await getEvents()

  const view = (searchParams.view || 'month') as 'month' | 'week' | 'day'

  return (
    <CalendarClient
      events={events}
      initialView={view}
    />
  )
}

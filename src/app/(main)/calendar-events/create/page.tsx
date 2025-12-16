import { BreadcrumbSetter } from '@/components/breadcrumb-setter'
import { CalendarEventFormWrapper } from '../calendar-event-form-wrapper'
import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'

export default async function CalendarEventCreatePage() {
  const supabase = await createClient()

  // Check authentication server-side
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    redirect('/login')
  }

  const breadcrumbs = [
    { label: "Dashboard", href: "/dashboard" },
    { label: "Calendar Events", href: "/calendar-events" },
    { label: "Create" }
  ]

  return (
    <>
      <BreadcrumbSetter breadcrumbs={breadcrumbs} />
      <CalendarEventFormWrapper />
    </>
  )
}

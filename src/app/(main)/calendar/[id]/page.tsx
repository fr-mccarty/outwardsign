import { PageContainer } from '@/components/page-container'
import { BreadcrumbSetter } from '@/components/breadcrumb-setter'
import { createClient } from '@/lib/supabase/server'
import { redirect, notFound } from 'next/navigation'
import { getCalendarEntry } from "@/lib/actions/calendar"
import { CalendarViewClient } from './calendar-view-client'

interface PageProps {
  params: Promise<{ id: string }>
}

export default async function CalendarDetailPage({ params }: PageProps) {
  const supabase = await createClient()

  // Check authentication server-side
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    redirect('/login')
  }

  const { id } = await params
  const entry = await getCalendarEntry(id)

  if (!entry) {
    notFound()
  }

  const breadcrumbs = [
    { label: "Dashboard", href: "/dashboard" },
    { label: "Liturgical Calendar", href: "/calendar?view=month" },
    { label: entry.title }
  ]

  return (
    <PageContainer
      title={entry.title}
      description={`${entry.liturgical_rank || 'Event'} - ${new Date(entry.date).toLocaleDateString()}`}
    >
      <BreadcrumbSetter breadcrumbs={breadcrumbs} />
      <CalendarViewClient entry={entry} entryId={id} />
    </PageContainer>
  )
}

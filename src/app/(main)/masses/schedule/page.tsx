import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { BreadcrumbSetter } from '@/components/breadcrumb-setter'
import { ScheduleMassesClient } from './schedule-masses-client'
import { getMassTimesWithItems } from '@/lib/actions/mass-times-templates'
import { getMassRolesWithCounts } from '@/lib/actions/mass-roles'
import { getEventTypesBySystemType } from '@/lib/actions/event-types'

export const dynamic = 'force-dynamic'

export default async function ScheduleMassesPage() {
  const supabase = await createClient()

  // Check authentication server-side
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    redirect('/login')
  }

  // Fetch data server-side
  // - Mass event types with role_definitions (replaces old role templates)
  // - Mass times templates for scheduling
  // - Mass roles with counts for minister pool display
  const [massEventTypes, massTimesTemplates, massRolesWithCounts] = await Promise.all([
    getEventTypesBySystemType('mass'),
    getMassTimesWithItems({ is_active: true }),
    getMassRolesWithCounts()
  ])

  const breadcrumbs = [
    { label: "Dashboard", href: "/dashboard" },
    { label: "Masses", href: "/masses" },
    { label: "Schedule Masses", href: "/masses/schedule" }
  ]

  return (
    <>
      <BreadcrumbSetter breadcrumbs={breadcrumbs} />
      <ScheduleMassesClient
        massEventTypes={massEventTypes}
        massTimesTemplates={massTimesTemplates}
        massRolesWithCounts={massRolesWithCounts}
      />
    </>
  )
}

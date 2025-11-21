import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { BreadcrumbSetter } from '@/components/breadcrumb-setter'
import { ScheduleMassesClient } from './schedule-masses-client'
import { getMassRoleTemplatesWithItems } from '@/lib/actions/mass-role-templates'
import { getMassTimesWithItems } from '@/lib/actions/mass-times-templates'
import { getMassRolesWithCounts } from '@/lib/actions/mass-roles'

export const dynamic = 'force-dynamic'

export default async function ScheduleMassesPage() {
  const supabase = await createClient()

  // Check authentication server-side
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    redirect('/login')
  }

  // Fetch templates server-side
  const [roleTemplates, massTimesTemplates, massRolesWithCounts] = await Promise.all([
    getMassRoleTemplatesWithItems(),
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
        templates={roleTemplates}
        massTimesTemplates={massTimesTemplates}
        massRolesWithCounts={massRolesWithCounts}
      />
    </>
  )
}

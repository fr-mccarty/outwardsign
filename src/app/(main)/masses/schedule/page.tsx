import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { BreadcrumbSetter } from '@/components/breadcrumb-setter'
import { ScheduleMassesClient } from './schedule-masses-client'
import { getMassRoleTemplates } from '@/lib/actions/mass-role-templates'

export const dynamic = 'force-dynamic'

export default async function ScheduleMassesPage() {
  const supabase = await createClient()

  // Check authentication server-side
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    redirect('/login')
  }

  // Fetch templates server-side for Step 3
  const templates = await getMassRoleTemplates()

  const breadcrumbs = [
    { label: "Dashboard", href: "/dashboard" },
    { label: "Masses", href: "/masses" },
    { label: "Schedule Masses" }
  ]

  return (
    <>
      <BreadcrumbSetter breadcrumbs={breadcrumbs} />
      <ScheduleMassesClient templates={templates} />
    </>
  )
}

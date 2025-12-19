import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { BreadcrumbSetter } from '@/components/breadcrumb-setter'
import { MassTimeFormWrapper } from '../mass-time-form-wrapper'

export default async function CreateMassTimePage() {
  const supabase = await createClient()

  // Check authentication server-side
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) {
    redirect('/login')
  }

  const breadcrumbs = [
    { label: 'Dashboard', href: '/dashboard' },
    { label: 'Settings', href: '/settings' },
    { label: 'Mass Configuration', href: '/settings/mass-configuration' },
    { label: 'Recurring Schedule', href: '/settings/mass-configuration/recurring-schedule' },
    { label: 'Create' },
  ]

  return (
    <>
      <BreadcrumbSetter breadcrumbs={breadcrumbs} />
      <MassTimeFormWrapper />
    </>
  )
}

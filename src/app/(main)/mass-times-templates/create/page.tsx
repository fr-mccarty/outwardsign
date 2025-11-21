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
    { label: 'Mass Times Templates', href: '/mass-times-templates' },
    { label: 'Create' },
  ]

  return (
    <>
      <BreadcrumbSetter breadcrumbs={breadcrumbs} />
      <MassTimeFormWrapper />
    </>
  )
}

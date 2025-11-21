import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { BreadcrumbSetter } from '@/components/breadcrumb-setter'
import { MassRoleFormWrapper } from '../mass-role-form-wrapper'

export const dynamic = 'force-dynamic'

export default async function CreateMassRolePage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  const breadcrumbs = [
    { label: 'Dashboard', href: '/dashboard' },
    { label: 'Settings', href: '/settings' },
    { label: 'Mass Roles', href: '/settings/mass-roles' },
    { label: 'Create Mass Role' }
  ]

  return (
    <>
      <BreadcrumbSetter breadcrumbs={breadcrumbs} />
      <MassRoleFormWrapper />
    </>
  )
}

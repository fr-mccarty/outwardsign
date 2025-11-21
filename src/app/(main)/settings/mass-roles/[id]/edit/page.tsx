import { createClient } from '@/lib/supabase/server'
import { redirect, notFound } from 'next/navigation'
import { BreadcrumbSetter } from '@/components/breadcrumb-setter'
import { getMassRoleWithRelations } from '@/lib/actions/mass-roles'
import { MassRoleFormWrapper } from '../../mass-role-form-wrapper'

export const dynamic = 'force-dynamic'

interface PageProps {
  params: Promise<{ id: string }>
}

export default async function EditMassRolePage({ params }: PageProps) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  const { id } = await params
  const massRole = await getMassRoleWithRelations(id)

  if (!massRole) {
    notFound()
  }

  const breadcrumbs = [
    { label: 'Dashboard', href: '/dashboard' },
    { label: 'Settings', href: '/settings' },
    { label: 'Mass Roles', href: '/settings/mass-roles' },
    { label: massRole.name, href: `/settings/mass-roles/${massRole.id}` },
    { label: 'Edit' }
  ]

  return (
    <>
      <BreadcrumbSetter breadcrumbs={breadcrumbs} />
      <MassRoleFormWrapper massRole={massRole} />
    </>
  )
}

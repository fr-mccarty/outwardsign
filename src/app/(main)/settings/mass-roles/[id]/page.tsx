import { createClient } from '@/lib/supabase/server'
import { redirect, notFound } from 'next/navigation'
import { BreadcrumbSetter } from '@/components/breadcrumb-setter'
import { getMassRoleWithRelations } from '@/lib/actions/mass-roles'
import { MassRoleViewClient } from './mass-role-view-client'

export const dynamic = 'force-dynamic'

interface PageProps {
  params: Promise<{ id: string }>
}

export default async function MassRoleViewPage({ params }: PageProps) {
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
    { label: massRole.name }
  ]

  return (
    <>
      <BreadcrumbSetter breadcrumbs={breadcrumbs} />
      <MassRoleViewClient massRole={massRole} />
    </>
  )
}

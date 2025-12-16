import { BreadcrumbSetter } from '@/components/breadcrumb-setter'
import { createClient } from '@/lib/supabase/server'
import { redirect, notFound } from 'next/navigation'
import { getEventWithRelations, computeMasterEventTitle } from '@/lib/actions/master-events'
import { MassFormWrapper } from '../../mass-form-wrapper'

interface PageProps {
  params: Promise<{ id: string }>
}

export default async function EditMassPage({ params }: PageProps) {
  const supabase = await createClient()

  // Check authentication server-side
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    redirect('/login')
  }

  const { id } = await params
  const mass = await getEventWithRelations(id)

  if (!mass) {
    notFound()
  }

  // Build dynamic title from computeMasterEventTitle
  const title = await computeMasterEventTitle(mass)

  const breadcrumbs = [
    { label: "Dashboard", href: "/dashboard" },
    { label: "Masses", href: "/masses" },
    { label: "Edit" }
  ]

  return (
    <>
      <BreadcrumbSetter breadcrumbs={breadcrumbs} />
      <MassFormWrapper
        mass={mass as any} // TODO: Update MassFormWrapper to work with MasterEventWithRelations
        title={title}
        description="Update Mass information."
      />
    </>
  )
}

import { createClient } from '@/lib/supabase/server'
import { redirect, notFound } from 'next/navigation'
import { BreadcrumbSetter } from '@/components/breadcrumb-setter'
import { getMassTimeWithRelations } from '@/lib/actions/mass-times'
import { MassTimeFormWrapper } from '../../mass-time-form-wrapper'

interface PageProps {
  params: Promise<{
    id: string
  }>
}

export default async function EditMassTimePage({ params }: PageProps) {
  const supabase = await createClient()

  // Check authentication server-side
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) {
    redirect('/login')
  }

  // Parse params (Next.js 15 requires await)
  const { id } = await params

  // Fetch mass times template
  const massTime = await getMassTimeWithRelations(id)
  if (!massTime) {
    notFound()
  }

  // Build dynamic title from template name
  const title = `Edit ${massTime.name || 'Mass Times Template'}`

  const breadcrumbs = [
    { label: 'Dashboard', href: '/dashboard' },
    { label: 'Mass Times Templates', href: '/mass-times' },
    {
      label: massTime.name || 'Template',
      href: `/mass-times/${id}`,
    },
    { label: 'Edit' },
  ]

  return (
    <>
      <BreadcrumbSetter breadcrumbs={breadcrumbs} />
      <MassTimeFormWrapper
        massTime={massTime}
        title={title}
        description="Edit mass times template details."
      />
    </>
  )
}

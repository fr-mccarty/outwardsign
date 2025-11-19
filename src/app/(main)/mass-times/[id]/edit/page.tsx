import { createClient } from '@/lib/supabase/server'
import { redirect, notFound } from 'next/navigation'
import { PageContainer } from '@/components/page-container'
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

  // Fetch mass time with relations
  const massTime = await getMassTimeWithRelations(id)
  if (!massTime) {
    notFound()
  }

  // Build dynamic title from mass type
  const title = `Edit ${massTime.mass_type?.label_en || 'Mass Time'}`

  const breadcrumbs = [
    { label: 'Dashboard', href: '/dashboard' },
    { label: 'Mass Times', href: '/mass-times' },
    {
      label: massTime.mass_type?.label_en || 'Mass Time',
      href: `/mass-times/${id}`,
    },
    { label: 'Edit' },
  ]

  return (
    <PageContainer
      title={title}
      description="Edit mass time details and schedule information."
    >
      <BreadcrumbSetter breadcrumbs={breadcrumbs} />
      <MassTimeFormWrapper massTime={massTime} />
    </PageContainer>
  )
}

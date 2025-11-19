import { createClient } from '@/lib/supabase/server'
import { redirect, notFound } from 'next/navigation'
import { PageContainer } from '@/components/page-container'
import { BreadcrumbSetter } from '@/components/breadcrumb-setter'
import { getMassTimeWithRelations } from '@/lib/actions/mass-times'
import { MassTimeViewClient } from './mass-time-view-client'

interface PageProps {
  params: Promise<{
    id: string
  }>
}

export default async function MassTimeViewPage({ params }: PageProps) {
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
  const title = massTime.mass_type?.label_en || 'Mass Time'

  const breadcrumbs = [
    { label: 'Dashboard', href: '/dashboard' },
    { label: 'Mass Times', href: '/mass-times' },
    { label: 'View' },
  ]

  return (
    <PageContainer
      title={title}
      description="View mass time details and schedule information."
    >
      <BreadcrumbSetter breadcrumbs={breadcrumbs} />
      <MassTimeViewClient massTime={massTime} />
    </PageContainer>
  )
}

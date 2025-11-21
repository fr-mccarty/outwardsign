import { createClient } from '@/lib/supabase/server'
import { redirect, notFound } from 'next/navigation'
import { PageContainer } from '@/components/page-container'
import { BreadcrumbSetter } from '@/components/breadcrumb-setter'
import { getMassTimeWithRelations } from '@/lib/actions/mass-times'
import { getTemplateItems } from '@/lib/actions/mass-times-template-items'
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

  // Fetch mass times template and items
  const massTime = await getMassTimeWithRelations(id)
  if (!massTime) {
    notFound()
  }
  const items = await getTemplateItems(id)

  // Build dynamic title from template name
  const title = massTime.name || 'Mass Times Template'

  const breadcrumbs = [
    { label: 'Dashboard', href: '/dashboard' },
    { label: 'Mass Times Templates', href: '/mass-times-templates' },
    { label: 'View' },
  ]

  return (
    <PageContainer
      title={title}
      description="View mass times template details."
    >
      <BreadcrumbSetter breadcrumbs={breadcrumbs} />
      <MassTimeViewClient massTime={massTime} items={items} />
    </PageContainer>
  )
}

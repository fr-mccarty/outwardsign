import { PageContainer } from '@/components/page-container'
import { BreadcrumbSetter } from '@/components/breadcrumb-setter'
import { createClient } from '@/lib/supabase/server'
import { redirect, notFound } from 'next/navigation'
import { getMassWithRelations } from '@/lib/actions/masses'
import { MassViewClient } from './mass-view-client'
import { getMassPageTitle } from '@/lib/utils/formatters'

interface PageProps {
  params: Promise<{ id: string }>
}

export default async function ViewMassPage({ params }: PageProps) {
  const supabase = await createClient()

  // Check authentication server-side
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    redirect('/login')
  }

  const { id } = await params
  const mass = await getMassWithRelations(id)

  if (!mass) {
    notFound()
  }

  // Build dynamic title from presider name and date
  const title = getMassPageTitle(mass)

  const breadcrumbs = [
    { label: "Dashboard", href: "/dashboard" },
    { label: "Masses", href: "/masses" },
    { label: "View" }
  ]

  return (
    <PageContainer
      title={title}
      description="Preview and download Mass liturgy documents."
    >
      <BreadcrumbSetter breadcrumbs={breadcrumbs} />
      <MassViewClient mass={mass} />
    </PageContainer>
  )
}

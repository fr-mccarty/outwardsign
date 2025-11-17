import { PageContainer } from '@/components/page-container'
import { BreadcrumbSetter } from '@/components/breadcrumb-setter'
import { createClient } from '@/lib/supabase/server'
import { redirect, notFound } from 'next/navigation'
import { getBaptismWithRelations } from '@/lib/actions/baptisms'
import { BaptismViewClient } from './baptism-view-client'
import { getBaptismPageTitle } from '@/lib/utils/formatters'

interface PageProps {
  params: Promise<{ id: string }>
}

export default async function ViewBaptismPage({ params }: PageProps) {
  const supabase = await createClient()

  // Check authentication server-side
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    redirect('/login')
  }

  const { id } = await params
  const baptism = await getBaptismWithRelations(id)

  if (!baptism) {
    notFound()
  }

  // Build dynamic title from child name
  const title = getBaptismPageTitle(baptism)

  const breadcrumbs = [
    { label: "Dashboard", href: "/dashboard" },
    { label: "Our Baptisms", href: "/baptisms" },
    { label: "View" }
  ]

  return (
    <PageContainer
      title={title}
      description="Preview and download baptism liturgy documents."
    >
      <BreadcrumbSetter breadcrumbs={breadcrumbs} />
      <BaptismViewClient baptism={baptism} />
    </PageContainer>
  )
}

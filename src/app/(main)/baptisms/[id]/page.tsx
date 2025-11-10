import { PageContainer } from '@/components/page-container'
import { BreadcrumbSetter } from '@/components/breadcrumb-setter'
import { createClient } from '@/lib/supabase/server'
import { redirect, notFound } from 'next/navigation'
import { getBaptismWithRelations } from '@/lib/actions/baptisms'
import { BaptismViewClient } from './baptism-view-client'

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
  const child = (baptism as any).child
  let title = "Baptism Liturgy"

  if (child?.last_name) {
    title = `${child.first_name || ''} ${child.last_name} Baptism`.trim()
  } else if (child?.first_name) {
    title = `${child.first_name} Baptism`
  }

  const breadcrumbs = [
    { label: "Dashboard", href: "/dashboard" },
    { label: "Baptisms", href: "/baptisms" },
    { label: "View" }
  ]

  return (
    <PageContainer
      title={title}
      description="Preview and download baptism liturgy documents."
      maxWidth="7xl"
    >
      <BreadcrumbSetter breadcrumbs={breadcrumbs} />
      <BaptismViewClient baptism={baptism} />
    </PageContainer>
  )
}

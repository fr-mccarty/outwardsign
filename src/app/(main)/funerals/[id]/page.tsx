import { PageContainer } from '@/components/page-container'
import { BreadcrumbSetter } from '@/components/breadcrumb-setter'
import { createClient } from '@/lib/supabase/server'
import { redirect, notFound } from 'next/navigation'
import { getFuneralWithRelations } from '@/lib/actions/funerals'
import { FuneralViewClient } from './funeral-view-client'

interface PageProps {
  params: Promise<{ id: string }>
}

export default async function ViewFuneralPage({ params }: PageProps) {
  const supabase = await createClient()

  // Check authentication server-side
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    redirect('/login')
  }

  const { id } = await params
  const funeral = await getFuneralWithRelations(id)

  if (!funeral) {
    notFound()
  }

  // Build dynamic title from deceased name
  const deceased = (funeral as any).deceased
  let title = "Funeral"

  if (deceased?.last_name) {
    title = `${deceased.first_name ? deceased.first_name + ' ' : ''}${deceased.last_name}-Funeral`
  }

  const breadcrumbs = [
    { label: "Dashboard", href: "/dashboard" },
    { label: "Our Funerals", href: "/funerals" },
    { label: "View" }
  ]

  return (
    <PageContainer
      title={title}
      description="Preview and download funeral liturgy documents."
    >
      <BreadcrumbSetter breadcrumbs={breadcrumbs} />
      <FuneralViewClient funeral={funeral} />
    </PageContainer>
  )
}

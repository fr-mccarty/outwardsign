import { PageContainer } from '@/components/page-container'
import { BreadcrumbSetter } from '@/components/breadcrumb-setter'
import { createClient } from '@/lib/supabase/server'
import { redirect, notFound } from 'next/navigation'
import { getWeddingWithRelations } from '@/lib/actions/weddings'
import { WeddingViewClient } from './wedding-view-client'
import { getWeddingPageTitle } from '@/lib/utils/formatters'

interface PageProps {
  params: Promise<{ id: string }>
}

export default async function ViewWeddingPage({ params }: PageProps) {
  const supabase = await createClient()

  // Check authentication server-side
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    redirect('/login')
  }

  const { id } = await params
  const wedding = await getWeddingWithRelations(id)

  if (!wedding) {
    notFound()
  }

  // Build dynamic title from bride and groom names
  const title = getWeddingPageTitle(wedding)

  const breadcrumbs = [
    { label: "Dashboard", href: "/dashboard" },
    { label: "Our Weddings", href: "/weddings" },
    { label: "View" }
  ]

  return (
    <PageContainer
      title={title}
      description="Preview and download wedding liturgy documents."
    >
      <BreadcrumbSetter breadcrumbs={breadcrumbs} />
      <WeddingViewClient wedding={wedding} />
    </PageContainer>
  )
}

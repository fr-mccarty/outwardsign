import { PageContainer } from '@/components/page-container'
import { BreadcrumbSetter } from '@/components/breadcrumb-setter'
import { createClient } from '@/lib/supabase/server'
import { redirect, notFound } from 'next/navigation'
import { getQuinceaneraWithRelations } from '@/lib/actions/quinceaneras'
import { QuinceaneraViewClient } from './quinceanera-view-client'

interface PageProps {
  params: Promise<{ id: string }>
}

export default async function ViewQuinceaneraPage({ params }: PageProps) {
  const supabase = await createClient()

  // Check authentication server-side
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    redirect('/login')
  }

  const { id } = await params
  const quinceanera = await getQuinceaneraWithRelations(id)

  if (!quinceanera) {
    notFound()
  }

  // Build dynamic title from quinceañera name
  const quinceaneraGirl = quinceanera.quinceanera
  let title = "Quinceañera"

  if (quinceaneraGirl?.last_name) {
    title = `${quinceaneraGirl.last_name}-Quinceañera`
  }

  const breadcrumbs = [
    { label: "Dashboard", href: "/dashboard" },
    { label: "Our Quinceañeras", href: "/quinceaneras" },
    { label: "View" }
  ]

  return (
    <PageContainer
      title={title}
      description="Preview and download quinceañera liturgy documents."
      maxWidth="7xl"
    >
      <BreadcrumbSetter breadcrumbs={breadcrumbs} />
      <QuinceaneraViewClient quinceanera={quinceanera} />
    </PageContainer>
  )
}

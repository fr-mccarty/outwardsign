import { createClient } from '@/lib/supabase/server'
import { redirect, notFound } from 'next/navigation'
import { PageContainer } from '@/components/page-container'
import { BreadcrumbSetter } from '@/components/breadcrumb-setter'
import { OciaSessionViewClient } from './ocia-session-view-client'
import { getOciaSessionWithRelations } from '@/lib/actions/ocia-sessions'

interface PageProps {
  params: Promise<{ id: string }>
}

export default async function OciaSessionPage({ params }: PageProps) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { id } = await params
  const ociaSession = await getOciaSessionWithRelations(id)
  if (!ociaSession) notFound()

  // Build dynamic title from OCIA session data
  const title = ociaSession.name

  const breadcrumbs = [
    { label: 'Dashboard', href: '/dashboard' },
    { label: 'Our OCIA Sessions', href: '/ocia-sessions' },
    { label: 'View' }
  ]

  return (
    <PageContainer
      title={title}
      description="View OCIA session details and manage candidates."
    >
      <BreadcrumbSetter breadcrumbs={breadcrumbs} />
      <OciaSessionViewClient ociaSession={ociaSession} />
    </PageContainer>
  )
}

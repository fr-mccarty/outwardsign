import { createClient } from '@/lib/supabase/server'
import { redirect, notFound } from 'next/navigation'
import { BreadcrumbSetter } from '@/components/breadcrumb-setter'
import { OciaSessionFormWrapper } from '../../ocia-session-form-wrapper'
import { getOciaSessionWithRelations } from '@/lib/actions/ocia-sessions'

interface PageProps {
  params: Promise<{ id: string }>
}

export default async function EditOciaSessionPage({ params }: PageProps) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { id } = await params
  const ociaSession = await getOciaSessionWithRelations(id)
  if (!ociaSession) notFound()

  const breadcrumbs = [
    { label: 'Dashboard', href: '/dashboard' },
    { label: 'Our OCIA Sessions', href: '/ocia-sessions' },
    { label: ociaSession.name || 'View', href: `/ocia-sessions/${id}` },
    { label: 'Edit', href: `/ocia-sessions/${id}/edit` }
  ]

  return (
    <>
      <BreadcrumbSetter breadcrumbs={breadcrumbs} />
      <OciaSessionFormWrapper
        ociaSession={ociaSession}
        title="Edit OCIA Session"
        description="Update OCIA session details and manage candidates in this session."
      />
    </>
  )
}

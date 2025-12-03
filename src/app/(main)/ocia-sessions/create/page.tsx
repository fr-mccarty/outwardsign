import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { BreadcrumbSetter } from '@/components/breadcrumb-setter'
import { OciaSessionFormWrapper } from '../ocia-session-form-wrapper'

export default async function CreateOciaSessionPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const breadcrumbs = [
    { label: 'Dashboard', href: '/dashboard' },
    { label: 'Our OCIA Sessions', href: '/ocia-sessions' },
    { label: 'Create', href: '/ocia-sessions/create' }
  ]

  return (
    <>
      <BreadcrumbSetter breadcrumbs={breadcrumbs} />
      <OciaSessionFormWrapper
        title="Create OCIA Session"
        description="Create a new OCIA session for managing candidates."
      />
    </>
  )
}

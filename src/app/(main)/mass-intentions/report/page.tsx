import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { MassIntentionsReportClient } from './report-client'
import { BreadcrumbSetter } from '@/components/breadcrumb-setter'

export default async function MassIntentionsReportPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  return (
    <>
      <BreadcrumbSetter
        breadcrumbs={[
          { label: 'Mass Intentions', href: '/mass-intentions' },
          { label: 'Report', href: '/mass-intentions/report' }
        ]}
      />
      <MassIntentionsReportClient />
    </>
  )
}

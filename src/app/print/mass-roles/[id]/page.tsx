import { createClient } from '@/lib/supabase/server'
import { redirect, notFound } from 'next/navigation'
import { getMassRoleWithRelations } from '@/lib/actions/mass-roles'
import { PRINT_PAGE_STYLES } from '@/lib/print-styles'
import { buildMassRoleReport, REPORT_STYLES } from '@/lib/report-builders'

export const dynamic = 'force-dynamic'

interface PageProps {
  params: Promise<{ id: string }>
}

export default async function PrintMassRoleMembersPage({ params }: PageProps) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  const { id } = await params
  const massRole = await getMassRoleWithRelations(id)

  if (!massRole) {
    notFound()
  }

  // Build report using report builder
  const reportHTML = buildMassRoleReport({ massRole })

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: `${PRINT_PAGE_STYLES}\n${REPORT_STYLES}` }} />
      <div dangerouslySetInnerHTML={{ __html: reportHTML }} />
    </>
  )
}

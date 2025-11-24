import { createClient } from '@/lib/supabase/server'
import { redirect, notFound } from 'next/navigation'
import { PageContainer } from '@/components/page-container'
import { BreadcrumbSetter } from '@/components/breadcrumb-setter'
import { WeekendSummaryViewClient } from './weekend-summary-view-client'
import { getWeekendSummaryData } from '@/lib/actions/weekend-summary'
import { formatDatePretty } from '@/lib/utils/formatters'

export const dynamic = 'force-dynamic'

interface PageProps {
  searchParams: Promise<{
    date?: string
    sacraments?: string
    masses?: string
    massRoles?: string
  }>
}

export default async function WeekendSummaryViewPage({ searchParams }: PageProps) {
  const supabase = await createClient()

  // Check authentication server-side
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    redirect('/login')
  }

  const params = await searchParams

  // Validate required param
  if (!params.date) {
    notFound()
  }

  // Build params for data fetch
  const weekendParams = {
    sundayDate: params.date,
    includeSacraments: params.sacraments === 'true',
    includeMasses: params.masses === 'true',
    includeMassRoles: params.massRoles === 'true'
  }

  // Fetch weekend data
  const weekendData = await getWeekendSummaryData(weekendParams)

  // Build title
  const title = `Weekend Summary - ${formatDatePretty(params.date)}`

  const breadcrumbs = [
    { label: 'Dashboard', href: '/dashboard' },
    { label: 'Weekend Summary', href: '/weekend-summary' },
    { label: 'View' }
  ]

  return (
    <PageContainer
      title={title}
      description="Summary of all weekend activities from Saturday morning to Sunday afternoon."
    >
      <BreadcrumbSetter breadcrumbs={breadcrumbs} />
      <WeekendSummaryViewClient
        weekendData={weekendData}
        params={weekendParams}
      />
    </PageContainer>
  )
}

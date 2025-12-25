import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { getMassIntentionsReport } from '@/lib/actions/mass-intentions'
import { formatDatePretty } from '@/lib/utils/formatters'
import { buildMassIntentionReport, REPORT_STYLES } from '@/lib/report-builders'
import { PrintPageWrapper } from '@/components/print/print-page-wrapper'

interface PageProps {
  searchParams: Promise<{ startDate?: string; endDate?: string }>
}

export default async function PrintMassIntentionsReportPage({ searchParams }: PageProps) {
  const supabase = await createClient()

  // Check authentication server-side
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    redirect('/login')
  }

  const params = await searchParams
  const { startDate, endDate } = params

  // Fetch report data with optional date filtering
  const result = await getMassIntentionsReport({
    startDate: startDate || undefined,
    endDate: endDate || undefined
  })

  const { intentions, totalStipends } = result

  // Generate date range display text
  let dateRangeText = 'All Mass Intentions'
  if (startDate && endDate) {
    dateRangeText = `${formatDatePretty(startDate)} to ${formatDatePretty(endDate)}`
  } else if (startDate) {
    dateRangeText = `From ${formatDatePretty(startDate)} onwards`
  } else if (endDate) {
    dateRangeText = `Until ${formatDatePretty(endDate)}`
  }

  // Build report using report builder
  const reportHTML = buildMassIntentionReport({
    intentions,
    totalStipends,
    dateRangeText,
    startDate: startDate || undefined,
    endDate: endDate || undefined,
  })

  return (
    <PrintPageWrapper additionalStyles={REPORT_STYLES} htmlContent={reportHTML} />
  )
}

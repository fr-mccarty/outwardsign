import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { getMassIntentionsReport } from '@/lib/actions/mass-intentions'
import { formatDatePretty } from '@/lib/utils/formatters'
import { PRINT_PAGE_MARGIN } from '@/lib/print-styles'
import { buildMassIntentionReport, REPORT_STYLES } from '@/lib/report-builders'

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
    <>
      <style dangerouslySetInnerHTML={{ __html: `
        @page {
          margin: ${PRINT_PAGE_MARGIN};
        }
        body {
          margin: 0 !important;
          background: white !important;
          color: black !important;
          font-family: system-ui, -apple-system, sans-serif;
          padding: 0 !important;
        }
        .print-container {
          max-width: none !important;
          padding: 1rem !important;
          box-shadow: none !important;
          border-radius: 0 !important;
          background: transparent !important;
        }
        ${REPORT_STYLES}
      `}} />
      <div dangerouslySetInnerHTML={{ __html: reportHTML }} />
    </>
  )
}

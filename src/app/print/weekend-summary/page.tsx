import { createClient } from '@/lib/supabase/server'
import { redirect, notFound } from 'next/navigation'
import { getWeekendSummaryData } from '@/lib/actions/weekend-summary'
import { buildWeekendSummary } from '@/lib/content-builders/weekend-summary'
import { renderHTML } from '@/lib/renderers/html-renderer'
import { PRINT_PAGE_MARGIN } from '@/lib/print-styles'

interface PageProps {
  searchParams: Promise<{
    date?: string
    sacraments?: string
    masses?: string
    massRoles?: string
  }>
}

export default async function PrintWeekendSummaryPage({ searchParams }: PageProps) {
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

  // Build liturgy content using centralized content builder
  const liturgyDocument = buildWeekendSummary(weekendData, weekendParams)

  // Render to HTML
  const liturgyContent = renderHTML(liturgyDocument)

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
        }
        .print-container {
          max-width: none !important;
          box-shadow: none !important;
          border-radius: 0 !important;
          padding: 0 !important;
          background: white !important;
        }
        .weekend-summary-print-content div {
          color: black !important;
        }
      `}} />
      <div className="weekend-summary-print-content">
        {liturgyContent}
      </div>
    </>
  )
}

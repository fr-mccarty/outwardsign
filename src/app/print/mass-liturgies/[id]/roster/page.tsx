import { createClient } from '@/lib/supabase/server'
import { redirect, notFound } from 'next/navigation'
import { getEventWithRelations } from '@/lib/actions/parish-events'
import { buildMassRosterContent } from '@/lib/content-builders/mass-liturgy-roster'
import { renderHTML } from '@/lib/renderers/html-renderer'
import { PrintPageWrapper } from '@/components/print/print-page-wrapper'

interface PageProps {
  params: Promise<{ id: string }>
}

export default async function PrintMassRosterPage({ params }: PageProps) {
  const supabase = await createClient()

  // Check authentication server-side
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    redirect('/login')
  }

  const { id } = await params
  const mass = await getEventWithRelations(id)

  if (!mass) {
    notFound()
  }

  // Build roster using centralized content builder
  const rosterDocument = buildMassRosterContent(mass)

  // Render to HTML (isPrintMode: true for inline colors on white background)
  const content = renderHTML(rosterDocument, true)

  return (
    <PrintPageWrapper>
      {content}
    </PrintPageWrapper>
  )
}

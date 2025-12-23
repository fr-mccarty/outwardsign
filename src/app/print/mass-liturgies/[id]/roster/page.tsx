import { createClient } from '@/lib/supabase/server'
import { redirect, notFound } from 'next/navigation'
import { getEventWithRelations } from '@/lib/actions/master-events'
import { buildMassRosterContent } from '@/lib/content-builders/mass-liturgy-roster'
import { renderHTML } from '@/lib/renderers/html-renderer'
import { PRINT_PAGE_STYLES } from '@/lib/print-styles'

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
    <>
      <style dangerouslySetInnerHTML={{ __html: PRINT_PAGE_STYLES }} />
      <div className="mass-roster-print-content">
        {content}
      </div>
    </>
  )
}

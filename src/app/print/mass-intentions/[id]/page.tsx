import { createClient } from '@/lib/supabase/server'
import { redirect, notFound } from 'next/navigation'
import { getMassIntentionWithRelations } from '@/lib/actions/mass-intentions'
import { buildMassIntentionLiturgy } from '@/lib/content-builders/mass-intention'
import { renderHTML } from '@/lib/renderers/html-renderer'
import { PRINT_PAGE_STYLES } from '@/lib/print-styles'

interface PageProps {
  params: Promise<{ id: string }>
}

export default async function PrintMassIntentionPage({ params }: PageProps) {
  const supabase = await createClient()

  // Check authentication server-side
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    redirect('/login')
  }

  const { id } = await params
  const massIntention = await getMassIntentionWithRelations(id)

  if (!massIntention) {
    notFound()
  }

  // Build liturgy content using centralized content builder
  const templateId = massIntention.mass_intention_template_id || 'mass-intention-summary-english'
  const liturgyDocument = buildMassIntentionLiturgy(massIntention, templateId)

  // Render to HTML (isPrintMode: true for inline color styles)
  const liturgyContent = renderHTML(liturgyDocument, true)

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: PRINT_PAGE_STYLES }} />
      <div className="mass-intention-print-content">
        {liturgyContent}
      </div>
    </>
  )
}

import { createClient } from '@/lib/supabase/server'
import { redirect, notFound } from 'next/navigation'
import { getMassIntentionWithRelations } from '@/lib/actions/mass-intentions'
import { buildMassIntentionLiturgy } from '@/lib/content-builders/mass-intention'
import { renderHTML } from '@/lib/renderers/html-renderer'
import { PRINT_PAGE_MARGIN } from '@/lib/print-styles'

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
  const templateId = 'mass-intention-summary'
  const liturgyDocument = buildMassIntentionLiturgy(massIntention, templateId)

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
        .mass-intention-print-content div {
          color: black !important;
        }
      `}} />
      <div className="mass-intention-print-content">
        {liturgyContent}
      </div>
    </>
  )
}

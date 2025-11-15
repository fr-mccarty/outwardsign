import { createClient } from '@/lib/supabase/server'
import { redirect, notFound } from 'next/navigation'
import { getPresentationWithRelations } from '@/lib/actions/presentations'
import { buildPresentationLiturgy } from '@/lib/content-builders/presentation'
import { renderHTML } from '@/lib/renderers/html-renderer'
import { PRINT_PAGE_MARGIN } from '@/lib/print-styles'

interface PageProps {
  params: Promise<{ id: string }>
}

export default async function PrintPresentationPage({ params }: PageProps) {
  const supabase = await createClient()

  // Check authentication server-side
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    redirect('/login')
  }

  const { id } = await params
  const presentation = await getPresentationWithRelations(id)

  if (!presentation) {
    notFound()
  }

  // Build liturgy content using centralized content builder
  // Use the template_id from the presentation record, defaulting to 'presentation-spanish'
  const templateId = presentation.presentation_template_id || 'presentation-spanish'
  const liturgyDocument = buildPresentationLiturgy(presentation, templateId)

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
        .presentation-print-content div {
          color: black !important;
        }
        .presentation-print-content div[style*="color: rgb(196, 30, 58)"],
        .presentation-print-content div[style*="color:#c41e3a"],
        .presentation-print-content div[style*="color: #c41e3a"] {
          color: rgb(196, 30, 58) !important;
        }
        .presentation-print-content span[style*="color: rgb(196, 30, 58)"],
        .presentation-print-content span[style*="color:#c41e3a"],
        .presentation-print-content span[style*="color: #c41e3a"] {
          color: rgb(196, 30, 58) !important;
        }
      `}} />
      <div className="presentation-print-content">
        {liturgyContent}
      </div>
    </>
  )
}

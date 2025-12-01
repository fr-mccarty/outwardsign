import { createClient } from '@/lib/supabase/server'
import { redirect, notFound } from 'next/navigation'
import { getBaptismWithRelations } from '@/lib/actions/baptisms'
import { buildBaptismLiturgy } from '@/lib/content-builders/baptism'
import { renderHTML } from '@/lib/renderers/html-renderer'
import { PRINT_PAGE_MARGIN } from '@/lib/print-styles'

interface PageProps {
  params: Promise<{ id: string }>
}

export default async function PrintBaptismPage({ params }: PageProps) {
  const supabase = await createClient()

  // Check authentication server-side
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    redirect('/login')
  }

  const { id } = await params
  const baptism = await getBaptismWithRelations(id)

  if (!baptism) {
    notFound()
  }

  // Build liturgy content using centralized content builder
  // Use the template_id from the baptism record, defaulting to 'baptism-summary-english'
  const templateId = baptism.baptism_template_id || 'baptism-summary-english'
  const liturgyDocument = buildBaptismLiturgy(baptism, templateId)

  // Render to HTML (isPrintMode: true for inline color styles)
  const liturgyContent = renderHTML(liturgyDocument, true)

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
        .baptism-print-content div {
          color: black !important;
        }
        .baptism-print-content div[style*="color: rgb(196, 30, 58)"],
        .baptism-print-content div[style*="color:#c41e3a"],
        .baptism-print-content div[style*="color: #c41e3a"] {
          color: rgb(196, 30, 58) !important;
        }
        .baptism-print-content span[style*="color: rgb(196, 30, 58)"],
        .baptism-print-content span[style*="color:#c41e3a"],
        .baptism-print-content span[style*="color: #c41e3a"] {
          color: rgb(196, 30, 58) !important;
        }
      `}} />
      <div className="baptism-print-content">
        {liturgyContent}
      </div>
    </>
  )
}

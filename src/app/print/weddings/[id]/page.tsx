import { createClient } from '@/lib/supabase/server'
import { redirect, notFound } from 'next/navigation'
import { getWeddingWithRelations } from '@/lib/actions/weddings'
import { buildWeddingLiturgy } from '@/lib/content-builders/wedding'
import { renderHTML } from '@/lib/renderers/html-renderer'
import { PRINT_PAGE_MARGIN } from '@/lib/print-styles'

interface PageProps {
  params: Promise<{ id: string }>
}

export default async function PrintWeddingPage({ params }: PageProps) {
  const supabase = await createClient()

  // Check authentication server-side
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    redirect('/login')
  }

  const { id } = await params
  const wedding = await getWeddingWithRelations(id)

  if (!wedding) {
    notFound()
  }

  // Build liturgy content using centralized content builder
  // Use the template_id from the wedding record, defaulting to 'wedding-full-script-english'
  const templateId = wedding.wedding_template_id || 'wedding-full-script-english'
  const liturgyDocument = buildWeddingLiturgy(wedding, templateId)

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
        .wedding-print-content div {
          color: black !important;
        }
        .wedding-print-content div[style*="color: rgb(196, 30, 58)"],
        .wedding-print-content div[style*="color:#c41e3a"],
        .wedding-print-content div[style*="color: #c41e3a"] {
          color: rgb(196, 30, 58) !important;
        }
        .wedding-print-content span[style*="color: rgb(196, 30, 58)"],
        .wedding-print-content span[style*="color:#c41e3a"],
        .wedding-print-content span[style*="color: #c41e3a"] {
          color: rgb(196, 30, 58) !important;
        }
      `}} />
      <div className="wedding-print-content">
        {liturgyContent}
      </div>
    </>
  )
}

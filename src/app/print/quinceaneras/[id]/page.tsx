import { createClient } from '@/lib/supabase/server'
import { redirect, notFound } from 'next/navigation'
import { getQuinceaneraWithRelations } from '@/lib/actions/quinceaneras'
import { buildQuinceaneraLiturgy } from '@/lib/content-builders/quinceanera'
import { renderHTML } from '@/lib/renderers/html-renderer'
import { PRINT_PAGE_MARGIN } from '@/lib/print-styles'

interface PageProps {
  params: Promise<{ id: string }>
}

export default async function PrintQuinceaneraPage({ params }: PageProps) {
  const supabase = await createClient()

  // Check authentication server-side
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    redirect('/login')
  }

  const { id } = await params
  const quinceanera = await getQuinceaneraWithRelations(id)

  if (!quinceanera) {
    notFound()
  }

  // Build liturgy content using centralized content builder
  // Use the template_id from the quinceanera record, defaulting to 'quinceanera-full-script-english'
  const templateId = quinceanera.quinceanera_template_id || 'quinceanera-full-script-english'
  const liturgyDocument = buildQuinceaneraLiturgy(quinceanera, templateId)

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
        .quinceanera-print-content div {
          color: black !important;
        }
        .quinceanera-print-content div[style*="color: rgb(196, 30, 58)"],
        .quinceanera-print-content div[style*="color:#c41e3a"],
        .quinceanera-print-content div[style*="color: #c41e3a"] {
          color: rgb(196, 30, 58) !important;
        }
        .quinceanera-print-content span[style*="color: rgb(196, 30, 58)"],
        .quinceanera-print-content span[style*="color:#c41e3a"],
        .quinceanera-print-content span[style*="color: #c41e3a"] {
          color: rgb(196, 30, 58) !important;
        }
      `}} />
      <div className="quinceanera-print-content">
        {liturgyContent}
      </div>
    </>
  )
}

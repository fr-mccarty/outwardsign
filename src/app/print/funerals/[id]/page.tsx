import { createClient } from '@/lib/supabase/server'
import { redirect, notFound } from 'next/navigation'
import { getFuneralWithRelations } from '@/lib/actions/funerals'
import { buildFuneralLiturgy } from '@/lib/content-builders/funeral'
import { renderHTML } from '@/lib/renderers/html-renderer'
import { PRINT_PAGE_MARGIN } from '@/lib/print-styles'

interface PageProps {
  params: Promise<{ id: string }>
}

export default async function PrintFuneralPage({ params }: PageProps) {
  const supabase = await createClient()

  // Check authentication server-side
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    redirect('/login')
  }

  const { id } = await params
  const funeral = await getFuneralWithRelations(id)

  if (!funeral) {
    notFound()
  }

  // Build liturgy content using centralized content builder
  // Use the template_id from the funeral record, defaulting to 'funeral-full-script-english'
  const templateId = funeral.funeral_template_id || 'funeral-full-script-english'
  const liturgyDocument = buildFuneralLiturgy(funeral, templateId)

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
        .funeral-print-content div {
          color: black !important;
        }
        .funeral-print-content div[style*="color: rgb(196, 30, 58)"],
        .funeral-print-content div[style*="color:#c41e3a"],
        .funeral-print-content div[style*="color: #c41e3a"] {
          color: rgb(196, 30, 58) !important;
        }
        .funeral-print-content span[style*="color: rgb(196, 30, 58)"],
        .funeral-print-content span[style*="color:#c41e3a"],
        .funeral-print-content span[style*="color: #c41e3a"] {
          color: rgb(196, 30, 58) !important;
        }
      `}} />
      <div className="funeral-print-content">
        {liturgyContent}
      </div>
    </>
  )
}

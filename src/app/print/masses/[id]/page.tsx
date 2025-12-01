import { createClient } from '@/lib/supabase/server'
import { redirect, notFound } from 'next/navigation'
import { getMassWithRelations } from '@/lib/actions/masses'
import { buildMassLiturgy } from '@/lib/content-builders/mass'
import { renderHTML } from '@/lib/renderers/html-renderer'
import { PRINT_PAGE_MARGIN } from '@/lib/print-styles'

interface PageProps {
  params: Promise<{ id: string }>
}

export default async function PrintMassPage({ params }: PageProps) {
  const supabase = await createClient()

  // Check authentication server-side
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    redirect('/login')
  }

  const { id } = await params
  const mass = await getMassWithRelations(id)

  if (!mass) {
    notFound()
  }

  // Build liturgy content using centralized content builder
  // Use the template_id from the mass record, defaulting to 'mass-english'
  const templateId = mass.mass_template_id || 'mass-english'
  const liturgyDocument = buildMassLiturgy(mass, templateId)

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
        .mass-print-content div {
          color: black !important;
        }
        .mass-print-content div[style*="color: rgb(196, 30, 58)"],
        .mass-print-content div[style*="color:#c41e3a"],
        .mass-print-content div[style*="color: #c41e3a"] {
          color: rgb(196, 30, 58) !important;
        }
        .mass-print-content span[style*="color: rgb(196, 30, 58)"],
        .mass-print-content span[style*="color:#c41e3a"],
        .mass-print-content span[style*="color: #c41e3a"] {
          color: rgb(196, 30, 58) !important;
        }
      `}} />
      <div className="mass-print-content">
        {liturgyContent}
      </div>
    </>
  )
}

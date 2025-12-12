import { createClient } from '@/lib/supabase/server'
import { redirect, notFound } from 'next/navigation'
import { getMassWithRelations } from '@/lib/actions/masses'
import { buildMassLiturgy } from '@/lib/content-builders/mass'
import { renderHTML } from '@/lib/renderers/html-renderer'
import { PRINT_PAGE_STYLES, LITURGICAL_RUBRIC_STYLES } from '@/lib/print-styles'

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
      <style dangerouslySetInnerHTML={{ __html: `${PRINT_PAGE_STYLES}\n${LITURGICAL_RUBRIC_STYLES}` }} />
      <div className="mass-print-content">
        {liturgyContent}
      </div>
    </>
  )
}

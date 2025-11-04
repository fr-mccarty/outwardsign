import { createClient } from '@/lib/supabase/server'
import { redirect, notFound } from 'next/navigation'
import { getWeddingWithRelations } from '@/lib/actions/weddings'
import { buildWeddingLiturgy } from '@/lib/content-builders/wedding'
import { renderHTML } from '@/lib/renderers/html-renderer'

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
  const liturgyDocument = buildWeddingLiturgy(wedding, 'wedding-full-script-english')

  // Render to HTML
  const liturgyContent = renderHTML(liturgyDocument)

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: `
        body {
          background: white !important;
          color: black !important;
          padding: 2rem !important;
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

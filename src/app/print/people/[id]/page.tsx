import { createClient } from '@/lib/supabase/server'
import { redirect, notFound } from 'next/navigation'
import { getPerson } from '@/lib/actions/people'
import { buildPersonContactCard } from '@/lib/content-builders/person'
import { renderHTML } from '@/lib/renderers/html-renderer'
import { PRINT_PAGE_MARGIN } from '@/lib/print-styles'

interface PageProps {
  params: Promise<{ id: string }>
}

export default async function PrintPersonPage({ params }: PageProps) {
  const supabase = await createClient()

  // Check authentication server-side
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    redirect('/login')
  }

  const { id } = await params
  const person = await getPerson(id)

  if (!person) {
    notFound()
  }

  // Build contact card content using centralized content builder
  const contactCardDocument = await buildPersonContactCard(person)

  // Render to HTML
  const content = renderHTML(contactCardDocument)

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
        .person-print-content div {
          color: black !important;
        }
      `}} />
      <div className="person-print-content">
        {content}
      </div>
    </>
  )
}

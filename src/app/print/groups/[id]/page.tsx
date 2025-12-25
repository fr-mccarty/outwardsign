import { createClient } from '@/lib/supabase/server'
import { redirect, notFound } from 'next/navigation'
import { getGroup } from '@/lib/actions/groups'
import { buildGroupMembersReport } from '@/lib/content-builders/group'
import { renderHTML } from '@/lib/renderers/html-renderer'
import { PrintPageWrapper } from '@/components/print/print-page-wrapper'

interface PageProps {
  params: Promise<{ id: string }>
}

export default async function PrintGroupPage({ params }: PageProps) {
  const supabase = await createClient()

  // Check authentication server-side
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    redirect('/login')
  }

  const { id } = await params
  const group = await getGroup(id)

  if (!group) {
    notFound()
  }

  // Build members report using centralized content builder
  const reportDocument = buildGroupMembersReport(group)

  // Render to HTML (isPrintMode: true for inline colors on white background)
  const content = renderHTML(reportDocument, true)

  return (
    <PrintPageWrapper>
      {content}
    </PrintPageWrapper>
  )
}

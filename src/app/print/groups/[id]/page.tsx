import { createClient } from '@/lib/supabase/server'
import { redirect, notFound } from 'next/navigation'
import { getGroup } from '@/lib/actions/groups'
import { buildGroupMembersReport } from '@/lib/content-builders/group'
import { renderHTML } from '@/lib/renderers/html-renderer'
import { PRINT_PAGE_STYLES } from '@/lib/print-styles'

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

  // Render to HTML
  const content = renderHTML(reportDocument)

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: PRINT_PAGE_STYLES }} />
      <div className="group-print-content">
        {content}
      </div>
    </>
  )
}

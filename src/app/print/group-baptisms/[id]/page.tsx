import { createClient } from '@/lib/supabase/server'
import { redirect, notFound } from 'next/navigation'
import { getGroupBaptismWithRelations } from '@/lib/actions/group-baptisms'
import { getPersonAvatarSignedUrls } from '@/lib/actions/people'
import { buildGroupBaptismLiturgy } from '@/lib/content-builders/group-baptism'
import { renderHTML } from '@/lib/renderers/html-renderer'
import { PRINT_PAGE_MARGIN } from '@/lib/print-styles'

interface PageProps {
  params: Promise<{ id: string }>
}

export default async function PrintGroupBaptismPage({ params }: PageProps) {
  const supabase = await createClient()

  // Check authentication server-side
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    redirect('/login')
  }

  const { id } = await params
  const groupBaptism = await getGroupBaptismWithRelations(id)

  if (!groupBaptism) {
    notFound()
  }

  // Extract avatar storage paths from children
  const avatarPaths = groupBaptism.baptisms
    ?.filter(b => b.child?.avatar_url)
    .map(b => b.child!.avatar_url!)
    .filter(Boolean) || []

  // Generate signed URLs for avatars
  const avatarUrls = await getPersonAvatarSignedUrls(avatarPaths)

  // Enrich group baptism with signed URLs
  const enrichedGroupBaptism = {
    ...groupBaptism,
    baptisms: groupBaptism.baptisms?.map(baptism => ({
      ...baptism,
      child: baptism.child ? {
        ...baptism.child,
        avatar_url: baptism.child.avatar_url && avatarUrls[baptism.child.avatar_url]
          ? avatarUrls[baptism.child.avatar_url]
          : baptism.child.avatar_url
      } : baptism.child
    }))
  }

  // Build liturgy content using centralized content builder
  // Use the template_id from the group baptism record, defaulting to 'group-baptism-summary-english'
  const templateId = enrichedGroupBaptism.group_baptism_template_id || 'group-baptism-summary-english'
  const liturgyDocument = buildGroupBaptismLiturgy(enrichedGroupBaptism, templateId)

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
        .group-baptism-print-content div {
          color: black !important;
        }
        .group-baptism-print-content div[style*="color: rgb(196, 30, 58)"],
        .group-baptism-print-content div[style*="color:#c41e3a"],
        .group-baptism-print-content div[style*="color: #c41e3a"] {
          color: rgb(196, 30, 58) !important;
        }
        .group-baptism-print-content span[style*="color: rgb(196, 30, 58)"],
        .group-baptism-print-content span[style*="color:#c41e3a"],
        .group-baptism-print-content span[style*="color: #c41e3a"] {
          color: rgb(196, 30, 58) !important;
        }
      `}} />
      <div className="group-baptism-print-content">
        {liturgyContent}
      </div>
    </>
  )
}

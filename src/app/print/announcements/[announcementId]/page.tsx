import { createClient } from '@/lib/supabase/server'
import { redirect, notFound } from 'next/navigation'
import { getAnnouncement } from '@/lib/actions/announcements'
import { PRINT_PAGE_STYLES } from '@/lib/print-styles'

interface PageProps {
  params: Promise<{ announcementId: string }>
}

export default async function PrintAnnouncementPage({ params }: PageProps) {
  const supabase = await createClient()

  // Check authentication server-side
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    redirect('/login')
  }

  const { announcementId } = await params
  const announcement = await getAnnouncement(parseInt(announcementId))

  if (!announcement) {
    notFound()
  }

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: PRINT_PAGE_STYLES }} />
      <div className="announcement-print-content font-sans">
        {/* Header - Center Aligned Blue Text */}
        <div className="text-center text-2xl text-blue-600 font-bold mb-2">
          ANNOUNCEMENT
        </div>

        {announcement.title && (
          <div className="text-center text-xl text-blue-600 font-semibold italic mb-2">
            {announcement.title}
          </div>
        )}

        {announcement.date && (
          <div className="text-center text-lg text-blue-600 font-medium mb-6">
            {new Date(announcement.date).toLocaleDateString('en-US', {
              weekday: 'long',
              year: 'numeric',
              month: 'long',
              day: 'numeric'
            })}
          </div>
        )}

        {/* Announcement Content */}
        <div className="mt-8">
          {announcement.text ? (
            <div className="whitespace-pre-line text-base leading-relaxed">
              {announcement.text}
            </div>
          ) : (
            <div className="mt-3 italic text-gray-600">
              No announcement content available.
            </div>
          )}
        </div>

        {/* Footer with creation date */}
        <div className="mt-12 pt-4 border-t border-gray-300 text-sm text-gray-500 text-center">
          Created on {new Date(announcement.created_at).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
          })}
        </div>
      </div>
    </>
  )
}

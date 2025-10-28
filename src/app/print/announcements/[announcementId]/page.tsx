'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Printer, ArrowLeft } from 'lucide-react'
import { Button } from '@/components/ui/button'
import type { Announcement } from '@/lib/actions/announcements'
import { getAnnouncement } from '@/lib/actions/announcements'

interface PrintAnnouncementPageProps {
  params: Promise<{ announcementId: string }>
}

export default function PrintAnnouncementPage({ params }: PrintAnnouncementPageProps) {
  const [announcement, setAnnouncement] = useState<Announcement | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  
  const router = useRouter()

  useEffect(() => {
    const loadData = async () => {
      const { announcementId: id } = await params
      
      if (!id) {
        setError('No announcement ID provided')
        setLoading(false)
        return
      }

      try {
        const announcementData = await getAnnouncement(parseInt(id))
        if (!announcementData) {
          setError('Announcement not found')
        } else {
          setAnnouncement(announcementData)
        }
      } catch (err) {
        console.error('Failed to load announcement:', err)
        setError('Failed to load announcement for printing')
      } finally {
        setLoading(false)
      }
    }

    loadData()
  }, [params])


  const handlePrint = () => {
    window.print()
  }

  const handleClose = () => {
    router.back()
  }

  if (loading) {
    return (
      <div className="hide-on-print">
        <div className="flex items-center justify-center min-h-[200px]">
          <div className="flex items-center gap-3">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
            <span className="text-gray-600">Loading announcement for printing...</span>
          </div>
        </div>
      </div>
    )
  }

  if (error || !announcement) {
    return (
      <div>
        <div className="print-preview-notice hide-on-print" style={{ background: '#ffebee', borderColor: '#f44336', color: '#c62828' }}>
          {error || 'Announcement not found'}
        </div>
        <div className="print-actions hide-on-print">
          <Button variant="outline" onClick={handleClose}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div>
      {/* Custom print styles for smaller margins */}
      <style dangerouslySetInnerHTML={{
        __html: `
          @media print {
            @page {
              margin: 0.5cm 0.8cm 0.3cm 0.8cm !important;
            }
            .announcement-print-content {
              padding: 1.5cm 0 0 0 !important;
            }
          }
          @media screen {
            .announcement-print-content {
              padding: 0.5cm 0.8cm 0.3cm 0.8cm !important;
            }
          }
        `
      }} />
      
      {/* Print Actions - Hidden on Print */}
      <div className="print-actions hide-on-print">
        <Button onClick={handlePrint}>
          <Printer className="h-4 w-4 mr-2" />
          Print
        </Button>
      </div>

      {/* Announcement Content */}
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
              No announcement content available. Please return to edit the announcement.
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

    </div>
  )
}
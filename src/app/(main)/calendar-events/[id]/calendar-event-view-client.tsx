'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import type { CalendarEvent } from '@/lib/types'
import { deleteCalendarEvent } from '@/lib/actions/calendar-events'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { DeleteConfirmationDialog } from '@/components/delete-confirmation-dialog'
import { Edit, Calendar, MapPin, Clock, Trash2 } from 'lucide-react'
import Link from 'next/link'
import { toast } from 'sonner'
import { formatDatePretty, formatTime } from '@/lib/utils/formatters'
import { useTranslations } from 'next-intl'

interface CalendarEventViewClientProps {
  calendarEvent: CalendarEvent
}

export function CalendarEventViewClient({ calendarEvent }: CalendarEventViewClientProps) {
  const router = useRouter()
  const tCommon = useTranslations('common')
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)

  // Handle delete
  const handleDelete = async () => {
    try {
      await deleteCalendarEvent(calendarEvent.id)
      toast.success(tCommon('deleteSuccess'))
      router.push('/calendar-events')
    } catch (error) {
      console.error('Error deleting calendar event:', error)
      toast.error(tCommon('deleteError'))
    } finally {
      setDeleteDialogOpen(false)
    }
  }

  return (
    <>
      <div className="space-y-6">
        {/* Action Buttons */}
        <div className="flex gap-2">
          <Button asChild>
            <Link href={`/calendar-events/${calendarEvent.id}/edit`}>
              <Edit className="h-4 w-4 mr-2" />
              {tCommon('edit')}
            </Link>
          </Button>
          <Button
            variant="destructive"
            onClick={() => setDeleteDialogOpen(true)}
          >
            <Trash2 className="h-4 w-4 mr-2" />
            {tCommon('delete')}
          </Button>
        </div>

        {/* Event Information Card */}
        <Card>
          <CardHeader>
            <CardTitle>Event Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-start gap-3">
              <Calendar className="h-5 w-5 text-muted-foreground mt-0.5" />
              <div>
                <div className="text-sm font-medium text-muted-foreground">Date</div>
                <div className="text-base">
                  {calendarEvent.date ? formatDatePretty(calendarEvent.date) : 'Not specified'}
                </div>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <Clock className="h-5 w-5 text-muted-foreground mt-0.5" />
              <div>
                <div className="text-sm font-medium text-muted-foreground">Time</div>
                <div className="text-base">
                  {calendarEvent.time ? formatTime(calendarEvent.time) : 'Not specified'}
                </div>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <MapPin className="h-5 w-5 text-muted-foreground mt-0.5" />
              <div>
                <div className="text-sm font-medium text-muted-foreground">Location</div>
                <div className="text-base">
                  {calendarEvent.location?.name || 'Not specified'}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <DeleteConfirmationDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        onConfirm={handleDelete}
        title="Delete Calendar Event"
        description={`Are you sure you want to delete "${calendarEvent.label}"? This action cannot be undone.`}
      />
    </>
  )
}

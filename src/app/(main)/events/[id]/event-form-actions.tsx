'use client'

import { useState } from 'react'
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import Link from "next/link"
import { Edit, Copy, Trash2 } from "lucide-react"
import { deleteEvent } from "@/lib/actions/events"
import type { Event } from "@/lib/types"
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'

interface EventFormActionsProps {
  event: Event
}

export function EventFormActions({ event }: EventFormActionsProps) {
  const [isDeleting, setIsDeleting] = useState(false)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const router = useRouter()

  const handleDelete = async () => {
    setIsDeleting(true)
    try {
      await deleteEvent(event.id)
      toast.success('Event deleted successfully')
      setDeleteDialogOpen(false)
      router.push('/events')
    } catch (error) {
      console.error('Failed to delete event:', error)
      toast.error('Failed to delete event. Please try again.')
    } finally {
      setIsDeleting(false)
    }
  }

  const handleCopyInfo = () => {
    const formatDate = (dateString?: string) => dateString ? new Date(dateString).toLocaleDateString() : 'Not set'
    const info = `Event: ${event.name}\nType: ${event.event_type}${event.description ? `\nDescription: ${event.description}` : ''}${event.start_date ? `\nStart: ${formatDate(event.start_date)}${event.start_time ? ` at ${event.start_time}` : ''}` : ''}${event.end_date ? `\nEnd: ${formatDate(event.end_date)}${event.end_time ? ` at ${event.end_time}` : ''}` : ''}${event.location ? `\nLocation: ${event.location}` : ''}${event.language ? `\nLanguage: ${event.language}` : ''}${event.notes ? `\n\nNotes: ${event.notes}` : ''}`
    navigator.clipboard.writeText(info)
    toast.success('Event information copied to clipboard')
  }

  return (
    <div className="flex flex-wrap gap-3">
      <Button variant="outline" onClick={handleCopyInfo}>
        <Copy className="h-4 w-4 mr-2" />
        Copy Info
      </Button>
      <Button variant="outline" asChild>
        <Link href={`/events/${event.id}/edit`}>
          <Edit className="h-4 w-4 mr-2" />
          Edit
        </Link>
      </Button>
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogTrigger asChild>
          <Button variant="destructive">
            <Trash2 className="h-4 w-4 mr-2" />
            Delete
          </Button>
        </DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Event</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this event? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteDialogOpen(false)} disabled={isDeleting}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDelete} disabled={isDeleting}>
              {isDeleting ? 'Deleting...' : 'Delete'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import type { CalendarEvent } from '@/lib/types'
import { deleteCalendarEvent } from '@/lib/actions/calendar-events'
import { DataTable } from '@/components/data-table/data-table'
import { ClearableSearchInput } from '@/components/clearable-search-input'
import { DeleteConfirmationDialog } from '@/components/delete-confirmation-dialog'
import { SearchCard } from "@/components/search-card"
import { EmptyState } from "@/components/empty-state"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { Plus, Calendar } from "lucide-react"
import { toast } from "sonner"
import {
  buildWhenColumn,
  buildWhereColumn,
  buildActionsColumn
} from '@/lib/utils/table-columns'
import { DataTableColumn } from '@/components/data-table/data-table'
import { useTranslations } from 'next-intl'

interface CalendarEventsListClientProps {
  initialData: CalendarEvent[]
}

export function CalendarEventsListClient({ initialData }: CalendarEventsListClientProps) {
  const router = useRouter()
  const tCommon = useTranslations('common')

  // Local state for search filtering
  const [searchValue, setSearchValue] = useState('')
  const [calendarEvents] = useState(initialData)

  // Delete dialog state
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [eventToDelete, setEventToDelete] = useState<CalendarEvent | null>(null)

  // Filter calendar events based on search
  const filteredEvents = calendarEvents.filter(event => {
    if (!searchValue) return true
    const searchLower = searchValue.toLowerCase()
    return event.label.toLowerCase().includes(searchLower)
  })

  // Handle delete
  const handleDelete = async () => {
    if (!eventToDelete) return

    try {
      await deleteCalendarEvent(eventToDelete.id)
      toast.success(tCommon('deleteSuccess'))
      router.refresh()
    } catch (error) {
      console.error('Error deleting calendar event:', error)
      toast.error(tCommon('deleteError'))
    } finally {
      setDeleteDialogOpen(false)
      setEventToDelete(null)
    }
  }

  // Column definitions
  const columns: DataTableColumn<CalendarEvent>[] = [
    {
      key: 'label',
      header: 'Event Name',
      cell: (event) => (
        <Link
          href={`/calendar-events/${event.id}`}
          className="font-medium hover:underline"
        >
          {event.label}
        </Link>
      )
    },
    buildWhenColumn<CalendarEvent>({
      getDate: (event) => event.date,
      getTime: (event) => event.time
    }),
    buildWhereColumn<CalendarEvent>({
      getLocation: (event) => event.location || null
    }),
    buildActionsColumn<CalendarEvent>({
      baseUrl: '/calendar-events',
      onDelete: (event) => {
        setEventToDelete(event)
        setDeleteDialogOpen(true)
      },
      getDeleteMessage: (event) => `Are you sure you want to delete "${event.label}"? This action cannot be undone.`
    })
  ]

  // Show empty state if no events and no search
  if (filteredEvents.length === 0 && !searchValue) {
    return (
      <>
        <EmptyState
          icon={<Calendar className="h-12 w-12" />}
          title="No calendar events yet"
          description="Create your first standalone calendar event to get started."
          action={
            <Button asChild>
              <Link href="/calendar-events/create">
                <Plus className="h-4 w-4 mr-2" />
                Create Calendar Event
              </Link>
            </Button>
          }
        />
      </>
    )
  }

  return (
    <>
      <SearchCard title="Search">
        <ClearableSearchInput
          value={searchValue}
          onChange={setSearchValue}
          placeholder="Search calendar events..."
        />
      </SearchCard>

      <DataTable
        data={filteredEvents}
        columns={columns}
        keyExtractor={(event) => event.id}
        emptyState={{
          icon: <Calendar className="h-12 w-12" />,
          title: "No events found",
          description: "Try adjusting your search criteria."
        }}
      />

      <DeleteConfirmationDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        onConfirm={handleDelete}
        title="Delete Calendar Event"
        description={`Are you sure you want to delete "${eventToDelete?.label}"? This action cannot be undone.`}
      />
    </>
  )
}

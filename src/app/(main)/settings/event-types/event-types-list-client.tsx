'use client'

import { useState } from 'react'
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from '@dnd-kit/core'
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
  useSortable,
} from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { PageContainer } from '@/components/page-container'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Plus, Pencil, Trash2, GripVertical } from 'lucide-react'
import { EventTypeFormDialog } from './event-type-form-dialog'
import type { EventType } from '@/lib/types'
import { deleteEventType, reorderEventTypes } from '@/lib/actions/event-types'
import { toast } from 'sonner'
import { useRouter } from 'next/navigation'
import { DeleteConfirmationDialog } from '@/components/delete-confirmation-dialog'

interface EventTypesListClientProps {
  initialData: EventType[]
}

// Sortable event type item component
function SortableEventTypeItem({
  eventType,
  onEdit,
  onDelete,
}: {
  eventType: EventType
  onEdit: (eventType: EventType) => void
  onDelete: (eventType: EventType) => void
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: eventType.id })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  }

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="flex items-center gap-3 py-2 px-3 border rounded-md bg-card"
    >
      <button
        className="cursor-grab active:cursor-grabbing touch-none"
        {...attributes}
        {...listeners}
      >
        <GripVertical className="h-4 w-4 text-muted-foreground" />
      </button>

      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <span className="font-medium text-sm truncate">{eventType.name}</span>
          {!eventType.is_active && (
            <Badge variant="outline" className="text-xs py-0">Inactive</Badge>
          )}
        </div>
        {eventType.description && (
          <p className="text-xs text-muted-foreground truncate">{eventType.description}</p>
        )}
      </div>

      <div className="flex gap-1">
        <Button
          variant="ghost"
          size="icon"
          className="h-7 w-7"
          onClick={() => onEdit(eventType)}
        >
          <Pencil className="h-3.5 w-3.5" />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          className="h-7 w-7"
          onClick={() => onDelete(eventType)}
        >
          <Trash2 className="h-3.5 w-3.5" />
        </Button>
      </div>
    </div>
  )
}

export function EventTypesListClient({ initialData }: EventTypesListClientProps) {
  const router = useRouter()
  const [items, setItems] = useState<EventType[]>(initialData)
  const [selectedEventType, setSelectedEventType] = useState<EventType | undefined>()
  const [isFormDialogOpen, setIsFormDialogOpen] = useState(false)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [eventTypeToDelete, setEventTypeToDelete] = useState<EventType | null>(null)

  // Set up drag and drop sensors
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  )

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event

    if (!over || active.id === over.id) {
      return
    }

    const oldIndex = items.findIndex((item) => item.id === active.id)
    const newIndex = items.findIndex((item) => item.id === over.id)

    if (oldIndex === -1 || newIndex === -1) {
      return
    }

    // Optimistically update UI
    const reorderedItems = arrayMove(items, oldIndex, newIndex)
    setItems(reorderedItems)

    try {
      // Save to server
      const itemIds = reorderedItems.map((item) => item.id)
      await reorderEventTypes(itemIds)
      toast.success('Order updated')
    } catch (error) {
      console.error('Failed to reorder items:', error)
      toast.error('Failed to update order')
      // Revert on error
      setItems(initialData)
    }
  }

  const handleCreate = () => {
    setSelectedEventType(undefined)
    setIsFormDialogOpen(true)
  }

  const handleEdit = (eventType: EventType) => {
    setSelectedEventType(eventType)
    setIsFormDialogOpen(true)
  }

  const handleDelete = async () => {
    if (!eventTypeToDelete) return

    try {
      await deleteEventType(eventTypeToDelete.id)
      toast.success('Event type deleted successfully')
      setEventTypeToDelete(null)
      router.refresh()
    } catch (error) {
      console.error('Failed to delete event type:', error)
      const errorMessage = error instanceof Error ? error.message : 'Failed to delete event type'
      toast.error(errorMessage)
      throw error
    }
  }

  const confirmDelete = (eventType: EventType) => {
    setEventTypeToDelete(eventType)
    setDeleteDialogOpen(true)
  }

  const handleFormSuccess = () => {
    setIsFormDialogOpen(false)
    router.refresh()
  }

  const stats = {
    total: items.length,
    active: items.filter((et) => et.is_active).length,
  }

  return (
    <PageContainer
      title="Event Types"
      description="Manage custom event types for your parish. Drag to reorder."
      primaryAction={
        <Button onClick={handleCreate}>
          <Plus className="h-4 w-4 mr-2" />
          Add Event Type
        </Button>
      }
    >
      {/* Stats */}
      <div className="grid grid-cols-2 gap-4 mb-6">
        <div className="border rounded-lg p-4">
          <div className="text-2xl font-bold">{stats.total}</div>
          <div className="text-sm text-muted-foreground">Total Event Types</div>
        </div>
        <div className="border rounded-lg p-4">
          <div className="text-2xl font-bold">{stats.active}</div>
          <div className="text-sm text-muted-foreground">Active</div>
        </div>
      </div>

      {/* Sortable List */}
      <div className="border rounded-lg p-4 bg-muted/30">
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragEnd={handleDragEnd}
        >
          <SortableContext
            items={items.map((item) => item.id)}
            strategy={verticalListSortingStrategy}
          >
            <div className="space-y-2">
              {items.map((eventType) => (
                <SortableEventTypeItem
                  key={eventType.id}
                  eventType={eventType}
                  onEdit={handleEdit}
                  onDelete={confirmDelete}
                />
              ))}
              {items.length === 0 && (
                <div className="text-center py-8 text-muted-foreground">
                  No event types yet. Create one to get started.
                </div>
              )}
            </div>
          </SortableContext>
        </DndContext>
      </div>

      {/* Form Dialog */}
      <EventTypeFormDialog
        open={isFormDialogOpen}
        onOpenChange={setIsFormDialogOpen}
        eventType={selectedEventType}
        onSuccess={handleFormSuccess}
      />

      {/* Delete Confirmation Dialog */}
      <DeleteConfirmationDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        onConfirm={handleDelete}
        title="Delete Event Type"
        description={`Are you sure you want to delete "${eventTypeToDelete?.name}"? This action cannot be undone. Events using this type will no longer have an assigned type.`}
      />
    </PageContainer>
  )
}

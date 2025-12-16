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
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Plus, Trash2, GripVertical, Info, type LucideIcon } from 'lucide-react'
import * as Icons from 'lucide-react'
import type { DynamicEventType } from '@/lib/types'
import { deleteEventType, reorderEventTypes } from '@/lib/actions/event-types'
import { toast } from 'sonner'
import { useRouter } from 'next/navigation'
import { DeleteConfirmationDialog } from '@/components/delete-confirmation-dialog'
import Link from 'next/link'
import { useTranslations } from 'next-intl'

interface MassesListClientProps {
  initialData: DynamicEventType[]
}

// Sortable event type item component
function SortableEventTypeItem({
  eventType,
  onDelete,
}: {
  eventType: DynamicEventType
  onDelete: (eventType: DynamicEventType) => void
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

  // Get the icon component from Lucide
  const IconComponent = (Icons[eventType.icon as keyof typeof Icons] as LucideIcon) || Icons.Calendar

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="flex items-center gap-3 py-2 px-3 border rounded-md bg-card hover:bg-accent/50 transition-colors"
    >
      <button
        className="cursor-grab active:cursor-grabbing touch-none"
        {...attributes}
        {...listeners}
      >
        <GripVertical className="h-4 w-4 text-muted-foreground" />
      </button>

      <Link
        href={`/settings/event-types/${eventType.slug}`}
        className="flex-1 min-w-0 flex items-center gap-2"
      >
        <IconComponent className="h-4 w-4 text-muted-foreground flex-shrink-0" />
        <span className="font-medium text-sm truncate">{eventType.name}</span>
      </Link>

      <div className="flex gap-1">
        <Button
          variant="ghost"
          size="icon"
          className="h-7 w-7"
          onClick={(e) => {
            e.preventDefault()
            e.stopPropagation()
            onDelete(eventType)
          }}
        >
          <Trash2 className="h-3.5 w-3.5" />
        </Button>
      </div>
    </div>
  )
}

export function MassesListClient({ initialData }: MassesListClientProps) {
  const router = useRouter()
  const t = useTranslations('masses')
  const [items, setItems] = useState<DynamicEventType[]>(initialData)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [eventTypeToDelete, setEventTypeToDelete] = useState<DynamicEventType | null>(null)

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

  const handleDelete = async () => {
    if (!eventTypeToDelete) return

    try {
      await deleteEventType(eventTypeToDelete.id)
      toast.success('Mass type deleted successfully')
      setEventTypeToDelete(null)
      router.refresh()
    } catch (error) {
      console.error('Failed to delete mass type:', error)
      const errorMessage = error instanceof Error ? error.message : 'Failed to delete mass type'
      toast.error(errorMessage)
      throw error
    }
  }

  const confirmDelete = (eventType: DynamicEventType) => {
    setEventTypeToDelete(eventType)
    setDeleteDialogOpen(true)
  }

  return (
    <PageContainer
      title={t('title')}
      description={t('description')}
      primaryAction={
        <Button asChild>
          <Link href="/settings/masses/create">
            <Plus className="h-4 w-4 mr-2" />
            {t('createTitle')}
          </Link>
        </Button>
      }
    >
      {/* Explanatory Alert */}
      <Alert className="mb-6">
        <Info className="h-4 w-4" />
        <AlertDescription className="space-y-2">
          <p>{t('explanation')}</p>
          <p className="text-muted-foreground text-sm">{t('examples')}</p>
        </AlertDescription>
      </Alert>

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
                  onDelete={confirmDelete}
                />
              ))}
              {items.length === 0 && (
                <div className="text-center py-12">
                  <p className="font-medium mb-2">{t('noMasses')}</p>
                  <p className="text-muted-foreground mb-4 max-w-md mx-auto">
                    {t('noMassesMessage')}
                  </p>
                  <Button asChild>
                    <Link href="/settings/masses/create">
                      <Plus className="h-4 w-4 mr-2" />
                      {t('createTitle')}
                    </Link>
                  </Button>
                </div>
              )}
            </div>
          </SortableContext>
        </DndContext>
      </div>

      {/* Delete Confirmation Dialog */}
      <DeleteConfirmationDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        onConfirm={handleDelete}
        title="Delete Mass Type"
        description={`Are you sure you want to delete "${eventTypeToDelete?.name}"? This action cannot be undone. Events using this type will no longer have an assigned type.`}
      />
    </PageContainer>
  )
}

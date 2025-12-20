'use client'

import { ReactNode } from 'react'
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
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/content-card'
import { Button } from '@/components/ui/button'
import { Plus } from 'lucide-react'

interface ListCardProps<T> {
  title: string
  description?: string
  items: T[]
  renderItem: (item: T) => ReactNode
  onAdd?: () => void
  addButtonLabel?: string
  emptyMessage?: string
  enableDragAndDrop?: boolean
  onDragEnd?: (items: T[]) => void
  getItemId: (item: T) => string
}

export function ListCard<T>({
  title,
  description,
  items,
  renderItem,
  onAdd,
  addButtonLabel = 'Add',
  emptyMessage = 'No items added yet.',
  enableDragAndDrop = false,
  onDragEnd,
  getItemId,
}: ListCardProps<T>) {
  // Set up drag and drop sensors
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  )

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event

    if (!over || active.id === over.id || !onDragEnd) {
      return
    }

    const oldIndex = items.findIndex((item) => getItemId(item) === active.id)
    const newIndex = items.findIndex((item) => getItemId(item) === over.id)

    if (oldIndex === -1 || newIndex === -1) {
      return
    }

    // Reorder items
    const reorderedItems = [...items]
    const [removed] = reorderedItems.splice(oldIndex, 1)
    reorderedItems.splice(newIndex, 0, removed)

    onDragEnd(reorderedItems)
  }

  const content = items.length === 0 ? (
    <div className="text-center py-8 text-muted-foreground">
      <p className="mb-4">{emptyMessage}</p>
      {onAdd && (
        <p className="text-sm">Click &quot;{addButtonLabel}&quot; to get started.</p>
      )}
    </div>
  ) : enableDragAndDrop ? (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragEnd={handleDragEnd}
    >
      <SortableContext
        items={items.map(getItemId)}
        strategy={verticalListSortingStrategy}
      >
        <div className="space-y-2">
          {items.map((item) => (
            <div key={getItemId(item)}>{renderItem(item)}</div>
          ))}
        </div>
      </SortableContext>
    </DndContext>
  ) : (
    <div className="space-y-2">
      {items.map((item) => (
        <div key={getItemId(item)}>{renderItem(item)}</div>
      ))}
    </div>
  )

  return (
    <Card>
      <CardHeader className="flex flex-row items-start justify-between space-y-0 pb-4">
        <div className="space-y-1.5">
          <CardTitle>{title}</CardTitle>
          {description && <CardDescription>{description}</CardDescription>}
        </div>
        {onAdd && (
          <Button type="button" size="sm" onClick={onAdd}>
            <Plus className="h-4 w-4 mr-1" />
            {addButtonLabel}
          </Button>
        )}
      </CardHeader>
      <CardContent>{content}</CardContent>
    </Card>
  )
}

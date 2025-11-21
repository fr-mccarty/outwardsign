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
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Plus, Pencil, Trash2, GripVertical } from 'lucide-react'
import { MassTypeFormDialog } from './mass-type-form-dialog'
import type { MassType } from '@/lib/actions/mass-types'
import { deleteMassType, reorderMassTypes } from '@/lib/actions/mass-types'
import { toast } from 'sonner'
import { useRouter } from 'next/navigation'
import { DeleteConfirmationDialog } from '@/components/delete-confirmation-dialog'

interface MassTypesListClientProps {
  initialData: MassType[]
}

// Sortable mass type item component
function SortableMassTypeItem({
  massType,
  onEdit,
  onDelete,
}: {
  massType: MassType
  onEdit: (massType: MassType) => void
  onDelete: (massType: MassType) => void
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: massType.id })

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

      <div className="flex-1 flex items-center gap-2 min-w-0">
        <span className="font-medium text-sm truncate">{massType.name}</span>
        {massType.is_system && (
          <Badge variant="secondary" className="text-xs py-0">System</Badge>
        )}
        {!massType.active && (
          <Badge variant="outline" className="text-xs py-0">Inactive</Badge>
        )}
      </div>

      <div className="flex gap-1">
        <Button
          variant="ghost"
          size="icon"
          className="h-7 w-7"
          onClick={() => onEdit(massType)}
        >
          <Pencil className="h-3.5 w-3.5" />
        </Button>
        {!massType.is_system && (
          <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7"
            onClick={() => onDelete(massType)}
          >
            <Trash2 className="h-3.5 w-3.5" />
          </Button>
        )}
      </div>
    </div>
  )
}

export function MassTypesListClient({ initialData }: MassTypesListClientProps) {
  const router = useRouter()
  const [items, setItems] = useState<MassType[]>(initialData)
  const [selectedMassType, setSelectedMassType] = useState<MassType | undefined>()
  const [isFormDialogOpen, setIsFormDialogOpen] = useState(false)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [massTypeToDelete, setMassTypeToDelete] = useState<MassType | null>(null)

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
      await reorderMassTypes(itemIds)
      toast.success('Order updated')
    } catch (error) {
      console.error('Failed to reorder items:', error)
      toast.error('Failed to update order')
      // Revert on error
      setItems(initialData)
    }
  }

  const handleCreate = () => {
    setSelectedMassType(undefined)
    setIsFormDialogOpen(true)
  }

  const handleEdit = (massType: MassType) => {
    setSelectedMassType(massType)
    setIsFormDialogOpen(true)
  }

  const handleDelete = async () => {
    if (!massTypeToDelete) return

    try {
      await deleteMassType(massTypeToDelete.id)
      toast.success('Mass type deleted successfully')
      setMassTypeToDelete(null)
      router.refresh()
    } catch (error) {
      console.error('Failed to delete mass type:', error)
      const errorMessage = error instanceof Error ? error.message : 'Failed to delete mass type'
      toast.error(errorMessage)
      throw error
    }
  }

  const confirmDelete = (massType: MassType) => {
    setMassTypeToDelete(massType)
    setDeleteDialogOpen(true)
  }

  const handleFormSuccess = () => {
    setIsFormDialogOpen(false)
    router.refresh()
  }

  const stats = {
    total: items.length,
    active: items.filter((mt) => mt.active).length,
    custom: items.filter((mt) => !mt.is_system).length,
  }

  return (
    <PageContainer
      title="Mass Types"
      description="Manage mass type categories for your parish. Drag to reorder."
      actions={
        <Button onClick={handleCreate}>
          <Plus className="h-4 w-4 mr-2" />
          New Mass Type
        </Button>
      }
    >
      <div className="space-y-6">
        {/* Stats */}
        <div className="flex gap-4 text-sm text-muted-foreground">
          <span>
            {stats.total} total, {stats.active} active, {stats.custom} custom
          </span>
        </div>

        {/* Mass Types List */}
        {items.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <h3 className="text-lg font-semibold mb-2">No Mass Types</h3>
              <p className="text-muted-foreground mb-4">
                Get started by creating your first mass type.
              </p>
              <Button onClick={handleCreate}>
                <Plus className="h-4 w-4 mr-2" />
                Create Mass Type
              </Button>
            </CardContent>
          </Card>
        ) : (
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
                {items.map((massType) => (
                  <SortableMassTypeItem
                    key={massType.id}
                    massType={massType}
                    onEdit={handleEdit}
                    onDelete={confirmDelete}
                  />
                ))}
              </div>
            </SortableContext>
          </DndContext>
        )}
      </div>

      {/* Form Dialog */}
      <MassTypeFormDialog
        open={isFormDialogOpen}
        onOpenChange={setIsFormDialogOpen}
        massType={selectedMassType}
        onSuccess={handleFormSuccess}
      />

      {/* Delete Confirmation Dialog */}
      <DeleteConfirmationDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        title="Delete Mass Type"
        itemName={massTypeToDelete?.name}
        onConfirm={handleDelete}
      />
    </PageContainer>
  )
}

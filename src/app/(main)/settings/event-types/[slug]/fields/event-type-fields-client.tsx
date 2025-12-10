'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
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
import {
  deleteInputFieldDefinition,
  reorderInputFieldDefinitions,
} from '@/lib/actions/input-field-definitions'
import { toast } from 'sonner'
import type { DynamicEventType, InputFieldDefinition } from '@/lib/types'
import { DeleteConfirmationDialog } from '@/components/delete-confirmation-dialog'
import { InputFieldEditorDialog } from './input-field-editor-dialog'

interface EventTypeFieldsClientProps {
  eventType: DynamicEventType
  initialFields: InputFieldDefinition[]
}

// Sortable field item component
function SortableFieldItem({
  field,
  onEdit,
  onDelete,
}: {
  field: InputFieldDefinition
  onEdit: (field: InputFieldDefinition) => void
  onDelete: (field: InputFieldDefinition) => void
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: field.id })

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
          <span className="font-medium text-sm truncate">{field.name}</span>
          <Badge variant="outline" className="text-xs py-0">
            {field.type}
          </Badge>
          {field.required && (
            <Badge variant="secondary" className="text-xs py-0">
              Required
            </Badge>
          )}
          {field.is_key_person && (
            <Badge variant="default" className="text-xs py-0">
              Key Person
            </Badge>
          )}
        </div>
      </div>

      <div className="flex gap-1">
        <Button
          variant="ghost"
          size="icon"
          className="h-7 w-7"
          onClick={() => onEdit(field)}
        >
          <Pencil className="h-3.5 w-3.5" />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          className="h-7 w-7"
          onClick={() => onDelete(field)}
        >
          <Trash2 className="h-3.5 w-3.5" />
        </Button>
      </div>
    </div>
  )
}

export function EventTypeFieldsClient({
  eventType,
  initialFields,
}: EventTypeFieldsClientProps) {
  const router = useRouter()
  const [fields, setFields] = useState<InputFieldDefinition[]>(initialFields)
  const [selectedField, setSelectedField] = useState<
    InputFieldDefinition | undefined
  >()
  const [isFieldDialogOpen, setIsFieldDialogOpen] = useState(false)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [fieldToDelete, setFieldToDelete] = useState<InputFieldDefinition | null>(
    null
  )

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

    const oldIndex = fields.findIndex((field) => field.id === active.id)
    const newIndex = fields.findIndex((field) => field.id === over.id)

    if (oldIndex === -1 || newIndex === -1) {
      return
    }

    // Optimistically update UI
    const reorderedFields = arrayMove(fields, oldIndex, newIndex)
    setFields(reorderedFields)

    try {
      // Save to server
      const fieldIds = reorderedFields.map((field) => field.id)
      await reorderInputFieldDefinitions(eventType.id, fieldIds)
      toast.success('Field order updated')
    } catch (error) {
      console.error('Failed to reorder fields:', error)
      toast.error('Failed to update field order')
      // Revert on error
      setFields(initialFields)
    }
  }

  const handleCreate = () => {
    setSelectedField(undefined)
    setIsFieldDialogOpen(true)
  }

  const handleEdit = (field: InputFieldDefinition) => {
    setSelectedField(field)
    setIsFieldDialogOpen(true)
  }

  const handleDelete = async () => {
    if (!fieldToDelete) return

    try {
      await deleteInputFieldDefinition(fieldToDelete.id)
      toast.success('Field deleted successfully')
      setFieldToDelete(null)
      router.refresh()
    } catch (error) {
      console.error('Failed to delete field:', error)
      const errorMessage =
        error instanceof Error ? error.message : 'Failed to delete field'
      toast.error(errorMessage)
      throw error
    }
  }

  const confirmDelete = (field: InputFieldDefinition) => {
    setFieldToDelete(field)
    setDeleteDialogOpen(true)
  }

  const handleFieldSuccess = () => {
    setIsFieldDialogOpen(false)
    router.refresh()
  }

  return (
    <PageContainer
      title={`${eventType.name} - Input Fields`}
      description="Manage input fields for this event type. Drag to reorder."
      primaryAction={
        <Button onClick={handleCreate}>
          <Plus className="h-4 w-4 mr-2" />
          Add Input Field
        </Button>
      }
    >
      <div className="mb-6 flex gap-2">
        <Button
          variant="outline"
          onClick={() => router.push(`/settings/event-types/${eventType.slug}`)}
        >
          Back to Settings
        </Button>
        <Button
          variant="outline"
          onClick={() =>
            router.push(`/settings/event-types/${eventType.slug}/scripts`)
          }
        >
          Manage Scripts
        </Button>
      </div>

      {/* Sortable List */}
      <div className="border rounded-lg p-4 bg-muted/30">
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragEnd={handleDragEnd}
        >
          <SortableContext
            items={fields.map((field) => field.id)}
            strategy={verticalListSortingStrategy}
          >
            <div className="space-y-2">
              {fields.map((field) => (
                <SortableFieldItem
                  key={field.id}
                  field={field}
                  onEdit={handleEdit}
                  onDelete={confirmDelete}
                />
              ))}
              {fields.length === 0 && (
                <div className="text-center py-8 text-muted-foreground">
                  No input fields yet. Create one to get started.
                </div>
              )}
            </div>
          </SortableContext>
        </DndContext>
      </div>

      {/* Field Editor Dialog */}
      <InputFieldEditorDialog
        open={isFieldDialogOpen}
        onOpenChange={setIsFieldDialogOpen}
        eventTypeId={eventType.id}
        field={selectedField}
        onSuccess={handleFieldSuccess}
      />

      {/* Delete Confirmation Dialog */}
      <DeleteConfirmationDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        onConfirm={handleDelete}
        title="Delete Input Field"
        description={`Are you sure you want to delete the field "${fieldToDelete?.name}"? This action cannot be undone. Events with data in this field will lose that data.`}
      />
    </PageContainer>
  )
}

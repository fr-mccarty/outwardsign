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
import { PAGE_SECTIONS_SPACING } from '@/lib/constants/form-spacing'
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
  useSortable,
} from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { Button } from '@/components/ui/button'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Plus, Edit, Trash2, GripVertical, Info, ArrowLeft } from 'lucide-react'
import type { EventTypeWithRelations, InputFieldDefinition } from '@/lib/types/event-types'
import {
  deleteInputFieldDefinition,
  reorderInputFieldDefinitions,
} from '@/lib/actions/input-field-definitions'
import { toast } from 'sonner'
import { ConfirmationDialog } from '@/components/confirmation-dialog'
import Link from 'next/link'
import { useTranslations } from 'next-intl'
import { FieldFormDialog } from './field-form-dialog'

interface FieldsListClientProps {
  eventType: EventTypeWithRelations
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

  // Format field type for display
  const formatFieldType = (type: string) => {
    return type.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())
  }

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="flex items-center gap-3 py-3 px-4 border rounded-md bg-card hover:bg-accent/50 transition-colors"
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
          <span className="font-medium text-sm">{field.name}</span>
          {field.required && (
            <span className="text-xs text-destructive">*</span>
          )}
          {field.is_key_person && (
            <span className="text-xs bg-primary/10 text-primary px-2 py-0.5 rounded">Key Person</span>
          )}
          {field.is_primary && (
            <span className="text-xs bg-primary/10 text-primary px-2 py-0.5 rounded">Primary</span>
          )}
        </div>
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <span>{formatFieldType(field.type)}</span>
          <span>•</span>
          <code className="text-xs">{field.property_name}</code>
        </div>
      </div>

      <div className="flex gap-1">
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8"
          onClick={(e) => {
            e.preventDefault()
            e.stopPropagation()
            onEdit(field)
          }}
        >
          <Edit className="h-4 w-4" />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8"
          onClick={(e) => {
            e.preventDefault()
            e.stopPropagation()
            onDelete(field)
          }}
        >
          <Trash2 className="h-4 w-4" />
        </Button>
      </div>
    </div>
  )
}

export function FieldsListClient({ eventType, initialFields }: FieldsListClientProps) {
  const t = useTranslations()
  const [items, setItems] = useState<InputFieldDefinition[]>(initialFields)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [fieldToEdit, setFieldToEdit] = useState<InputFieldDefinition | null>(null)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [fieldToDelete, setFieldToDelete] = useState<InputFieldDefinition | null>(null)

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
      await reorderInputFieldDefinitions(eventType.id, itemIds)
      toast.success(t('common.orderUpdated'))
    } catch (error) {
      console.error('Failed to reorder fields:', error)
      toast.error(t('common.orderUpdateFailed'))
      // Revert on error
      setItems(initialFields)
    }
  }

  const handleDelete = async () => {
    if (!fieldToDelete) return

    try {
      await deleteInputFieldDefinition(fieldToDelete.id)
      setItems(items.filter((item) => item.id !== fieldToDelete.id))
      toast.success(t('eventType.fields.deleteSuccess'))
      setDeleteDialogOpen(false)
      setFieldToDelete(null)
    } catch (error) {
      console.error('Failed to delete field:', error)
      const errorMessage = error instanceof Error ? error.message : t('eventType.fields.deleteError')
      toast.error(errorMessage)
    }
  }

  const handleEdit = (field: InputFieldDefinition) => {
    setFieldToEdit(field)
    setDialogOpen(true)
  }

  const handleDeleteClick = (field: InputFieldDefinition) => {
    setFieldToDelete(field)
    setDeleteDialogOpen(true)
  }

  const handleDialogClose = () => {
    setDialogOpen(false)
    setFieldToEdit(null)
  }

  const handleFieldSaved = (field: InputFieldDefinition) => {
    if (fieldToEdit) {
      // Update existing field
      setItems(items.map((item) => (item.id === field.id ? field : item)))
    } else {
      // Add new field
      setItems([...items, field])
    }
    handleDialogClose()
  }

  return (
    <div className={PAGE_SECTIONS_SPACING}>
      {/* Back button */}
      <div>
        <Button variant="outline" asChild>
          <Link href={`/settings/event-types/${eventType.slug}`}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            {t('common.back')}
          </Link>
        </Button>
      </div>

      {/* Explanation */}
      <Alert>
        <Info className="h-4 w-4" />
        <AlertDescription>
          {t('eventType.fields.explanation', { eventTypeName: eventType.name })}
        </AlertDescription>
      </Alert>

      {/* Add Field Button */}
      <div className="flex justify-end">
        <Button onClick={() => setDialogOpen(true)}>
          <Plus className="h-4 w-4 mr-2" />
          {t('eventType.fields.addField')}
        </Button>
      </div>

      {/* Fields List */}
      {items.length === 0 ? (
        <div className="text-center py-12 border rounded-md bg-muted/30">
          <p className="text-muted-foreground mb-4">
            {t('eventType.fields.noFields')}
          </p>
          <Button onClick={() => setDialogOpen(true)}>
            <Plus className="h-4 w-4 mr-2" />
            {t('eventType.fields.addField')}
          </Button>
        </div>
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
              {items.map((field) => (
                <SortableFieldItem
                  key={field.id}
                  field={field}
                  onEdit={handleEdit}
                  onDelete={handleDeleteClick}
                />
              ))}
            </div>
          </SortableContext>
        </DndContext>
      )}

      {/* Field Form Dialog */}
      <FieldFormDialog
        eventType={eventType}
        field={fieldToEdit}
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        onClose={handleDialogClose}
        onSaved={handleFieldSaved}
      />

      {/* Delete Confirmation Dialog */}
      <ConfirmationDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        title={t('eventType.fields.deleteConfirmTitle')}
        description={t('eventType.fields.deleteConfirmDescription', {
          fieldName: fieldToDelete?.name || '',
        })}
        confirmLabel={t('common.delete')}
        cancelLabel={t('common.cancel')}
        onConfirm={handleDelete}
        variant="destructive"
      />
    </div>
  )
}

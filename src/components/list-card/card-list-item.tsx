'use client'

import { ReactNode, useState } from 'react'
import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { Button } from '@/components/ui/button'
import { ConfirmationDialog } from '@/components/confirmation-dialog'
import { ListItemDeleteButton } from '@/components/list-item-delete-button'
import { Edit, GripVertical } from 'lucide-react'

interface CardListItemProps {
  id: string
  children: ReactNode
  onEdit?: () => void
  onDelete?: () => Promise<void> | void
  deleteConfirmTitle?: string
  deleteConfirmDescription?: string
  deleteActionLabel?: string
  enableDragAndDrop?: boolean
}

export function CardListItem({
  id,
  children,
  onEdit,
  onDelete,
  deleteConfirmTitle = 'Delete Item',
  deleteConfirmDescription = 'Are you sure you want to delete this item? This action cannot be undone.',
  deleteActionLabel = 'Delete',
  enableDragAndDrop = false,
}: CardListItemProps) {
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)

  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id, disabled: !enableDragAndDrop })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  }

  const handleConfirmDelete = async () => {
    if (onDelete) {
      await onDelete()
    }
  }

  return (
    <>
      <div
        ref={setNodeRef}
        style={style}
        className="flex items-center justify-between py-2 px-3 border rounded-md bg-card"
      >
        <div className="flex items-center gap-3 flex-1 min-w-0">
          {enableDragAndDrop && (
            <button
              className="cursor-grab active:cursor-grabbing touch-none flex-shrink-0"
              {...attributes}
              {...listeners}
            >
              <GripVertical className="h-5 w-5 text-muted-foreground" />
            </button>
          )}
          <div className="flex-1 min-w-0">{children}</div>
        </div>
        <div className="flex items-center gap-1 flex-shrink-0 ml-2">
          {onEdit && (
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="h-7 w-7"
              onClick={onEdit}
            >
              <Edit className="h-3.5 w-3.5" />
            </Button>
          )}
          {onDelete && (
            <ListItemDeleteButton
              onClick={() => setIsDeleteDialogOpen(true)}
            />
          )}
        </div>
      </div>

      {onDelete && (
        <ConfirmationDialog
          open={isDeleteDialogOpen}
          onOpenChange={setIsDeleteDialogOpen}
          onConfirm={handleConfirmDelete}
          title={deleteConfirmTitle}
          description={deleteConfirmDescription}
          confirmLabel={deleteActionLabel}
          preset="delete"
        />
      )}
    </>
  )
}

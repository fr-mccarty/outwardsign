'use client'

import { Button } from "@/components/ui/button"
import Link from "next/link"
import { GripVertical, SquarePen, Eye } from "lucide-react"
import { useSortable } from "@dnd-kit/sortable"
import { CSS } from "@dnd-kit/utilities"
import { ModuleStatusLabel } from "./module-status-label"

interface DraggableListItemProps {
  id: string
  title: string
  description?: string
  editHref: string
  viewHref: string
  status?: string
  statusType?: 'module'
}

/**
 * DraggableListItem - Compact draggable row for sortable lists
 *
 * Use with vertical list layouts for drag & drop reordering.
 * Must be used within a DndContext and SortableContext.
 */
export function DraggableListItem({
  id,
  title,
  description,
  editHref,
  viewHref,
  status,
  statusType = 'module',
}: DraggableListItemProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  }

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="flex items-center gap-3 px-3 py-2 bg-card border rounded-md hover:bg-accent/50 transition-colors overflow-hidden w-full"
    >
      <button
        className="cursor-grab active:cursor-grabbing touch-none flex-shrink-0"
        {...attributes}
        {...listeners}
      >
        <GripVertical className="h-4 w-4 text-muted-foreground" />
      </button>

      <div className="flex-1 w-0">
        <div className="truncate font-medium">{title}</div>
        {description && (
          <p className="text-sm text-muted-foreground truncate">{description}</p>
        )}
        {status && (
          <ModuleStatusLabel
            status={status}
            statusType={statusType}
            className="text-xs"
          />
        )}
      </div>

      <div className="flex items-center gap-1 flex-shrink-0">
        <Button variant="ghost" size="icon" asChild className="h-8 w-8">
          <Link href={viewHref}>
            <Eye className="h-4 w-4" />
          </Link>
        </Button>
        <Button variant="ghost" size="icon" asChild className="h-8 w-8">
          <Link href={editHref}>
            <SquarePen className="h-4 w-4" />
          </Link>
        </Button>
      </div>
    </div>
  )
}

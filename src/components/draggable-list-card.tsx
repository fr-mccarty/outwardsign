'use client'

import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import Link from "next/link"
import { GripVertical, SquarePen } from "lucide-react"
import { ReactNode } from "react"
import { useSortable } from "@dnd-kit/sortable"
import { CSS } from "@dnd-kit/utilities"
import { ModuleStatusLabel } from "./module-status-label"
import { LITURGICAL_LANGUAGE_LABELS } from "@/lib/constants"

interface DraggableListCardProps {
  id: string
  title: string
  editHref: string
  viewHref: string
  viewButtonText?: string
  status?: string
  statusType?: 'module'
  language?: string
  children?: ReactNode
}

/**
 * DraggableListCard - Reusable draggable card component for list views
 *
 * Combines ListViewCard styling with @dnd-kit drag & drop functionality.
 * Must be used within a DndContext and SortableContext.
 *
 * Layout:
 * - Drag handle (left)
 * - Title with optional status badge below
 * - Edit icon button (upper right)
 * - Optional language badge (ghost variant)
 * - Custom content in the body (passed as children)
 * - View button in bottom right
 */
export function DraggableListCard({
  id,
  title,
  editHref,
  viewHref,
  viewButtonText = "View Details",
  status,
  statusType = 'module',
  language,
  children
}: DraggableListCardProps) {
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
    <Card
      ref={setNodeRef}
      style={style}
      className="hover:shadow-lg transition-shadow"
    >
      <CardHeader className="pb-2">
        <div className="flex items-start justify-between gap-2">
          <div className="flex items-start gap-2 flex-1 overflow-hidden">
            <button
              className="cursor-grab active:cursor-grabbing touch-none mt-1 flex-shrink-0"
              {...attributes}
              {...listeners}
            >
              <GripVertical className="h-4 w-4 text-muted-foreground" />
            </button>
            <div className="flex-1 overflow-hidden">
              <CardTitle className="text-lg line-clamp-1">
                {title}
              </CardTitle>
              {status && (
                <div className="mt-1">
                  <ModuleStatusLabel
                    status={status}
                    statusType={statusType}
                    className="text-xs"
                  />
                </div>
              )}
              {language && (
                <div className="mt-1">
                  <Badge variant="ghost" className="text-xs">
                    {LITURGICAL_LANGUAGE_LABELS[language]?.en || language}
                  </Badge>
                </div>
              )}
            </div>
          </div>
          <Button variant="outline" size="sm" asChild className="flex-shrink-0">
            <Link href={editHref}>
              <SquarePen className="h-4 w-4" />
            </Link>
          </Button>
        </div>
      </CardHeader>
      {(children || viewHref) && (
        <CardContent className="space-y-3">
          {children}
          <div className="flex justify-end items-center pt-2">
            <Button variant="outline" size="sm" asChild>
              <Link href={viewHref}>
                {viewButtonText}
              </Link>
            </Button>
          </div>
        </CardContent>
      )}
    </Card>
  )
}

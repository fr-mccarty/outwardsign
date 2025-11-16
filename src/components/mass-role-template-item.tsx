'use client'

import { useState, useEffect } from 'react'
import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { GripVertical, Trash2 } from "lucide-react"
import { updateTemplateItem, type MassRoleTemplateItemWithRole } from '@/lib/actions/mass-role-template-items'
import { toast } from 'sonner'
import { useDebounce } from '@/hooks/use-debounce'

interface MassRoleTemplateItemProps {
  item: MassRoleTemplateItemWithRole
  onDelete: (itemId: string) => void
  onUpdate: () => void
}

export function MassRoleTemplateItem({ item, onDelete, onUpdate }: MassRoleTemplateItemProps) {
  const [count, setCount] = useState(item.count)
  const [isUpdating, setIsUpdating] = useState(false)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)

  // Debounce count updates
  const debouncedCount = useDebounce(count, 500)

  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: item.id })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  }

  // Update count on server when debounced value changes
  useEffect(() => {
    if (debouncedCount !== item.count && debouncedCount > 0) {
      handleCountUpdate(debouncedCount)
    }
  }, [debouncedCount])

  const handleCountUpdate = async (newCount: number) => {
    try {
      setIsUpdating(true)
      await updateTemplateItem(item.id, { count: newCount })
      onUpdate()
    } catch (error) {
      console.error('Failed to update count:', error)
      toast.error('Failed to update count')
      // Revert to original value
      setCount(item.count)
    } finally {
      setIsUpdating(false)
    }
  }

  const handleDelete = async () => {
    setIsDeleting(true)
    try {
      await onDelete(item.id)
      setDeleteDialogOpen(false)
    } catch (error) {
      console.error('Failed to delete item:', error)
      toast.error('Failed to delete mass role')
    } finally {
      setIsDeleting(false)
    }
  }

  return (
    <>
      <Card ref={setNodeRef} style={style} className="p-3">
        <div className="flex items-center gap-3">
          {/* Drag Handle */}
          <button
            className="cursor-grab active:cursor-grabbing text-muted-foreground hover:text-foreground transition-colors"
            {...attributes}
            {...listeners}
            aria-label="Drag to reorder"
          >
            <GripVertical className="h-5 w-5" />
          </button>

          {/* Mass Role Name */}
          <div className="flex-1 min-w-0">
            <p className="font-medium truncate">{item.mass_role.name}</p>
            {item.mass_role.description && (
              <p className="text-sm text-muted-foreground truncate">
                {item.mass_role.description}
              </p>
            )}
          </div>

          {/* Count Input */}
          <div className="flex items-center gap-2">
            <label htmlFor={`count-${item.id}`} className="text-sm text-muted-foreground whitespace-nowrap">
              Count:
            </label>
            <Input
              id={`count-${item.id}`}
              type="number"
              min="1"
              max="99"
              value={count}
              onChange={(e) => {
                const value = parseInt(e.target.value)
                if (!isNaN(value) && value > 0) {
                  setCount(value)
                }
              }}
              className="w-20"
              disabled={isUpdating}
            />
          </div>

          {/* Delete Button */}
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setDeleteDialogOpen(true)}
            className="text-muted-foreground hover:text-destructive"
            aria-label="Delete mass role"
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </Card>

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Remove Mass Role from Template</DialogTitle>
            <DialogDescription>
              Are you sure you want to remove <strong>{item.mass_role.name}</strong> from this template?
              This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setDeleteDialogOpen(false)}
              disabled={isDeleting}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleDelete}
              disabled={isDeleting}
            >
              {isDeleting ? 'Removing...' : 'Remove Mass Role'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}

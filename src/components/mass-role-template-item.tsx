'use client'

import { useState, useEffect } from 'react'
import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { Input } from "@/components/ui/input"
import { updateTemplateItem, type MassRoleTemplateItemWithRole } from '@/lib/actions/mass-role-template-items'
import { toast } from 'sonner'
import { useDebounce } from '@/hooks/use-debounce'
import { CardListItem } from '@/components/list-card'

interface MassRoleTemplateItemProps {
  item: MassRoleTemplateItemWithRole
  onDelete: (itemId: string) => void
  onUpdate: () => void
}

export function MassRoleTemplateItem({ item, onDelete, onUpdate }: MassRoleTemplateItemProps) {
  const [count, setCount] = useState(item.count)
  const [isUpdating, setIsUpdating] = useState(false)

  // Debounce count updates
  const debouncedCount = useDebounce(count, 500)

  const {
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

  return (
    <div ref={setNodeRef} style={style}>
      <CardListItem
        id={item.id}
        onDelete={() => onDelete(item.id)}
        deleteConfirmTitle="Remove Mass Role from Template"
        deleteConfirmDescription={`Are you sure you want to remove ${item.mass_role.name} from this template? This action cannot be undone.`}
        enableDragAndDrop={true}
      >
        <div className="flex items-center gap-3 flex-1">
          {/* Drag Handle - rendered by CardListItem */}

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
        </div>
      </CardListItem>
    </div>
  )
}

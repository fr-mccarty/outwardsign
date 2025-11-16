'use client'

import { useState, useEffect } from 'react'
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
} from '@dnd-kit/sortable'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Plus } from "lucide-react"
import {
  getTemplateItems,
  reorderTemplateItems,
  deleteTemplateItem,
  createTemplateItem,
  type MassRoleTemplateItemWithRole
} from '@/lib/actions/mass-role-template-items'
import { MassRoleTemplateItem } from './mass-role-template-item'
import { MassRolePicker } from './mass-role-picker'
import { toast } from 'sonner'
import type { MassRole } from '@/lib/types'

interface MassRoleTemplateItemListProps {
  templateId: string
}

export function MassRoleTemplateItemList({ templateId }: MassRoleTemplateItemListProps) {
  const [items, setItems] = useState<MassRoleTemplateItemWithRole[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [showRolePicker, setShowRolePicker] = useState(false)

  // Set up drag and drop sensors
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  )

  // Load items on mount
  useEffect(() => {
    loadItems()
  }, [templateId])

  const loadItems = async () => {
    try {
      setIsLoading(true)
      const data = await getTemplateItems(templateId)
      setItems(data)
    } catch (error) {
      console.error('Failed to load template items:', error)
      toast.error('Failed to load template items')
    } finally {
      setIsLoading(false)
    }
  }

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event

    if (!over || active.id === over.id) {
      return
    }

    // Find the indices
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
      await reorderTemplateItems(templateId, itemIds)
      toast.success('Order updated')
    } catch (error) {
      console.error('Failed to reorder items:', error)
      toast.error('Failed to update order')
      // Revert on error
      loadItems()
    }
  }

  const handleDelete = async (itemId: string) => {
    try {
      await deleteTemplateItem(itemId)
      toast.success('Mass role removed from template')
      loadItems()
    } catch (error) {
      console.error('Failed to delete item:', error)
      toast.error('Failed to remove mass role')
    }
  }

  const handleRoleSelected = async (role: MassRole) => {
    try {
      // Check if role already exists in template
      const existingRoleIds = items.map(item => item.mass_role_id)
      if (existingRoleIds.includes(role.id)) {
        toast.error('This mass role is already in the template')
        setShowRolePicker(false)
        return
      }

      // Add role to template
      await createTemplateItem({
        template_id: templateId,
        mass_role_id: role.id,
        count: 1
      })
      toast.success('Mass role added to template')
      setShowRolePicker(false)
      loadItems()
    } catch (error) {
      console.error('Failed to add mass role:', error)
      toast.error('Failed to add mass role')
    }
  }

  if (isLoading) {
    return (
      <Card>
        <CardContent className="py-8 text-center text-muted-foreground">
          Loading mass roles...
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Template Mass Roles</CardTitle>
        <CardDescription>
          Define which mass roles are needed and how many of each. Drag to reorder.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {items.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <p className="mb-4">No mass roles added yet.</p>
            <p className="text-sm">Click "Add Mass Role" to get started.</p>
          </div>
        ) : (
          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragEnd={handleDragEnd}
          >
            <SortableContext
              items={items.map(item => item.id)}
              strategy={verticalListSortingStrategy}
            >
              <div className="space-y-2">
                {items.map((item) => (
                  <MassRoleTemplateItem
                    key={item.id}
                    item={item}
                    onDelete={handleDelete}
                    onUpdate={loadItems}
                  />
                ))}
              </div>
            </SortableContext>
          </DndContext>
        )}

        <Button
          onClick={() => setShowRolePicker(true)}
          variant="outline"
          className="w-full"
        >
          <Plus className="h-4 w-4 mr-2" />
          Add Mass Role
        </Button>

        <MassRolePicker
          open={showRolePicker}
          onOpenChange={setShowRolePicker}
          onSelect={handleRoleSelected}
          placeholder="Search for a mass role..."
          emptyMessage="No mass roles found."
        />
      </CardContent>
    </Card>
  )
}

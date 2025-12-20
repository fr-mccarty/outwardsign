'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent } from "@/components/content-card"
import { ListCard } from '@/components/list-card'
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
  const [showMassRolePicker, setShowMassRolePicker] = useState(false)

  // Load items on mount
  useEffect(() => {
    loadItems()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [templateId]) // loadItems is stable

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

  const handleReorder = async (reorderedItems: MassRoleTemplateItemWithRole[]) => {
    // Optimistically update UI
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

  const handleMassRoleSelected = async (massRole: MassRole) => {
    try {
      // Check if mass role already exists in template
      const existingMassRoleIds = items.map(item => item.mass_role_id)
      if (existingMassRoleIds.includes(massRole.id)) {
        toast.error('This mass role is already in the template')
        setShowMassRolePicker(false)
        return
      }

      // Add mass role to template
      await createTemplateItem({
        mass_roles_template_id: templateId,
        mass_role_id: massRole.id,
        count: 1
      })
      toast.success('Mass role added to template')
      setShowMassRolePicker(false)
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
    <>
      <ListCard
        title="Template Mass Roles"
        description="Define which mass roles are needed and how many of each. Drag to reorder."
        items={items}
        getItemId={(item) => item.id}
        onAdd={() => setShowMassRolePicker(true)}
        addButtonLabel="Add Role"
        emptyMessage="No mass roles added yet."
        enableDragAndDrop={true}
        onDragEnd={handleReorder}
        renderItem={(item) => (
          <MassRoleTemplateItem
            item={item}
            onDelete={handleDelete}
            onUpdate={loadItems}
          />
        )}
      />

      <MassRolePicker
        open={showMassRolePicker}
        onOpenChange={setShowMassRolePicker}
        onSelect={handleMassRoleSelected}
        placeholder="Search for a mass role..."
        emptyMessage="No mass roles found."
      />
    </>
  )
}

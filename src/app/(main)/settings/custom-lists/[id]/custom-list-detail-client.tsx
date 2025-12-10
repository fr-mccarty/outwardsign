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
  useSortable,
} from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { PageContainer } from '@/components/page-container'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Plus, Trash2, GripVertical, Edit2, Check, X } from 'lucide-react'
import type { CustomListWithItems, CustomListItem } from '@/lib/types'
import {
  updateCustomList,
  // deleteCustomList available for future list deletion
} from '@/lib/actions/custom-lists'
import {
  createCustomListItem,
  updateCustomListItem,
  deleteCustomListItem,
  reorderCustomListItems,
} from '@/lib/actions/custom-list-items'
import { toast } from 'sonner'
import { useRouter } from 'next/navigation'
import { DeleteConfirmationDialog } from '@/components/delete-confirmation-dialog'
import { useBreadcrumbs } from '@/components/breadcrumb-context'

interface CustomListDetailClientProps {
  customList: CustomListWithItems
}

// Sortable list item component
function SortableListItem({
  item,
  onEdit,
  onDelete,
  isEditing,
  editValue,
  onEditValueChange,
  onSaveEdit,
  onCancelEdit,
}: {
  item: CustomListItem
  onEdit: (item: CustomListItem) => void
  onDelete: (item: CustomListItem) => void
  isEditing: boolean
  editValue: string
  onEditValueChange: (value: string) => void
  onSaveEdit: () => void
  onCancelEdit: () => void
}) {
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

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="flex items-center gap-3 py-2 px-3 border rounded-md bg-card hover:bg-accent/50 transition-colors"
    >
      <button
        className="cursor-grab active:cursor-grabbing touch-none"
        {...attributes}
        {...listeners}
      >
        <GripVertical className="h-4 w-4 text-muted-foreground" />
      </button>

      {isEditing ? (
        <>
          <Input
            value={editValue}
            onChange={(e) => onEditValueChange(e.target.value)}
            className="flex-1"
            placeholder="Item value"
            autoFocus
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                onSaveEdit()
              } else if (e.key === 'Escape') {
                onCancelEdit()
              }
            }}
          />
          <div className="flex gap-1">
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7"
              onClick={onSaveEdit}
            >
              <Check className="h-3.5 w-3.5" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7"
              onClick={onCancelEdit}
            >
              <X className="h-3.5 w-3.5" />
            </Button>
          </div>
        </>
      ) : (
        <>
          <span className="flex-1 text-sm">{item.value}</span>
          <div className="flex gap-1">
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7"
              onClick={(e) => {
                e.preventDefault()
                e.stopPropagation()
                onEdit(item)
              }}
            >
              <Edit2 className="h-3.5 w-3.5" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7"
              onClick={(e) => {
                e.preventDefault()
                e.stopPropagation()
                onDelete(item)
              }}
            >
              <Trash2 className="h-3.5 w-3.5" />
            </Button>
          </div>
        </>
      )}
    </div>
  )
}

export function CustomListDetailClient({ customList: initialCustomList }: CustomListDetailClientProps) {
  const router = useRouter()
  const { setBreadcrumbs } = useBreadcrumbs()
  const [customList, setCustomList] = useState(initialCustomList)
  const [items, setItems] = useState<CustomListItem[]>(initialCustomList.items || [])
  const [listName, setListName] = useState(customList.name)
  const [isEditingName, setIsEditingName] = useState(false)
  const [newItemValue, setNewItemValue] = useState('')
  const [isAddingItem, setIsAddingItem] = useState(false)
  const [editingItemId, setEditingItemId] = useState<string | null>(null)
  const [editingItemValue, setEditingItemValue] = useState('')
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [itemToDelete, setItemToDelete] = useState<CustomListItem | null>(null)

  useEffect(() => {
    setBreadcrumbs([
      { label: 'Dashboard', href: '/dashboard' },
      { label: 'Settings', href: '/settings' },
      { label: 'Custom Lists', href: '/settings/custom-lists' },
      { label: customList.name }
    ])
  }, [setBreadcrumbs, customList.name])

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
      await reorderCustomListItems(customList.id, itemIds)
      toast.success('Order updated')
    } catch (error) {
      console.error('Failed to reorder items:', error)
      toast.error('Failed to update order')
      // Revert on error
      setItems(initialCustomList.items || [])
    }
  }

  const handleSaveListName = async () => {
    if (listName.trim() === '' || listName === customList.name) {
      setListName(customList.name)
      setIsEditingName(false)
      return
    }

    try {
      await updateCustomList(customList.id, { name: listName })
      setCustomList({ ...customList, name: listName })
      setIsEditingName(false)
      toast.success('List name updated')
      router.refresh()
    } catch (error) {
      console.error('Failed to update list name:', error)
      toast.error('Failed to update list name')
      setListName(customList.name)
    }
  }

  const handleAddItem = async () => {
    if (newItemValue.trim() === '') {
      toast.error('Item value cannot be empty')
      return
    }

    setIsAddingItem(true)
    try {
      const newItem = await createCustomListItem(customList.id, { value: newItemValue })
      setItems([...items, newItem])
      setNewItemValue('')
      toast.success('Item added')
      router.refresh()
    } catch (error) {
      console.error('Failed to add item:', error)
      toast.error('Failed to add item')
    } finally {
      setIsAddingItem(false)
    }
  }

  const startEditingItem = (item: CustomListItem) => {
    setEditingItemId(item.id)
    setEditingItemValue(item.value)
  }

  const handleSaveItemEdit = async () => {
    if (!editingItemId) return

    if (editingItemValue.trim() === '') {
      toast.error('Item value cannot be empty')
      return
    }

    try {
      await updateCustomListItem(editingItemId, { value: editingItemValue })
      setItems(items.map((item) =>
        item.id === editingItemId ? { ...item, value: editingItemValue } : item
      ))
      setEditingItemId(null)
      setEditingItemValue('')
      toast.success('Item updated')
      router.refresh()
    } catch (error) {
      console.error('Failed to update item:', error)
      toast.error('Failed to update item')
    }
  }

  const handleCancelItemEdit = () => {
    setEditingItemId(null)
    setEditingItemValue('')
  }

  const handleDeleteItem = async () => {
    if (!itemToDelete) return

    try {
      await deleteCustomListItem(itemToDelete.id)
      setItems(items.filter((item) => item.id !== itemToDelete.id))
      setItemToDelete(null)
      toast.success('Item deleted')
      router.refresh()
    } catch (error) {
      console.error('Failed to delete item:', error)
      const errorMessage = error instanceof Error ? error.message : 'Failed to delete item'
      toast.error(errorMessage)
      throw error
    }
  }

  const confirmDeleteItem = (item: CustomListItem) => {
    setItemToDelete(item)
    setDeleteDialogOpen(true)
  }

  return (
    <PageContainer
      title={
        isEditingName ? (
          <div className="flex items-center gap-2">
            <Input
              value={listName}
              onChange={(e) => setListName(e.target.value)}
              className="max-w-md"
              autoFocus
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  handleSaveListName()
                } else if (e.key === 'Escape') {
                  setListName(customList.name)
                  setIsEditingName(false)
                }
              }}
            />
            <Button variant="ghost" size="icon" onClick={handleSaveListName}>
              <Check className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => {
                setListName(customList.name)
                setIsEditingName(false)
              }}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        ) : (
          <div className="flex items-center gap-2">
            <span>{customList.name}</span>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setIsEditingName(true)}
            >
              <Edit2 className="h-4 w-4" />
            </Button>
          </div>
        )
      }
      description="Manage list items. Drag to reorder."
    >
      {/* Add new item */}
      <div className="mb-6 flex gap-2">
        <Input
          value={newItemValue}
          onChange={(e) => setNewItemValue(e.target.value)}
          placeholder="Add new item..."
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              handleAddItem()
            }
          }}
          disabled={isAddingItem}
        />
        <Button
          onClick={handleAddItem}
          disabled={isAddingItem || newItemValue.trim() === ''}
        >
          <Plus className="h-4 w-4 mr-2" />
          Add Item
        </Button>
      </div>

      {/* Sortable List */}
      <div className="border rounded-lg p-4 bg-muted/30">
        {items.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-muted-foreground mb-4">
              No items yet. Add your first item above.
            </p>
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
                {items.map((item) => (
                  <SortableListItem
                    key={item.id}
                    item={item}
                    onEdit={startEditingItem}
                    onDelete={confirmDeleteItem}
                    isEditing={editingItemId === item.id}
                    editValue={editingItemValue}
                    onEditValueChange={setEditingItemValue}
                    onSaveEdit={handleSaveItemEdit}
                    onCancelEdit={handleCancelItemEdit}
                  />
                ))}
              </div>
            </SortableContext>
          </DndContext>
        )}
      </div>

      {/* Delete Confirmation Dialog */}
      <DeleteConfirmationDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        onConfirm={handleDeleteItem}
        title="Delete List Item"
        description={`Are you sure you want to delete "${itemToDelete?.value}"? If this item is used in events, those events may show empty values.`}
      />
    </PageContainer>
  )
}

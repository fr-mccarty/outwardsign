'use client'

import { useState, useEffect, useMemo } from 'react'
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
import { Label } from '@/components/ui/label'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Plus, Trash2, GripVertical, Edit2 } from 'lucide-react'
import type { CustomListWithItems, CustomListItem } from '@/lib/types'
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
import { ClearableSearchInput } from '@/components/clearable-search-input'

interface CustomListDetailClientProps {
  customList: CustomListWithItems
}

// Sortable list item component
function SortableListItem({
  item,
  onEdit,
  onDelete,
}: {
  item: CustomListItem
  onEdit: (item: CustomListItem) => void
  onDelete: (item: CustomListItem) => void
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
    </div>
  )
}

export function CustomListDetailClient({ customList: initialCustomList }: CustomListDetailClientProps) {
  const router = useRouter()
  const { setBreadcrumbs } = useBreadcrumbs()
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [customList, setCustomList] = useState(initialCustomList)
  const [items, setItems] = useState<CustomListItem[]>(initialCustomList.items || [])
  const [searchValue, setSearchValue] = useState('')

  // Edit dialog state
  const [editDialogOpen, setEditDialogOpen] = useState(false)
  const [editingItem, setEditingItem] = useState<CustomListItem | null>(null)
  const [editingItemValue, setEditingItemValue] = useState('')
  const [isSavingEdit, setIsSavingEdit] = useState(false)

  // Delete dialog state
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

  // Filter items based on search
  const filteredItems = useMemo(() => {
    if (!searchValue.trim()) return items
    const search = searchValue.toLowerCase()
    return items.filter(item => item.value.toLowerCase().includes(search))
  }, [items, searchValue])

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

  const openAddDialog = () => {
    setEditingItem(null)
    setEditingItemValue('')
    setEditDialogOpen(true)
  }

  const handleSaveItem = async () => {
    if (editingItemValue.trim() === '') {
      toast.error('Item value cannot be empty')
      return
    }

    setIsSavingEdit(true)
    try {
      if (editingItem) {
        // Editing existing item
        await updateCustomListItem(editingItem.id, { value: editingItemValue })
        setItems(items.map((item) =>
          item.id === editingItem.id ? { ...item, value: editingItemValue } : item
        ))
        toast.success('Item updated')
      } else {
        // Adding new item
        const newItem = await createCustomListItem(customList.id, { value: editingItemValue })
        setItems([...items, newItem])
        toast.success('Item added')
      }
      setEditDialogOpen(false)
      setEditingItem(null)
      setEditingItemValue('')
      router.refresh()
    } catch (error) {
      console.error('Failed to save item:', error)
      toast.error(editingItem ? 'Failed to update item' : 'Failed to add item')
    } finally {
      setIsSavingEdit(false)
    }
  }

  const openEditDialog = (item: CustomListItem) => {
    setEditingItem(item)
    setEditingItemValue(item.value)
    setEditDialogOpen(true)
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
      title={customList.name}
      description="Manage list items. Drag to reorder."
    >
      {/* Search and Add */}
      <div className="mb-6 flex gap-2">
        <ClearableSearchInput
          value={searchValue}
          onChange={setSearchValue}
          placeholder="Search items..."
          className="flex-1"
        />
        <Button onClick={openAddDialog}>
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
        ) : filteredItems.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-muted-foreground">
              No items match your search.
            </p>
          </div>
        ) : (
          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragEnd={handleDragEnd}
          >
            <SortableContext
              items={filteredItems.map((item) => item.id)}
              strategy={verticalListSortingStrategy}
            >
              <div className="space-y-2">
                {filteredItems.map((item) => (
                  <SortableListItem
                    key={item.id}
                    item={item}
                    onEdit={openEditDialog}
                    onDelete={confirmDeleteItem}
                  />
                ))}
              </div>
            </SortableContext>
          </DndContext>
        )}
      </div>

      {/* Add/Edit Item Dialog */}
      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>{editingItem ? 'Edit Item' : 'Add Item'}</DialogTitle>
            <DialogDescription>
              {editingItem ? 'Update the item value below.' : 'Enter the value for the new item.'}
            </DialogDescription>
          </DialogHeader>

          <div className="py-4 space-y-2">
            <Label htmlFor="item-value">
              Value <span className="text-destructive">*</span>
            </Label>
            <Input
              id="item-value"
              value={editingItemValue}
              onChange={(e) => setEditingItemValue(e.target.value)}
              placeholder="Item value"
              autoFocus
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault()
                  handleSaveItem()
                }
              }}
            />
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => setEditDialogOpen(false)}
              disabled={isSavingEdit}
            >
              Cancel
            </Button>
            <Button
              onClick={handleSaveItem}
              disabled={isSavingEdit}
            >
              {isSavingEdit ? 'Saving...' : editingItem ? 'Save' : 'Add'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

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

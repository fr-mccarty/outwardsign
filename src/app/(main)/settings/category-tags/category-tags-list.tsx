'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
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
import { Button } from '@/components/ui/button'
import { Plus, Tag, Trash2, Edit, GripVertical } from 'lucide-react'
import { PageContainer } from '@/components/page-container'
import { ConfirmationDialog } from '@/components/confirmation-dialog'
import { deleteCategoryTag, reorderCategoryTags } from '@/lib/actions/category-tags'
import type { CategoryTagWithUsageCount } from '@/lib/types'
import { toast } from 'sonner'
import { useBreadcrumbs } from '@/components/breadcrumb-context'
import Link from 'next/link'

interface CategoryTagsListProps {
  initialTags: CategoryTagWithUsageCount[]
}

// Sortable tag item component
function SortableTagItem({
  tag,
  onEdit,
  onDelete,
}: {
  tag: CategoryTagWithUsageCount
  onEdit: (id: string) => void
  onDelete: (tag: CategoryTagWithUsageCount) => void
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: tag.id })

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

      <Tag className="h-4 w-4 text-muted-foreground flex-shrink-0" />

      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <span className="font-medium text-sm">{tag.name}</span>
          <span className="text-xs text-muted-foreground">({tag.slug})</span>
        </div>
        <div className="text-xs text-muted-foreground">
          Used in {tag.usage_count} item{tag.usage_count !== 1 ? 's' : ''}
        </div>
      </div>

      <div className="flex gap-1 flex-shrink-0">
        <Button
          variant="ghost"
          size="icon"
          className="h-7 w-7"
          onClick={() => onEdit(tag.id)}
        >
          <Edit className="h-3.5 w-3.5" />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          className="h-7 w-7"
          onClick={() => onDelete(tag)}
          disabled={tag.usage_count > 0}
        >
          <Trash2 className="h-3.5 w-3.5" />
        </Button>
      </div>
    </div>
  )
}

export function CategoryTagsList({ initialTags }: CategoryTagsListProps) {
  const router = useRouter()
  const { setBreadcrumbs } = useBreadcrumbs()
  const [items, setItems] = useState<CategoryTagWithUsageCount[]>(initialTags)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [tagToDelete, setTagToDelete] = useState<CategoryTagWithUsageCount | null>(null)

  useEffect(() => {
    setBreadcrumbs([
      { label: 'Dashboard', href: '/dashboard' },
      { label: 'Settings', href: '/settings' },
      { label: 'Category Tags' }
    ])
  }, [setBreadcrumbs])

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
      await reorderCategoryTags(itemIds)
      toast.success('Order updated')
    } catch (error) {
      console.error('Failed to reorder items:', error)
      toast.error('Failed to update order')
      // Revert on error
      setItems(initialTags)
    }
  }

  const handleEditClick = (id: string) => {
    router.push(`/settings/category-tags/${id}/edit`)
  }

  const handleDeleteClick = (tag: CategoryTagWithUsageCount) => {
    if (tag.usage_count > 0) {
      toast.error(`Cannot delete tag "${tag.name}" because it is assigned to ${tag.usage_count} item(s)`)
      return
    }
    setTagToDelete(tag)
    setDeleteDialogOpen(true)
  }

  const confirmDelete = async () => {
    if (!tagToDelete) return

    try {
      await deleteCategoryTag(tagToDelete.id)
      toast.success('Tag deleted successfully')
      setDeleteDialogOpen(false)
      setTagToDelete(null)
      router.refresh()
    } catch (error: any) {
      console.error('Error deleting tag:', error)
      toast.error(error.message || 'Failed to delete tag')
    }
  }

  return (
    <PageContainer
      title="Category Tags"
      description="Manage tags for organizing content and petitions. Drag to reorder."
      primaryAction={
        <Button asChild>
          <Link href="/settings/category-tags/create">
            <Plus className="mr-2 h-4 w-4" />
            Create Tag
          </Link>
        </Button>
      }
    >
      {items.length === 0 ? (
        <div className="border rounded-lg p-4 bg-muted/30">
          <div className="text-center py-12">
            <Tag className="mx-auto h-12 w-12 text-muted-foreground" />
            <h3 className="mt-4 text-lg font-semibold">No tags found</h3>
            <p className="mt-2 text-sm text-muted-foreground">
              Get started by creating your first tag
            </p>
            <Button asChild className="mt-4">
              <Link href="/settings/category-tags/create">
                <Plus className="mr-2 h-4 w-4" />
                Create Tag
              </Link>
            </Button>
          </div>
        </div>
      ) : (
        <div className="border rounded-lg p-4 bg-muted/30">
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
                {items.map((tag) => (
                  <SortableTagItem
                    key={tag.id}
                    tag={tag}
                    onEdit={handleEditClick}
                    onDelete={handleDeleteClick}
                  />
                ))}
              </div>
            </SortableContext>
          </DndContext>
        </div>
      )}

      {/* Delete Confirmation Dialog */}
      <ConfirmationDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        onConfirm={confirmDelete}
        title="Delete Tag?"
        description={
          tagToDelete
            ? `Are you sure you want to delete the tag "${tagToDelete.name}"? This action cannot be undone.`
            : ''
        }
        confirmLabel="Delete"
        cancelLabel="Cancel"
        variant="destructive"
      />
    </PageContainer>
  )
}

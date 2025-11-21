# Drag and Drop Implementation Guide

## Overview

This project uses `@dnd-kit` for drag-and-drop functionality. This document covers implementation patterns and common pitfalls.

## Library

- **@dnd-kit/core** - Core DnD functionality
- **@dnd-kit/sortable** - Sortable list utilities
- **@dnd-kit/utilities** - CSS transform utilities

## Basic Implementation Pattern

### 1. Parent Component (List)

```tsx
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

function SortableList({ items, onReorder }) {
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  )

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event
    if (!over || active.id === over.id) return

    const oldIndex = items.findIndex((item) => item.id === active.id)
    const newIndex = items.findIndex((item) => item.id === over.id)

    // Optimistically update UI
    const reorderedItems = arrayMove(items, oldIndex, newIndex)
    setItems(reorderedItems)

    // Persist to server
    await onReorder(reorderedItems.map((item) => item.id))
  }

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragEnd={handleDragEnd}
    >
      <SortableContext
        items={items.map((item) => item.id)}
        strategy={verticalListSortingStrategy}
      >
        {items.map((item) => (
          <SortableItem key={item.id} item={item} />
        ))}
      </SortableContext>
    </DndContext>
  )
}
```

### 2. Child Component (Sortable Item)

```tsx
import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { GripVertical } from 'lucide-react'

function SortableItem({ item }) {
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
    <div ref={setNodeRef} style={style}>
      <button
        className="cursor-grab active:cursor-grabbing touch-none"
        {...attributes}
        {...listeners}
      >
        <GripVertical className="h-5 w-5 text-muted-foreground" />
      </button>
      {/* Rest of item content */}
    </div>
  )
}
```

## Server Action Pattern

### Database Requirements

Tables that support reordering need:
- A `position` or `display_order` column (INTEGER)
- Index on the order column for performance

### Unique Constraint Handling

**CRITICAL:** If your table has a unique constraint on `(parent_id, position)`, you cannot update positions one at a time when swapping - it will violate the constraint.

**Solution:** Use a two-phase update:

```tsx
export async function reorderItems(parentId: string, orderedIds: string[]): Promise<void> {
  const supabase = await createClient()

  // Phase 1: Set all positions to high temporary values
  for (let i = 0; i < orderedIds.length; i++) {
    await supabase
      .from('items')
      .update({ position: 10000 + i })
      .eq('id', orderedIds[i])
      .eq('parent_id', parentId)
  }

  // Phase 2: Set final positions
  for (let i = 0; i < orderedIds.length; i++) {
    await supabase
      .from('items')
      .update({ position: i })
      .eq('id', orderedIds[i])
      .eq('parent_id', parentId)
  }

  revalidatePath(`/items`)
}
```

**Important:** Use high positive values (10000+) for temporary positions. Negative values may violate CHECK constraints like `position >= 0`.

## Current Implementations

| Component | Location | Notes |
|-----------|----------|-------|
| Mass Role Template Items | `src/components/mass-role-template-item-list.tsx` | Has unique constraint on (template_id, position) |
| Mass Types | `src/app/(main)/mass-types/mass-types-list-client.tsx` | Uses display_order column |

## UI Guidelines

1. **Drag Handle:** Always use a visible drag handle (`GripVertical` icon) - don't make the entire item draggable
2. **Visual Feedback:** Reduce opacity while dragging (`isDragging ? 0.5 : 1`)
3. **Cursor:** Use `cursor-grab` and `active:cursor-grabbing` classes
4. **Touch Support:** Add `touch-none` class to the drag handle
5. **Description:** Add "Drag to reorder" hint in the page description
6. **Toast Feedback:** Show success/error toast after reorder completes

## Optimistic Updates

Always update the UI immediately, then persist to server:

```tsx
// Optimistically update UI
const reorderedItems = arrayMove(items, oldIndex, newIndex)
setItems(reorderedItems)

try {
  await reorderItems(reorderedItems.map((item) => item.id))
  toast.success('Order updated')
} catch (error) {
  // Revert on error
  setItems(originalItems)
  toast.error('Failed to update order')
}
```

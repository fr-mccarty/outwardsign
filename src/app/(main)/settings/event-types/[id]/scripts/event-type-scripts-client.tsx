'use client'

import { useState } from 'react'
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
import { PageContainer } from '@/components/page-container'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Plus, Pencil, Trash2, GripVertical, FileText } from 'lucide-react'
import {
  deleteScript,
  reorderScripts,
  createScript,
} from '@/lib/actions/scripts'
import { toast } from 'sonner'
import type { DynamicEventType, Script, InputFieldDefinition } from '@/lib/types'
import { DeleteConfirmationDialog } from '@/components/delete-confirmation-dialog'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'
import { FormInput } from '@/components/form-input'

interface EventTypeScriptsClientProps {
  eventType: DynamicEventType
  initialScripts: Script[]
  inputFields: InputFieldDefinition[]
}

// Sortable script item component
function SortableScriptItem({
  script,
  onEdit,
  onDelete,
}: {
  script: Script
  onEdit: (script: Script) => void
  onDelete: (script: Script) => void
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: script.id })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  }

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="flex items-center gap-3 py-3 px-4 border rounded-md bg-card hover:bg-accent/5 transition-colors"
    >
      <button
        className="cursor-grab active:cursor-grabbing touch-none"
        {...attributes}
        {...listeners}
      >
        <GripVertical className="h-5 w-5 text-muted-foreground" />
      </button>

      <FileText className="h-5 w-5 text-muted-foreground" />

      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <span className="font-medium text-sm truncate">{script.name}</span>
          <Badge variant="outline" className="text-xs py-0">
            Script
          </Badge>
        </div>
        <p className="text-xs text-muted-foreground">
          Click to manage sections
        </p>
      </div>

      <div className="flex gap-1">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => onEdit(script)}
        >
          <Pencil className="h-4 w-4 mr-2" />
          Edit
        </Button>
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8"
          onClick={() => onDelete(script)}
        >
          <Trash2 className="h-4 w-4" />
        </Button>
      </div>
    </div>
  )
}

// Create script dialog component
function CreateScriptDialog({
  open,
  onOpenChange,
  onSubmit,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSubmit: (name: string) => Promise<void>
}) {
  const [name, setName] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmit = async () => {
    if (!name.trim()) {
      toast.error('Script name is required')
      return
    }

    setIsSubmitting(true)
    try {
      await onSubmit(name)
      setName('')
      onOpenChange(false)
    } catch (_error) {
      // Error is handled in parent via toast
      void _error
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Create Script</DialogTitle>
        </DialogHeader>
        <div className="py-4">
          <FormInput
            id="script-name"
            label="Script Name"
            value={name}
            onChange={setName}
            required
            placeholder="e.g., English Program, Spanish Program"
          />
        </div>
        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isSubmitting}
          >
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={isSubmitting}>
            {isSubmitting ? 'Creating...' : 'Create Script'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

export function EventTypeScriptsClient({
  eventType,
  initialScripts,
  inputFields: _inputFields,
}: EventTypeScriptsClientProps) {
  // inputFields available for future field-based section generation
  void _inputFields
  const router = useRouter()
  const [scripts, setScripts] = useState<Script[]>(initialScripts)
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [scriptToDelete, setScriptToDelete] = useState<Script | null>(null)

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

    const oldIndex = scripts.findIndex((script) => script.id === active.id)
    const newIndex = scripts.findIndex((script) => script.id === over.id)

    // Optimistically update the UI
    const newScripts = arrayMove(scripts, oldIndex, newIndex)
    setScripts(newScripts)

    try {
      // Reorder on the server
      await reorderScripts(
        eventType.id,
        newScripts.map((s) => s.id)
      )
      toast.success('Scripts reordered successfully')
      router.refresh()
    } catch (error) {
      console.error('Failed to reorder scripts:', error)
      toast.error('Failed to reorder scripts')
      // Revert on error
      setScripts(scripts)
    }
  }

  const handleCreateScript = async (name: string) => {
    try {
      const newScript = await createScript({
        event_type_id: eventType.id,
        name,
      })
      toast.success('Script created successfully')
      router.refresh()
      // Navigate to script builder
      router.push(
        `/settings/event-types/${eventType.id}/scripts/${newScript.id}`
      )
    } catch (error) {
      console.error('Failed to create script:', error)
      toast.error('Failed to create script')
      throw error
    }
  }

  const handleEditScript = (script: Script) => {
    router.push(`/settings/event-types/${eventType.id}/scripts/${script.id}`)
  }

  const handleDeleteClick = (script: Script) => {
    setScriptToDelete(script)
    setDeleteDialogOpen(true)
  }

  const handleDeleteConfirm = async () => {
    if (!scriptToDelete) return

    try {
      await deleteScript(scriptToDelete.id)
      toast.success('Script deleted successfully')
      router.refresh()
    } catch (error) {
      console.error('Failed to delete script:', error)
      toast.error('Failed to delete script')
      throw error
    }
  }

  return (
    <PageContainer
      title="Scripts"
      description="Manage scripts for this event type. Scripts define the structure and content of programs and documents."
    >
      <div className="mb-6 flex gap-2">
        <Button
          variant="outline"
          onClick={() => router.push(`/settings/event-types/${eventType.id}`)}
        >
          Back to Settings
        </Button>
        <Button
          variant="outline"
          onClick={() =>
            router.push(`/settings/event-types/${eventType.id}/fields`)
          }
        >
          Manage Input Fields
        </Button>
      </div>

      <div className="flex justify-between items-center mb-4">
        <div>
          <h2 className="text-lg font-semibold">
            Scripts for {eventType.name}
          </h2>
          <p className="text-sm text-muted-foreground">
            Drag to reorder. Click to edit sections.
          </p>
        </div>
        <Button onClick={() => setIsCreateDialogOpen(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Create Script
        </Button>
      </div>

      {scripts.length === 0 ? (
        <div className="text-center py-12 border rounded-lg bg-card">
          <FileText className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
          <h3 className="text-lg font-medium mb-2">No scripts yet</h3>
          <p className="text-sm text-muted-foreground mb-4">
            Create your first script to define programs and documents for this
            event type.
          </p>
          <Button onClick={() => setIsCreateDialogOpen(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Create Script
          </Button>
        </div>
      ) : (
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragEnd={handleDragEnd}
        >
          <SortableContext
            items={scripts.map((s) => s.id)}
            strategy={verticalListSortingStrategy}
          >
            <div className="space-y-2">
              {scripts.map((script) => (
                <SortableScriptItem
                  key={script.id}
                  script={script}
                  onEdit={handleEditScript}
                  onDelete={handleDeleteClick}
                />
              ))}
            </div>
          </SortableContext>
        </DndContext>
      )}

      <CreateScriptDialog
        open={isCreateDialogOpen}
        onOpenChange={setIsCreateDialogOpen}
        onSubmit={handleCreateScript}
      />

      <DeleteConfirmationDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        onConfirm={handleDeleteConfirm}
        title="Delete Script"
        description={`Are you sure you want to delete "${scriptToDelete?.name}"? This will also delete all sections in this script. This action cannot be undone.`}
      />
    </PageContainer>
  )
}

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
import { Button } from '@/components/ui/button'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Plus, Edit, Trash2, GripVertical, Info, FileText } from 'lucide-react'
import type { EventTypeWithRelations, Script } from '@/lib/types/event-types'
import {
  createScript,
  deleteScript,
  reorderScripts,
} from '@/lib/actions/scripts'
import { toast } from 'sonner'
import { ConfirmationDialog } from '@/components/confirmation-dialog'
import { useTranslations } from 'next-intl'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'

interface ScriptsListClientProps {
  eventType: EventTypeWithRelations
  initialScripts: Script[]
}

// Sortable script item component
function SortableScriptItem({
  script,
  eventTypeSlug,
  onEdit,
  onDelete,
}: {
  script: Script
  eventTypeSlug: string
  onEdit: () => void
  onDelete: (script: Script) => void
}) {
  const router = useRouter()
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

  const handleClick = () => {
    router.push(`/settings/event-types/${eventTypeSlug}/scripts/${script.id}`)
  }

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="flex items-center gap-3 py-4 px-4 border rounded-md bg-card hover:bg-accent/50 transition-colors cursor-pointer"
      onClick={handleClick}
    >
      <button
        className="cursor-grab active:cursor-grabbing touch-none"
        onClick={(e) => e.stopPropagation()}
        {...attributes}
        {...listeners}
      >
        <GripVertical className="h-4 w-4 text-muted-foreground" />
      </button>

      <FileText className="h-4 w-4 text-muted-foreground flex-shrink-0" />

      <div className="flex-1 min-w-0">
        <div className="font-medium text-sm">{script.name}</div>
        {script.description && (
          <div className="text-xs text-muted-foreground line-clamp-1">
            {script.description}
          </div>
        )}
      </div>

      <div className="flex gap-1">
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8"
          onClick={(e) => {
            e.preventDefault()
            e.stopPropagation()
            onEdit()
          }}
        >
          <Edit className="h-4 w-4" />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8"
          onClick={(e) => {
            e.preventDefault()
            e.stopPropagation()
            onDelete(script)
          }}
        >
          <Trash2 className="h-4 w-4" />
        </Button>
      </div>
    </div>
  )
}

export function ScriptsListClient({ eventType, initialScripts }: ScriptsListClientProps) {
  const t = useTranslations()
  const router = useRouter()
  const [items, setItems] = useState<Script[]>(initialScripts)
  const [createDialogOpen, setCreateDialogOpen] = useState(false)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [scriptToDelete, setScriptToDelete] = useState<Script | null>(null)
  const [newScriptName, setNewScriptName] = useState('')
  const [newScriptDescription, setNewScriptDescription] = useState('')
  const [isCreating, setIsCreating] = useState(false)

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
      await reorderScripts(eventType.id, itemIds)
      toast.success(t('common.orderUpdated'))
    } catch (error) {
      console.error('Failed to reorder scripts:', error)
      toast.error(t('common.orderUpdateFailed'))
      // Revert on error
      setItems(initialScripts)
    }
  }

  const handleDelete = async () => {
    if (!scriptToDelete) return

    try {
      await deleteScript(scriptToDelete.id)
      setItems(items.filter((item) => item.id !== scriptToDelete.id))
      toast.success(t('eventType.scripts.deleteSuccess'))
      setDeleteDialogOpen(false)
      setScriptToDelete(null)
      router.refresh()
    } catch (error) {
      console.error('Failed to delete script:', error)
      const errorMessage = error instanceof Error ? error.message : t('eventType.scripts.deleteError')
      toast.error(errorMessage)
    }
  }

  const handleDeleteClick = (script: Script) => {
    setScriptToDelete(script)
    setDeleteDialogOpen(true)
  }

  const handleEditClick = (script: Script) => {
    router.push(`/settings/event-types/${eventType.slug}/scripts/${script.id}`)
  }

  const handleCreate = async () => {
    if (!newScriptName.trim()) {
      toast.error(t('eventType.scripts.nameRequired'))
      return
    }

    setIsCreating(true)
    try {
      const newScript = await createScript({
        event_type_id: eventType.id,
        name: newScriptName.trim(),
        description: newScriptDescription.trim() || null,
      })
      setItems([...items, newScript])
      toast.success(t('eventType.scripts.createSuccess'))
      setCreateDialogOpen(false)
      setNewScriptName('')
      setNewScriptDescription('')
      router.refresh()
      // Navigate to edit the new script
      router.push(`/settings/event-types/${eventType.slug}/scripts/${newScript.id}`)
    } catch (error) {
      console.error('Failed to create script:', error)
      toast.error(t('eventType.scripts.createError'))
    } finally {
      setIsCreating(false)
    }
  }

  return (
    <div className="space-y-6">
      {/* Explanation */}
      <Alert>
        <Info className="h-4 w-4" />
        <AlertDescription>
          {t('eventType.scripts.explanation', { eventTypeName: eventType.name })}
        </AlertDescription>
      </Alert>

      {/* Add Script Button */}
      <div className="flex justify-end">
        <Button onClick={() => setCreateDialogOpen(true)}>
          <Plus className="h-4 w-4 mr-2" />
          {t('eventType.scripts.addScript')}
        </Button>
      </div>

      {/* Scripts List */}
      {items.length === 0 ? (
        <div className="text-center py-12 border rounded-md bg-muted/30">
          <p className="text-muted-foreground mb-4">
            {t('eventType.scripts.noScripts')}
          </p>
          <Button onClick={() => setCreateDialogOpen(true)}>
            <Plus className="h-4 w-4 mr-2" />
            {t('eventType.scripts.addScript')}
          </Button>
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
              {items.map((script) => (
                <SortableScriptItem
                  key={script.id}
                  script={script}
                  eventTypeSlug={eventType.slug || ''}
                  onEdit={() => handleEditClick(script)}
                  onDelete={handleDeleteClick}
                />
              ))}
            </div>
          </SortableContext>
        </DndContext>
      )}

      {/* Create Script Dialog */}
      <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t('eventType.scripts.createScript')}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="script-name">{t('eventType.scripts.scriptName')}</Label>
              <Input
                id="script-name"
                value={newScriptName}
                onChange={(e) => setNewScriptName(e.target.value)}
                placeholder={t('eventType.scripts.scriptNamePlaceholder')}
              />
            </div>
            <div>
              <Label htmlFor="script-description">{t('eventType.scripts.scriptDescription')}</Label>
              <Textarea
                id="script-description"
                value={newScriptDescription}
                onChange={(e) => setNewScriptDescription(e.target.value)}
                placeholder={t('eventType.scripts.scriptDescriptionPlaceholder')}
                rows={3}
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setCreateDialogOpen(false)
                setNewScriptName('')
                setNewScriptDescription('')
              }}
            >
              {t('common.cancel')}
            </Button>
            <Button onClick={handleCreate} disabled={isCreating}>
              {t('common.create')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <ConfirmationDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        title={t('eventType.scripts.deleteConfirmTitle')}
        description={t('eventType.scripts.deleteConfirmDescription', {
          scriptName: scriptToDelete?.name || '',
        })}
        confirmLabel={t('common.delete')}
        cancelLabel={t('common.cancel')}
        onConfirm={handleDelete}
        variant="destructive"
      />
    </div>
  )
}

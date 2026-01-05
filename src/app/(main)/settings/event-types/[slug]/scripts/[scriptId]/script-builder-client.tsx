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
import { LinkButton } from '@/components/link-button'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Plus, Edit, Trash2, GripVertical, Info, ArrowLeft, FileText } from 'lucide-react'
import type { ScriptWithSections, Section, EventTypeWithRelations } from '@/lib/types/event-types'
import { updateScript } from '@/lib/actions/scripts'
import {
  deleteSection,
  reorderSections,
} from '@/lib/actions/sections'
import { toast } from 'sonner'
import { ConfirmationDialog } from '@/components/confirmation-dialog'
import { useTranslations } from 'next-intl'
import Link from 'next/link'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { FORM_FIELDS_SPACING } from '@/lib/constants/form-spacing'

// Schema for script metadata form
const scriptMetadataSchema = z.object({
  name: z.string().min(1, 'Script name is required'),
  description: z.string().optional(),
})

type ScriptMetadataFormValues = z.infer<typeof scriptMetadataSchema>

interface ScriptBuilderClientProps {
  script: ScriptWithSections
  eventType: EventTypeWithRelations
}

// Sortable section item component
function SortableSectionItem({
  section,
  editUrl,
  onDelete,
}: {
  section: Section
  editUrl: string
  onDelete: (section: Section) => void
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: section.id })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  }

  // Content preview (first 100 chars)
  const contentPreview = section.content ? section.content.substring(0, 100) + (section.content.length > 100 ? '...' : '') : ''

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="flex items-center gap-3 py-4 px-4 border rounded-md bg-card hover:bg-accent/50 transition-colors"
    >
      <button
        className="cursor-grab active:cursor-grabbing touch-none"
        {...attributes}
        {...listeners}
      >
        <GripVertical className="h-4 w-4 text-muted-foreground" />
      </button>

      <FileText className="h-4 w-4 text-muted-foreground flex-shrink-0" />

      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <span className="font-medium text-sm">{section.name}</span>
          {section.page_break_after && (
            <span className="text-xs bg-primary/10 text-primary px-2 py-0.5 rounded">Page Break</span>
          )}
        </div>
        {contentPreview && (
          <div className="text-xs text-muted-foreground line-clamp-1 mt-1">
            {contentPreview}
          </div>
        )}
      </div>

      <div className="flex gap-1">
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8"
          asChild
        >
          <Link href={editUrl}>
            <Edit className="h-4 w-4" />
          </Link>
        </Button>
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8"
          onClick={(e) => {
            e.preventDefault()
            e.stopPropagation()
            onDelete(section)
          }}
        >
          <Trash2 className="h-4 w-4" />
        </Button>
      </div>
    </div>
  )
}

export function ScriptBuilderClient({ script, eventType }: ScriptBuilderClientProps) {
  const t = useTranslations()
  const router = useRouter()
  const [sections, setSections] = useState<Section[]>(script.sections || [])
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [sectionToDelete, setSectionToDelete] = useState<Section | null>(null)
  const [isEditingMetadata, setIsEditingMetadata] = useState(false)

  // Base URL for section pages
  const sectionBaseUrl = `/settings/event-types/${eventType.slug}/scripts/${script.id}/sections`

  // Script metadata form
  const form = useForm<ScriptMetadataFormValues>({
    resolver: zodResolver(scriptMetadataSchema),
    defaultValues: {
      name: script.name,
      description: script.description || '',
    },
  })

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

    const oldIndex = sections.findIndex((item) => item.id === active.id)
    const newIndex = sections.findIndex((item) => item.id === over.id)

    if (oldIndex === -1 || newIndex === -1) {
      return
    }

    // Optimistically update UI
    const reorderedSections = arrayMove(sections, oldIndex, newIndex)
    setSections(reorderedSections)

    try {
      // Save to server
      const sectionIds = reorderedSections.map((item) => item.id)
      await reorderSections(script.id, sectionIds)
      toast.success(t('common.orderUpdated'))
    } catch (error) {
      console.error('Failed to reorder sections:', error)
      toast.error(t('common.orderUpdateFailed'))
      // Revert on error
      setSections(script.sections || [])
    }
  }

  const handleDelete = async () => {
    if (!sectionToDelete) return

    try {
      await deleteSection(sectionToDelete.id)
      setSections(sections.filter((item) => item.id !== sectionToDelete.id))
      toast.success(t('eventType.scripts.sections.deleteSuccess'))
      setDeleteDialogOpen(false)
      setSectionToDelete(null)
      router.refresh()
    } catch (error) {
      console.error('Failed to delete section:', error)
      const errorMessage = error instanceof Error ? error.message : t('eventType.scripts.sections.deleteError')
      toast.error(errorMessage)
    }
  }

  const handleDeleteClick = (section: Section) => {
    setSectionToDelete(section)
    setDeleteDialogOpen(true)
  }

  const handleSaveScriptMetadata = async (data: ScriptMetadataFormValues) => {
    try {
      await updateScript(script.id, {
        name: data.name,
        description: data.description || null,
      })
      toast.success(t('eventType.scripts.updateSuccess'))
      setIsEditingMetadata(false)
      router.refresh()
    } catch (error) {
      console.error('Failed to update script:', error)
      toast.error(t('eventType.scripts.updateError'))
    }
  }

  return (
    <div className="space-y-6">
      {/* Back button */}
      <div>
        <LinkButton href={`/settings/event-types/${eventType.slug}/scripts`} variant="outline">
          <ArrowLeft className="w-4 h-4 mr-2" />
          {t('common.back')}
        </LinkButton>
      </div>

      {/* Script Name and Description */}
      <Form {...form}>
        <form onSubmit={form.handleSubmit(handleSaveScriptMetadata)} className={`border rounded-md p-4 ${FORM_FIELDS_SPACING}`}>
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{t('eventType.scripts.scriptName')}</FormLabel>
                <FormControl>
                  <Input
                    {...field}
                    onChange={(e) => {
                      field.onChange(e)
                      setIsEditingMetadata(true)
                    }}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="description"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{t('eventType.scripts.scriptDescription')}</FormLabel>
                <FormControl>
                  <Textarea
                    {...field}
                    rows={2}
                    onChange={(e) => {
                      field.onChange(e)
                      setIsEditingMetadata(true)
                    }}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          {isEditingMetadata && (
            <div className="flex justify-end">
              <Button type="submit" size="sm">
                {t('common.save')}
              </Button>
            </div>
          )}
        </form>
      </Form>

      {/* Explanation */}
      <Alert>
        <Info className="h-4 w-4" />
        <AlertDescription>
          {t('eventType.scripts.sections.explanation')}
        </AlertDescription>
      </Alert>

      {/* Sections Container */}
      <div className="space-y-4">
        {/* Add Section Button */}
        <div className="flex justify-between items-center">
          <h3 className="text-lg font-semibold">{t('eventType.scripts.sections.title')}</h3>
          <LinkButton href={`${sectionBaseUrl}/create`}>
            <Plus className="h-4 w-4 mr-2" />
            {t('eventType.scripts.sections.addSection')}
          </LinkButton>
        </div>

        {/* Sections List */}
        {sections.length === 0 ? (
          <div className="text-center py-12 border rounded-md bg-muted/30">
            <p className="text-muted-foreground mb-4">
              {t('eventType.scripts.sections.noSections')}
            </p>
            <LinkButton href={`${sectionBaseUrl}/create`}>
              <Plus className="h-4 w-4 mr-2" />
              {t('eventType.scripts.sections.addSection')}
            </LinkButton>
          </div>
        ) : (
          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragEnd={handleDragEnd}
          >
            <SortableContext
              items={sections.map((item) => item.id)}
              strategy={verticalListSortingStrategy}
            >
              <div className="space-y-2">
                {sections.map((section) => (
                  <SortableSectionItem
                    key={section.id}
                    section={section}
                    editUrl={`${sectionBaseUrl}/${section.id}`}
                    onDelete={handleDeleteClick}
                  />
                ))}
              </div>
            </SortableContext>
          </DndContext>
        )}
      </div>

      {/* Delete Confirmation Dialog */}
      <ConfirmationDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        title={t('eventType.scripts.sections.deleteConfirmTitle')}
        description={t('eventType.scripts.sections.deleteConfirmDescription', {
          sectionName: sectionToDelete?.name || '',
        })}
        confirmLabel={t('common.delete')}
        cancelLabel={t('common.cancel')}
        onConfirm={handleDelete}
        variant="destructive"
      />
    </div>
  )
}

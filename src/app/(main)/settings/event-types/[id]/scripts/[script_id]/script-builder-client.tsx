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
import { FormSectionCard } from '@/components/form-section-card'
import { FormInput } from '@/components/form-input'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { SaveButton } from '@/components/save-button'
import {
  Plus,
  Pencil,
  Trash2,
  GripVertical,
  FileText,
  FileDown,
} from 'lucide-react'
import { updateScript } from '@/lib/actions/scripts'
import { deleteSection, reorderSections } from '@/lib/actions/sections'
import { toast } from 'sonner'
import type {
  DynamicEventType,
  ScriptWithSections,
  Section,
  InputFieldDefinition,
} from '@/lib/types'
import { DeleteConfirmationDialog } from '@/components/delete-confirmation-dialog'
import { SectionEditorDialog } from '@/components/section-editor-dialog'

interface ScriptBuilderClientProps {
  eventType: DynamicEventType
  script: ScriptWithSections
  inputFields: InputFieldDefinition[]
}

// Sortable section item component
function SortableSectionItem({
  section,
  onEdit,
  onDelete,
}: {
  section: Section
  onEdit: (section: Section) => void
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

  // Get content preview (first 100 chars)
  const contentPreview =
    section.content.length > 100
      ? section.content.substring(0, 100) + '...'
      : section.content

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="flex items-start gap-3 py-3 px-4 border rounded-md bg-card hover:bg-accent/5 transition-colors"
    >
      <button
        className="cursor-grab active:cursor-grabbing touch-none mt-1"
        {...attributes}
        {...listeners}
      >
        <GripVertical className="h-5 w-5 text-muted-foreground" />
      </button>

      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-1">
          <span className="font-medium text-sm">{section.name}</span>
          {section.page_break_after && (
            <Badge variant="outline" className="text-xs py-0">
              Page Break
            </Badge>
          )}
        </div>
        <p className="text-xs text-muted-foreground line-clamp-2">
          {contentPreview || 'No content'}
        </p>
      </div>

      <div className="flex gap-1">
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8"
          onClick={() => onEdit(section)}
        >
          <Pencil className="h-4 w-4" />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8"
          onClick={() => onDelete(section)}
        >
          <Trash2 className="h-4 w-4" />
        </Button>
      </div>
    </div>
  )
}

export function ScriptBuilderClient({
  eventType,
  script,
  inputFields,
}: ScriptBuilderClientProps) {
  const router = useRouter()
  const [scriptName, setScriptName] = useState(script.name)
  const [sections, setSections] = useState<Section[]>(script.sections)
  const [isSaving, setIsSaving] = useState(false)
  const [isSectionDialogOpen, setIsSectionDialogOpen] = useState(false)
  const [selectedSection, setSelectedSection] = useState<Section | undefined>()
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [sectionToDelete, setSectionToDelete] = useState<Section | null>(null)

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

    const oldIndex = sections.findIndex((section) => section.id === active.id)
    const newIndex = sections.findIndex((section) => section.id === over.id)

    // Optimistically update the UI
    const newSections = arrayMove(sections, oldIndex, newIndex)
    setSections(newSections)

    try {
      // Reorder on the server
      await reorderSections(
        script.id,
        newSections.map((s) => s.id)
      )
      toast.success('Sections reordered successfully')
      router.refresh()
    } catch (error) {
      console.error('Failed to reorder sections:', error)
      toast.error('Failed to reorder sections')
      // Revert on error
      setSections(sections)
    }
  }

  const handleSaveScriptName = async () => {
    if (!scriptName.trim()) {
      toast.error('Script name is required')
      return
    }

    setIsSaving(true)
    try {
      await updateScript(script.id, { name: scriptName })
      toast.success('Script name updated successfully')
      router.refresh()
    } catch (error) {
      console.error('Failed to update script name:', error)
      toast.error('Failed to update script name')
    } finally {
      setIsSaving(false)
    }
  }

  const handleAddSection = () => {
    setSelectedSection(undefined)
    setIsSectionDialogOpen(true)
  }

  const handleEditSection = (section: Section) => {
    setSelectedSection(section)
    setIsSectionDialogOpen(true)
  }

  const handleDeleteClick = (section: Section) => {
    setSectionToDelete(section)
    setDeleteDialogOpen(true)
  }

  const handleDeleteConfirm = async () => {
    if (!sectionToDelete) return

    try {
      await deleteSection(sectionToDelete.id)
      toast.success('Section deleted successfully')
      router.refresh()
    } catch (error) {
      console.error('Failed to delete section:', error)
      toast.error('Failed to delete section')
      throw error
    }
  }

  const handleSectionSaved = () => {
    router.refresh()
  }

  return (
    <PageContainer
      title={`Script Builder: ${script.name}`}
      description="Build your script by adding and organizing sections with content."
    >
      <div className="mb-6 flex gap-2">
        <Button
          variant="outline"
          onClick={() =>
            router.push(`/settings/event-types/${eventType.id}/scripts`)
          }
        >
          Back to Scripts
        </Button>
      </div>

      <div className="space-y-6">
        {/* Script Name Section */}
        <FormSectionCard title="Script Settings">
          <div className="flex gap-3 items-end">
            <div className="flex-1">
              <FormInput
                id="script-name"
                label="Script Name"
                value={scriptName}
                onChange={setScriptName}
                required
                placeholder="e.g., English Program, Spanish Program"
              />
            </div>
            <SaveButton
              isLoading={isSaving}
              onClick={handleSaveScriptName}
              disabled={scriptName === script.name}
            />
          </div>
        </FormSectionCard>

        {/* Sections List */}
        <FormSectionCard
          title="Sections"
          description="Add sections to build your script. Drag to reorder."
        >
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <p className="text-sm text-muted-foreground">
                {sections.length} section{sections.length !== 1 ? 's' : ''}
              </p>
              <Button onClick={handleAddSection}>
                <Plus className="h-4 w-4 mr-2" />
                Add Section
              </Button>
            </div>

            {sections.length === 0 ? (
              <div className="text-center py-8 border rounded-lg bg-muted/10">
                <FileText className="h-10 w-10 mx-auto text-muted-foreground mb-3" />
                <h3 className="text-sm font-medium mb-1">No sections yet</h3>
                <p className="text-xs text-muted-foreground mb-4">
                  Add your first section to start building the script.
                </p>
                <Button onClick={handleAddSection} size="sm">
                  <Plus className="h-4 w-4 mr-2" />
                  Add Section
                </Button>
              </div>
            ) : (
              <DndContext
                sensors={sensors}
                collisionDetection={closestCenter}
                onDragEnd={handleDragEnd}
              >
                <SortableContext
                  items={sections.map((s) => s.id)}
                  strategy={verticalListSortingStrategy}
                >
                  <div className="space-y-2">
                    {sections.map((section) => (
                      <SortableSectionItem
                        key={section.id}
                        section={section}
                        onEdit={handleEditSection}
                        onDelete={handleDeleteClick}
                      />
                    ))}
                  </div>
                </SortableContext>
              </DndContext>
            )}
          </div>
        </FormSectionCard>

        {/* Preview and Export Section */}
        <FormSectionCard title="Preview & Export">
          <div className="flex gap-3">
            <Button variant="outline" disabled>
              <FileDown className="h-4 w-4 mr-2" />
              Preview Script
            </Button>
            <p className="text-sm text-muted-foreground self-center">
              Preview and export features coming soon
            </p>
          </div>
        </FormSectionCard>
      </div>

      <SectionEditorDialog
        open={isSectionDialogOpen}
        onOpenChange={setIsSectionDialogOpen}
        section={selectedSection}
        scriptId={script.id}
        inputFields={inputFields}
        onSaved={handleSectionSaved}
      />

      <DeleteConfirmationDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        onConfirm={handleDeleteConfirm}
        title="Delete Section"
        description={`Are you sure you want to delete "${sectionToDelete?.name}"? This action cannot be undone.`}
      />
    </PageContainer>
  )
}

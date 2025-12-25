'use client'

import { useState, useEffect } from 'react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { FormInput } from '@/components/form-input'
import { Checkbox } from '@/components/ui/checkbox'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { TiptapEditor } from '@/components/tiptap-editor'
import { createSection, updateSection } from '@/lib/actions/sections'
import { toast } from 'sonner'
import type { Section, InputFieldDefinition, SectionType } from '@/lib/types'

interface SectionEditorDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  section?: Section
  scriptId: string
  inputFields: InputFieldDefinition[]
  onSaved: () => void
}

const SECTION_TYPE_OPTIONS: { value: SectionType; label: string; description: string }[] = [
  { value: 'text', label: 'Text', description: 'Rich text with field placeholders' },
  { value: 'petition', label: 'Petition', description: 'Prayer of the Faithful / Petitions' },
]

export function SectionEditorDialog({
  open,
  onOpenChange,
  section,
  scriptId,
  inputFields,
  onSaved,
}: SectionEditorDialogProps) {
  const [name, setName] = useState('')
  const [sectionType, setSectionType] = useState<SectionType>('text')
  const [content, setContent] = useState('')
  const [pageBreakAfter, setPageBreakAfter] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Load section data when editing
  useEffect(() => {
    if (section) {
      setName(section.name)
      setSectionType(section.section_type || 'text')
      setContent(section.content)
      setPageBreakAfter(section.page_break_after)
    } else {
      setName('')
      setSectionType('text')
      setContent('')
      setPageBreakAfter(false)
    }
  }, [section, open])

  const handleSubmit = async () => {
    if (!name.trim()) {
      toast.error('Section name is required')
      return
    }

    // Content is only required for text type
    if (sectionType === 'text' && !content.trim()) {
      toast.error('Section content is required')
      return
    }

    setIsSubmitting(true)
    try {
      if (section) {
        // Update existing section
        await updateSection(section.id, {
          name: name.trim(),
          section_type: sectionType,
          content: sectionType === 'text' ? content.trim() : '',
          page_break_after: pageBreakAfter,
        })
        toast.success('Section updated successfully')
      } else {
        // Create new section
        await createSection(scriptId, {
          name: name.trim(),
          section_type: sectionType,
          content: sectionType === 'text' ? content.trim() : '',
          page_break_after: pageBreakAfter,
        })
        toast.success('Section created successfully')
      }

      onSaved()
      onOpenChange(false)
    } catch (error) {
      console.error('Failed to save section:', error)
      toast.error('Failed to save section')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {section ? 'Edit Section' : 'Create Section'}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Section Name */}
          <FormInput
            id="section-name"
            label="Section Name"
            value={name}
            onChange={setName}
            required
            placeholder="e.g., Opening Prayer, Readings, Closing"
          />

          {/* Section Type Selector */}
          <div className="space-y-2">
            <Label htmlFor="section-type">Section Type</Label>
            <Select
              value={sectionType}
              onValueChange={(value) => setSectionType(value as SectionType)}
            >
              <SelectTrigger id="section-type">
                <SelectValue placeholder="Select section type" />
              </SelectTrigger>
              <SelectContent>
                {SECTION_TYPE_OPTIONS.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    <div className="flex flex-col">
                      <span>{option.label}</span>
                      <span className="text-xs text-muted-foreground">
                        {option.description}
                      </span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Content - only show for text type */}
          {sectionType === 'text' && (
            <TiptapEditor
              value={content}
              onChange={setContent}
              availableFields={inputFields}
              label="Content"
              required
              placeholder="Enter the section content..."
            />
          )}

          {/* Petition message - show for petition type */}
          {sectionType === 'petition' && (
            <div className="rounded-lg border border-border bg-muted/30 p-4">
              <p className="text-sm text-muted-foreground">
                This section will display the event&apos;s petitions (Prayer of the Faithful).
                Petitions are created and edited when filling out the event details, using the
                petition input field.
              </p>
              <p className="text-sm text-muted-foreground mt-2">
                Make sure the event type has a <strong>petition</strong> input field configured.
              </p>
            </div>
          )}

          {/* Page Break After */}
          <div className="flex items-center space-x-2">
            <Checkbox
              id="page-break-after"
              checked={pageBreakAfter}
              onCheckedChange={(checked) =>
                setPageBreakAfter(checked as boolean)
              }
            />
            <Label
              htmlFor="page-break-after"
              className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
            >
              Insert page break after this section
            </Label>
          </div>
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
            {isSubmitting
              ? 'Saving...'
              : section
                ? 'Update Section'
                : 'Create Section'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

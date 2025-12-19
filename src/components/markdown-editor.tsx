'use client'

import { useRef, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Input } from '@/components/ui/input'
import {
  Bold,
  Italic,
  Underline,
  Heading1,
  Heading2,
  Heading3,
  AlignLeft,
  AlignCenter,
  AlignRight,
  List,
  ListOrdered,
  Type,
  ChevronDown,
  Users,
  Church,
} from 'lucide-react'
import { PARISH_PLACEHOLDERS } from '@/lib/utils/markdown-processor'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSub,
  DropdownMenuSubTrigger,
  DropdownMenuSubContent,
  DropdownMenuPortal,
} from '@/components/ui/dropdown-menu'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import type { InputFieldDefinition } from '@/lib/types'

interface MarkdownEditorProps {
  value: string
  onChange: (value: string) => void
  availableFields: InputFieldDefinition[]
  placeholder?: string
  label?: string
  required?: boolean
}

export function MarkdownEditor({
  value,
  onChange,
  availableFields,
  placeholder,
  label,
  required,
}: MarkdownEditorProps) {
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  // Gendered text dialog state
  const [genderedDialogOpen, setGenderedDialogOpen] = useState(false)
  const [selectedPersonField, setSelectedPersonField] = useState<string | null>(null)  // property_name for template
  const [selectedPersonFieldDisplay, setSelectedPersonFieldDisplay] = useState<string | null>(null)  // display name for dialog
  const [maleText, setMaleText] = useState('')
  const [femaleText, setFemaleText] = useState('')

  // Filter to only person-type fields for gendered text
  const personFields = availableFields.filter(field => field.type === 'person')

  // Get current selection or cursor position
  const getSelection = () => {
    const textarea = textareaRef.current
    if (!textarea) return { start: 0, end: 0, text: '' }

    return {
      start: textarea.selectionStart,
      end: textarea.selectionEnd,
      text: textarea.value.substring(
        textarea.selectionStart,
        textarea.selectionEnd
      ),
    }
  }

  // Insert text at cursor position or wrap selection
  const insertText = (before: string, after: string = '') => {
    const textarea = textareaRef.current
    if (!textarea) return

    const { start, end, text } = getSelection()
    const newValue =
      value.substring(0, start) + before + text + after + value.substring(end)

    onChange(newValue)

    // Set cursor position after the inserted text
    setTimeout(() => {
      const newCursorPos = start + before.length + text.length + after.length
      textarea.focus()
      textarea.setSelectionRange(newCursorPos, newCursorPos)
    }, 0)
  }

  // Insert text at line start (for headings and lists)
  const insertAtLineStart = (prefix: string) => {
    const textarea = textareaRef.current
    if (!textarea) return

    const { start } = getSelection()

    // Find the start of the current line
    let lineStart = start
    while (lineStart > 0 && value[lineStart - 1] !== '\n') {
      lineStart--
    }

    const newValue =
      value.substring(0, lineStart) + prefix + value.substring(lineStart)

    onChange(newValue)

    // Set cursor position after the prefix
    setTimeout(() => {
      const newCursorPos = start + prefix.length
      textarea.focus()
      textarea.setSelectionRange(newCursorPos, newCursorPos)
    }, 0)
  }

  // Formatting functions
  const applyBold = () => insertText('**', '**')
  const applyItalic = () => insertText('*', '*')
  const applyUnderline = () => insertText('<u>', '</u>')
  const applyRed = () => insertText('{red}', '{/red}')
  const applyH1 = () => insertAtLineStart('# ')
  const applyH2 = () => insertAtLineStart('## ')
  const applyH3 = () => insertAtLineStart('### ')
  const applyBulletList = () => insertAtLineStart('- ')
  const applyNumberedList = () => insertAtLineStart('1. ')

  // Alignment helpers (using HTML since markdown doesn't have native alignment)
  const applyAlignment = (align: 'left' | 'center' | 'right') => {
    const { start, end, text } = getSelection()
    if (!text) return

    const alignedText = `<div style="text-align: ${align}">\n${text}\n</div>`
    const textarea = textareaRef.current
    if (!textarea) return

    const newValue =
      value.substring(0, start) + alignedText + value.substring(end)
    onChange(newValue)

    setTimeout(() => {
      textarea.focus()
      textarea.setSelectionRange(start, start + alignedText.length)
    }, 0)
  }

  // Insert field placeholder
  const insertField = (fieldName: string) => {
    insertText(`{{${fieldName}}}`)
  }

  // Open gendered text dialog for a person field
  const openGenderedDialog = (propertyName: string, displayName: string) => {
    setSelectedPersonField(propertyName)
    setSelectedPersonFieldDisplay(displayName)
    setMaleText('')
    setFemaleText('')
    setGenderedDialogOpen(true)
  }

  // Insert gendered text placeholder
  const insertGenderedText = () => {
    if (!selectedPersonField || !maleText.trim() || !femaleText.trim()) return

    insertText(`{{${selectedPersonField}.sex | ${maleText.trim()} | ${femaleText.trim()}}}`)
    setGenderedDialogOpen(false)
    setSelectedPersonField(null)
    setSelectedPersonFieldDisplay(null)
    setMaleText('')
    setFemaleText('')
  }

  return (
    <div className="space-y-2">
      {label && (
        <Label htmlFor="markdown-editor">
          {label}
          {required && <span className="text-destructive ml-1">*</span>}
        </Label>
      )}

      {/* Toolbar */}
      <div className="flex flex-wrap gap-1 p-2 border rounded-md bg-muted/20">
        {/* Text formatting */}
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="h-8 w-8"
          onClick={applyBold}
          title="Bold"
        >
          <Bold className="h-4 w-4" />
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="h-8 w-8"
          onClick={applyItalic}
          title="Italic"
        >
          <Italic className="h-4 w-4" />
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="h-8 w-8"
          onClick={applyUnderline}
          title="Underline"
        >
          <Underline className="h-4 w-4" />
        </Button>

        <div className="w-px h-8 bg-border" />

        {/* Headings */}
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="h-8 w-8"
          onClick={applyH1}
          title="Heading 1"
        >
          <Heading1 className="h-4 w-4" />
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="h-8 w-8"
          onClick={applyH2}
          title="Heading 2"
        >
          <Heading2 className="h-4 w-4" />
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="h-8 w-8"
          onClick={applyH3}
          title="Heading 3"
        >
          <Heading3 className="h-4 w-4" />
        </Button>

        <div className="w-px h-8 bg-border" />

        {/* Alignment */}
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="h-8 w-8"
          onClick={() => applyAlignment('left')}
          title="Align Left"
        >
          <AlignLeft className="h-4 w-4" />
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="h-8 w-8"
          onClick={() => applyAlignment('center')}
          title="Align Center"
        >
          <AlignCenter className="h-4 w-4" />
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="h-8 w-8"
          onClick={() => applyAlignment('right')}
          title="Align Right"
        >
          <AlignRight className="h-4 w-4" />
        </Button>

        <div className="w-px h-8 bg-border" />

        {/* Lists */}
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="h-8 w-8"
          onClick={applyBulletList}
          title="Bullet List"
        >
          <List className="h-4 w-4" />
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="h-8 w-8"
          onClick={applyNumberedList}
          title="Numbered List"
        >
          <ListOrdered className="h-4 w-4" />
        </Button>

        <div className="w-px h-8 bg-border" />

        {/* Red text */}
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="h-8 w-8"
          onClick={applyRed}
          title="Red Text (Liturgical)"
        >
          <Type className="h-4 w-4 text-red-600" />
        </Button>

        <div className="w-px h-8 bg-border" />

        {/* Insert Field dropdown */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="h-8 px-2"
              title="Insert Field"
            >
              Insert Field
              <ChevronDown className="h-3 w-3 ml-1" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start" className="max-h-[300px] overflow-y-auto">
            {availableFields.length === 0 ? (
              <DropdownMenuItem disabled>No fields available</DropdownMenuItem>
            ) : (
              availableFields.map((field) => (
                field.type === 'person' ? (
                  // Person fields get a submenu with property options
                  <DropdownMenuSub key={field.id}>
                    <DropdownMenuSubTrigger>
                      {field.name}
                      <span className="ml-2 text-xs text-muted-foreground">
                        (person)
                      </span>
                    </DropdownMenuSubTrigger>
                    <DropdownMenuPortal>
                      <DropdownMenuSubContent>
                        <DropdownMenuItem onClick={() => insertField(`${field.property_name}.full_name`)}>
                          Full Name
                          <span className="ml-2 text-xs text-muted-foreground">
                            {`{{${field.property_name}.full_name}}`}
                          </span>
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => insertField(`${field.property_name}.first_name`)}>
                          First Name
                          <span className="ml-2 text-xs text-muted-foreground">
                            {`{{${field.property_name}.first_name}}`}
                          </span>
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => insertField(`${field.property_name}.last_name`)}>
                          Last Name
                          <span className="ml-2 text-xs text-muted-foreground">
                            {`{{${field.property_name}.last_name}}`}
                          </span>
                        </DropdownMenuItem>
                      </DropdownMenuSubContent>
                    </DropdownMenuPortal>
                  </DropdownMenuSub>
                ) : (
                  // Non-person fields insert directly using property_name
                  <DropdownMenuItem
                    key={field.id}
                    onClick={() => insertField(field.property_name)}
                  >
                    {field.name}
                    <span className="ml-2 text-xs text-muted-foreground">
                      ({field.type})
                    </span>
                  </DropdownMenuItem>
                )
              ))
            )}
          </DropdownMenuContent>
        </DropdownMenu>

        {/* Insert Gendered Text dropdown - only show if there are person fields */}
        {personFields.length > 0 && (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="h-8 px-2"
                title="Insert Gendered Text"
              >
                <Users className="h-4 w-4 mr-1" />
                Gendered Text
                <ChevronDown className="h-3 w-3 ml-1" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" className="max-h-[300px] overflow-y-auto">
              {personFields.map((field) => (
                <DropdownMenuItem
                  key={field.id}
                  onClick={() => openGenderedDialog(field.property_name, field.name)}
                >
                  {field.name}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        )}

        {/* Insert Parish Info dropdown */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="h-8 px-2"
              title="Insert Parish Info"
            >
              <Church className="h-4 w-4 mr-1" />
              Parish Info
              <ChevronDown className="h-3 w-3 ml-1" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start">
            {PARISH_PLACEHOLDERS.map((placeholder) => (
              <DropdownMenuItem
                key={placeholder.key}
                onClick={() => insertText(`{{${placeholder.key}}}`)}
              >
                <div className="flex flex-col">
                  <span>{placeholder.label}</span>
                  <span className="text-xs text-muted-foreground">
                    e.g., {placeholder.example}
                  </span>
                </div>
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* Textarea */}
      <Textarea
        ref={textareaRef}
        id="markdown-editor"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder || 'Enter your content here...'}
        className="min-h-[400px] font-mono text-sm"
      />

      {/* Help text */}
      <div className="text-xs text-muted-foreground space-y-1">
        <p>
          <strong>Formatting:</strong> Use the toolbar buttons or markdown
          syntax
        </p>
        <p>
          <strong>Person Fields:</strong> {"{{person_field.full_name}}"}, {"{{person_field.first_name}}"}, {"{{person_field.last_name}}"}
        </p>
        <p>
          <strong>Other Fields:</strong> {"{{field_name}}"} - Use &quot;Insert Field&quot; dropdown
        </p>
        <p>
          <strong>Parish Info:</strong> {"{{parish.name}}"}, {"{{parish.city}}"}, {"{{parish.state}}"}, {"{{parish.city_state}}"}
        </p>
        <p>
          <strong>Gendered Text:</strong> {"{{person_field.sex | male text | female text}}"}
        </p>
        <p>
          <strong>Red Text:</strong> {"{red}"}text{"{/red}"} for liturgical
          instructions
        </p>
      </div>

      {/* Gendered Text Dialog */}
      <Dialog open={genderedDialogOpen} onOpenChange={setGenderedDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Insert Gendered Text</DialogTitle>
            <DialogDescription>
              Enter text variants based on the gender of &quot;{selectedPersonFieldDisplay}&quot;.
              If gender is unknown, both options will be shown as &quot;male/female&quot;.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="male-text">Male Text</Label>
              <Input
                id="male-text"
                value={maleText}
                onChange={(e) => setMaleText(e.target.value)}
                placeholder="e.g., él, his, him, el novio"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="female-text">Female Text</Label>
              <Input
                id="female-text"
                value={femaleText}
                onChange={(e) => setFemaleText(e.target.value)}
                placeholder="e.g., ella, her, her, la novia"
              />
            </div>
            <div className="text-xs text-muted-foreground bg-muted p-2 rounded">
              <strong>Preview:</strong>{' '}
              {selectedPersonField && maleText && femaleText
                ? `{{${selectedPersonField}.sex | ${maleText} | ${femaleText}}}`
                : '...'}
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setGenderedDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button
              onClick={insertGenderedText}
              disabled={!maleText.trim() || !femaleText.trim()}
            >
              Insert
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

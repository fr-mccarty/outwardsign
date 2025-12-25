'use client'

import { useState } from 'react'
import type { Editor } from '@tiptap/react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Bold,
  Italic,
  Underline,
  AlignLeft,
  AlignCenter,
  AlignRight,
  ChevronDown,
  Users,
  Church,
  Palette,
  Type,
  ArrowUpToLine,
  ArrowDownToLine,
  ChevronsUpDown,
} from 'lucide-react'
import { PARISH_PLACEHOLDERS } from '@/lib/utils/content-processor'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSub,
  DropdownMenuSubTrigger,
  DropdownMenuSubContent,
  DropdownMenuPortal,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from '@/components/ui/dialog'
import type { InputFieldDefinition } from '@/lib/types'

const LITURGICAL_RED = '#c41e3a'

// Text size options with font-size values
const TEXT_SIZES = {
  xs: '0.75em',
  small: '0.875em',
  medium: '1em',
  large: '1.25em',
  xl: '1.5em',
} as const

interface TiptapToolbarProps {
  editor: Editor | null
  availableFields: InputFieldDefinition[]
  onInsertText: (text: string) => void
}

export function TiptapToolbar({
  editor,
  availableFields,
  onInsertText,
}: TiptapToolbarProps) {
  // Gendered text dialog state
  const [genderedDialogOpen, setGenderedDialogOpen] = useState(false)
  const [selectedPersonField, setSelectedPersonField] = useState<string | null>(null)
  const [selectedPersonFieldDisplay, setSelectedPersonFieldDisplay] = useState<string | null>(null)
  const [maleText, setMaleText] = useState('')
  const [femaleText, setFemaleText] = useState('')

  // Filter to only person-type fields for gendered text
  const personFields = availableFields.filter(field => field.type === 'person')

  if (!editor) {
    return null
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

    onInsertText(`{{${selectedPersonField}.sex | ${maleText.trim()} | ${femaleText.trim()}}}`)
    setGenderedDialogOpen(false)
    setSelectedPersonField(null)
    setSelectedPersonFieldDisplay(null)
    setMaleText('')
    setFemaleText('')
  }

  // Apply text size using the FontSize extension
  const applyTextSize = (size: keyof typeof TEXT_SIZES) => {
    const fontSize = TEXT_SIZES[size]
    editor.chain().focus().setFontSize(fontSize).run()
  }

  // Reset text size to default
  const resetTextSize = () => {
    editor.chain().focus().unsetFontSize().run()
  }

  return (
    <>
      <div className="tiptap-toolbar flex flex-wrap gap-1 p-2 border-b bg-muted/20">
        {/* Text formatting */}
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className={`h-8 w-8 ${editor.isActive('bold') ? 'bg-accent' : ''}`}
          onClick={() => editor.chain().focus().toggleBold().run()}
          title="Bold"
        >
          <Bold className="h-4 w-4" />
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className={`h-8 w-8 ${editor.isActive('italic') ? 'bg-accent' : ''}`}
          onClick={() => editor.chain().focus().toggleItalic().run()}
          title="Italic"
        >
          <Italic className="h-4 w-4" />
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className={`h-8 w-8 ${editor.isActive('underline') ? 'bg-accent' : ''}`}
          onClick={() => editor.chain().focus().toggleUnderline().run()}
          title="Underline"
        >
          <Underline className="h-4 w-4" />
        </Button>

        <div className="w-px h-8 bg-border" />

        {/* Text Size dropdown */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="h-8 px-2"
              title="Text Size"
            >
              <Type className="h-4 w-4 mr-1" />
              Size
              <ChevronDown className="h-3 w-3 ml-1" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start">
            <DropdownMenuItem onClick={() => applyTextSize('xs')}>
              <span className="text-xs">Extra Small</span>
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => applyTextSize('small')}>
              <span className="text-sm">Small</span>
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => applyTextSize('medium')}>
              <span className="text-base">Medium</span>
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => applyTextSize('large')}>
              <span className="text-lg">Large</span>
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => applyTextSize('xl')}>
              <span className="text-xl">Extra Large</span>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={resetTextSize}>
              Reset to Default
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        {/* Text Color dropdown */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="h-8 px-2"
              title="Text Color"
            >
              <Palette className="h-4 w-4 mr-1" />
              Color
              <ChevronDown className="h-3 w-3 ml-1" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start">
            <DropdownMenuItem
              onClick={() => editor.chain().focus().unsetColor().run()}
            >
              <span className="w-4 h-4 rounded border border-border bg-foreground mr-2" />
              Black (Default)
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => editor.chain().focus().setColor(LITURGICAL_RED).run()}
            >
              <span
                className="w-4 h-4 rounded mr-2"
                style={{ backgroundColor: LITURGICAL_RED }}
              />
              Liturgical Red
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        <div className="w-px h-8 bg-border" />

        {/* Alignment */}
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className={`h-8 w-8 ${editor.isActive({ textAlign: 'left' }) ? 'bg-accent' : ''}`}
          onClick={() => editor.chain().focus().setTextAlign('left').run()}
          title="Align Left"
        >
          <AlignLeft className="h-4 w-4" />
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className={`h-8 w-8 ${editor.isActive({ textAlign: 'center' }) ? 'bg-accent' : ''}`}
          onClick={() => editor.chain().focus().setTextAlign('center').run()}
          title="Align Center"
        >
          <AlignCenter className="h-4 w-4" />
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className={`h-8 w-8 ${editor.isActive({ textAlign: 'right' }) ? 'bg-accent' : ''}`}
          onClick={() => editor.chain().focus().setTextAlign('right').run()}
          title="Align Right"
        >
          <AlignRight className="h-4 w-4" />
        </Button>

        <div className="w-px h-8 bg-border" />

        {/* Spacing dropdown */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="h-8 px-2"
              title="Spacing"
            >
              <ChevronsUpDown className="h-4 w-4 mr-1" />
              Spacing
              <ChevronDown className="h-3 w-3 ml-1" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start">
            <DropdownMenuSub>
              <DropdownMenuSubTrigger>
                <ArrowUpToLine className="h-4 w-4 mr-2" />
                Space Before
              </DropdownMenuSubTrigger>
              <DropdownMenuPortal>
                <DropdownMenuSubContent>
                  <DropdownMenuItem onClick={() => editor.chain().focus().updateAttributes('paragraph', { style: 'margin-top: 0.5em' }).run()}>
                    Small
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => editor.chain().focus().updateAttributes('paragraph', { style: 'margin-top: 1em' }).run()}>
                    Medium
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => editor.chain().focus().updateAttributes('paragraph', { style: 'margin-top: 2em' }).run()}>
                    Large
                  </DropdownMenuItem>
                </DropdownMenuSubContent>
              </DropdownMenuPortal>
            </DropdownMenuSub>
            <DropdownMenuSub>
              <DropdownMenuSubTrigger>
                <ArrowDownToLine className="h-4 w-4 mr-2" />
                Space After
              </DropdownMenuSubTrigger>
              <DropdownMenuPortal>
                <DropdownMenuSubContent>
                  <DropdownMenuItem onClick={() => editor.chain().focus().updateAttributes('paragraph', { style: 'margin-bottom: 0.5em' }).run()}>
                    Small
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => editor.chain().focus().updateAttributes('paragraph', { style: 'margin-bottom: 1em' }).run()}>
                    Medium
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => editor.chain().focus().updateAttributes('paragraph', { style: 'margin-bottom: 2em' }).run()}>
                    Large
                  </DropdownMenuItem>
                </DropdownMenuSubContent>
              </DropdownMenuPortal>
            </DropdownMenuSub>
            <DropdownMenuSeparator />
            <DropdownMenuSub>
              <DropdownMenuSubTrigger>
                <ChevronsUpDown className="h-4 w-4 mr-2" />
                Line Spacing
              </DropdownMenuSubTrigger>
              <DropdownMenuPortal>
                <DropdownMenuSubContent>
                  <DropdownMenuItem onClick={() => editor.chain().focus().updateAttributes('paragraph', { style: 'line-height: 1.2' }).run()}>
                    Single
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => editor.chain().focus().updateAttributes('paragraph', { style: 'line-height: 1.5' }).run()}>
                    1.5 Lines
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => editor.chain().focus().updateAttributes('paragraph', { style: 'line-height: 2' }).run()}>
                    Double
                  </DropdownMenuItem>
                </DropdownMenuSubContent>
              </DropdownMenuPortal>
            </DropdownMenuSub>
          </DropdownMenuContent>
        </DropdownMenu>

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
                  <DropdownMenuSub key={field.id}>
                    <DropdownMenuSubTrigger>
                      {field.name}
                      <span className="ml-2 text-xs text-muted-foreground">
                        (person)
                      </span>
                    </DropdownMenuSubTrigger>
                    <DropdownMenuPortal>
                      <DropdownMenuSubContent>
                        <DropdownMenuItem onClick={() => onInsertText(`{{${field.property_name}.full_name}}`)}>
                          Full Name
                          <span className="ml-2 text-xs text-muted-foreground">
                            {`{{${field.property_name}.full_name}}`}
                          </span>
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => onInsertText(`{{${field.property_name}.first_name}}`)}>
                          First Name
                          <span className="ml-2 text-xs text-muted-foreground">
                            {`{{${field.property_name}.first_name}}`}
                          </span>
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => onInsertText(`{{${field.property_name}.last_name}}`)}>
                          Last Name
                          <span className="ml-2 text-xs text-muted-foreground">
                            {`{{${field.property_name}.last_name}}`}
                          </span>
                        </DropdownMenuItem>
                      </DropdownMenuSubContent>
                    </DropdownMenuPortal>
                  </DropdownMenuSub>
                ) : (
                  <DropdownMenuItem
                    key={field.id}
                    onClick={() => onInsertText(`{{${field.property_name}}}`)}
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
                onClick={() => onInsertText(`{{${placeholder.key}}}`)}
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
    </>
  )
}

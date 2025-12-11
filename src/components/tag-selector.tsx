'use client'

import { useState } from 'react'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuCheckboxItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { X, ChevronDown } from 'lucide-react'
import type { CategoryTag } from '@/lib/types'

interface TagSelectorProps {
  selectedTags: CategoryTag[]
  onTagsChange: (tags: CategoryTag[]) => void
  availableTags: CategoryTag[]
  label?: string
  placeholder?: string
}

export function TagSelector({
  selectedTags,
  onTagsChange,
  availableTags,
  label = 'Tags',
  placeholder = 'Select tags...',
}: TagSelectorProps) {
  const [open, setOpen] = useState(false)

  const handleToggleTag = (tag: CategoryTag) => {
    const isSelected = selectedTags.some((t) => t.id === tag.id)
    if (isSelected) {
      onTagsChange(selectedTags.filter((t) => t.id !== tag.id))
    } else {
      onTagsChange([...selectedTags, tag])
    }
  }

  const handleRemoveTag = (tagId: string) => {
    onTagsChange(selectedTags.filter((t) => t.id !== tagId))
  }

  return (
    <div className="space-y-2">
      <Label>{label}</Label>

      {/* Selected Tags Display */}
      {selectedTags.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {selectedTags.map((tag) => (
            <Badge
              key={tag.id}
              variant="secondary"
              className="gap-1"
              style={tag.color ? { backgroundColor: tag.color } : undefined}
            >
              {tag.name}
              <button
                type="button"
                onClick={() => handleRemoveTag(tag.id)}
                className="ml-1 hover:bg-background/20 rounded-full p-0.5"
              >
                <X className="h-3 w-3" />
              </button>
            </Badge>
          ))}
        </div>
      )}

      {/* Tag Dropdown */}
      <DropdownMenu open={open} onOpenChange={setOpen}>
        <DropdownMenuTrigger asChild>
          <Button type="button" variant="outline" className="w-full justify-between">
            <span className="text-muted-foreground">
              {selectedTags.length > 0
                ? `${selectedTags.length} tag${selectedTags.length > 1 ? 's' : ''} selected`
                : placeholder}
            </span>
            <ChevronDown className="h-4 w-4 opacity-50" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent className="w-[300px]" align="start">
          {availableTags.length === 0 ? (
            <div className="px-2 py-3 text-sm text-muted-foreground text-center">
              No tags available
            </div>
          ) : (
            availableTags.map((tag) => {
              const isSelected = selectedTags.some((t) => t.id === tag.id)
              return (
                <DropdownMenuCheckboxItem
                  key={tag.id}
                  checked={isSelected}
                  onCheckedChange={() => handleToggleTag(tag)}
                  onSelect={(e) => e.preventDefault()} // Prevent dropdown from closing
                >
                  <div className="flex items-center gap-2">
                    <span>{tag.name}</span>
                    {tag.color && (
                      <div
                        className="h-3 w-3 rounded-full"
                        style={{ backgroundColor: tag.color }}
                      />
                    )}
                  </div>
                </DropdownMenuCheckboxItem>
              )
            })
          )}
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  )
}

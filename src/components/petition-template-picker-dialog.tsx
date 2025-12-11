'use client'

import { useState, useEffect, useMemo } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { FileText, ChevronDown, ChevronUp } from 'lucide-react'
import { ScrollArea } from '@/components/ui/scroll-area'
import { ClearableSearchInput } from '@/components/clearable-search-input'
import { getPetitionTemplates } from '@/lib/actions/petition-templates'
import { getCategoryTags } from '@/lib/actions/category-tags'
import { getTagsForEntity } from '@/lib/actions/tag-assignments'
import type { PetitionTemplateWithTags, CategoryTag } from '@/lib/types'
import type { LiturgicalLanguage } from '@/lib/constants'
import { PetitionContextTemplate } from '@/lib/actions/petition-templates'

interface PetitionTemplatePickerDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSelect: (template: PetitionContextTemplate) => void
  language?: LiturgicalLanguage
}

export function PetitionTemplatePickerDialog({
  open,
  onOpenChange,
  onSelect,
  language,
}: PetitionTemplatePickerDialogProps) {
  const [searchQuery, setSearchQuery] = useState('')
  const [activeTags, setActiveTags] = useState<string[]>([])
  const [availableTags, setAvailableTags] = useState<CategoryTag[]>([])
  const [templates, setTemplates] = useState<PetitionTemplateWithTags[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [showMoreFilters, setShowMoreFilters] = useState(false)

  // Progressive disclosure: show limited tags initially
  const INITIAL_TAG_LIMIT = 10
  const visibleTags = useMemo(() => {
    if (showMoreFilters) {
      return availableTags
    }
    return availableTags.slice(0, INITIAL_TAG_LIMIT)
  }, [availableTags, showMoreFilters])

  const hasMoreTags = availableTags.length > INITIAL_TAG_LIMIT

  // Toggle tag filter
  const handleToggleTag = (tagSlug: string) => {
    setActiveTags((prev) => {
      if (prev.includes(tagSlug)) {
        return prev.filter((slug) => slug !== tagSlug)
      } else {
        return [...prev, tagSlug]
      }
    })
  }

  // Load templates and tags on mount
  useEffect(() => {
    if (!open) return

    async function loadData() {
      setIsLoading(true)
      try {
        // Fetch all petition templates
        const fetchedTemplates = await getPetitionTemplates({
          language: language,
        })

        // Fetch all tags
        const fetchedTags = await getCategoryTags('name')

        // Fetch tags for each template
        const templatesWithTags = await Promise.all(
          fetchedTemplates.map(async (template) => {
            const tags = await getTagsForEntity('petition_template', template.id)
            return { ...template, tags }
          })
        )

        setTemplates(templatesWithTags)
        setAvailableTags(fetchedTags)
      } catch (error) {
        console.error('Failed to load templates:', error)
      } finally {
        setIsLoading(false)
      }
    }

    loadData()
  }, [open, language])

  // Filter templates based on search and selected tags
  const filteredTemplates = templates.filter((template) => {
    // Search filter
    const matchesSearch =
      searchQuery === '' ||
      template.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      template.description?.toLowerCase().includes(searchQuery.toLowerCase())

    // Tag filter (AND logic - must have ALL selected tags)
    const matchesTags =
      activeTags.length === 0 ||
      activeTags.every((tagSlug) =>
        template.tags?.some((tag) => tag.slug === tagSlug)
      )

    return matchesSearch && matchesTags
  })

  const handleSelect = (template: PetitionTemplateWithTags) => {
    onSelect(template)
    onOpenChange(false)
    // Reset filters
    setSearchQuery('')
    setActiveTags([])
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-4xl max-h-[80vh]">
        <DialogHeader>
          <DialogTitle>Choose Petition Template</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Search Input */}
          <ClearableSearchInput
            value={searchQuery}
            onChange={setSearchQuery}
            placeholder="Search by title or description..."
          />

          {/* Tag filters - flat list with progressive disclosure */}
          {availableTags.length > 0 && (
            <div className="space-y-2">
              <div className="flex flex-wrap gap-1">
                {visibleTags.map((tag) => (
                  <Button
                    key={tag.id}
                    type="button"
                    variant={activeTags.includes(tag.slug) ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => handleToggleTag(tag.slug)}
                    className="h-7 text-xs"
                  >
                    {tag.name}
                  </Button>
                ))}

                {/* Show more/less toggle inline with tags */}
                {hasMoreTags && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => setShowMoreFilters(!showMoreFilters)}
                    className="h-7 text-xs text-muted-foreground hover:text-foreground"
                  >
                    {showMoreFilters ? (
                      <>
                        <ChevronUp className="h-3 w-3 mr-1" />
                        Less
                      </>
                    ) : (
                      <>
                        <ChevronDown className="h-3 w-3 mr-1" />
                        +{availableTags.length - INITIAL_TAG_LIMIT} more
                      </>
                    )}
                  </Button>
                )}
              </div>
            </div>
          )}

          {/* Template List */}
          <div className="space-y-2">
            <Label>Templates</Label>
            <ScrollArea className="h-[400px] border rounded-lg">
              {isLoading ? (
                <div className="p-4 text-center text-muted-foreground">
                  Loading templates...
                </div>
              ) : filteredTemplates.length === 0 ? (
                <div className="p-4 text-center text-muted-foreground">
                  No templates found matching your filters
                </div>
              ) : (
                <div className="divide-y">
                  {filteredTemplates.map((template) => (
                    <button
                      key={template.id}
                      type="button"
                      onClick={() => handleSelect(template)}
                      className="w-full text-left p-4 hover:bg-accent transition-colors"
                    >
                      <div className="space-y-2">
                        {/* Title */}
                        <div className="flex items-start gap-2">
                          <FileText className="h-4 w-4 flex-shrink-0 mt-0.5 text-muted-foreground" />
                          <div className="flex-1">
                            <h4 className="font-medium">{template.title}</h4>
                            {template.description && (
                              <p className="text-sm text-muted-foreground mt-1">
                                {template.description}
                              </p>
                            )}
                          </div>
                        </div>

                        {/* Tags and Language */}
                        <div className="flex flex-wrap gap-2 ml-6">
                          {template.language && (
                            <Badge variant="outline" className="text-xs">
                              {template.language.toUpperCase()}
                            </Badge>
                          )}
                          {template.tags?.map((tag) => (
                            <Badge
                              key={tag.id}
                              variant="secondary"
                              className="text-xs"
                              style={tag.color ? { backgroundColor: tag.color } : undefined}
                            >
                              {tag.name}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </ScrollArea>
          </div>

          {/* Cancel Button */}
          <div className="flex justify-end">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}

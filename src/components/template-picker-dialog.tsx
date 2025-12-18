"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Search, BookmarkCheck, Calendar } from "lucide-react"
import type { MasterEventTemplate } from "@/lib/types"
import { getTemplatesByEventType } from "@/lib/actions/master-event-templates"
import { formatDatePretty } from "@/lib/utils/formatters"

interface TemplatePickerDialogProps {
  eventTypeId: string
  open: boolean
  onOpenChange: (open: boolean) => void
  onSelectTemplate: (template: MasterEventTemplate) => void
}

export function TemplatePickerDialog({
  eventTypeId,
  open,
  onOpenChange,
  onSelectTemplate
}: TemplatePickerDialogProps) {
  const [templates, setTemplates] = useState<MasterEventTemplate[]>([])
  const [filteredTemplates, setFilteredTemplates] = useState<MasterEventTemplate[]>([])
  const [searchQuery, setSearchQuery] = useState("")
  const [isLoading, setIsLoading] = useState(false)

  // Fetch templates when dialog opens
  useEffect(() => {
    async function fetchTemplates() {
      if (!open) return

      setIsLoading(true)
      try {
        const fetchedTemplates = await getTemplatesByEventType(eventTypeId)
        setTemplates(fetchedTemplates)
        setFilteredTemplates(fetchedTemplates)
      } catch (error) {
        console.error("Failed to fetch templates:", error)
        setTemplates([])
        setFilteredTemplates([])
      } finally {
        setIsLoading(false)
      }
    }

    fetchTemplates()
  }, [open, eventTypeId])

  // Filter templates by search query
  useEffect(() => {
    if (!searchQuery) {
      setFilteredTemplates(templates)
      return
    }

    const query = searchQuery.toLowerCase()
    const filtered = templates.filter(template =>
      template.name.toLowerCase().includes(query) ||
      template.description?.toLowerCase().includes(query)
    )
    setFilteredTemplates(filtered)
  }, [searchQuery, templates])

  const handleSelectTemplate = (template: MasterEventTemplate) => {
    onSelectTemplate(template)
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>Select Template</DialogTitle>
          <DialogDescription>
            Choose a template to pre-fill the event with saved data
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Search Bar */}
          <div className="relative">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search templates by name or description..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-8"
            />
          </div>

          {/* Templates List */}
          {isLoading ? (
            <div className="flex items-center justify-center py-8 text-muted-foreground">
              Loading templates...
            </div>
          ) : filteredTemplates.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-8 text-center">
              <BookmarkCheck className="h-12 w-12 text-muted-foreground mb-2" />
              <p className="text-sm text-muted-foreground">
                {templates.length === 0
                  ? "No templates available for this event type. Create an event and save it as a template."
                  : "No templates match your search."}
              </p>
            </div>
          ) : (
            <ScrollArea className="h-96">
              <div className="space-y-2 pr-4">
                {filteredTemplates.map((template) => (
                  <button
                    key={template.id}
                    onClick={() => handleSelectTemplate(template)}
                    className="w-full text-left p-4 rounded-lg border bg-card hover:bg-accent hover:text-accent-foreground transition-colors"
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1 min-w-0">
                        <h4 className="font-medium truncate">{template.name}</h4>
                        {template.description && (
                          <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
                            {template.description}
                          </p>
                        )}
                        <div className="flex items-center gap-2 mt-2 text-xs text-muted-foreground">
                          <Calendar className="h-3 w-3" />
                          <span>Created {formatDatePretty(template.created_at)}</span>
                        </div>
                      </div>
                      <BookmarkCheck className="h-5 w-5 text-muted-foreground flex-shrink-0" />
                    </div>
                  </button>
                ))}
              </div>
            </ScrollArea>
          )}
        </div>

        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
          >
            Cancel
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

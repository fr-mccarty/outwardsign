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
import type { EventPreset } from "@/lib/types"
import { getPresetsByEventType } from "@/lib/actions/event-presets"
import { formatDatePretty } from "@/lib/utils/formatters"

interface PresetPickerDialogProps {
  eventTypeId: string
  open: boolean
  onOpenChange: (open: boolean) => void
  onSelectPreset: (preset: EventPreset) => void
}

export function PresetPickerDialog({
  eventTypeId,
  open,
  onOpenChange,
  onSelectPreset
}: PresetPickerDialogProps) {
  const [presets, setPresets] = useState<EventPreset[]>([])
  const [filteredPresets, setFilteredPresets] = useState<EventPreset[]>([])
  const [searchQuery, setSearchQuery] = useState("")
  const [isLoading, setIsLoading] = useState(false)

  // Fetch presets when dialog opens
  useEffect(() => {
    async function fetchPresets() {
      if (!open) return

      setIsLoading(true)
      try {
        const fetchedPresets = await getPresetsByEventType(eventTypeId)
        setPresets(fetchedPresets)
        setFilteredPresets(fetchedPresets)
      } catch (error) {
        console.error("Failed to fetch presets:", error)
        setPresets([])
        setFilteredPresets([])
      } finally {
        setIsLoading(false)
      }
    }

    fetchPresets()
  }, [open, eventTypeId])

  // Filter presets by search query
  useEffect(() => {
    if (!searchQuery) {
      setFilteredPresets(presets)
      return
    }

    const query = searchQuery.toLowerCase()
    const filtered = presets.filter(preset =>
      preset.name.toLowerCase().includes(query) ||
      preset.description?.toLowerCase().includes(query)
    )
    setFilteredPresets(filtered)
  }, [searchQuery, presets])

  const handleSelectPreset = (preset: EventPreset) => {
    onSelectPreset(preset)
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>Select Preset</DialogTitle>
          <DialogDescription>
            Choose a preset to pre-fill the event with saved data
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Search Bar */}
          <div className="relative">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search presets by name or description..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-8"
            />
          </div>

          {/* Presets List */}
          {isLoading ? (
            <div className="flex items-center justify-center py-8 text-muted-foreground">
              Loading presets...
            </div>
          ) : filteredPresets.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-8 text-center">
              <BookmarkCheck className="h-12 w-12 text-muted-foreground mb-2" />
              <p className="text-sm text-muted-foreground">
                {presets.length === 0
                  ? "No presets available for this event type. Create an event and save it as a preset."
                  : "No presets match your search."}
              </p>
            </div>
          ) : (
            <ScrollArea className="h-96">
              <div className="space-y-2 pr-4">
                {filteredPresets.map((preset) => (
                  <button
                    key={preset.id}
                    onClick={() => handleSelectPreset(preset)}
                    className="w-full text-left p-4 rounded-lg border bg-card hover:bg-accent hover:text-accent-foreground transition-colors"
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1 min-w-0">
                        <h4 className="font-medium truncate">{preset.name}</h4>
                        {preset.description && (
                          <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
                            {preset.description}
                          </p>
                        )}
                        <div className="flex items-center gap-2 mt-2 text-xs text-muted-foreground">
                          <Calendar className="h-3 w-3" />
                          <span>Created {formatDatePretty(preset.created_at)}</span>
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

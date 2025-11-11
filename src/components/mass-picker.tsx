'use client'

import { useState, useEffect, useCallback } from 'react'
import {
  Command,
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command'
import { Badge } from '@/components/ui/badge'
import { DialogTitle } from '@/components/ui/dialog'
import { Calendar, User, Church } from 'lucide-react'
import { getMasses } from '@/lib/actions/masses'
import type { MassWithNames } from '@/lib/actions/masses'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'
import { MASS_STATUS_LABELS } from '@/lib/constants'

interface MassPickerProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSelect: (mass: MassWithNames) => void
  placeholder?: string
  emptyMessage?: string
  selectedMassId?: string
  className?: string
}

// Custom hook for debounced search
function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value)

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value)
    }, delay)

    return () => {
      clearTimeout(handler)
    }
  }, [value, delay])

  return debouncedValue
}

export function MassPicker({
  open,
  onOpenChange,
  onSelect,
  placeholder = "Search for a mass...",
  emptyMessage = "No masses found.",
  selectedMassId,
  className,
}: MassPickerProps) {
  const [searchQuery, setSearchQuery] = useState('')
  const [masses, setMasses] = useState<MassWithNames[]>([])
  const [loading, setLoading] = useState(false)

  // Debounce search query to avoid too many API calls
  const debouncedSearchQuery = useDebounce(searchQuery, 300)

  const searchMassesCallback = useCallback(async (query: string) => {
    try {
      setLoading(true)
      const results = await getMasses(query ? { search: query } : undefined)
      setMasses(results)
    } catch (error) {
      console.error('Error searching masses:', error)
      toast.error('Failed to search masses')
    } finally {
      setLoading(false)
    }
  }, [])

  // Effect to search when debounced query changes
  useEffect(() => {
    if (open) {
      searchMassesCallback(debouncedSearchQuery)
    }
  }, [debouncedSearchQuery, open, searchMassesCallback])

  // Load initial data when dialog opens
  useEffect(() => {
    if (open && masses.length === 0) {
      searchMassesCallback('')
    }
  }, [open, masses.length, searchMassesCallback])

  const handleMassSelect = (mass: MassWithNames) => {
    onSelect(mass)
    onOpenChange(false)
    setSearchQuery('')
  }

  const formatEventDate = (dateString: string | null | undefined) => {
    if (!dateString) return 'No date'
    try {
      return new Date(dateString).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
        hour: 'numeric',
        minute: '2-digit'
      })
    } catch {
      return 'Invalid date'
    }
  }

  const getMassDisplayName = (mass: MassWithNames) => {
    const presider = mass.presider
      ? `${mass.presider.first_name} ${mass.presider.last_name}`
      : 'No Presider'
    const date = mass.event?.start_date
      ? new Date(mass.event.start_date).toLocaleDateString()
      : 'No Date'
    return `${presider} - ${date}`
  }

  const isMassSelected = (mass: MassWithNames) => {
    return selectedMassId === mass.id
  }

  const getStatusVariant = (status: string) => {
    switch (status) {
      case 'PLANNING':
        return 'secondary'
      case 'SCHEDULED':
        return 'default'
      case 'COMPLETED':
        return 'outline'
      case 'CANCELLED':
        return 'destructive'
      default:
        return 'secondary'
    }
  }

  return (
    <CommandDialog open={open} onOpenChange={onOpenChange}>
      <DialogTitle className="sr-only">Select Mass</DialogTitle>
      <Command className={cn("rounded-lg border shadow-md", className)}>
        <div className="flex items-center border-b px-3" onClick={(e) => e.stopPropagation()}>
          <CommandInput
            placeholder={placeholder}
            value={searchQuery}
            onValueChange={setSearchQuery}
            className="flex h-11 w-full rounded-md bg-transparent py-3 text-sm outline-none placeholder:text-muted-foreground disabled:cursor-not-allowed disabled:opacity-50"
          />
        </div>

        <CommandList className="max-h-[400px]">
          {loading && (
            <div className="flex items-center justify-center py-6">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <div className="h-4 w-4 animate-spin rounded-full border-2 border-muted-foreground border-t-transparent" />
                Searching...
              </div>
            </div>
          )}

          {!loading && masses.length === 0 && (
            <CommandEmpty className="py-6 text-center text-sm">
              <div className="flex flex-col items-center gap-2">
                <Church className="h-8 w-8 text-muted-foreground" />
                <div>{emptyMessage}</div>
                <p className="text-xs text-muted-foreground mt-2">
                  Create a mass from the Masses page
                </p>
              </div>
            </CommandEmpty>
          )}

          {!loading && masses.length > 0 && (
            <CommandGroup heading="Masses">
              {masses.map((mass) => (
                <CommandItem
                  key={mass.id}
                  value={getMassDisplayName(mass)}
                  onSelect={() => handleMassSelect(mass)}
                  className={cn(
                    "flex items-center gap-3 px-3 py-3 cursor-pointer",
                    isMassSelected(mass) && "bg-accent text-accent-foreground"
                  )}
                >
                  <Church className="h-5 w-5 text-muted-foreground" />

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-medium truncate">
                        {mass.presider ? `${mass.presider.first_name} ${mass.presider.last_name}` : 'No Presider'}
                      </span>
                      {isMassSelected(mass) && (
                        <Badge variant="secondary" className="text-xs">
                          Selected
                        </Badge>
                      )}
                    </div>

                    <div className="flex items-center gap-4 mt-1 text-xs text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        <span>{mass.event?.start_date ? new Date(mass.event.start_date).toLocaleDateString() : 'No Date'}</span>
                      </div>
                      {mass.homilist && (
                        <div className="flex items-center gap-1">
                          <User className="h-3 w-3" />
                          <span className="truncate">Homilist: {mass.homilist.first_name} {mass.homilist.last_name}</span>
                        </div>
                      )}
                    </div>

                    <div className="mt-1">
                      <Badge variant={getStatusVariant(mass.status || 'PLANNING')} className="text-xs">
                        {MASS_STATUS_LABELS[mass.status as keyof typeof MASS_STATUS_LABELS]?.en || mass.status}
                      </Badge>
                    </div>
                  </div>
                </CommandItem>
              ))}
            </CommandGroup>
          )}
        </CommandList>
      </Command>
    </CommandDialog>
  )
}

// Hook to use the mass picker
export function useMassPicker() {
  const [open, setOpen] = useState(false)
  const [selectedMass, setSelectedMass] = useState<MassWithNames | null>(null)

  const openPicker = () => setOpen(true)
  const closePicker = () => setOpen(false)

  const handleSelect = (mass: MassWithNames) => {
    setSelectedMass(mass)
    setOpen(false)
  }

  const clearSelection = () => {
    setSelectedMass(null)
  }

  return {
    open,
    openPicker,
    closePicker,
    selectedMass,
    handleSelect,
    clearSelection,
    setOpen,
  }
}

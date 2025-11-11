'use client'

import { useState, useEffect } from 'react'
import { Badge } from '@/components/ui/badge'
import { Calendar, User, Church } from 'lucide-react'
import { getMasses, type MassWithNames } from '@/lib/actions/masses'
import { toast } from 'sonner'
import { CorePicker } from '@/components/core-picker'
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

export function MassPicker({
  open,
  onOpenChange,
  onSelect,
  placeholder = 'Search for a mass...',
  emptyMessage = 'No masses found. Create a mass from the Masses page.',
  selectedMassId,
  className,
}: MassPickerProps) {
  const [masses, setMasses] = useState<MassWithNames[]>([])
  const [loading, setLoading] = useState(false)

  // Load masses when dialog opens
  useEffect(() => {
    if (open) {
      loadMasses()
    }
  }, [open])

  const loadMasses = async () => {
    try {
      setLoading(true)
      const results = await getMasses()
      setMasses(results)
    } catch (error) {
      console.error('Error loading masses:', error)
      toast.error('Failed to load masses')
    } finally {
      setLoading(false)
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

  const selectedMass = selectedMassId
    ? masses.find((m) => m.id === selectedMassId)
    : null

  // Custom render for mass list items
  const renderMassItem = (mass: MassWithNames) => {
    const isSelected = selectedMassId === mass.id

    return (
      <div className="flex items-center gap-3">
        <Church className="h-5 w-5 text-muted-foreground" />

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <span className="font-medium truncate">
              {mass.presider
                ? `${mass.presider.first_name} ${mass.presider.last_name}`
                : 'No Presider'}
            </span>
            {isSelected && (
              <Badge variant="secondary" className="text-xs">
                Selected
              </Badge>
            )}
          </div>

          <div className="flex items-center gap-4 mt-1 text-xs text-muted-foreground">
            <div className="flex items-center gap-1">
              <Calendar className="h-3 w-3" />
              <span>
                {mass.event?.start_date
                  ? new Date(mass.event.start_date).toLocaleDateString()
                  : 'No Date'}
              </span>
            </div>
            {mass.homilist && (
              <div className="flex items-center gap-1">
                <User className="h-3 w-3" />
                <span className="truncate">
                  Homilist: {mass.homilist.first_name} {mass.homilist.last_name}
                </span>
              </div>
            )}
          </div>

          <div className="mt-1">
            <Badge
              variant={getStatusVariant(mass.status || 'PLANNING')}
              className="text-xs"
            >
              {MASS_STATUS_LABELS[mass.status as keyof typeof MASS_STATUS_LABELS]
                ?.en || mass.status}
            </Badge>
          </div>
        </div>
      </div>
    )
  }

  return (
    <CorePicker<MassWithNames>
      open={open}
      onOpenChange={onOpenChange}
      items={masses}
      selectedItem={selectedMass}
      onSelect={onSelect}
      title="Select Mass"
      searchPlaceholder={placeholder}
      searchFields={['presider', 'homilist', 'status']}
      getItemLabel={getMassDisplayName}
      getItemId={(mass) => mass.id}
      renderItem={renderMassItem}
      enableCreate={false}
      emptyMessage={emptyMessage}
      noResultsMessage="No masses match your search"
      isLoading={loading}
    />
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

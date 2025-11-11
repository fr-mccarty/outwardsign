'use client'

import { useState, useEffect, useMemo } from 'react'
import { Badge } from '@/components/ui/badge'
import { Calendar, User, Church } from 'lucide-react'
import { getMassesPaginated, createMass, updateMass, type MassWithNames } from '@/lib/actions/masses'
import type { Event, Person } from '@/lib/types'
import { toast } from 'sonner'
import { CorePicker } from '@/components/core-picker'
import { PickerFieldConfig } from '@/types/core-picker'
import { MASS_STATUS_VALUES, MASS_STATUS_LABELS } from '@/lib/constants'
import { EventPicker } from '@/components/event-picker'
import { PeoplePicker } from '@/components/people-picker'
import { Button } from '@/components/ui/button'
import { X } from 'lucide-react'
import { cn } from '@/lib/utils'

interface MassPickerProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSelect: (mass: MassWithNames) => void
  placeholder?: string
  emptyMessage?: string
  selectedMassId?: string
  className?: string
  editMode?: boolean // Open directly to edit form
  massToEdit?: MassWithNames | null // Mass being edited
}

// Define constant outside component to prevent re-creation on every render
const EMPTY_FORM_DATA = {}

export function MassPicker({
  open,
  onOpenChange,
  onSelect,
  placeholder = 'Search for a mass...',
  emptyMessage = 'No masses found.',
  selectedMassId,
  className,
  editMode = false,
  massToEdit = null,
}: MassPickerProps) {
  const [masses, setMasses] = useState<MassWithNames[]>([])
  const [loading, setLoading] = useState(false)
  const [currentPage, setCurrentPage] = useState(1)
  const [totalCount, setTotalCount] = useState(0)
  const [searchQuery, setSearchQuery] = useState('')
  const PAGE_SIZE = 10

  // State for nested pickers
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null)
  const [showEventPicker, setShowEventPicker] = useState(false)
  const [selectedPresider, setSelectedPresider] = useState<Person | null>(null)
  const [showPresiderPicker, setShowPresiderPicker] = useState(false)

  // Store onChange callbacks from CorePicker's custom fields
  const [eventOnChange, setEventOnChange] = useState<((value: any) => void) | null>(null)
  const [presiderOnChange, setPresiderOnChange] = useState<((value: any) => void) | null>(null)

  // Load masses when dialog opens or when page/search changes
  useEffect(() => {
    if (open) {
      loadMasses(currentPage, searchQuery)
    }
  }, [open, currentPage, searchQuery])

  const loadMasses = async (page: number, search: string) => {
    try {
      setLoading(true)
      const result = await getMassesPaginated({
        page,
        limit: PAGE_SIZE,
        search,
      })
      setMasses(result.items)
      setTotalCount(result.totalCount)
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

  // Build create fields configuration - memoized to prevent infinite re-renders
  const createFields: PickerFieldConfig[] = useMemo(() => [
    {
      key: 'event_id',
      label: 'Event (Date/Time)',
      type: 'custom',
      required: false,
      render: ({ value, onChange, error }) => {
        // Store the onChange callback
        if (onChange !== eventOnChange) {
          setEventOnChange(() => onChange)
        }

        return (
          <div>
            {selectedEvent ? (
              <div className="flex items-center justify-between p-2 border rounded-md bg-muted/50">
                <span className="text-sm">
                  {selectedEvent.start_date && new Date(selectedEvent.start_date).toLocaleDateString()}
                  {selectedEvent.start_time && ` at ${selectedEvent.start_time}`}
                </span>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={(e) => {
                    e.preventDefault()
                    e.stopPropagation()
                    setSelectedEvent(null)
                    onChange(null)
                  }}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            ) : (
              <Button
                type="button"
                variant="outline"
                onClick={(e) => {
                  e.preventDefault()
                  e.stopPropagation()
                  setShowEventPicker(true)
                }}
                className={cn('w-full justify-start', error && 'border-destructive')}
              >
                <Calendar className="h-4 w-4 mr-2" />
                Select Event
              </Button>
            )}
          </div>
        )
      },
    },
    {
      key: 'presider_id',
      label: 'Presider',
      type: 'custom',
      required: false,
      render: ({ value, onChange, error }) => {
        // Store the onChange callback
        if (onChange !== presiderOnChange) {
          setPresiderOnChange(() => onChange)
        }

        return (
          <div>
            {selectedPresider ? (
              <div className="flex items-center justify-between p-2 border rounded-md bg-muted/50">
                <span className="text-sm">
                  {selectedPresider.first_name} {selectedPresider.last_name}
                </span>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={(e) => {
                    e.preventDefault()
                    e.stopPropagation()
                    setSelectedPresider(null)
                    onChange(null)
                  }}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            ) : (
              <Button
                type="button"
                variant="outline"
                onClick={(e) => {
                  e.preventDefault()
                  e.stopPropagation()
                  setShowPresiderPicker(true)
                }}
                className={cn('w-full justify-start', error && 'border-destructive')}
              >
                <User className="h-4 w-4 mr-2" />
                Select Presider
              </Button>
            )}
          </div>
        )
      },
    },
    {
      key: 'status',
      label: 'Status',
      type: 'select',
      required: false,
      options: MASS_STATUS_VALUES.map((status) => ({
        value: status,
        label: MASS_STATUS_LABELS[status].en,
      })),
    },
    {
      key: 'note',
      label: 'Note',
      type: 'textarea',
      required: false,
      placeholder: 'Add any notes about this mass...',
    },
  ], [selectedEvent, selectedPresider, eventOnChange, presiderOnChange])

  // Handle creating a new mass
  const handleCreateMass = async (data: any): Promise<MassWithNames> => {
    const newMass = await createMass({
      event_id: selectedEvent?.id || undefined,
      presider_id: selectedPresider?.id || undefined,
      status: data.status || 'PLANNING',
      note: data.note || undefined,
    })

    // Reset nested selections
    setSelectedEvent(null)
    setSelectedPresider(null)

    // Fetch the mass with relations for display
    const massWithRelations: MassWithNames = {
      ...newMass,
      event: selectedEvent || null,
      presider: selectedPresider || null,
      homilist: null,
    }

    // Add to local list
    setMasses((prev) => [massWithRelations, ...prev])

    return massWithRelations
  }

  // Handle updating an existing mass
  const handleUpdateMass = async (id: string, data: any): Promise<MassWithNames> => {
    const updatedMass = await updateMass(id, {
      event_id: selectedEvent?.id || null,
      presider_id: selectedPresider?.id || null,
      status: data.status || null,
      note: data.note || null,
    })

    // Reset nested selections
    setSelectedEvent(null)
    setSelectedPresider(null)

    // Fetch the mass with relations for display
    const massWithRelations: MassWithNames = {
      ...updatedMass,
      event: selectedEvent || null,
      presider: selectedPresider || null,
      homilist: null,
    }

    // Update local list
    setMasses((prev) =>
      prev.map(m => m.id === massWithRelations.id ? massWithRelations : m)
    )

    return massWithRelations
  }

  // Handle page change
  const handlePageChange = (page: number) => {
    setCurrentPage(page)
  }

  // Handle search change
  const handleSearchChange = (search: string) => {
    setSearchQuery(search)
    setCurrentPage(1) // Reset to first page when searching
  }

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
    <>
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
        enableCreate={true}
        createFields={createFields}
        onCreateSubmit={handleCreateMass}
        createButtonLabel="Save Mass"
        addNewButtonLabel="Add New Mass"
        defaultCreateFormData={EMPTY_FORM_DATA}
        emptyMessage={emptyMessage}
        noResultsMessage="No masses match your search"
        isLoading={loading}
        editMode={editMode}
        entityToEdit={massToEdit}
        onUpdateSubmit={handleUpdateMass}
        updateButtonLabel="Update Mass"
        enablePagination={true}
        totalCount={totalCount}
        currentPage={currentPage}
        pageSize={PAGE_SIZE}
        onPageChange={handlePageChange}
        onSearch={handleSearchChange}
      />

      {/* Nested Event Picker Modal */}
      <EventPicker
        open={showEventPicker}
        onOpenChange={setShowEventPicker}
        onSelect={(event) => {
          setSelectedEvent(event)
          // Call the stored onChange callback to update CorePicker's form state
          if (eventOnChange) {
            eventOnChange(event.id)
          }
          setShowEventPicker(false)
        }}
        selectedEventId={selectedEvent?.id}
        defaultEventType="MASS"
        visibleFields={['location', 'note']}
      />

      {/* Nested Presider Picker Modal */}
      <PeoplePicker
        open={showPresiderPicker}
        onOpenChange={setShowPresiderPicker}
        onSelect={(person) => {
          setSelectedPresider(person)
          // Call the stored onChange callback to update CorePicker's form state
          if (presiderOnChange) {
            presiderOnChange(person.id)
          }
          setShowPresiderPicker(false)
        }}
        selectedPersonId={selectedPresider?.id}
        visibleFields={['email', 'phone_number']}
      />
    </>
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

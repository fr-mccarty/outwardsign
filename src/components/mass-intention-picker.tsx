'use client'

import { useState, useEffect, useMemo } from 'react'
import { z } from 'zod'
import { Badge } from '@/components/ui/badge'
import { Heart, DollarSign, Calendar, User, X } from 'lucide-react'
import { getMassIntentionsPaginated, createMassIntention, updateMassIntention, type MassIntentionWithNames } from '@/lib/actions/mass-intentions'
import type { Person } from '@/lib/types'
import type { MassWithNames } from '@/lib/schemas/mass-liturgies'
import { toast } from 'sonner'
import { CorePicker } from '@/components/core-picker'
import { PickerFieldConfig } from '@/types/core-picker'
import { MASS_INTENTION_STATUS_VALUES } from '@/lib/constants'
import { getStatusLabel } from '@/lib/content-builders/shared/helpers'
import { PeoplePicker } from '@/components/people-picker'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { formatDatePretty } from '@/lib/utils/formatters'

interface MassIntentionPickerProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSelect: (massIntention: MassIntentionWithNames) => void
  placeholder?: string
  emptyMessage?: string
  selectedMassIntentionId?: string
  openToNewMassIntention?: boolean
  autoOpenCreateForm?: boolean
  editMode?: boolean
  massIntentionToEdit?: MassIntentionWithNames | null
  testId?: string
}

// Define constant outside component to prevent re-creation on every render
const EMPTY_FORM_DATA = {}

export function MassIntentionPicker({
  open,
  onOpenChange,
  onSelect,
  placeholder = 'Search for a mass intention...',
  emptyMessage = 'No mass intentions found.',
  selectedMassIntentionId,
  openToNewMassIntention = false,
  autoOpenCreateForm = false,
  editMode = false,
  massIntentionToEdit = null,
  testId = 'mass-intention-picker',
}: MassIntentionPickerProps) {
  const [massIntentions, setMassIntentions] = useState<MassIntentionWithNames[]>([])
  const [loading, setLoading] = useState(false)
  const [currentPage, setCurrentPage] = useState(1)
  const [totalCount, setTotalCount] = useState(0)
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter] = useState<string>('all')
  const PAGE_SIZE = 10

  // State for nested pickers
  const [selectedMass, setSelectedMass] = useState<MassWithNames | null>(null)
  const [selectedRequestedBy, setSelectedRequestedBy] = useState<Person | null>(null)
  const [showRequestedByPicker, setShowRequestedByPicker] = useState(false)

  // Store onChange callbacks from CorePicker's custom fields
  const [requestedByOnChange, setRequestedByOnChange] = useState<((value: any) => void) | null>(null)

  // Load mass intentions when dialog opens or when page/search/filters change
  useEffect(() => {
    if (open) {
      loadMassIntentions(currentPage, searchQuery, statusFilter)
    }
  }, [open, currentPage, searchQuery, statusFilter])

  const loadMassIntentions = async (page: number, search: string, status: string) => {
    try {
      setLoading(true)
      const offset = (page - 1) * PAGE_SIZE
      const result = await getMassIntentionsPaginated({
        offset,
        limit: PAGE_SIZE,
        search,
        status: status !== 'all' ? status as any : undefined,
      })
      setMassIntentions(result.items)
      setTotalCount(result.totalCount)
    } catch (error) {
      console.error('Error loading mass intentions:', error)
      toast.error('Failed to load mass intentions')
    } finally {
      setLoading(false)
    }
  }

  const getMassIntentionDisplayName = (intention: MassIntentionWithNames) => {
    const offeredFor = intention.mass_offered_for || 'No intention specified'
    const requestedBy = intention.requested_by
      ? `${intention.requested_by.first_name} ${intention.requested_by.last_name}`
      : 'Unknown'
    return `${offeredFor} - ${requestedBy}`
  }

  const getStatusVariant = (status: string) => {
    switch (status) {
      case 'REQUESTED':
        return 'secondary'
      case 'CONFIRMED':
        return 'default'
      case 'FULFILLED':
        return 'outline'
      case 'CANCELLED':
        return 'destructive'
      default:
        return 'secondary'
    }
  }

  const formatStipend = (cents: number | null | undefined) => {
    if (!cents) return 'No stipend'
    return `$${(cents / 100).toFixed(2)}`
  }

  const selectedMassIntention = selectedMassIntentionId
    ? massIntentions.find((mi) => mi.id === selectedMassIntentionId)
    : null

  // Build create fields configuration - memoized to prevent infinite re-renders
  const createFields: PickerFieldConfig[] = useMemo(() => [
    {
      key: 'mass_offered_for',
      label: 'Mass Offered For',
      type: 'text',
      required: true,
      placeholder: 'For the repose of the soul of...',
      validation: z.string().min(1, 'Intention is required'),
    },
    {
      key: 'requested_by_id',
      label: 'Requested By',
      type: 'custom',
      required: false,
      render: ({ onChange, error }) => {
        // Store the onChange callback
        if (onChange !== requestedByOnChange) {
          setRequestedByOnChange(() => onChange)
        }

        return (
          <div>
            {selectedRequestedBy ? (
              <div className="flex items-center justify-between p-2 border rounded-md bg-muted/50">
                <span className="text-sm">
                  {selectedRequestedBy.first_name} {selectedRequestedBy.last_name}
                </span>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={(e) => {
                    e.preventDefault()
                    e.stopPropagation()
                    setSelectedRequestedBy(null)
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
                  setShowRequestedByPicker(true)
                }}
                className={cn('w-full justify-start', error && 'border-destructive')}
              >
                <User className="h-4 w-4 mr-2" />
                Select Person
              </Button>
            )}
          </div>
        )
      },
    },
    {
      key: 'date_requested',
      label: 'Date Requested',
      type: 'date',
      required: false,
    },
    {
      key: 'date_received',
      label: 'Date Received',
      type: 'date',
      required: false,
    },
    {
      key: 'stipend_in_cents',
      label: 'Stipend Amount ($)',
      type: 'number',
      required: false,
      placeholder: '10.00',
      description: 'Enter dollar amount (will be converted to cents)',
    },
    {
      key: 'status',
      label: 'Status',
      type: 'select',
      required: false,
      options: MASS_INTENTION_STATUS_VALUES.map((status) => ({
        value: status,
        label: getStatusLabel(status, 'en'),
      })),
    },
    {
      key: 'note',
      label: 'Note',
      type: 'textarea',
      required: false,
      placeholder: 'Add any notes about this mass intention...',
    },
  ], [selectedRequestedBy, requestedByOnChange])

  // Handle creating a new mass intention
  const handleCreateMassIntention = async (data: any): Promise<MassIntentionWithNames> => {
    // Convert dollar amount to cents if provided
    const stipendInCents = data.stipend_in_cents
      ? Math.round(parseFloat(data.stipend_in_cents) * 100)
      : undefined

    const newMassIntention = await createMassIntention({
      mass_offered_for: data.mass_offered_for,
      requested_by_id: selectedRequestedBy?.id || undefined,
      date_requested: data.date_requested || undefined,
      date_received: data.date_received || undefined,
      stipend_in_cents: stipendInCents,
      status: data.status || 'REQUESTED',
      note: data.note || undefined,
    })

    // Reset nested selections
    setSelectedMass(null)
    setSelectedRequestedBy(null)

    // Fetch the mass intention with relations for display
    // Extract calendar_event from the selected mass's primary_calendar_event
    const massIntentionWithRelations: MassIntentionWithNames = {
      ...newMassIntention,
      calendar_event: selectedMass?.primary_calendar_event || null,
      requested_by: selectedRequestedBy || null,
    }

    // Add to local list
    setMassIntentions((prev) => [massIntentionWithRelations, ...prev])

    return massIntentionWithRelations
  }

  // Handle updating an existing mass intention
  const handleUpdateMassIntention = async (id: string, data: any): Promise<MassIntentionWithNames> => {
    // Convert dollar amount to cents if provided
    const stipendInCents = data.stipend_in_cents
      ? Math.round(parseFloat(data.stipend_in_cents) * 100)
      : null

    const updatedMassIntention = await updateMassIntention(id, {
      mass_offered_for: data.mass_offered_for || null,
      requested_by_id: selectedRequestedBy?.id || null,
      date_requested: data.date_requested || null,
      date_received: data.date_received || null,
      stipend_in_cents: stipendInCents,
      status: data.status || null,
      note: data.note || null,
    })

    // Reset nested selections
    setSelectedMass(null)
    setSelectedRequestedBy(null)

    // Fetch the mass intention with relations for display
    // Extract calendar_event from the selected mass's primary_calendar_event
    const massIntentionWithRelations: MassIntentionWithNames = {
      ...updatedMassIntention,
      calendar_event: selectedMass?.primary_calendar_event || null,
      requested_by: selectedRequestedBy || null,
    }

    // Update local list
    setMassIntentions((prev) =>
      prev.map(mi => mi.id === massIntentionWithRelations.id ? massIntentionWithRelations : mi)
    )

    return massIntentionWithRelations
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

  // Custom render for mass intention list items
  const renderMassIntentionItem = (intention: MassIntentionWithNames) => {
    const isSelected = selectedMassIntentionId === intention.id

    return (
      <div className="flex items-center gap-3">
        <Heart className="h-5 w-5 text-muted-foreground" />

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <span className="font-medium truncate">
              {intention.mass_offered_for || 'No intention specified'}
            </span>
            {isSelected && (
              <Badge variant="secondary" className="text-xs">
                Selected
              </Badge>
            )}
          </div>

          <div className="flex items-center gap-4 mt-1 text-xs text-muted-foreground">
            {intention.requested_by && (
              <div className="flex items-center gap-1">
                <User className="h-3 w-3" />
                <span className="truncate">
                  {intention.requested_by.first_name} {intention.requested_by.last_name}
                </span>
              </div>
            )}
            {intention.date_requested && (
              <div className="flex items-center gap-1">
                <Calendar className="h-3 w-3" />
                <span>{formatDatePretty(intention.date_requested)}</span>
              </div>
            )}
            {intention.stipend_in_cents && (
              <div className="flex items-center gap-1">
                <DollarSign className="h-3 w-3" />
                <span>{formatStipend(intention.stipend_in_cents)}</span>
              </div>
            )}
          </div>

          <div className="mt-1">
            <Badge
              variant={getStatusVariant(intention.status || 'REQUESTED')}
              className="text-xs"
            >
              {getStatusLabel(intention.status, 'en')}
            </Badge>
          </div>
        </div>
      </div>
    )
  }

  return (
    <>
      <CorePicker<MassIntentionWithNames>
        open={open}
        onOpenChange={onOpenChange}
        items={massIntentions}
        selectedItem={selectedMassIntention}
        onSelect={onSelect}
        title="Select Mass Intention"
        entityName="mass intention"
        searchPlaceholder={placeholder}
        searchFields={['mass_offered_for', 'requested_by', 'status']}
        getItemLabel={getMassIntentionDisplayName}
        getItemId={(intention) => intention.id}
        renderItem={renderMassIntentionItem}
        enableCreate={true}
        createFields={createFields}
        onCreateSubmit={handleCreateMassIntention}
        createButtonLabel="Save Mass Intention"
        addNewButtonLabel="Add New Mass Intention"
        defaultCreateFormData={EMPTY_FORM_DATA}
        emptyMessage={emptyMessage}
        noResultsMessage="No mass intentions match your search"
        isLoading={loading}
        autoOpenCreateForm={autoOpenCreateForm || openToNewMassIntention}
        editMode={editMode}
        entityToEdit={massIntentionToEdit}
        onUpdateSubmit={handleUpdateMassIntention}
        updateButtonLabel="Update Mass Intention"
        enablePagination={true}
        totalCount={totalCount}
        currentPage={currentPage}
        pageSize={PAGE_SIZE}
        onPageChange={handlePageChange}
        onSearch={handleSearchChange}
        testId={testId}
      />

      {/* Nested Requested By Picker Modal */}
      <PeoplePicker
        open={showRequestedByPicker}
        onOpenChange={setShowRequestedByPicker}
        onSelect={(person) => {
          setSelectedRequestedBy(person)
          // Call the stored onChange callback to update CorePicker's form state
          if (requestedByOnChange) {
            requestedByOnChange(person.id)
          }
          setShowRequestedByPicker(false)
        }}
        selectedPersonId={selectedRequestedBy?.id}
        additionalVisibleFields={['email', 'phone_number']}
      />
    </>
  )
}

// Hook to use the mass intention picker
export function useMassIntentionPicker() {
  const [open, setOpen] = useState(false)
  const [selectedMassIntention, setSelectedMassIntention] = useState<MassIntentionWithNames | null>(null)

  const openPicker = () => setOpen(true)
  const closePicker = () => setOpen(false)

  const handleSelect = (massIntention: MassIntentionWithNames) => {
    setSelectedMassIntention(massIntention)
    setOpen(false)
  }

  const clearSelection = () => {
    setSelectedMassIntention(null)
  }

  return {
    open,
    openPicker,
    closePicker,
    selectedMassIntention,
    handleSelect,
    clearSelection,
    setOpen,
  }
}

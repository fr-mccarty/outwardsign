'use client'

import { useState, useEffect, useMemo, useCallback } from 'react'
import { z } from 'zod'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Mail, Phone } from 'lucide-react'
import { getPeoplePaginated, createPerson, updatePerson } from '@/lib/actions/people'
import type { Person } from '@/lib/types'
import { toast } from 'sonner'
import { CorePicker } from '@/components/core-picker'
import { PickerFieldConfig } from '@/types/core-picker'
import { isFieldVisible as checkFieldVisible, isFieldRequired as checkFieldRequired } from '@/types/picker'
import { SEX_VALUES, SEX_LABELS, type Sex } from '@/lib/constants'

interface PeoplePickerProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSelect: (person: Person) => void
  placeholder?: string
  emptyMessage?: string
  selectedPersonId?: string
  className?: string
  visibleFields?: string[] // Optional fields to show: 'email', 'phone_number', 'sex', 'note'
  requiredFields?: string[] // Fields that should be marked as required: 'email', 'phone_number', 'sex', 'note'
  openToNewPerson?: boolean
  autoOpenCreateForm?: boolean
  defaultCreateFormData?: Record<string, any>
  editMode?: boolean // Open directly to edit form
  personToEdit?: Person | null // Person being edited
  autoSetSex?: Sex // Auto-set sex to this value and hide the field
}

// Default visible fields - defined outside component to prevent re-creation
const DEFAULT_VISIBLE_FIELDS = ['email', 'phone_number', 'sex', 'note']

// Empty object constant to prevent re-creation on every render
const EMPTY_FORM_DATA = {}

export function PeoplePicker({
  open,
  onOpenChange,
  onSelect,
  placeholder = 'Search for a person...',
  emptyMessage = 'No people found.',
  selectedPersonId,

  visibleFields,
  requiredFields,
  openToNewPerson = false,
  autoOpenCreateForm = false,
  defaultCreateFormData,
  editMode = false,
  personToEdit = null,
  autoSetSex,
}: PeoplePickerProps) {
  const [people, setPeople] = useState<Person[]>([])
  const [loading, setLoading] = useState(false)
  const [currentPage, setCurrentPage] = useState(1)
  const [totalCount, setTotalCount] = useState(0)
  const [searchQuery, setSearchQuery] = useState('')
  const [debouncedSearchQuery, setDebouncedSearchQuery] = useState('')
  const PAGE_SIZE = 10

  // Debounce search query with 1000ms delay
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchQuery(searchQuery)
    }, 1000)

    return () => clearTimeout(timer)
  }, [searchQuery])

  // Memoize helper functions to prevent unnecessary re-renders
  const isFieldVisible = useCallback(
    (fieldName: string) => {
      // Hide sex field if autoSetSex is provided
      if (fieldName === 'sex' && autoSetSex) {
        return false
      }
      return checkFieldVisible(fieldName, visibleFields, DEFAULT_VISIBLE_FIELDS)
    },
    [visibleFields, autoSetSex]
  )
  const isFieldRequired = useCallback(
    (fieldName: string) => checkFieldRequired(fieldName, requiredFields),
    [requiredFields]
  )

  // Load people when dialog opens or when page/search changes
  useEffect(() => {
    if (open) {
      loadPeople(currentPage, debouncedSearchQuery)
    }
  }, [open, currentPage, debouncedSearchQuery])

  const loadPeople = async (page: number, search: string) => {
    try {
      setLoading(true)
      const result = await getPeoplePaginated({
        page,
        limit: PAGE_SIZE,
        search,
      })
      setPeople(result.items)
      setTotalCount(result.totalCount)
    } catch (error) {
      console.error('Error loading people:', error)
      toast.error('Failed to load people')
    } finally {
      setLoading(false)
    }
  }

  const getPersonDisplayName = (person: Person) => {
    return `${person.first_name} ${person.last_name}`.trim()
  }

  const getPersonInitials = (person: Person) => {
    const firstName = person.first_name?.charAt(0) || ''
    const lastName = person.last_name?.charAt(0) || ''
    return (firstName + lastName).toUpperCase()
  }

  const selectedPerson = selectedPersonId
    ? people.find((p) => p.id === selectedPersonId)
    : null

  // Handle page change
  const handlePageChange = (page: number) => {
    setCurrentPage(page)
  }

  // Handle search change - debounced via useEffect above
  const handleSearchChange = (search: string) => {
    setSearchQuery(search)
    setCurrentPage(1) // Reset to first page when searching
  }

  // Build create fields configuration dynamically - memoized to prevent infinite re-renders
  const createFields: PickerFieldConfig[] = useMemo(() => {
    const fields: PickerFieldConfig[] = [
      {
        key: 'first_name',
        label: 'First Name',
        type: 'text',
        required: true,
        placeholder: 'John',
        validation: z.string().min(1, 'First name is required'),
      },
      {
        key: 'last_name',
        label: 'Last Name',
        type: 'text',
        required: true,
        placeholder: 'Doe',
        validation: z.string().min(1, 'Last name is required'),
      },
    ]

    if (isFieldVisible('email')) {
      fields.push({
        key: 'email',
        label: 'Email',
        type: 'email',
        required: isFieldRequired('email'),
        placeholder: 'john.doe@example.com',
      })
    }

    if (isFieldVisible('phone_number')) {
      fields.push({
        key: 'phone_number',
        label: 'Phone',
        type: 'tel',
        required: isFieldRequired('phone_number'),
        placeholder: '(555) 123-4567',
      })
    }

    if (isFieldVisible('sex')) {
      fields.push({
        key: 'sex',
        label: 'Sex',
        type: 'select',
        required: isFieldRequired('sex'),
        options: SEX_VALUES.map(value => ({
          value,
          label: SEX_LABELS[value].en // Using English labels for now
        })),
      })
    }

    if (isFieldVisible('note')) {
      fields.push({
        key: 'note',
        label: 'Note',
        type: 'textarea',
        required: isFieldRequired('note'),
        placeholder: 'Add any notes about this person...',
      })
    }

    return fields
  }, [isFieldVisible, isFieldRequired])

  // Handle creating a new person
  const handleCreatePerson = async (data: any): Promise<Person> => {
    const newPerson = await createPerson({
      first_name: data.first_name,
      last_name: data.last_name,
      email: data.email || undefined,
      phone_number: data.phone_number || undefined,
      sex: autoSetSex || data.sex || undefined,
      note: data.note || undefined,
    })

    // Add to local list
    setPeople((prev) => [newPerson, ...prev])

    return newPerson
  }

  // Handle updating an existing person
  const handleUpdatePerson = async (id: string, data: any): Promise<Person> => {
    const updatedPerson = await updatePerson(id, {
      first_name: data.first_name,
      last_name: data.last_name,
      email: data.email || undefined,
      phone_number: data.phone_number || undefined,
      sex: data.sex || undefined,
      note: data.note || undefined,
    })

    // Update local list
    setPeople((prev) =>
      prev.map(p => p.id === updatedPerson.id ? updatedPerson : p)
    )

    return updatedPerson
  }

  // Custom render for person list items
  const renderPersonItem = (person: Person) => {
    const isSelected = selectedPersonId === person.id

    return (
      <div className="flex items-center gap-3">
        <Avatar className="h-8 w-8">
          <AvatarFallback className="text-xs">
            {getPersonInitials(person)}
          </AvatarFallback>
        </Avatar>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <span className="font-medium">{getPersonDisplayName(person)}</span>
            {isSelected && (
              <Badge variant="secondary" className="text-xs">
                Selected
              </Badge>
            )}
          </div>

          <div className="flex items-center gap-4 mt-1 text-xs text-muted-foreground">
            {person.email && (
              <div className="flex items-center gap-1">
                <Mail className="h-3 w-3" />
                <span className="truncate">{person.email}</span>
              </div>
            )}
            {person.phone_number && (
              <div className="flex items-center gap-1">
                <Phone className="h-3 w-3" />
                <span>{person.phone_number}</span>
              </div>
            )}
          </div>
        </div>
      </div>
    )
  }

  return (
    <CorePicker<Person>
      open={open}
      onOpenChange={onOpenChange}
      items={people}
      selectedItem={selectedPerson}
      onSelect={onSelect}
      title="Select Person"
      entityName="person"
      searchPlaceholder={placeholder}
      searchFields={['first_name', 'last_name', 'email', 'phone_number']}
      getItemLabel={(person) => getPersonDisplayName(person)}
      getItemId={(person) => person.id}
      renderItem={renderPersonItem}
      enableCreate={true}
      createFields={createFields}
      onCreateSubmit={handleCreatePerson}
      createButtonLabel="Save Person"
      addNewButtonLabel="Add New Person"
      emptyMessage={emptyMessage}
      noResultsMessage="No people match your search"
      isLoading={loading}
      autoOpenCreateForm={autoOpenCreateForm || openToNewPerson}
      defaultCreateFormData={defaultCreateFormData || EMPTY_FORM_DATA}
      editMode={editMode}
      entityToEdit={personToEdit}
      onUpdateSubmit={handleUpdatePerson}
      updateButtonLabel="Update Person"
      enablePagination={true}
      totalCount={totalCount}
      currentPage={currentPage}
      pageSize={PAGE_SIZE}
      onPageChange={handlePageChange}
      onSearch={handleSearchChange}
    />
  )
}

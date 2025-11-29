'use client'

import { useState, useEffect, useMemo, useCallback } from 'react'
import { z } from 'zod'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Mail, Phone, ChevronDown, ChevronRight, Sparkles, Loader2 } from 'lucide-react'
import { getPeoplePaginated, createPerson, updatePerson } from '@/lib/actions/people'
import { generatePronunciation } from '@/lib/actions/generate-pronunciation'
import type { Person } from '@/lib/types'
import { toast } from 'sonner'
import { CorePicker } from '@/components/core-picker'
import { PickerFieldConfig, CustomFormComponentProps } from '@/types/core-picker'
import { isFieldVisible as checkFieldVisible, isFieldRequired as checkFieldRequired } from '@/types/picker'
import { SEX_VALUES, SEX_LABELS, type Sex } from '@/lib/constants'
import { FormInput } from '@/components/form-input'

interface PeoplePickerProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSelect: (person: Person) => void
  placeholder?: string
  emptyMessage?: string
  selectedPersonId?: string
  className?: string
  additionalVisibleFields?: string[] // Additional fields to show: 'email', 'phone_number', 'sex', 'note'
  requiredFields?: string[] // Fields that should be marked as required: 'email', 'phone_number', 'sex', 'note'
  openToNewPerson?: boolean
  autoOpenCreateForm?: boolean
  defaultCreateFormData?: Record<string, any>
  editMode?: boolean // Open directly to edit form
  personToEdit?: Person | null // Person being edited
  autoSetSex?: Sex // Auto-set sex to this value and hide the field
  filterByMassRole?: string // Filter people by mass role membership
}

// Default additional visible fields - defined outside component to prevent re-creation
// Note: first_name, last_name, and pronunciation fields are always shown (pronunciation via toggle)
const DEFAULT_ADDITIONAL_FIELDS = ['email', 'phone_number', 'sex', 'note']

// Empty object constant to prevent re-creation on every render
const EMPTY_FORM_DATA = {}

export function PeoplePicker({
  open,
  onOpenChange,
  onSelect,
  placeholder = 'Search for a person...',
  emptyMessage = 'No people found.',
  selectedPersonId,
  additionalVisibleFields,
  requiredFields,
  openToNewPerson = false,
  autoOpenCreateForm = false,
  defaultCreateFormData,
  editMode = false,
  personToEdit = null,
  autoSetSex,
  filterByMassRole,
}: PeoplePickerProps) {
  const [people, setPeople] = useState<Person[]>([])
  const [loading, setLoading] = useState(false)
  const [currentPage, setCurrentPage] = useState(1)
  const [totalCount, setTotalCount] = useState(0)
  const [searchQuery, setSearchQuery] = useState('')
  const [debouncedSearchQuery, setDebouncedSearchQuery] = useState('')
  const [showPronunciation, setShowPronunciation] = useState(false)
  const [isGenerating, setIsGenerating] = useState(false)
  const PAGE_SIZE = 10

  // Debounce search query with 1000ms delay
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchQuery(searchQuery)
    }, 1000)

    return () => clearTimeout(timer)
  }, [searchQuery])

  // Auto-expand pronunciation section when editing a person with pronunciation data
  useEffect(() => {
    if (editMode && personToEdit) {
      const hasPronunciationData =
        personToEdit.first_name_pronunciation || personToEdit.last_name_pronunciation
      setShowPronunciation(!!hasPronunciationData)
    } else if (!open) {
      // Reset when picker closes
      setShowPronunciation(false)
    }
  }, [editMode, personToEdit, open])

  // Memoize helper functions to prevent unnecessary re-renders
  // Note: isFieldVisible only applies to additional fields (email, phone, sex, note)
  // First name, last name, and pronunciation fields are always available
  const isAdditionalFieldVisible = useCallback(
    (fieldName: string) => {
      // Hide sex field if autoSetSex is provided
      if (fieldName === 'sex' && autoSetSex) {
        return false
      }
      return checkFieldVisible(fieldName, additionalVisibleFields, DEFAULT_ADDITIONAL_FIELDS)
    },
    [additionalVisibleFields, autoSetSex]
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
        massRoleId: filterByMassRole,
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

  // Build create fields configuration for schema validation
  // Note: The actual form rendering is handled by PersonFormFields below
  // First name, last name, and pronunciation fields are always included
  const createFields: PickerFieldConfig[] = useMemo(() => {
    const fields: PickerFieldConfig[] = [
      // Core name fields - always present
      {
        key: 'first_name',
        label: 'First Name',
        type: 'text',
        required: true,
        validation: z.string().min(1, 'First name is required'),
      },
      {
        key: 'last_name',
        label: 'Last Name',
        type: 'text',
        required: true,
        validation: z.string().min(1, 'Last name is required'),
      },
      // Pronunciation fields - always in schema (optional, shown via toggle)
      {
        key: 'first_name_pronunciation',
        label: 'First Name Pronunciation',
        type: 'text',
        required: false,
      },
      {
        key: 'last_name_pronunciation',
        label: 'Last Name Pronunciation',
        type: 'text',
        required: false,
      },
    ]

    // Additional configurable fields
    if (isAdditionalFieldVisible('email')) {
      fields.push({
        key: 'email',
        label: 'Email',
        type: 'email',
        required: isFieldRequired('email'),
      })
    }

    if (isAdditionalFieldVisible('phone_number')) {
      fields.push({
        key: 'phone_number',
        label: 'Phone',
        type: 'tel',
        required: isFieldRequired('phone_number'),
      })
    }

    if (isAdditionalFieldVisible('sex')) {
      fields.push({
        key: 'sex',
        label: 'Sex',
        type: 'select',
        required: isFieldRequired('sex'),
        options: SEX_VALUES.map(value => ({
          value,
          label: SEX_LABELS[value].en
        })),
      })
    }

    if (isAdditionalFieldVisible('note')) {
      fields.push({
        key: 'note',
        label: 'Note',
        type: 'textarea',
        required: isFieldRequired('note'),
      })
    }

    return fields
  }, [isAdditionalFieldVisible, isFieldRequired])

  // Custom form component with pronunciation toggle
  const PersonFormFields = useCallback(
    ({ form, errors }: CustomFormComponentProps) => {
      const { watch, setValue } = form

      const getError = (field: string) => {
        const error = errors[field]
        return error?.message ? String(error.message) : undefined
      }

      const handleGeneratePronunciations = async () => {
        const firstName = watch('first_name')?.trim()
        const lastName = watch('last_name')?.trim()

        if (!firstName && !lastName) {
          toast.error('Please enter both first and last name before generating pronunciations')
          return
        }

        try {
          setIsGenerating(true)
          const result = await generatePronunciation({
            firstName: firstName || '',
            lastName: lastName || '',
          })

          // Set pronunciations in form
          setValue('first_name_pronunciation', result.firstNamePronunciation, { shouldValidate: true })
          setValue('last_name_pronunciation', result.lastNamePronunciation, { shouldValidate: true })

          // Show pronunciation fields after generation
          setShowPronunciation(true)

          toast.success('Pronunciations generated successfully')
        } catch (error) {
          console.error('Failed to generate pronunciations:', error)
          toast.error('Failed to generate pronunciations. Please try again.')
        } finally {
          setIsGenerating(false)
        }
      }

      return (
        <div className="space-y-4">
          {/* First Name - always shown */}
          <FormInput
            id="first_name"
            label="First Name"
            inputType="text"
            value={watch('first_name') ?? ''}
            onChange={(value) => setValue('first_name', value, { shouldValidate: true })}
            required
            error={getError('first_name')}
          />

          {/* Last Name - always shown */}
          <FormInput
            id="last_name"
            label="Last Name"
            inputType="text"
            value={watch('last_name') ?? ''}
            onChange={(value) => setValue('last_name', value, { shouldValidate: true })}
            required
            error={getError('last_name')}
          />

          {/* Pronunciation Toggle - always shown */}
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => setShowPronunciation(!showPronunciation)}
            className="h-6 px-2 text-xs text-muted-foreground hover:text-foreground"
          >
            {showPronunciation ? (
              <ChevronDown className="h-3 w-3 mr-1" />
            ) : (
              <ChevronRight className="h-3 w-3 mr-1" />
            )}
            {showPronunciation ? 'Hide pronunciation' : 'Add pronunciation guide'}
          </Button>

          {/* Generate Pronunciations Button - shown when name exists */}
          {(watch('first_name') || watch('last_name')) && (
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleGeneratePronunciations}
              disabled={isGenerating}
              className="mt-2 h-7 px-2 text-xs"
            >
              {isGenerating ? (
                <>
                  <Loader2 className="mr-1 h-3 w-3 animate-spin" />
                  Generating...
                </>
              ) : (
                <>
                  <Sparkles className="mr-1 h-3 w-3" />
                  Generate Pronunciations with AI
                </>
              )}
            </Button>
          )}

          {/* Pronunciation Fields - shown when toggle is expanded */}
          {showPronunciation && (
            <>
              <FormInput
                id="first_name_pronunciation"
                label="First Name Pronunciation"
                inputType="text"
                value={watch('first_name_pronunciation') ?? ''}
                onChange={(value) => setValue('first_name_pronunciation', value, { shouldValidate: true })}
                description="How to pronounce the first name"
                error={getError('first_name_pronunciation')}
              />
              <FormInput
                id="last_name_pronunciation"
                label="Last Name Pronunciation"
                inputType="text"
                value={watch('last_name_pronunciation') ?? ''}
                onChange={(value) => setValue('last_name_pronunciation', value, { shouldValidate: true })}
                description="How to pronounce the last name"
                error={getError('last_name_pronunciation')}
              />
            </>
          )}

          {/* Additional configurable fields */}
          {isAdditionalFieldVisible('email') && (
            <FormInput
              id="email"
              label="Email"
              inputType="email"
              value={watch('email') ?? ''}
              onChange={(value) => setValue('email', value, { shouldValidate: true })}
              placeholder="john.doe@example.com"
              required={isFieldRequired('email')}
              error={getError('email')}
            />
          )}

          {isAdditionalFieldVisible('phone_number') && (
            <FormInput
              id="phone_number"
              label="Phone"
              inputType="tel"
              value={watch('phone_number') ?? ''}
              onChange={(value) => setValue('phone_number', value, { shouldValidate: true })}
              placeholder="(555) 123-4567"
              required={isFieldRequired('phone_number')}
              error={getError('phone_number')}
            />
          )}

          {isAdditionalFieldVisible('sex') && (
            <FormInput
              id="sex"
              label="Sex"
              inputType="select"
              value={watch('sex') ?? ''}
              onChange={(value) => setValue('sex', value, { shouldValidate: true })}
              options={SEX_VALUES.map(value => ({
                value,
                label: SEX_LABELS[value].en
              }))}
              required={isFieldRequired('sex')}
              error={getError('sex')}
            />
          )}

          {isAdditionalFieldVisible('note') && (
            <FormInput
              id="note"
              label="Note"
              inputType="textarea"
              value={watch('note') ?? ''}
              onChange={(value) => setValue('note', value, { shouldValidate: true })}
              placeholder="Add any notes about this person..."
              required={isFieldRequired('note')}
              error={getError('note')}
            />
          )}
        </div>
      )
    },
    [isAdditionalFieldVisible, isFieldRequired, showPronunciation, isGenerating]
  )

  // Handle creating a new person
  const handleCreatePerson = async (data: any): Promise<Person> => {
    const newPerson = await createPerson({
      first_name: data.first_name,
      first_name_pronunciation: data.first_name_pronunciation || undefined,
      last_name: data.last_name,
      last_name_pronunciation: data.last_name_pronunciation || undefined,
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
      first_name_pronunciation: data.first_name_pronunciation || undefined,
      last_name: data.last_name,
      last_name_pronunciation: data.last_name_pronunciation || undefined,
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
      CustomFormComponent={PersonFormFields}
    />
  )
}

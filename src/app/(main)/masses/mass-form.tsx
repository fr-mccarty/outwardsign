"use client"

import { useEffect, useRef } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { FormInput } from "@/components/form-input"
import { FormSectionCard } from "@/components/form-section-card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { createMass, updateMass, getMassRoles, createMassRole, deleteMassRole, deleteAllMassRoles, linkMassIntention, unlinkMassIntention } from "@/lib/actions/masses"
import type { MassWithRelations, MasterEventRoleWithRelations } from "@/lib/schemas/masses"
import type { Person, Event, Location, ContentWithTags, Petition, Document } from "@/lib/types"
import type { Group } from "@/lib/actions/groups"
import type { GlobalLiturgicalEvent } from "@/lib/actions/global-liturgical-events"
import type { MassIntentionWithNames } from "@/lib/actions/mass-intentions"
import type { EventTypeWithRelations, InputFieldDefinition } from "@/lib/types/event-types"
import { getEventTypeWithRelations } from "@/lib/actions/event-types"
import { useRouter } from "next/navigation"
import { toast } from 'sonner'
import { PersonPickerField } from "@/components/person-picker-field"
import { EventPickerField } from "@/components/event-picker-field"
import { LiturgicalEventPickerField } from "@/components/liturgical-event-picker-field"
import { LocationPickerField } from "@/components/location-picker-field"
import { ContentPickerField } from "@/components/content-picker-field"
import { PetitionPickerField } from "@/components/petition-picker-field"
import { GroupPickerField } from "@/components/group-picker-field"
import { ListItemPickerField } from "@/components/list-item-picker-field"
import { DocumentPickerField } from "@/components/document-picker-field"
import { DatePickerField } from "@/components/date-picker-field"
import { TimePickerField } from "@/components/time-picker-field"
import { EventTypeSelectField } from "@/components/event-type-select-field"
import { MassIntentionTextarea } from "@/components/mass-intention-textarea"
import { FormSpacer } from "@/components/form-spacer"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { MASS_STATUS_VALUES, MASS_TEMPLATE_VALUES, MASS_TEMPLATE_LABELS, MASS_DEFAULT_TEMPLATE, LITURGICAL_COLOR_VALUES, LITURGICAL_COLOR_LABELS, type MassStatus, type MassTemplate, type LiturgicalColor } from "@/lib/constants"
import { getStatusLabel } from "@/lib/content-builders/shared/helpers"
import { FormBottomActions } from "@/components/form-bottom-actions"
import { PetitionEditor, type PetitionTemplate } from "@/components/petition-editor"
import { usePickerState } from "@/hooks/use-picker-state"
import { PeoplePicker } from "@/components/people-picker"
import { MassIntentionPicker } from "@/components/mass-intention-picker"
import { RoleFulfillmentBadge } from "@/components/role-fulfillment-badge"
import { Plus, X, Heart } from "lucide-react"
import { createMassSchema, type CreateMassData } from "@/lib/schemas/masses"
import { useState } from "react"
import { toLocalDateString } from "@/lib/utils/formatters"

interface MassFormProps {
  mass?: MassWithRelations
  formId?: string
  onLoadingChange?: (loading: boolean) => void
  initialLiturgicalEvent?: GlobalLiturgicalEvent | null
}

export function MassForm({ mass, formId, onLoadingChange, initialLiturgicalEvent }: MassFormProps) {
  const router = useRouter()
  const isEditing = !!mass

  // Initialize React Hook Form
  // Note: In the new data model, many fields are stored in field_values JSONB column
  const initialFieldValues = mass?.field_values || {}
  const { handleSubmit, formState: { errors, isSubmitting }, setValue, watch } = useForm<CreateMassData>({
    resolver: zodResolver(createMassSchema),
    defaultValues: {
      status: mass?.status || "ACTIVE",
      event_id: undefined, // Calendar events are in calendar_events[], not event_id
      liturgical_event_id: (initialFieldValues.liturgical_event_id as string) || initialLiturgicalEvent?.id || undefined,
      mass_roles_template_id: undefined, // No longer used - roles are in event_type.role_definitions
      petitions: (initialFieldValues.petitions as string) || undefined,
      announcements: (initialFieldValues.announcements as string) || undefined,
      note: (initialFieldValues.note as string) || undefined,
      mass_template_id: (initialFieldValues.mass_template_id as MassTemplate) || MASS_DEFAULT_TEMPLATE,
      liturgical_color: (initialFieldValues.liturgical_color as LiturgicalColor) || undefined,
    }
  })

  // Notify parent component of loading state changes
  useEffect(() => {
    onLoadingChange?.(isSubmitting)
  }, [isSubmitting, onLoadingChange])

  // Picker states using usePickerState hook
  const event = usePickerState<Event>()
  const liturgicalEvent = usePickerState<GlobalLiturgicalEvent>()

  // Mass role assignments state
  const [massRoles, setMassRoles] = useState<MasterEventRoleWithRelations[]>([])
  const [rolePickerOpen, setRolePickerOpen] = useState(false)
  const [currentRoleId, setCurrentRoleId] = useState<string | null>(null)

  // Mass intention state
  const [massIntention, setMassIntention] = useState<MassIntentionWithNames | null>(null)
  const [massIntentionPickerOpen, setMassIntentionPickerOpen] = useState(false)

  // Event type templating state
  const [eventTypeId, setEventTypeId] = useState<string | null>(mass?.event_type_id || null)
  const [eventType, setEventType] = useState<EventTypeWithRelations | null>(null)
  const [inputFieldDefinitions, setInputFieldDefinitions] = useState<InputFieldDefinition[]>([])
  const [fieldValues, setFieldValues] = useState<Record<string, any>>(() => {
    // Initialize from existing mass or empty
    return mass?.field_values || {}
  })
  const [pickerValues, setPickerValues] = useState<Record<string, Person | Location | ContentWithTags | Petition | Group | Document | null>>(() => {
    const initial: Record<string, Person | Location | ContentWithTags | Petition | Group | Document | null> = {}
    // Initialize from resolved fields if editing
    if (mass?.resolved_fields) {
      Object.entries(mass.resolved_fields).forEach(([fieldName, resolved]) => {
        if (resolved.resolved_value) {
          initial[fieldName] = resolved.resolved_value as Person | Location | ContentWithTags | Petition | Group | Document
        }
      })
    }
    return initial
  })
  const [pickerOpen, setPickerOpen] = useState<Record<string, boolean>>({})

  // Track if we've initialized to prevent infinite loops
  const initializedMassIdRef = useRef<string | null>(null)

  // Initialize form with mass data when editing
  useEffect(() => {
    if (mass && mass.id !== initializedMassIdRef.current) {
      initializedMassIdRef.current = mass.id

      // Note: In new data model, event info is in calendar_events[], not a direct event relation
      // The EventPickerField expects the old Event type, so we don't set it from calendar_events
      // TODO: Update EventPickerField to work with CalendarEvent or create CalendarEventPickerField

      // Note: presider/homilist are now handled via people_event_assignments, not direct columns

      // Note: liturgical_event is now stored in field_values, not as a direct relation
      // TODO: Load liturgical event from field_values.liturgical_event_id if needed

      // TODO: Mass roles now handled via people_event_assignments, not separate roles property
      // setMassRoles would need to be refactored to use people_event_assignments

      // Set mass intention if available
      if (mass.mass_intention) {
        setMassIntention(mass.mass_intention)
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mass?.id]) // Only re-run when mass ID changes

  // Initialize liturgical event from URL params when creating new mass
  useEffect(() => {
    if (!isEditing && initialLiturgicalEvent) {
      liturgicalEvent.setValue(initialLiturgicalEvent)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []) // Only run once on mount

  // Sync picker values to form state
  useEffect(() => {
    setValue('event_id', event.value?.id)
  }, [event.value, setValue])

  useEffect(() => {
    setValue('liturgical_event_id', liturgicalEvent.value?.id)
  }, [liturgicalEvent.value, setValue])

  // Load mass roles when editing an existing mass
  useEffect(() => {
    if (isEditing && mass?.id) {
      loadMassRoles()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isEditing, mass?.id]) // loadMassRoles is stable, only re-run when mass changes

  // Load event type when selected
  useEffect(() => {
    if (eventTypeId) {
      loadEventType(eventTypeId)
    } else {
      setEventType(null)
      setInputFieldDefinitions([])
    }
  }, [eventTypeId])

  const loadEventType = async (typeId: string) => {
    try {
      const type = await getEventTypeWithRelations(typeId)
      if (type) {
        setEventType(type)
        setInputFieldDefinitions(type.input_field_definitions || [])
      }
    } catch (error) {
      console.error('Error loading event type:', error)
      toast.error('Failed to load event type template')
    }
  }

  const loadMassRoles = async () => {
    if (!mass?.id) return
    try {
      const massRoleInstances = await getMassRoles(mass.id)
      setMassRoles(massRoleInstances)
    } catch (error) {
      console.error('Error loading mass roles:', error)
      toast.error('Failed to load mass role assignments')
    }
  }

  // Petition templates (simple default for now)
  const petitionTemplates: PetitionTemplate[] = [
    {
      id: 'mass-sunday-english',
      name: 'Sunday Mass (English)',
      description: 'Standard Sunday Mass petitions in English',
    },
    {
      id: 'mass-weekday-english',
      name: 'Weekday Mass (English)',
      description: 'Standard weekday Mass petitions in English',
    },
  ]

  const handleInsertTemplate = (templateId: string): string[] => {
    // Simple template system - can be expanded later
    if (templateId === 'mass-sunday-english') {
      return [
        'For our Holy Father, Pope Francis, our Bishop, and all the clergy.',
        'For our nation\'s leaders and all who serve in public office.',
        'For peace in our world and protection of the innocent.',
        'For the unemployed and those struggling with financial hardship.',
        'For the sick and those who minister to them.',
        'For our young people and all who guide them.',
        'For our deceased parishioners and all who have gone before us.',
        'For our parish community and all our special intentions.',
      ]
    } else if (templateId === 'mass-weekday-english') {
      return [
        'For our Holy Father, Pope Francis, our Bishop, and all the clergy.',
        'For peace in our world and an end to all violence and hatred.',
        'For the sick, the suffering, and those who care for them.',
        'For our deceased brothers and sisters, especially those who have recently died.',
        'For our community and all our intentions.',
      ]
    }
    return []
  }

  // Clear all role assignments
  const handleClearRoleAssignments = async () => {
    if (!isEditing || !mass?.id || massRoles.length === 0) return

    try {
      await deleteAllMassRoles(mass.id)
      await loadMassRoles()
      toast.success('Mass role assignments cleared')
    } catch (error) {
      console.error('Error clearing mass role assignments:', error)
      toast.error('Failed to clear mass role assignments')
    }
  }

  // Mass role assignment handlers
  const handleOpenRolePicker = (roleId: string) => {
    setCurrentRoleId(roleId)
    setRolePickerOpen(true)
  }

  const handleSelectPersonForRole = async (person: Person) => {
    if (!isEditing || !mass?.id || !currentRoleId) {
      toast.error('Please save the mass before assigning mass roles')
      return
    }

    try {
      // Assign person to mass role using the new structure
      await createMassRole({
        master_event_id: mass.id,
        role_id: currentRoleId,
        person_id: person.id
      })

      // Reload mass roles to get the updated list with relations
      await loadMassRoles()
      toast.success('Mass role assignment added')
    } catch (error) {
      console.error('Error assigning mass role:', error)
      toast.error('Failed to assign mass role')
    }
  }

  const handleRemoveRoleAssignment = async (massRoleId: string) => {
    if (!isEditing || !mass?.id) return

    try {
      await deleteMassRole(massRoleId)
      await loadMassRoles()
      toast.success('Mass role assignment removed')
    } catch (error) {
      console.error('Error removing mass role assignment:', error)
      toast.error('Failed to remove mass role assignment')
    }
  }

  // Mass intention handlers
  const handleSelectMassIntention = async (intention: MassIntentionWithNames) => {
    if (!isEditing || !mass?.id) {
      toast.error('Please save the mass before linking a mass intention')
      return
    }

    try {
      await linkMassIntention(mass.id, intention.id)
      setMassIntention(intention)
      setMassIntentionPickerOpen(false)
      toast.success('Mass intention linked')
    } catch (error) {
      console.error('Error linking mass intention:', error)
      toast.error('Failed to link mass intention')
    }
  }

  const handleUnlinkMassIntention = async () => {
    if (!massIntention) return

    try {
      await unlinkMassIntention(massIntention.id)
      setMassIntention(null)
      toast.success('Mass intention unlinked')
    } catch (error) {
      console.error('Error unlinking mass intention:', error)
      toast.error('Failed to unlink mass intention')
    }
  }

  // Update field value (for text, rich_text, mass-intention, date, time, number, yes_no fields)
  const updateFieldValue = (fieldName: string, value: string | boolean | null) => {
    setFieldValues(prev => ({ ...prev, [fieldName]: value }))
  }

  // Update picker value (stores the ID in fieldValues for person, location, content, petition fields)
  const updatePickerValue = (fieldName: string, value: Person | Location | ContentWithTags | Petition | Group | Document | null) => {
    setPickerValues(prev => ({ ...prev, [fieldName]: value }))
    setFieldValues(prev => ({ ...prev, [fieldName]: value?.id || null }))
  }

  // Update list item value (stores the ID in fieldValues)
  const updateListItemValue = (fieldName: string, itemId: string | null) => {
    setFieldValues(prev => ({ ...prev, [fieldName]: itemId }))
  }

  const onSubmit = async (data: CreateMassData) => {
    // Validate required custom fields if event type is selected
    if (eventTypeId && inputFieldDefinitions.length > 0) {
      const missingRequired: string[] = []
      inputFieldDefinitions.forEach((field) => {
        if (field.required && !fieldValues[field.name]) {
          missingRequired.push(field.name)
        }
      })

      if (missingRequired.length > 0) {
        toast.error(`Please fill in required fields: ${missingRequired.join(', ')}`)
        return
      }
    }

    try {
      // Include event_type_id and field_values in submission data
      const submitData: CreateMassData = {
        ...data,
        event_type_id: eventTypeId,
        field_values: eventTypeId ? fieldValues : undefined
      }

      if (isEditing) {
        await updateMass(mass.id, submitData)
        toast.success('Mass updated successfully')
        router.refresh() // Stay on edit page to show updated data
      } else {
        const newMass = await createMass(submitData)
        toast.success('Mass created successfully')
        router.push(`/masses/${newMass.id}/edit`)
      }
    } catch (error) {
      console.error('Error saving mass:', error)
      toast.error(isEditing ? 'Failed to update mass' : 'Failed to create mass')
    }
  }

  // Render dynamic field based on type
  const renderField = (field: InputFieldDefinition) => {
    const value = fieldValues[field.name]

    switch (field.type) {
      case 'person':
        return (
          <PersonPickerField
            key={field.id}
            label={field.name}
            value={pickerValues[field.name] as Person | null}
            onValueChange={(person) => updatePickerValue(field.name, person)}
            showPicker={pickerOpen[field.name] || false}
            onShowPickerChange={(open) => setPickerOpen(prev => ({ ...prev, [field.name]: open }))}
            placeholder={`Select ${field.name}`}
          />
        )

      case 'location':
        return (
          <LocationPickerField
            key={field.id}
            label={field.name}
            value={pickerValues[field.name] as Location | null}
            onValueChange={(location) => updatePickerValue(field.name, location)}
            showPicker={pickerOpen[field.name] || false}
            onShowPickerChange={(open) => setPickerOpen(prev => ({ ...prev, [field.name]: open }))}
            placeholder={`Select ${field.name}`}
          />
        )

      case 'content':
        return (
          <ContentPickerField
            key={field.id}
            label={field.name}
            value={pickerValues[field.name] as ContentWithTags | null}
            onValueChange={(content) => updatePickerValue(field.name, content)}
            showPicker={pickerOpen[field.name] || false}
            onShowPickerChange={(open) => setPickerOpen(prev => ({ ...prev, [field.name]: open }))}
            placeholder={`Select ${field.name}`}
            defaultInputFilterTags={field.input_filter_tags || []}
          />
        )

      case 'petition':
        return (
          <PetitionPickerField
            key={field.id}
            label={field.name}
            value={pickerValues[field.name] as Petition | null}
            onValueChange={(petition) => updatePickerValue(field.name, petition)}
            showPicker={pickerOpen[field.name] || false}
            onShowPickerChange={(open) => setPickerOpen(prev => ({ ...prev, [field.name]: open }))}
            placeholder={`Select or create ${field.name}`}
            eventContext={{
              eventTypeName: 'Mass',
              occasionDate: event.value?.start_date || new Date().toISOString().split('T')[0],
              language: 'en',
            }}
          />
        )

      case 'group':
        return (
          <GroupPickerField
            key={field.id}
            label={field.name}
            value={pickerValues[field.name] as Group | null}
            onValueChange={(group) => updatePickerValue(field.name, group)}
            showPicker={pickerOpen[field.name] || false}
            onShowPickerChange={(open) => setPickerOpen(prev => ({ ...prev, [field.name]: open }))}
            placeholder={`Select ${field.name}`}
          />
        )

      case 'list_item':
        // Requires a list_id from the field definition
        if (!field.list_id) {
          return (
            <div key={field.id} className="text-sm text-destructive">
              Error: List not configured for field &quot;{field.name}&quot;
            </div>
          )
        }
        return (
          <ListItemPickerField
            key={field.id}
            label={field.name}
            listId={field.list_id}
            value={typeof value === 'string' ? value : null}
            onValueChange={(itemId) => updateListItemValue(field.name, itemId)}
            placeholder={`Select ${field.name}`}
          />
        )

      case 'document':
        return (
          <DocumentPickerField
            key={field.id}
            label={field.name}
            value={typeof value === 'string' ? value : null}
            onValueChange={(documentId, doc) => {
              setPickerValues(prev => ({ ...prev, [field.name]: doc }))
              setFieldValues(prev => ({ ...prev, [field.name]: documentId }))
            }}
            placeholder={`Upload ${field.name}`}
          />
        )

      case 'date':
        return (
          <DatePickerField
            key={field.id}
            id={field.name}
            label={field.name}
            value={value ? new Date(value + 'T12:00:00') : undefined}
            onValueChange={(date) => updateFieldValue(field.name, date ? toLocalDateString(date) : '')}
            closeOnSelect
          />
        )

      case 'time':
        return (
          <TimePickerField
            key={field.id}
            id={field.name}
            label={field.name}
            value={typeof value === 'string' ? value : ''}
            onChange={(time) => updateFieldValue(field.name, time)}
          />
        )

      case 'yes_no':
        return (
          <div key={field.id} className="flex items-center justify-between py-2">
            <Label htmlFor={field.name} className="text-sm font-medium">
              {field.name}
              {field.required && <span className="text-destructive ml-1">*</span>}
            </Label>
            <Switch
              id={field.name}
              checked={!!value}
              onCheckedChange={(checked) => updateFieldValue(field.name, checked)}
            />
          </div>
        )

      case 'mass-intention':
        return (
          <MassIntentionTextarea
            key={field.id}
            fieldName={field.name}
            value={typeof value === 'string' ? value : ''}
            onChange={(val) => updateFieldValue(field.name, val)}
            required={field.required}
          />
        )

      case 'spacer':
        return <FormSpacer key={field.id} label={field.name} />

      case 'rich_text':
        return (
          <FormInput
            key={field.id}
            id={field.name}
            label={field.name}
            inputType="textarea"
            value={typeof value === 'string' ? value : ''}
            onChange={(val) => updateFieldValue(field.name, val)}
            rows={4}
            placeholder={`Enter ${field.name.toLowerCase()}...`}
          />
        )

      case 'number':
        return (
          <FormInput
            key={field.id}
            id={field.name}
            label={field.name}
            inputType="text"
            value={typeof value === 'string' ? value : ''}
            onChange={(val) => updateFieldValue(field.name, val)}
            placeholder={`Enter ${field.name.toLowerCase()}`}
          />
        )

      case 'text':
      default:
        return (
          <FormInput
            key={field.id}
            id={field.name}
            label={field.name}
            value={typeof value === 'string' ? value : ''}
            onChange={(val) => updateFieldValue(field.name, val)}
            placeholder={`Enter ${field.name.toLowerCase()}`}
          />
        )
    }
  }

  // Sort fields by order
  const sortedFields = [...inputFieldDefinitions].sort((a, b) => a.order - b.order)

  return (
    <form id={formId} onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      {/* Basic Information */}
      <FormSectionCard
        title="Basic Information"
        description="Core details for this Mass celebration"
      >
        <EventPickerField
            label="Mass Event"
            description="Date, time, and location of the Mass"
            value={event.value}
            onValueChange={event.setValue}
            showPicker={event.showPicker}
            onShowPickerChange={event.setShowPicker}
            defaultRelatedEventType="MASS"
            defaultName="Holy Mass"
            openToNewEvent={!event.value}
          />

          <FormInput
            id="status"
            inputType="select"
            label="Status"
            description="Current status of this Mass"
            value={watch('status') || 'ACTIVE'}
            onChange={(value) => setValue('status', value as MassStatus)}
            options={MASS_STATUS_VALUES.map((value) => ({
              value,
              label: getStatusLabel(value, 'en')
            }))}
            error={errors.status?.message}
          />

          <FormInput
            id="liturgical_color"
            inputType="select"
            label="Liturgical Color"
            description="The liturgical color for this Mass celebration"
            value={watch('liturgical_color') || ''}
            onChange={(value) => setValue('liturgical_color', value ? (value as LiturgicalColor) : undefined)}
            placeholder="Select liturgical color (optional)"
            options={LITURGICAL_COLOR_VALUES.map((value) => ({
              value,
              label: LITURGICAL_COLOR_LABELS[value].en
            }))}
            error={errors.liturgical_color?.message}
          />

          <LiturgicalEventPickerField
            label="Liturgical Event"
            description="Link this Mass to a liturgical event (feast day, solemnity, etc.)"
            value={liturgicalEvent.value}
            onValueChange={liturgicalEvent.setValue}
            showPicker={liturgicalEvent.showPicker}
            onShowPickerChange={liturgicalEvent.setShowPicker}
          />

          <FormInput
            id="template"
            inputType="select"
            label="Print Template"
            description="Choose the liturgy template for this Mass"
            value={watch('mass_template_id') || MASS_DEFAULT_TEMPLATE}
            onChange={(value) => setValue('mass_template_id', value as MassTemplate)}
            options={MASS_TEMPLATE_VALUES.map((value) => ({
              value,
              label: MASS_TEMPLATE_LABELS[value].en
            }))}
            error={errors.mass_template_id?.message}
          />

          <EventTypeSelectField
            value={eventTypeId}
            onChange={setEventTypeId}
          />
      </FormSectionCard>

      {/* Custom Fields from Event Type */}
      {eventTypeId && sortedFields.length > 0 && (
        <FormSectionCard
          title="Custom Fields"
          description={`Additional fields from ${eventType?.name || 'event type'} template`}
        >
          <div className="space-y-4">
            {sortedFields.map(renderField)}
          </div>
        </FormSectionCard>
      )}

      {/* Ministers - Now handled via people_event_assignments */}
      {/* TODO: Add PeopleEventAssignmentSection component here for template-level assignments */}
      {/* TODO: Add CalendarEventAssignmentSection component for occurrence-level assignments */}

      {/* Mass Intention */}
      {isEditing && mass?.id && (
        <FormSectionCard
          title="Mass Intention"
          description="Link a mass intention to this Mass"
          data-testid="mass-intention-card"
        >
          {massIntention ? (
              <div className="border rounded-md p-4 space-y-3" data-testid="mass-intention-display">
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-3">
                    <Heart className="h-5 w-5 text-muted-foreground mt-0.5" />
                    <div className="space-y-2">
                      <div>
                        <div className="font-medium">
                          {massIntention.mass_offered_for || 'No intention specified'}
                        </div>
                        {massIntention.requested_by && (
                          <div className="text-sm text-muted-foreground">
                            Requested by: {massIntention.requested_by.first_name} {massIntention.requested_by.last_name}
                          </div>
                        )}
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant="secondary">
                          {getStatusLabel(massIntention.status, 'en')}
                        </Badge>
                        {massIntention.stipend_in_cents && (
                          <div className="text-sm text-muted-foreground">
                            ${(massIntention.stipend_in_cents / 100).toFixed(2)}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={handleUnlinkMassIntention}
                    data-testid="unlink-mass-intention-button"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ) : (
              <div className="text-center py-6">
                <Heart className="h-12 w-12 mx-auto text-muted-foreground mb-3" />
                <p className="text-sm text-muted-foreground mb-4">
                  No mass intention linked yet
                </p>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setMassIntentionPickerOpen(true)}
                  data-testid="link-mass-intention-button"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Link Mass Intention
                </Button>
              </div>
            )}
        </FormSectionCard>
      )}

      {/* Mass Role Assignments */}
      {isEditing && mass?.id && (
        <FormSectionCard
          title="Mass Role Assignments"
          description="Assign people to liturgical mass roles for this Mass"
        >
          {/* Get role definitions from event type */}
          {(() => {
            const roleDefinitions = eventType?.role_definitions?.roles || []

            if (roleDefinitions.length === 0) {
              return (
                <div className="text-sm text-muted-foreground text-center py-6">
                  {eventTypeId
                    ? "This event type has no roles defined. Configure roles in the event type settings."
                    : "Select an event type template above to see available roles."
                  }
                </div>
              )
            }

            return (
              <div className="space-y-6">
                {/* Clear all button */}
                {massRoles.length > 0 && (
                  <div className="flex justify-end">
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={handleClearRoleAssignments}
                    >
                      Clear All Assignments
                    </Button>
                  </div>
                )}

                {roleDefinitions.map((role: { id: string; name: string; count?: number }) => {
                  const assignments = massRoles.filter(mr => mr.role_id === role.id)
                  const countNeeded = role.count || 1

                  return (
                    <div key={role.id} className="space-y-2">
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="font-medium">
                            {role.name}
                            <RoleFulfillmentBadge
                              countNeeded={countNeeded}
                              countAssigned={assignments.length}
                            />
                          </div>
                        </div>
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => handleOpenRolePicker(role.id)}
                        >
                          <Plus className="h-4 w-4 mr-1" />
                          Assign Person
                        </Button>
                      </div>

                      {/* List of assigned people for this role */}
                      {assignments.length > 0 && (
                        <div className="space-y-2 ml-4 mt-2">
                          {assignments.map(assignment => (
                            <div
                              key={assignment.id}
                              className="flex items-center justify-between p-2 bg-accent/50 rounded-md"
                            >
                              <div className="flex items-center gap-2">
                                <span className="text-sm font-medium">
                                  {assignment.person?.first_name} {assignment.person?.last_name}
                                </span>
                              </div>
                              <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                onClick={() => handleRemoveRoleAssignment(assignment.id)}
                              >
                                <X className="h-4 w-4" />
                              </Button>
                            </div>
                          ))}
                        </div>
                      )}

                      {assignments.length === 0 && (
                        <div className="text-sm text-muted-foreground ml-4">
                          No one assigned yet
                        </div>
                      )}
                    </div>
                  )
                })}
              </div>
            )
          })()}
        </FormSectionCard>
      )}

      {/* People Picker Modal for Mass Role Assignment */}
      {currentRoleId && (
        <PeoplePicker
          open={rolePickerOpen}
          onOpenChange={setRolePickerOpen}
          onSelect={handleSelectPersonForRole}
        />
      )}

      {/* Petitions */}
      <PetitionEditor
        value={watch('petitions') || ''}
        onChange={(value) => setValue('petitions', value)}
        templates={petitionTemplates}
        onInsertTemplate={handleInsertTemplate}
      />

      {/* Announcements */}
      <FormSectionCard
        title="Announcements"
        description="Full text of announcements to be read before Mass"
      >
        <FormInput
            id="announcements"
            label="Announcement Text"
            inputType="textarea"
            value={watch('announcements') || ''}
            onChange={(value) => setValue('announcements', value)}
            placeholder="Enter announcements here..."
            rows={6}
            error={errors.announcements?.message}
          />
      </FormSectionCard>

      {/* Liturgy Template and Notes */}
      <FormSectionCard
        title="Template and Notes"
        description="Liturgy template selection and internal notes"
      >
        <FormInput
          id="mass_template_id"
          label="Liturgy Template"
          inputType="select"
          value={watch('mass_template_id') || MASS_DEFAULT_TEMPLATE}
          onChange={(value) => setValue('mass_template_id', value as MassTemplate)}
          options={MASS_TEMPLATE_VALUES.map((templateId) => ({
            value: templateId,
            label: MASS_TEMPLATE_LABELS[templateId].en,
          }))}
          error={errors.mass_template_id?.message}
        />

        <FormInput
            id="note"
            label="Notes (Optional)"
            description="Internal notes and reminders (not included in printed liturgy)"
            inputType="textarea"
            value={watch('note') || ''}
            onChange={(value) => setValue('note', value)}
            placeholder="Add any internal notes or reminders..."
            rows={3}
            error={errors.note?.message}
          />
      </FormSectionCard>

      {/* Form Actions */}
      <FormBottomActions
        isEditing={isEditing}
        isLoading={isSubmitting}
        cancelHref={isEditing ? `/masses/${mass.id}` : '/masses'}
        moduleName="Mass"
      />

      {/* Mass Intention Picker Modal */}
      <MassIntentionPicker
        open={massIntentionPickerOpen}
        onOpenChange={setMassIntentionPickerOpen}
        onSelect={handleSelectMassIntention}
        selectedMassIntentionId={massIntention?.id}
        openToNewMassIntention={!massIntention}
      />
    </form>
  )
}

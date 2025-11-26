"use client"

import { useEffect, useMemo, useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { Button } from "@/components/ui/button"
import { FormInput } from "@/components/form-input"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import { FormSectionCard } from "@/components/form-section-card"
import { Separator } from "@/components/ui/separator"
import { BookOpen } from "lucide-react"
import { createFuneral, updateFuneral, type FuneralWithRelations } from "@/lib/actions/funerals"
import { getIndividualReadings } from "@/lib/actions/readings"
import {
  createFuneralSchema,
  type CreateFuneralData
} from "@/lib/schemas/funerals"
import type { Person, IndividualReading, Event } from "@/lib/types"
import { useRouter } from "next/navigation"
import { toast } from 'sonner'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { ReadingPickerModal } from "@/components/reading-picker-modal"
import { MODULE_STATUS_VALUES, RELATED_EVENT_TYPE_LABELS, FUNERAL_TEMPLATE_VALUES, FUNERAL_TEMPLATE_LABELS, FUNERAL_DEFAULT_TEMPLATE, type ModuleStatus, type FuneralTemplate } from "@/lib/constants"
import { getStatusLabel } from "@/lib/content-builders/shared/helpers"
import { FormBottomActions } from "@/components/form-bottom-actions"
import { PetitionEditor, type PetitionTemplate } from "@/components/petition-editor"
import { funeralTemplates, buildFuneralPetitions } from "@/lib/petition-templates/funeral"
import { usePickerState } from "@/hooks/use-picker-state"
import { PersonPickerField } from "@/components/person-picker-field"
import { EventPickerField } from "@/components/event-picker-field"

interface FuneralFormProps {
  funeral?: FuneralWithRelations
  formId?: string
  onLoadingChange?: (loading: boolean) => void
}

export function FuneralForm({ funeral, formId, onLoadingChange }: FuneralFormProps) {
  const router = useRouter()
  const isEditing = !!funeral

  // Initialize React Hook Form with Zod validation
  const {
    handleSubmit,
    formState: { errors, isSubmitting },
    setValue,
    watch,
  } = useForm<CreateFuneralData>({
    resolver: zodResolver(createFuneralSchema),
    defaultValues: {
      status: (funeral?.status as ModuleStatus) || "ACTIVE",
      funeral_event_id: funeral?.funeral_event_id || null,
      funeral_meal_event_id: funeral?.funeral_meal_event_id || null,
      deceased_id: funeral?.deceased_id || null,
      family_contact_id: funeral?.family_contact_id || null,
      coordinator_id: funeral?.coordinator_id || null,
      presider_id: funeral?.presider_id || null,
      homilist_id: funeral?.homilist_id || null,
      lead_musician_id: funeral?.lead_musician_id || null,
      cantor_id: funeral?.cantor_id || null,
      first_reader_id: funeral?.first_reader_id || null,
      second_reader_id: funeral?.second_reader_id || null,
      psalm_reader_id: funeral?.psalm_reader_id || null,
      gospel_reader_id: funeral?.gospel_reader_id || null,
      petition_reader_id: funeral?.petition_reader_id || null,
      first_reading_id: funeral?.first_reading_id || null,
      psalm_id: funeral?.psalm_id || null,
      second_reading_id: funeral?.second_reading_id || null,
      gospel_reading_id: funeral?.gospel_reading_id || null,
      psalm_is_sung: funeral?.psalm_is_sung || false,
      petitions_read_by_second_reader: funeral?.petitions_read_by_second_reader || false,
      petitions: funeral?.petitions || null,
      announcements: funeral?.announcements || null,
      note: funeral?.note || null,
      funeral_template_id: (funeral?.funeral_template_id as FuneralTemplate) || FUNERAL_DEFAULT_TEMPLATE,
    },
  })

  // Notify parent component of loading state changes
  useEffect(() => {
    onLoadingChange?.(isSubmitting)
  }, [isSubmitting, onLoadingChange])

  // Watch form values
  const status = watch("status")
  const note = watch("note")
  const announcements = watch("announcements")
  const petitions = watch("petitions")
  const funeralTemplateId = watch("funeral_template_id")
  const psalmIsSung = watch("psalm_is_sung")
  const petitionsReadBySecondReader = watch("petitions_read_by_second_reader")

  // Picker states using usePickerState hook - Events
  const funeralEvent = usePickerState<Event>()
  const funeralMealEvent = usePickerState<Event>()

  // Picker states using usePickerState hook - People
  const deceased = usePickerState<Person>()
  const familyContact = usePickerState<Person>()
  const coordinator = usePickerState<Person>()
  const presider = usePickerState<Person>()
  const homilist = usePickerState<Person>()
  const leadMusician = usePickerState<Person>()
  const cantor = usePickerState<Person>()
  const firstReader = usePickerState<Person>()
  const secondReader = usePickerState<Person>()
  const psalmReader = usePickerState<Person>()
  const gospelReader = usePickerState<Person>()
  const petitionReader = usePickerState<Person>()

  // Reading picker states
  const [showFirstReadingPicker, setShowFirstReadingPicker] = useState(false)
  const [showPsalmPicker, setShowPsalmPicker] = useState(false)
  const [showSecondReadingPicker, setShowSecondReadingPicker] = useState(false)
  const [showGospelReadingPicker, setShowGospelReadingPicker] = useState(false)
  const [readings, setReadings] = useState<IndividualReading[]>([])

  // Selected readings (for display purposes)
  const [firstReading, setFirstReading] = useState<IndividualReading | null>(null)
  const [psalm, setPsalm] = useState<IndividualReading | null>(null)
  const [secondReading, setSecondReading] = useState<IndividualReading | null>(null)
  const [gospelReading, setGospelReading] = useState<IndividualReading | null>(null)

  // Load readings on mount
  useEffect(() => {
    const loadReadings = async () => {
      try {
        const allReadings = await getIndividualReadings()
        setReadings(allReadings)
      } catch (error) {
        console.error('Failed to load readings:', error)
        toast.error('Failed to load readings')
      }
    }
    loadReadings()
  }, [])

  // Initialize picker states when editing
  useEffect(() => {
    if (funeral) {
      // Set events
      if (funeral.funeral_event) funeralEvent.setValue(funeral.funeral_event)
      if (funeral.funeral_meal_event) funeralMealEvent.setValue(funeral.funeral_meal_event)

      // Set people
      if (funeral.deceased) deceased.setValue(funeral.deceased)
      if (funeral.family_contact) familyContact.setValue(funeral.family_contact)
      if (funeral.coordinator) coordinator.setValue(funeral.coordinator)
      if (funeral.presider) presider.setValue(funeral.presider)
      if (funeral.homilist) homilist.setValue(funeral.homilist)
      if (funeral.lead_musician) leadMusician.setValue(funeral.lead_musician)
      if (funeral.cantor) cantor.setValue(funeral.cantor)
      if (funeral.first_reader) firstReader.setValue(funeral.first_reader)
      if (funeral.second_reader) secondReader.setValue(funeral.second_reader)
      if (funeral.psalm_reader) psalmReader.setValue(funeral.psalm_reader)
      if (funeral.gospel_reader) gospelReader.setValue(funeral.gospel_reader)
      if (funeral.petition_reader) petitionReader.setValue(funeral.petition_reader)

      // Set readings
      if (funeral.first_reading) setFirstReading(funeral.first_reading)
      if (funeral.psalm) setPsalm(funeral.psalm)
      if (funeral.second_reading) setSecondReading(funeral.second_reading)
      if (funeral.gospel_reading) setGospelReading(funeral.gospel_reading)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [funeral])

  // Sync picker values to form when they change - Events
  useEffect(() => {
    setValue("funeral_event_id", funeralEvent.value?.id || null)
  }, [funeralEvent.value, setValue])

  useEffect(() => {
    setValue("funeral_meal_event_id", funeralMealEvent.value?.id || null)
  }, [funeralMealEvent.value, setValue])

  // Sync picker values to form when they change - People
  useEffect(() => {
    setValue("deceased_id", deceased.value?.id || null)
  }, [deceased.value, setValue])

  useEffect(() => {
    setValue("family_contact_id", familyContact.value?.id || null)
  }, [familyContact.value, setValue])

  useEffect(() => {
    setValue("coordinator_id", coordinator.value?.id || null)
  }, [coordinator.value, setValue])

  useEffect(() => {
    setValue("presider_id", presider.value?.id || null)
  }, [presider.value, setValue])

  useEffect(() => {
    setValue("homilist_id", homilist.value?.id || null)
  }, [homilist.value, setValue])

  useEffect(() => {
    setValue("lead_musician_id", leadMusician.value?.id || null)
  }, [leadMusician.value, setValue])

  useEffect(() => {
    setValue("cantor_id", cantor.value?.id || null)
  }, [cantor.value, setValue])

  useEffect(() => {
    setValue("first_reader_id", firstReader.value?.id || null)
  }, [firstReader.value, setValue])

  useEffect(() => {
    setValue("second_reader_id", secondReader.value?.id || null)
  }, [secondReader.value, setValue])

  useEffect(() => {
    setValue("psalm_reader_id", psalmReader.value?.id || null)
  }, [psalmReader.value, setValue])

  useEffect(() => {
    setValue("gospel_reader_id", gospelReader.value?.id || null)
  }, [gospelReader.value, setValue])

  useEffect(() => {
    setValue("petition_reader_id", petitionReader.value?.id || null)
  }, [petitionReader.value, setValue])

  // Sync reading picker values to form when they change
  useEffect(() => {
    setValue("first_reading_id", firstReading?.id || null)
  }, [firstReading, setValue])

  useEffect(() => {
    setValue("psalm_id", psalm?.id || null)
  }, [psalm, setValue])

  useEffect(() => {
    setValue("second_reading_id", secondReading?.id || null)
  }, [secondReading, setValue])

  useEffect(() => {
    setValue("gospel_reading_id", gospelReading?.id || null)
  }, [gospelReading, setValue])

  // Handle inserting template petitions
  const handleInsertTemplate = (templateId: string): string[] => {
    const deceasedName = deceased.value?.first_name || ''

    // Build petitions from selected template
    return buildFuneralPetitions(templateId, deceasedName)
  }

  // Get available templates - convert to PetitionTemplate format
  const petitionTemplates: PetitionTemplate[] = funeralTemplates.map(t => ({
    id: t.id,
    name: t.name,
    description: t.description,
  }))

  // Compute suggested event names based on deceased
  const suggestedFuneralName = useMemo(() => {
    const deceasedFirstName = deceased.value?.first_name
    const deceasedLastName = deceased.value?.last_name

    if (deceasedFirstName && deceasedLastName) {
      return `${deceasedFirstName} ${deceasedLastName} Funeral`
    } else if (deceasedLastName) {
      return `${deceasedLastName} Funeral`
    } else if (deceasedFirstName) {
      return `${deceasedFirstName} Funeral`
    }
    return RELATED_EVENT_TYPE_LABELS.FUNERAL.en
  }, [deceased.value])

  const suggestedFuneralMealName = useMemo(() => {
    const deceasedFirstName = deceased.value?.first_name
    const deceasedLastName = deceased.value?.last_name

    if (deceasedFirstName && deceasedLastName) {
      return `${deceasedFirstName} ${deceasedLastName} Funeral Meal`
    } else if (deceasedLastName) {
      return `${deceasedLastName} Funeral Meal`
    } else if (deceasedFirstName) {
      return `${deceasedFirstName} Funeral Meal`
    }
    return "Funeral Meal"
  }, [deceased.value])

  const onSubmit = async (data: CreateFuneralData) => {
    try {
      if (isEditing && funeral) {
        await updateFuneral(funeral.id, data)
        toast.success('Funeral updated successfully')
        router.refresh() // Stay on edit page to show updated data
      } else {
        const newFuneral = await createFuneral(data)
        toast.success('Funeral created successfully!')
        router.push(`/funerals/${newFuneral.id}/edit`)
      }
    } catch (error) {
      console.error(`Failed to ${isEditing ? 'update' : 'create'} funeral:`, error)
      toast.error(`Failed to ${isEditing ? 'update' : 'create'} funeral. Please try again.`)
    }
  }

  return (
    <form id={formId} onSubmit={handleSubmit(onSubmit)} className="space-y-8">
      {/* Key Information */}
      <FormSectionCard
        title="Key Information"
        description="Essential details about the deceased and funeral service"
      >
          <PersonPickerField
            label="Deceased"
            value={deceased.value}
            onValueChange={deceased.setValue}
            showPicker={deceased.showPicker}
            onShowPickerChange={deceased.setShowPicker}
            placeholder="Select Deceased"
            openToNewPerson={!deceased.value}
            additionalVisibleFields={['email', 'phone_number', 'sex', 'note']}
          />
          <EventPickerField
            label="Funeral Mass Event"
            value={funeralEvent.value}
            onValueChange={funeralEvent.setValue}
            showPicker={funeralEvent.showPicker}
            onShowPickerChange={funeralEvent.setShowPicker}
            placeholder="Add Funeral Service"
            openToNewEvent={!funeralEvent.value}
            defaultEventType="FUNERAL"
            defaultName={RELATED_EVENT_TYPE_LABELS.FUNERAL.en}
            disableSearch={true}
            defaultCreateFormData={{ name: suggestedFuneralName }}
          />
      </FormSectionCard>

      {/* Other Events */}
      <FormSectionCard
        title="Other Events"
        description="Related funeral events"
      >
          <EventPickerField
            label="Funeral Meal / Reception"
            value={funeralMealEvent.value}
            onValueChange={funeralMealEvent.setValue}
            showPicker={funeralMealEvent.showPicker}
            onShowPickerChange={funeralMealEvent.setShowPicker}
            placeholder="Add Funeral Meal"
            openToNewEvent={!funeralMealEvent.value}
            defaultEventType="OTHER"
            defaultName="Funeral Meal"
            disableSearch={true}
            defaultCreateFormData={{ name: suggestedFuneralMealName }}
          />
      </FormSectionCard>

      {/* Other People */}
      <FormSectionCard
        title="Other People"
        description="Family contacts and next of kin"
      >
          <PersonPickerField
            label="Family Contact"
            value={familyContact.value}
            onValueChange={familyContact.setValue}
            showPicker={familyContact.showPicker}
            onShowPickerChange={familyContact.setShowPicker}
            placeholder="Select Family Contact"
            openToNewPerson={!familyContact.value}
            additionalVisibleFields={['email', 'phone_number', 'note']}
          />
      </FormSectionCard>

      {/* Key Liturgical Roles */}
      <FormSectionCard
        title="Key Liturgical Roles"
        description="Primary liturgical ministers"
      >
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <PersonPickerField
              label="Presider"
              value={presider.value}
              onValueChange={presider.setValue}
              showPicker={presider.showPicker}
              onShowPickerChange={presider.setShowPicker}
              placeholder="Select Presider"
              autoSetSex="MALE"
              additionalVisibleFields={['email', 'phone_number', 'note']}
            />
            <PersonPickerField
              label="Homilist"
              value={homilist.value}
              onValueChange={homilist.setValue}
              showPicker={homilist.showPicker}
              onShowPickerChange={homilist.setShowPicker}
              placeholder="Select Homilist"
              autoSetSex="MALE"
              additionalVisibleFields={['email', 'phone_number', 'note']}
            />
          </div>
      </FormSectionCard>

      {/* Other Liturgical Roles and Liturgical Selections */}
      <FormSectionCard
        title="Other Liturgical Roles and Liturgical Selections"
        description="Additional ministers, readers, and scripture selections"
      >
          {/* Music Ministers */}
          <div className="space-y-2">
            <Label className="text-base font-semibold">Music Ministers</Label>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <PersonPickerField
              label="Lead Musician"
              value={leadMusician.value}
              onValueChange={leadMusician.setValue}
              showPicker={leadMusician.showPicker}
              onShowPickerChange={leadMusician.setShowPicker}
              placeholder="Select Lead Musician"
              openToNewPerson={!leadMusician.value}
              additionalVisibleFields={['email', 'phone_number', 'note']}
            />
            <PersonPickerField
              label="Cantor"
              value={cantor.value}
              onValueChange={cantor.setValue}
              showPicker={cantor.showPicker}
              onShowPickerChange={cantor.setShowPicker}
              placeholder="Select Cantor"
              openToNewPerson={!cantor.value}
              additionalVisibleFields={['email', 'phone_number', 'note']}
            />
          </div>

          <Separator />

          {/* Scripture Readings */}
          <div className="space-y-2">
            <Label className="text-base font-semibold">Scripture Readings</Label>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>First Reading</Label>
              <Button
                type="button"
                variant="outline"
                className="w-full justify-start"
                onClick={() => setShowFirstReadingPicker(true)}
              >
                <BookOpen className="h-4 w-4 mr-2" />
                {firstReading ? firstReading.pericope : 'Select First Reading'}
              </Button>
            </div>
            <PersonPickerField
              label="First Reader"
              value={firstReader.value}
              onValueChange={firstReader.setValue}
              showPicker={firstReader.showPicker}
              onShowPickerChange={firstReader.setShowPicker}
              placeholder="Select First Reader"
              openToNewPerson={!firstReader.value}
              additionalVisibleFields={['email', 'phone_number', 'note']}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Responsorial Psalm</Label>
              <Button
                type="button"
                variant="outline"
                className="w-full justify-start"
                onClick={() => setShowPsalmPicker(true)}
              >
                <BookOpen className="h-4 w-4 mr-2" />
                {psalm ? psalm.pericope : 'Select Psalm'}
              </Button>
            </div>
            {!psalmIsSung && (
              <PersonPickerField
                label="Psalm Reader"
                value={psalmReader.value}
                onValueChange={psalmReader.setValue}
                showPicker={psalmReader.showPicker}
                onShowPickerChange={psalmReader.setShowPicker}
                placeholder="Select Psalm Reader"
                openToNewPerson={!psalmReader.value}
                additionalVisibleFields={['email', 'phone_number', 'note']}
              />
            )}
          </div>

          <div className="flex items-center space-x-2">
            <Checkbox
              id="psalm_is_sung"
              checked={psalmIsSung || false}
              onCheckedChange={(checked) => setValue("psalm_is_sung", checked as boolean)}
            />
            <label
              htmlFor="psalm_is_sung"
              className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
            >
              Psalm is sung
            </label>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Second Reading</Label>
              <Button
                type="button"
                variant="outline"
                className="w-full justify-start"
                onClick={() => setShowSecondReadingPicker(true)}
              >
                <BookOpen className="h-4 w-4 mr-2" />
                {secondReading ? secondReading.pericope : 'Select Second Reading'}
              </Button>
            </div>
            <PersonPickerField
              label="Second Reader"
              value={secondReader.value}
              onValueChange={secondReader.setValue}
              showPicker={secondReader.showPicker}
              onShowPickerChange={secondReader.setShowPicker}
              placeholder="Select Second Reader"
              openToNewPerson={!secondReader.value}
              additionalVisibleFields={['email', 'phone_number', 'note']}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Gospel Reading</Label>
              <Button
                type="button"
                variant="outline"
                className="w-full justify-start"
                onClick={() => setShowGospelReadingPicker(true)}
              >
                <BookOpen className="h-4 w-4 mr-2" />
                {gospelReading ? gospelReading.pericope : 'Select Gospel'}
              </Button>
            </div>
            <PersonPickerField
              label="Gospel Reader"
              value={gospelReader.value}
              onValueChange={gospelReader.setValue}
              showPicker={gospelReader.showPicker}
              onShowPickerChange={gospelReader.setShowPicker}
              placeholder="Select Gospel Reader"
              openToNewPerson={!gospelReader.value}
              additionalVisibleFields={['email', 'phone_number', 'note']}
            />
          </div>
      </FormSectionCard>

      {/* Petitions */}
      <PetitionEditor
        value={petitions || ""}
        onChange={(value) => setValue("petitions", value)}
        onInsertTemplate={handleInsertTemplate}
        templates={petitionTemplates}
      />

      <FormSectionCard
        title="Petition Reader"
        description="Who will read the petitions"
      >
          <div className="flex items-center space-x-2">
            <Checkbox
              id="petitions_read_by_second_reader"
              checked={petitionsReadBySecondReader || false}
              onCheckedChange={(checked) => setValue("petitions_read_by_second_reader", checked as boolean)}
            />
            <label
              htmlFor="petitions_read_by_second_reader"
              className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
            >
              Petitions read by second reader
            </label>
          </div>

          {!petitionsReadBySecondReader && (
            <PersonPickerField
              label="Petition Reader"
              value={petitionReader.value}
              onValueChange={petitionReader.setValue}
              showPicker={petitionReader.showPicker}
              onShowPickerChange={petitionReader.setShowPicker}
              placeholder="Select Petition Reader"
              openToNewPerson={!petitionReader.value}
              additionalVisibleFields={['email', 'phone_number', 'note']}
            />
          )}
      </FormSectionCard>

      {/* Announcements */}
      <FormSectionCard
        title="Announcements"
        description="Special announcements for the end of the liturgy"
      >
          <FormInput
            id="announcements"
            label="Announcements"
            description="These announcements will be printed on the last page of the liturgy script"
            value={announcements || ""}
            onChange={(value) => setValue("announcements", value)}
            placeholder="Enter any announcements..."
            inputType="textarea"
            rows={3}
            error={errors.announcements?.message}
          />
      </FormSectionCard>

      {/* Additional Details */}
      <FormSectionCard
        title="Additional Details"
      >
          <PersonPickerField
            label="Coordinator"
            value={coordinator.value}
            onValueChange={coordinator.setValue}
            showPicker={coordinator.showPicker}
            onShowPickerChange={coordinator.setShowPicker}
            placeholder="Select Coordinator"
            openToNewPerson={!coordinator.value}
            additionalVisibleFields={['email', 'phone_number', 'note']}
          />

          <div className="space-y-2">
            <Label htmlFor="funeral_template_id">Liturgy Template</Label>
            <Select
              value={funeralTemplateId || ""}
              onValueChange={(value) => setValue("funeral_template_id", value as FuneralTemplate)}
            >
              <SelectTrigger id="funeral_template_id">
                <SelectValue placeholder="Select template" />
              </SelectTrigger>
              <SelectContent>
                {FUNERAL_TEMPLATE_VALUES.map((templateId) => (
                  <SelectItem key={templateId} value={templateId}>
                    {FUNERAL_TEMPLATE_LABELS[templateId].en}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <FormInput
            id="note"
            label="Notes (Optional)"
            description="These notes are just for reference and will not be printed in the script"
            value={note || ""}
            onChange={(value) => setValue("note", value)}
            placeholder="Enter any additional notes..."
            inputType="textarea"
            rows={3}
            error={errors.note?.message}
          />

          <div className="space-y-2">
            <Label htmlFor="status">Status</Label>
            <Select
              value={status || ""}
              onValueChange={(value) => setValue("status", value as ModuleStatus)}
            >
              <SelectTrigger id="status">
                <SelectValue placeholder="Select status" />
              </SelectTrigger>
              <SelectContent>
                {MODULE_STATUS_VALUES.map((statusOption) => (
                  <SelectItem key={statusOption} value={statusOption}>
                    {getStatusLabel(statusOption, 'en')}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
      </FormSectionCard>

      {/* Submit Buttons */}
      <FormBottomActions
        isEditing={isEditing}
        isLoading={isSubmitting}
        cancelHref={isEditing ? `/funerals/${funeral.id}` : '/funerals'}
        moduleName="Funeral"
      />

      {/* Reading Pickers */}
      <ReadingPickerModal
        isOpen={showFirstReadingPicker}
        onClose={() => setShowFirstReadingPicker(false)}
        onSelect={(reading) => setFirstReading(reading)}
        selectedReading={firstReading}
        readings={readings}
        title="Select First Reading"
        preselectedCategories={['First Reading', 'Funeral']}
      />
      <ReadingPickerModal
        isOpen={showPsalmPicker}
        onClose={() => setShowPsalmPicker(false)}
        onSelect={(reading) => setPsalm(reading)}
        selectedReading={psalm}
        readings={readings}
        title="Select Responsorial Psalm"
        preselectedCategories={['Psalm', 'Funeral']}
      />
      <ReadingPickerModal
        isOpen={showSecondReadingPicker}
        onClose={() => setShowSecondReadingPicker(false)}
        onSelect={(reading) => setSecondReading(reading)}
        selectedReading={secondReading}
        readings={readings}
        title="Select Second Reading"
        preselectedCategories={['Second Reading', 'Funeral']}
      />
      <ReadingPickerModal
        isOpen={showGospelReadingPicker}
        onClose={() => setShowGospelReadingPicker(false)}
        onSelect={(reading) => setGospelReading(reading)}
        selectedReading={gospelReading}
        readings={readings}
        title="Select Gospel Reading"
        preselectedCategories={['Gospel', 'Funeral']}
      />
    </form>
  )
}

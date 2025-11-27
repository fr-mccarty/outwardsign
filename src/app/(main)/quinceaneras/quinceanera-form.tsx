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
import { createQuinceanera, updateQuinceanera, type QuinceaneraWithRelations } from "@/lib/actions/quinceaneras"
import { getIndividualReadings } from "@/lib/actions/readings"
import {
  createQuinceaneraSchema,
  type CreateQuinceaneraData
} from "@/lib/schemas/quinceaneras"
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
import { MODULE_STATUS_VALUES, RELATED_EVENT_TYPE_LABELS, QUINCEANERA_TEMPLATE_VALUES, QUINCEANERA_TEMPLATE_LABELS, QUINCEANERA_DEFAULT_TEMPLATE, type ModuleStatus, type QuinceaneraTemplate } from "@/lib/constants"
import { getStatusLabel } from "@/lib/content-builders/shared/helpers"
import { FormBottomActions } from "@/components/form-bottom-actions"
import { PetitionEditor, type PetitionTemplate } from "@/components/petition-editor"
import { quinceaneraTemplates, buildQuinceaneraPetitions } from "@/lib/petition-templates/quinceanera"
import { usePickerState } from "@/hooks/use-picker-state"
import { PersonPickerField } from "@/components/person-picker-field"
import { EventPickerField } from "@/components/event-picker-field"

interface QuinceaneraFormProps {
  quinceanera?: QuinceaneraWithRelations
  formId?: string
  onLoadingChange?: (loading: boolean) => void
}

export function QuinceaneraForm({ quinceanera, formId, onLoadingChange }: QuinceaneraFormProps) {
  const router = useRouter()
  const isEditing = !!quinceanera

  // Initialize React Hook Form with Zod validation
  const {
    handleSubmit,
    formState: { errors, isSubmitting },
    setValue,
    watch,
  } = useForm<CreateQuinceaneraData>({
    resolver: zodResolver(createQuinceaneraSchema),
    defaultValues: {
      status: (quinceanera?.status as ModuleStatus) || "ACTIVE",
      quinceanera_event_id: quinceanera?.quinceanera_event_id || null,
      quinceanera_reception_id: quinceanera?.quinceanera_reception_id || null,
      quinceanera_id: quinceanera?.quinceanera_id || null,
      family_contact_id: quinceanera?.family_contact_id || null,
      coordinator_id: quinceanera?.coordinator_id || null,
      presider_id: quinceanera?.presider_id || null,
      homilist_id: quinceanera?.homilist_id || null,
      lead_musician_id: quinceanera?.lead_musician_id || null,
      cantor_id: quinceanera?.cantor_id || null,
      first_reader_id: quinceanera?.first_reader_id || null,
      second_reader_id: quinceanera?.second_reader_id || null,
      psalm_reader_id: quinceanera?.psalm_reader_id || null,
      gospel_reader_id: quinceanera?.gospel_reader_id || null,
      petition_reader_id: quinceanera?.petition_reader_id || null,
      first_reading_id: quinceanera?.first_reading_id || null,
      psalm_id: quinceanera?.psalm_id || null,
      second_reading_id: quinceanera?.second_reading_id || null,
      gospel_reading_id: quinceanera?.gospel_reading_id || null,
      psalm_is_sung: quinceanera?.psalm_is_sung || false,
      petitions_read_by_second_reader: quinceanera?.petitions_read_by_second_reader || false,
      petitions: quinceanera?.petitions || null,
      announcements: quinceanera?.announcements || null,
      note: quinceanera?.note || null,
      quinceanera_template_id: (quinceanera?.quinceanera_template_id as QuinceaneraTemplate) || QUINCEANERA_DEFAULT_TEMPLATE,
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
  const quinceaneraTemplateId = watch("quinceanera_template_id")
  const psalmIsSung = watch("psalm_is_sung")
  const petitionsReadBySecondReader = watch("petitions_read_by_second_reader")

  // Picker states using usePickerState hook - Events
  const quinceaneraEvent = usePickerState<Event>()
  const quinceaneraReception = usePickerState<Event>()

  // Picker states using usePickerState hook - People
  const quinceaneraGirl = usePickerState<Person>()
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

  // Selected readings
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
    if (quinceanera) {
      // Set events
      if (quinceanera.quinceanera_event) quinceaneraEvent.setValue(quinceanera.quinceanera_event)
      if (quinceanera.quinceanera_reception) quinceaneraReception.setValue(quinceanera.quinceanera_reception)

      // Set people
      if (quinceanera.quinceanera) quinceaneraGirl.setValue(quinceanera.quinceanera)
      if (quinceanera.family_contact) familyContact.setValue(quinceanera.family_contact)
      if (quinceanera.coordinator) coordinator.setValue(quinceanera.coordinator)
      if (quinceanera.presider) presider.setValue(quinceanera.presider)
      if (quinceanera.homilist) homilist.setValue(quinceanera.homilist)
      if (quinceanera.lead_musician) leadMusician.setValue(quinceanera.lead_musician)
      if (quinceanera.cantor) cantor.setValue(quinceanera.cantor)
      if (quinceanera.first_reader) firstReader.setValue(quinceanera.first_reader)
      if (quinceanera.second_reader) secondReader.setValue(quinceanera.second_reader)
      if (quinceanera.psalm_reader) psalmReader.setValue(quinceanera.psalm_reader)
      if (quinceanera.gospel_reader) gospelReader.setValue(quinceanera.gospel_reader)
      if (quinceanera.petition_reader) petitionReader.setValue(quinceanera.petition_reader)

      // Set readings
      if (quinceanera.first_reading) setFirstReading(quinceanera.first_reading)
      if (quinceanera.psalm) setPsalm(quinceanera.psalm)
      if (quinceanera.second_reading) setSecondReading(quinceanera.second_reading)
      if (quinceanera.gospel_reading) setGospelReading(quinceanera.gospel_reading)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [quinceanera])

  // Sync picker values to form when they change - Events
  useEffect(() => {
    setValue("quinceanera_event_id", quinceaneraEvent.value?.id || null)
  }, [quinceaneraEvent.value, setValue])

  useEffect(() => {
    setValue("quinceanera_reception_id", quinceaneraReception.value?.id || null)
  }, [quinceaneraReception.value, setValue])

  // Sync picker values to form when they change - People
  useEffect(() => {
    setValue("quinceanera_id", quinceaneraGirl.value?.id || null)
  }, [quinceaneraGirl.value, setValue])

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
    const quinceaneraName = quinceaneraGirl.value?.first_name || ''

    // Build petitions from selected template
    return buildQuinceaneraPetitions(templateId, quinceaneraName)
  }

  // Get available templates - convert to PetitionTemplate format
  const petitionTemplates: PetitionTemplate[] = quinceaneraTemplates.map(t => ({
    id: t.id,
    name: t.name,
    description: t.description,
  }))

  // Compute suggested event names based on quinceañera girl
  const suggestedQuinceaneraName = useMemo(() => {
    const girlFirstName = quinceaneraGirl.value?.first_name
    const girlLastName = quinceaneraGirl.value?.last_name

    if (girlFirstName && girlLastName) {
      return `${girlFirstName} ${girlLastName} Quinceañera`
    } else if (girlFirstName) {
      return `${girlFirstName} Quinceañera`
    } else if (girlLastName) {
      return `${girlLastName} Quinceañera`
    }
    return RELATED_EVENT_TYPE_LABELS.QUINCEANERA.en
  }, [quinceaneraGirl.value])

  const suggestedReceptionName = useMemo(() => {
    const girlFirstName = quinceaneraGirl.value?.first_name
    const girlLastName = quinceaneraGirl.value?.last_name

    if (girlFirstName && girlLastName) {
      return `${girlFirstName} ${girlLastName} Reception`
    } else if (girlFirstName) {
      return `${girlFirstName} Reception`
    } else if (girlLastName) {
      return `${girlLastName} Reception`
    }
    return "Quinceañera Reception"
  }, [quinceaneraGirl.value])

  const onSubmit = async (data: CreateQuinceaneraData) => {
    try {
      if (isEditing && quinceanera) {
        await updateQuinceanera(quinceanera.id, data)
        toast.success('Quinceañera updated successfully')
        router.refresh() // Stay on edit page to show updated data
      } else {
        const newQuinceanera = await createQuinceanera(data)
        toast.success('Quinceañera created successfully!')
        router.push(`/quinceaneras/${newQuinceanera.id}/edit`)
      }
    } catch (error) {
      console.error(`Failed to ${isEditing ? 'update' : 'create'} quinceañera:`, error)
      toast.error(`Failed to ${isEditing ? 'update' : 'create'} quinceañera. Please try again.`)
    }
  }

  return (
    <form id={formId} onSubmit={handleSubmit(onSubmit)} className="space-y-8">
      {/* Key Information */}
      <FormSectionCard
        title="Key Information"
        description="Essential details about the quinceañera and mass event"
      >
        <PersonPickerField
            label="Quinceañera"
            value={quinceaneraGirl.value}
            onValueChange={quinceaneraGirl.setValue}
            showPicker={quinceaneraGirl.showPicker}
            onShowPickerChange={quinceaneraGirl.setShowPicker}
            placeholder="Select Quinceañera"
            openToNewPerson={!quinceaneraGirl.value}
            testId="quinceanera"
            autoSetSex="FEMALE"
          />
          <EventPickerField
            label="Mass Event"
            value={quinceaneraEvent.value}
            onValueChange={quinceaneraEvent.setValue}
            showPicker={quinceaneraEvent.showPicker}
            onShowPickerChange={quinceaneraEvent.setShowPicker}
            placeholder="Add Quinceañera Ceremony"
            openToNewEvent={!quinceaneraEvent.value}
            defaultRelatedEventType="QUINCEANERA"
            defaultName={RELATED_EVENT_TYPE_LABELS.QUINCEANERA.en}
            disableSearch={true}
            defaultCreateFormData={{ name: suggestedQuinceaneraName }}
          />
      </FormSectionCard>

      {/* Other Events */}
      <FormSectionCard
        title="Other Events"
        description="Related celebration events"
      >
        <EventPickerField
            label="Reception"
            value={quinceaneraReception.value}
            onValueChange={quinceaneraReception.setValue}
            showPicker={quinceaneraReception.showPicker}
            onShowPickerChange={quinceaneraReception.setShowPicker}
            placeholder="Add Reception"
            openToNewEvent={!quinceaneraReception.value}
            defaultRelatedEventType="QUINCEANERA_RECEPTION"
            defaultName="Quinceañera Reception"
            disableSearch={true}
            defaultCreateFormData={{ name: suggestedReceptionName }}
          />
      </FormSectionCard>

      {/* Other People */}
      <FormSectionCard
        title="Other People"
        description="Family contacts"
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
            <Label htmlFor="quinceanera_template_id">Liturgy Template</Label>
            <Select
              value={quinceaneraTemplateId || ""}
              onValueChange={(value) => setValue("quinceanera_template_id", value as QuinceaneraTemplate)}
            >
              <SelectTrigger id="quinceanera_template_id">
                <SelectValue placeholder="Select template" />
              </SelectTrigger>
              <SelectContent>
                {QUINCEANERA_TEMPLATE_VALUES.map((templateId) => (
                  <SelectItem key={templateId} value={templateId}>
                    {QUINCEANERA_TEMPLATE_LABELS[templateId].en}
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
        cancelHref={isEditing ? `/quinceaneras/${quinceanera.id}` : '/quinceaneras'}
        moduleName="Quinceañera"
      />

      {/* Reading Pickers */}
      <ReadingPickerModal
        isOpen={showFirstReadingPicker}
        onClose={() => setShowFirstReadingPicker(false)}
        onSelect={(reading) => setFirstReading(reading)}
        selectedReading={firstReading}
        readings={readings}
        title="Select First Reading"
        preselectedCategories={['First Reading', 'Quinceanera']}
      />
      <ReadingPickerModal
        isOpen={showPsalmPicker}
        onClose={() => setShowPsalmPicker(false)}
        onSelect={(reading) => setPsalm(reading)}
        selectedReading={psalm}
        readings={readings}
        title="Select Responsorial Psalm"
        preselectedCategories={['Psalm', 'Quinceanera']}
      />
      <ReadingPickerModal
        isOpen={showSecondReadingPicker}
        onClose={() => setShowSecondReadingPicker(false)}
        onSelect={(reading) => setSecondReading(reading)}
        selectedReading={secondReading}
        readings={readings}
        title="Select Second Reading"
        preselectedCategories={['Second Reading', 'Quinceanera']}
      />
      <ReadingPickerModal
        isOpen={showGospelReadingPicker}
        onClose={() => setShowGospelReadingPicker(false)}
        onSelect={(reading) => setGospelReading(reading)}
        selectedReading={gospelReading}
        readings={readings}
        title="Select Gospel Reading"
        preselectedCategories={['Gospel', 'Quinceanera']}
      />
    </form>
  )
}

"use client"

import { useEffect, useMemo } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { FormInput } from "@/components/form-input"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import { FormSectionCard } from "@/components/form-section-card"
import { Separator } from "@/components/ui/separator"
import { BookOpen } from "lucide-react"
import { createWedding, updateWedding, type WeddingWithRelations } from "@/lib/actions/weddings"
import { getIndividualReadings } from "@/lib/actions/readings"
import {
  createWeddingSchema,
  type CreateWeddingData
} from "@/lib/schemas/weddings"
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
import { PersonPickerField } from "@/components/person-picker-field"
import { EventPickerField } from "@/components/event-picker-field"
import { ReadingPickerModal } from "@/components/reading-picker-modal"
import { MODULE_STATUS_VALUES, RELATED_EVENT_TYPE_LABELS, WEDDING_TEMPLATE_VALUES, WEDDING_TEMPLATE_LABELS, WEDDING_DEFAULT_TEMPLATE, type ModuleStatus, type WeddingTemplate } from "@/lib/constants"
import { getStatusLabel } from "@/lib/content-builders/shared/helpers"
import { FormBottomActions } from "@/components/form-bottom-actions"
import { PetitionEditor, type PetitionTemplate } from "@/components/petition-editor"
import { weddingTemplates, buildWeddingPetitions } from "@/lib/petition-templates/wedding"
import { usePickerState } from "@/hooks/use-picker-state"
import { Button } from "@/components/ui/button"
import { useState } from "react"

interface WeddingFormProps {
  wedding?: WeddingWithRelations
  formId?: string
  onLoadingChange?: (loading: boolean) => void
}

export function WeddingForm({ wedding, formId, onLoadingChange }: WeddingFormProps) {
  const router = useRouter()
  const isEditing = !!wedding

  // Initialize React Hook Form with Zod validation
  const {
    handleSubmit,
    formState: { errors, isSubmitting },
    setValue,
    watch,
  } = useForm<CreateWeddingData>({
    resolver: zodResolver(createWeddingSchema),
    defaultValues: {
      status: (wedding?.status as ModuleStatus) || "ACTIVE",
      wedding_event_id: wedding?.wedding_event_id || null,
      reception_event_id: wedding?.reception_event_id || null,
      rehearsal_event_id: wedding?.rehearsal_event_id || null,
      rehearsal_dinner_event_id: wedding?.rehearsal_dinner_event_id || null,
      bride_id: wedding?.bride_id || null,
      groom_id: wedding?.groom_id || null,
      coordinator_id: wedding?.coordinator_id || null,
      presider_id: wedding?.presider_id || null,
      homilist_id: wedding?.homilist_id || null,
      lead_musician_id: wedding?.lead_musician_id || null,
      cantor_id: wedding?.cantor_id || null,
      witness_1_id: wedding?.witness_1_id || null,
      witness_2_id: wedding?.witness_2_id || null,
      first_reader_id: wedding?.first_reader_id || null,
      second_reader_id: wedding?.second_reader_id || null,
      psalm_reader_id: wedding?.psalm_reader_id || null,
      gospel_reader_id: wedding?.gospel_reader_id || null,
      petition_reader_id: wedding?.petition_reader_id || null,
      first_reading_id: wedding?.first_reading_id || null,
      psalm_id: wedding?.psalm_id || null,
      second_reading_id: wedding?.second_reading_id || null,
      gospel_reading_id: wedding?.gospel_reading_id || null,
      psalm_is_sung: wedding?.psalm_is_sung || false,
      petitions_read_by_second_reader: wedding?.petitions_read_by_second_reader || false,
      petitions: wedding?.petitions || null,
      announcements: wedding?.announcements || null,
      notes: wedding?.notes || null,
      wedding_template_id: (wedding?.wedding_template_id as WeddingTemplate) || WEDDING_DEFAULT_TEMPLATE,
    },
  })

  // Notify parent component of loading state changes
  useEffect(() => {
    onLoadingChange?.(isSubmitting)
  }, [isSubmitting, onLoadingChange])

  // Watch form values
  const status = watch("status")
  const notes = watch("notes")
  const announcements = watch("announcements")
  const petitions = watch("petitions")
  const weddingTemplateId = watch("wedding_template_id")
  const psalmIsSung = watch("psalm_is_sung")
  const petitionsReadBySecondReader = watch("petitions_read_by_second_reader")

  // Picker states using usePickerState hook - Events
  const weddingEvent = usePickerState<Event>()
  const receptionEvent = usePickerState<Event>()
  const rehearsalEvent = usePickerState<Event>()
  const rehearsalDinnerEvent = usePickerState<Event>()

  // Picker states using usePickerState hook - People
  const bride = usePickerState<Person>()
  const groom = usePickerState<Person>()
  const coordinator = usePickerState<Person>()
  const presider = usePickerState<Person>()
  const homilist = usePickerState<Person>()
  const leadMusician = usePickerState<Person>()
  const cantor = usePickerState<Person>()
  const witness1 = usePickerState<Person>()
  const witness2 = usePickerState<Person>()
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
    if (wedding) {
      // Set events
      if (wedding.wedding_event) weddingEvent.setValue(wedding.wedding_event)
      if (wedding.reception_event) receptionEvent.setValue(wedding.reception_event)
      if (wedding.rehearsal_event) rehearsalEvent.setValue(wedding.rehearsal_event)
      if (wedding.rehearsal_dinner_event) rehearsalDinnerEvent.setValue(wedding.rehearsal_dinner_event)

      // Set people
      if (wedding.bride) bride.setValue(wedding.bride)
      if (wedding.groom) groom.setValue(wedding.groom)
      if (wedding.coordinator) coordinator.setValue(wedding.coordinator)
      if (wedding.presider) presider.setValue(wedding.presider)
      if (wedding.homilist) homilist.setValue(wedding.homilist)
      if (wedding.lead_musician) leadMusician.setValue(wedding.lead_musician)
      if (wedding.cantor) cantor.setValue(wedding.cantor)
      if (wedding.witness_1) witness1.setValue(wedding.witness_1)
      if (wedding.witness_2) witness2.setValue(wedding.witness_2)
      if (wedding.first_reader) firstReader.setValue(wedding.first_reader)
      if (wedding.second_reader) secondReader.setValue(wedding.second_reader)
      if (wedding.psalm_reader) psalmReader.setValue(wedding.psalm_reader)
      if (wedding.gospel_reader) gospelReader.setValue(wedding.gospel_reader)
      if (wedding.petition_reader) petitionReader.setValue(wedding.petition_reader)

      // Set readings
      if (wedding.first_reading) setFirstReading(wedding.first_reading)
      if (wedding.psalm) setPsalm(wedding.psalm)
      if (wedding.second_reading) setSecondReading(wedding.second_reading)
      if (wedding.gospel_reading) setGospelReading(wedding.gospel_reading)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [wedding])

  // Sync picker values to form when they change - Events
  useEffect(() => {
    setValue("wedding_event_id", weddingEvent.value?.id || null)
  }, [weddingEvent.value, setValue])

  useEffect(() => {
    setValue("reception_event_id", receptionEvent.value?.id || null)
  }, [receptionEvent.value, setValue])

  useEffect(() => {
    setValue("rehearsal_event_id", rehearsalEvent.value?.id || null)
  }, [rehearsalEvent.value, setValue])

  useEffect(() => {
    setValue("rehearsal_dinner_event_id", rehearsalDinnerEvent.value?.id || null)
  }, [rehearsalDinnerEvent.value, setValue])

  // Sync picker values to form when they change - People
  useEffect(() => {
    setValue("bride_id", bride.value?.id || null)
  }, [bride.value, setValue])

  useEffect(() => {
    setValue("groom_id", groom.value?.id || null)
  }, [groom.value, setValue])

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
    setValue("witness_1_id", witness1.value?.id || null)
  }, [witness1.value, setValue])

  useEffect(() => {
    setValue("witness_2_id", witness2.value?.id || null)
  }, [witness2.value, setValue])

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
    const brideName = bride.value?.first_name || ''
    const groomName = groom.value?.first_name || ''

    // Build petitions from selected template
    return buildWeddingPetitions(templateId, brideName, groomName)
  }

  // Get available templates - convert to PetitionTemplate format
  const petitionTemplates: PetitionTemplate[] = weddingTemplates.map(t => ({
    id: t.id,
    name: t.name,
    description: t.description,
  }))

  // Compute suggested event names based on bride and groom
  const suggestedWeddingName = useMemo(() => {
    const brideLastName = bride.value?.last_name
    const groomLastName = groom.value?.last_name

    if (brideLastName && groomLastName) {
      return `${brideLastName}-${groomLastName} Wedding`
    } else if (brideLastName) {
      return `${brideLastName} Wedding`
    } else if (groomLastName) {
      return `${groomLastName} Wedding`
    }
    return RELATED_EVENT_TYPE_LABELS.WEDDING.en
  }, [bride.value, groom.value])

  const suggestedReceptionName = useMemo(() => {
    const brideLastName = bride.value?.last_name
    const groomLastName = groom.value?.last_name

    if (brideLastName && groomLastName) {
      return `${brideLastName}-${groomLastName} Reception`
    } else if (brideLastName) {
      return `${brideLastName} Reception`
    } else if (groomLastName) {
      return `${groomLastName} Reception`
    }
    return "Reception"
  }, [bride.value, groom.value])

  const onSubmit = async (data: CreateWeddingData) => {
    try {
      if (isEditing && wedding) {
        await updateWedding(wedding.id, data)
        toast.success('Wedding updated successfully')
        router.refresh() // Stay on edit page to show updated data
      } else {
        const newWedding = await createWedding(data)
        toast.success('Wedding created successfully!')
        router.push(`/weddings/${newWedding.id}/edit`)
      }
    } catch (error) {
      console.error(`Failed to ${isEditing ? 'update' : 'create'} wedding:`, error)
      toast.error(`Failed to ${isEditing ? 'update' : 'create'} wedding. Please try again.`)
    }
  }

  return (
    <form id={formId} onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      {/* Key Information */}
      <FormSectionCard
        title="Key Information"
        description="Essential details about the couple and ceremony"
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <PersonPickerField
            label="Bride"
            value={bride.value}
            onValueChange={bride.setValue}
            showPicker={bride.showPicker}
            onShowPickerChange={bride.setShowPicker}
            placeholder="Select Bride"
            openToNewPerson={!bride.value}
            autoSetSex="FEMALE"
          />
          <PersonPickerField
            label="Groom"
            value={groom.value}
            onValueChange={groom.setValue}
            showPicker={groom.showPicker}
            onShowPickerChange={groom.setShowPicker}
            placeholder="Select Groom"
            openToNewPerson={!groom.value}
            autoSetSex="MALE"
          />
        </div>
        <EventPickerField
          label="Wedding Ceremony"
          value={weddingEvent.value}
          onValueChange={weddingEvent.setValue}
          showPicker={weddingEvent.showPicker}
          onShowPickerChange={weddingEvent.setShowPicker}
          placeholder="Add Wedding Ceremony"
          openToNewEvent={!weddingEvent.value}
          defaultEventType="WEDDING"
          defaultName={RELATED_EVENT_TYPE_LABELS.WEDDING.en}
          disableSearch={true}
          defaultCreateFormData={{ name: suggestedWeddingName }}
        />
      </FormSectionCard>

      {/* Other Events */}
      <FormSectionCard
        title="Other Events"
        description="Related celebration events"
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <EventPickerField
            label="Reception"
            value={receptionEvent.value}
            onValueChange={receptionEvent.setValue}
            showPicker={receptionEvent.showPicker}
            onShowPickerChange={receptionEvent.setShowPicker}
            placeholder="Add Reception"
            openToNewEvent={!receptionEvent.value}
            defaultEventType="OTHER"
            defaultName="Reception"
            disableSearch={true}
            defaultCreateFormData={{ name: suggestedReceptionName }}
          />
          <EventPickerField
            label="Rehearsal"
            value={rehearsalEvent.value}
            onValueChange={rehearsalEvent.setValue}
            showPicker={rehearsalEvent.showPicker}
            onShowPickerChange={rehearsalEvent.setShowPicker}
            placeholder="Add Rehearsal"
            openToNewEvent={!rehearsalEvent.value}
            defaultEventType="REHEARSAL"
            defaultName="Rehearsal"
            disableSearch={true}
          />
        </div>
        <EventPickerField
          label="Rehearsal Dinner"
          value={rehearsalDinnerEvent.value}
          onValueChange={rehearsalDinnerEvent.setValue}
          showPicker={rehearsalDinnerEvent.showPicker}
          onShowPickerChange={rehearsalDinnerEvent.setShowPicker}
          placeholder="Add Rehearsal Dinner"
          openToNewEvent={!rehearsalDinnerEvent.value}
          defaultEventType="OTHER"
          defaultName="Rehearsal Dinner"
          disableSearch={true}
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
              additionalVisibleFields={['email', 'phone_number', 'note']}
            />
            <PersonPickerField
              label="Cantor"
              value={cantor.value}
              onValueChange={cantor.setValue}
              showPicker={cantor.showPicker}
              onShowPickerChange={cantor.setShowPicker}
              placeholder="Select Cantor"
              additionalVisibleFields={['email', 'phone_number', 'note']}
            />
          </div>

          <Separator />

          {/* Witnesses */}
          <div className="space-y-2">
            <Label className="text-base font-semibold">Witnesses</Label>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <PersonPickerField
              label="Witness 1"
              value={witness1.value}
              onValueChange={witness1.setValue}
              showPicker={witness1.showPicker}
              onShowPickerChange={witness1.setShowPicker}
              placeholder="Select Witness 1"
              openToNewPerson={!witness1.value}
              additionalVisibleFields={['email', 'phone_number', 'note']}
            />
            <PersonPickerField
              label="Witness 2"
              value={witness2.value}
              onValueChange={witness2.setValue}
              showPicker={witness2.showPicker}
              onShowPickerChange={witness2.setShowPicker}
              placeholder="Select Witness 2"
              openToNewPerson={!witness2.value}
              additionalVisibleFields={['email', 'phone_number', 'note']}
            />
          </div>

          <Separator />

          {/* Readings */}
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

          <Separator />

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

          <Separator />

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

          <Separator />

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
              additionalVisibleFields={['email', 'phone_number', 'note']}
            />
          </div>
      </FormSectionCard>

      {/* Petitions */}
      <FormSectionCard
        title="Petitions"
        description="Prayer of the Faithful"
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

      {/* Petition Editor */}
      <PetitionEditor
        value={petitions || ""}
        onChange={(value) => setValue("petitions", value)}
        onInsertTemplate={handleInsertTemplate}
        templates={petitionTemplates}
      />

      {/* Announcements */}
      <FormSectionCard
        title="Announcements"
        description="Announcements for the end of the liturgy"
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
        description="Coordinator, template, notes, and status"
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

          <Separator />

          <div className="space-y-2">
            <Label htmlFor="wedding_template_id">Liturgy Template</Label>
            <Select
              value={weddingTemplateId || ""}
              onValueChange={(value) => setValue("wedding_template_id", value as WeddingTemplate)}
            >
              <SelectTrigger id="wedding_template_id">
                <SelectValue placeholder="Select template" />
              </SelectTrigger>
              <SelectContent>
                {WEDDING_TEMPLATE_VALUES.map((templateId) => (
                  <SelectItem key={templateId} value={templateId}>
                    {WEDDING_TEMPLATE_LABELS[templateId].en}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <FormInput
            id="notes"
            label="Notes (Optional)"
            description="These notes are just for reference and will not be printed in the script"
            value={notes || ""}
            onChange={(value) => setValue("notes", value)}
            placeholder="Enter any additional notes..."
            inputType="textarea"
            rows={3}
            error={errors.notes?.message}
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
        cancelHref={isEditing ? `/weddings/${wedding.id}` : '/weddings'}
        moduleName="Wedding"
      />

      {/* Reading Pickers */}
      <ReadingPickerModal
        isOpen={showFirstReadingPicker}
        onClose={() => setShowFirstReadingPicker(false)}
        onSelect={(reading) => setFirstReading(reading)}
        selectedReading={firstReading}
        readings={readings}
        title="Select First Reading"
        preselectedCategories={['First Reading', 'Wedding']}
      />
      <ReadingPickerModal
        isOpen={showPsalmPicker}
        onClose={() => setShowPsalmPicker(false)}
        onSelect={(reading) => setPsalm(reading)}
        selectedReading={psalm}
        readings={readings}
        title="Select Responsorial Psalm"
        preselectedCategories={['Psalm', 'Wedding']}
      />
      <ReadingPickerModal
        isOpen={showSecondReadingPicker}
        onClose={() => setShowSecondReadingPicker(false)}
        onSelect={(reading) => setSecondReading(reading)}
        selectedReading={secondReading}
        readings={readings}
        title="Select Second Reading"
        preselectedCategories={['Second Reading', 'Wedding']}
      />
      <ReadingPickerModal
        isOpen={showGospelReadingPicker}
        onClose={() => setShowGospelReadingPicker(false)}
        onSelect={(reading) => setGospelReading(reading)}
        selectedReading={gospelReading}
        readings={readings}
        title="Select Gospel Reading"
        preselectedCategories={['Gospel', 'Wedding']}
      />
    </form>
  )
}

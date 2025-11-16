"use client"

import { useState, useEffect, useMemo } from "react"
import { z } from "zod"
import { Button } from "@/components/ui/button"
import { FormField } from "@/components/ui/form-field"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { BookOpen } from "lucide-react"
import { createQuinceanera, updateQuinceanera, type CreateQuinceaneraData, type QuinceaneraWithRelations } from "@/lib/actions/quinceaneras"
import { getIndividualReadings } from "@/lib/actions/readings"
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
import { MODULE_STATUS_VALUES, MODULE_STATUS_LABELS, EVENT_TYPE_LABELS, QUINCEANERA_TEMPLATE_VALUES, QUINCEANERA_TEMPLATE_LABELS, QUINCEANERA_DEFAULT_TEMPLATE } from "@/lib/constants"
import { FormBottomActions } from "@/components/form-bottom-actions"
import { PetitionEditor, type PetitionTemplate } from "@/components/petition-editor"
import { quinceaneraTemplates, buildQuinceaneraPetitions } from "@/lib/petition-templates/quinceanera"
import { usePickerState } from "@/hooks/use-picker-state"
import { PersonPickerField } from "@/components/person-picker-field"
import { EventPickerField } from "@/components/event-picker-field"

// Zod validation schema
const quinceaneraSchema = z.object({
  status: z.string().optional(),
  quinceanera_event_id: z.string().optional(),
  quinceanera_reception_id: z.string().optional(),
  quinceanera_id: z.string().optional(),
  family_contact_id: z.string().optional(),
  coordinator_id: z.string().optional(),
  presider_id: z.string().optional(),
  homilist_id: z.string().optional(),
  lead_musician_id: z.string().optional(),
  cantor_id: z.string().optional(),
  first_reader_id: z.string().optional(),
  second_reader_id: z.string().optional(),
  psalm_reader_id: z.string().optional(),
  gospel_reader_id: z.string().optional(),
  petition_reader_id: z.string().optional(),
  first_reading_id: z.string().optional(),
  psalm_id: z.string().optional(),
  second_reading_id: z.string().optional(),
  gospel_reading_id: z.string().optional(),
  psalm_is_sung: z.boolean(),
  petitions_read_by_second_reader: z.boolean(),
  petitions: z.string().optional(),
  announcements: z.string().optional(),
  note: z.string().optional(),
  quinceanera_template_id: z.string().optional()
})

interface QuinceaneraFormProps {
  quinceanera?: QuinceaneraWithRelations
  formId?: string
  onLoadingChange?: (loading: boolean) => void
}

export function QuinceaneraForm({ quinceanera, formId, onLoadingChange }: QuinceaneraFormProps) {
  const router = useRouter()
  const isEditing = !!quinceanera
  const [isLoading, setIsLoading] = useState(false)

  // Notify parent component of loading state changes
  useEffect(() => {
    onLoadingChange?.(isLoading)
  }, [isLoading, onLoadingChange])

  // State for all fields
  const [status, setStatus] = useState(quinceanera?.status || "ACTIVE")
  const [note, setNote] = useState(quinceanera?.note || "")
  const [announcements, setAnnouncements] = useState(quinceanera?.announcements || "")
  const [petitions, setPetitions] = useState(quinceanera?.petitions || "")
  const [quinceaneraTemplateId, setQuinceaneraTemplateId] = useState(quinceanera?.quinceanera_template_id || QUINCEANERA_DEFAULT_TEMPLATE)

  // Boolean states
  const [psalmIsSung, setPsalmIsSung] = useState(quinceanera?.psalm_is_sung || false)
  const [petitionsReadBySecondReader, setPetitionsReadBySecondReader] = useState(quinceanera?.petitions_read_by_second_reader || false)

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

  // Initialize form with quinceanera data when editing
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
  }, [quinceanera])

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
    return EVENT_TYPE_LABELS.QUINCEANERA.en
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      // Validate with Zod
      const quinceaneraData = quinceaneraSchema.parse({
        status: status || undefined,
        quinceanera_event_id: quinceaneraEvent.value?.id,
        quinceanera_reception_id: quinceaneraReception.value?.id,
        quinceanera_id: quinceaneraGirl.value?.id,
        family_contact_id: familyContact.value?.id,
        coordinator_id: coordinator.value?.id,
        presider_id: presider.value?.id,
        homilist_id: homilist.value?.id,
        lead_musician_id: leadMusician.value?.id,
        cantor_id: cantor.value?.id,
        first_reader_id: firstReader.value?.id,
        second_reader_id: secondReader.value?.id,
        psalm_reader_id: psalmReader.value?.id,
        gospel_reader_id: gospelReader.value?.id,
        petition_reader_id: petitionReader.value?.id,
        first_reading_id: firstReading?.id,
        psalm_id: psalm?.id,
        second_reading_id: secondReading?.id,
        gospel_reading_id: gospelReading?.id,
        psalm_is_sung: psalmIsSung,
        petitions_read_by_second_reader: petitionsReadBySecondReader,
        petitions: petitions || undefined,
        announcements: announcements || undefined,
        note: note || undefined,
        quinceanera_template_id: quinceaneraTemplateId || undefined,
      })

      if (isEditing) {
        await updateQuinceanera(quinceanera.id, quinceaneraData)
        toast.success('Quinceañera updated successfully')
        router.refresh() // Stay on edit page to show updated data
      } else {
        const newQuinceanera = await createQuinceanera(quinceaneraData)
        toast.success('Quinceañera created successfully!')
        router.push(`/quinceaneras/${newQuinceanera.id}/edit`)
      }
    } catch (error) {
      if (error instanceof z.ZodError) {
        toast.error(error.issues[0].message)
      } else {
        console.error(`Failed to ${isEditing ? 'update' : 'create'} quinceañera:`, error)
        toast.error(`Failed to ${isEditing ? 'update' : 'create'} quinceañera. Please try again.`)
      }
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <form id={formId} onSubmit={handleSubmit} className="space-y-8">
      {/* Key Information */}
      <Card>
        <CardHeader>
          <CardTitle>Key Information</CardTitle>
          <CardDescription>Essential details about the quinceañera and mass event</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <PersonPickerField
            label="Quinceañera"
            value={quinceaneraGirl.value}
            onValueChange={quinceaneraGirl.setValue}
            showPicker={quinceaneraGirl.showPicker}
            onShowPickerChange={quinceaneraGirl.setShowPicker}
            placeholder="Select Quinceañera"
            openToNewPerson={!quinceaneraGirl.value}
          />
          <EventPickerField
            label="Mass Event"
            value={quinceaneraEvent.value}
            onValueChange={quinceaneraEvent.setValue}
            showPicker={quinceaneraEvent.showPicker}
            onShowPickerChange={quinceaneraEvent.setShowPicker}
            placeholder="Add Quinceañera Ceremony"
            openToNewEvent={!quinceaneraEvent.value}
            defaultEventType="QUINCEANERA"
            defaultName={EVENT_TYPE_LABELS.QUINCEANERA.en}
            disableSearch={true}
            defaultCreateFormData={{ name: suggestedQuinceaneraName }}
          />
        </CardContent>
      </Card>

      {/* Other Events */}
      <Card>
        <CardHeader>
          <CardTitle>Other Events</CardTitle>
          <CardDescription>Related celebration events</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <EventPickerField
            label="Reception"
            value={quinceaneraReception.value}
            onValueChange={quinceaneraReception.setValue}
            showPicker={quinceaneraReception.showPicker}
            onShowPickerChange={quinceaneraReception.setShowPicker}
            placeholder="Add Reception"
            openToNewEvent={!quinceaneraReception.value}
            defaultEventType="OTHER"
            defaultName="Quinceañera Reception"
            disableSearch={true}
            defaultCreateFormData={{ name: suggestedReceptionName }}
          />
        </CardContent>
      </Card>

      {/* Other People */}
      <Card>
        <CardHeader>
          <CardTitle>Other People</CardTitle>
          <CardDescription>Family contacts</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <PersonPickerField
            label="Family Contact"
            value={familyContact.value}
            onValueChange={familyContact.setValue}
            showPicker={familyContact.showPicker}
            onShowPickerChange={familyContact.setShowPicker}
            placeholder="Select Family Contact"
            openToNewPerson={!familyContact.value}
          />
        </CardContent>
      </Card>

      {/* Key Liturgical Roles */}
      <Card>
        <CardHeader>
          <CardTitle>Key Liturgical Roles</CardTitle>
          <CardDescription>Primary liturgical ministers</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <PersonPickerField
              label="Presider"
              value={presider.value}
              onValueChange={presider.setValue}
              showPicker={presider.showPicker}
              onShowPickerChange={presider.setShowPicker}
              placeholder="Select Presider"
              openToNewPerson={!presider.value}
            />
            <PersonPickerField
              label="Homilist"
              value={homilist.value}
              onValueChange={homilist.setValue}
              showPicker={homilist.showPicker}
              onShowPickerChange={homilist.setShowPicker}
              placeholder="Select Homilist"
              openToNewPerson={!homilist.value}
            />
          </div>
        </CardContent>
      </Card>

      {/* Other Liturgical Roles and Liturgical Selections */}
      <Card>
        <CardHeader>
          <CardTitle>Other Liturgical Roles and Liturgical Selections</CardTitle>
          <CardDescription>Additional ministers, readers, and scripture selections</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
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
            />
            <PersonPickerField
              label="Cantor"
              value={cantor.value}
              onValueChange={cantor.setValue}
              showPicker={cantor.showPicker}
              onShowPickerChange={cantor.setShowPicker}
              placeholder="Select Cantor"
              openToNewPerson={!cantor.value}
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
              />
            )}
          </div>

          <div className="flex items-center space-x-2">
            <Checkbox
              id="psalm_is_sung"
              checked={psalmIsSung}
              onCheckedChange={(checked) => setPsalmIsSung(checked as boolean)}
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
            />
          </div>
        </CardContent>
      </Card>

      {/* Petitions */}
      <PetitionEditor
        value={petitions}
        onChange={setPetitions}
        onInsertTemplate={handleInsertTemplate}
        templates={petitionTemplates}
      />

      <Card>
        <CardHeader>
          <CardTitle>Petition Reader</CardTitle>
          <CardDescription>Who will read the petitions</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center space-x-2">
            <Checkbox
              id="petitions_read_by_second_reader"
              checked={petitionsReadBySecondReader}
              onCheckedChange={(checked) => setPetitionsReadBySecondReader(checked as boolean)}
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
            />
          )}
        </CardContent>
      </Card>

      {/* Announcements */}
      <Card>
        <CardHeader>
          <CardTitle>Announcements</CardTitle>
          <CardDescription>Special announcements for the end of the liturgy</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <FormField
            id="announcements"
            label="Announcements"
            description="These announcements will be printed on the last page of the liturgy script"
            value={announcements}
            onChange={setAnnouncements}
            placeholder="Enter any announcements..."
            inputType="textarea"
            rows={3}
          />
        </CardContent>
      </Card>

      {/* Additional Details */}
      <Card>
        <CardHeader>
          <CardTitle>Additional Details</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <PersonPickerField
            label="Coordinator"
            value={coordinator.value}
            onValueChange={coordinator.setValue}
            showPicker={coordinator.showPicker}
            onShowPickerChange={coordinator.setShowPicker}
            placeholder="Select Coordinator"
            openToNewPerson={!coordinator.value}
          />

          <div className="space-y-2">
            <Label htmlFor="quinceanera_template_id">Liturgy Template</Label>
            <Select value={quinceaneraTemplateId} onValueChange={setQuinceaneraTemplateId}>
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

          <FormField
            id="note"
            label="Notes (Optional)"
            description="These notes are just for reference and will not be printed in the script"
            value={note}
            onChange={setNote}
            placeholder="Enter any additional notes..."
            inputType="textarea"
            rows={3}
          />

          <div className="space-y-2">
            <Label htmlFor="status">Status</Label>
            <Select value={status} onValueChange={setStatus}>
              <SelectTrigger id="status">
                <SelectValue placeholder="Select status" />
              </SelectTrigger>
              <SelectContent>
                {MODULE_STATUS_VALUES.map((statusOption) => (
                  <SelectItem key={statusOption} value={statusOption}>
                    {MODULE_STATUS_LABELS[statusOption].en}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Submit Buttons */}
      <FormBottomActions
        isEditing={isEditing}
        isLoading={isLoading}
        cancelHref={isEditing ? `/quinceaneras/${quinceanera.id}` : '/quinceaneras'}
        saveLabel={isEditing ? 'Update Quinceañera' : 'Save Quinceañera'}
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

"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { FormField } from "@/components/ui/form-field"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { User, BookOpen, Calendar } from "lucide-react"
import { createFuneral, updateFuneral, type CreateFuneralData, type FuneralWithRelations } from "@/lib/actions/funerals"
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
import { PeoplePicker } from "@/components/people-picker"
import { ReadingPickerModal } from "@/components/reading-picker-modal"
import { EventPicker } from "@/components/event-picker"
import { EventDisplay } from "@/components/event-display"
import { MODULE_STATUS_VALUES, MODULE_STATUS_LABELS, EVENT_TYPE_LABELS } from "@/lib/constants"
import { FormBottomActions } from "@/components/form-bottom-actions"
import { PetitionEditor, type PetitionTemplate } from "@/components/petition-editor"
import { funeralTemplates, buildFuneralPetitions } from "@/lib/petition-templates/funeral"
import { FUNERAL_TEMPLATES } from "@/lib/content-builders/funeral"

interface FuneralFormProps {
  funeral?: FuneralWithRelations
  formId?: string
  onLoadingChange?: (loading: boolean) => void
}

export function FuneralForm({ funeral, formId, onLoadingChange }: FuneralFormProps) {
  const router = useRouter()
  const isEditing = !!funeral
  const [isLoading, setIsLoading] = useState(false)

  // Notify parent component of loading state changes
  useEffect(() => {
    onLoadingChange?.(isLoading)
  }, [isLoading, onLoadingChange])

  // State for all fields
  const [status, setStatus] = useState(funeral?.status || "ACTIVE")
  const [note, setNote] = useState(funeral?.note || "")
  const [announcements, setAnnouncements] = useState(funeral?.announcements || "")
  const [petitions, setPetitions] = useState(funeral?.petitions || "")
  const [funeralTemplateId, setFuneralTemplateId] = useState(funeral?.funeral_template_id || "")

  // Boolean states
  const [psalmIsSung, setPsalmIsSung] = useState(funeral?.psalm_is_sung || false)
  const [petitionsReadBySecondReader, setPetitionsReadBySecondReader] = useState(funeral?.petitions_read_by_second_reader || false)

  // Event picker states
  const [showFuneralEventPicker, setShowFuneralEventPicker] = useState(false)
  const [showFuneralMealEventPicker, setShowFuneralMealEventPicker] = useState(false)

  // People picker states
  const [showDeceasedPicker, setShowDeceasedPicker] = useState(false)
  const [showFamilyContactPicker, setShowFamilyContactPicker] = useState(false)
  const [showCoordinatorPicker, setShowCoordinatorPicker] = useState(false)
  const [showPresiderPicker, setShowPresiderPicker] = useState(false)
  const [showHomilistPicker, setShowHomilistPicker] = useState(false)
  const [showLeadMusicianPicker, setShowLeadMusicianPicker] = useState(false)
  const [showCantorPicker, setShowCantorPicker] = useState(false)
  const [showFirstReaderPicker, setShowFirstReaderPicker] = useState(false)
  const [showSecondReaderPicker, setShowSecondReaderPicker] = useState(false)
  const [showPsalmReaderPicker, setShowPsalmReaderPicker] = useState(false)
  const [showGospelReaderPicker, setShowGospelReaderPicker] = useState(false)
  const [showPetitionReaderPicker, setShowPetitionReaderPicker] = useState(false)

  // Selected events
  const [funeralEvent, setFuneralEvent] = useState<Event | null>(null)
  const [funeralMealEvent, setFuneralMealEvent] = useState<Event | null>(null)

  // Selected people
  const [deceased, setDeceased] = useState<Person | null>(null)
  const [familyContact, setFamilyContact] = useState<Person | null>(null)
  const [coordinator, setCoordinator] = useState<Person | null>(null)
  const [presider, setPresider] = useState<Person | null>(null)
  const [homilist, setHomilist] = useState<Person | null>(null)
  const [leadMusician, setLeadMusician] = useState<Person | null>(null)
  const [cantor, setCantor] = useState<Person | null>(null)
  const [firstReader, setFirstReader] = useState<Person | null>(null)
  const [secondReader, setSecondReader] = useState<Person | null>(null)
  const [psalmReader, setPsalmReader] = useState<Person | null>(null)
  const [gospelReader, setGospelReader] = useState<Person | null>(null)
  const [petitionReader, setPetitionReader] = useState<Person | null>(null)

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

  // Initialize form with funeral data when editing
  useEffect(() => {
    if (funeral) {
      // Set events
      if (funeral.funeral_event) setFuneralEvent(funeral.funeral_event)
      if (funeral.funeral_meal_event) setFuneralMealEvent(funeral.funeral_meal_event)

      // Set people
      if (funeral.deceased) setDeceased(funeral.deceased)
      if (funeral.family_contact) setFamilyContact(funeral.family_contact)
      if (funeral.coordinator) setCoordinator(funeral.coordinator)
      if (funeral.presider) setPresider(funeral.presider)
      if (funeral.homilist) setHomilist(funeral.homilist)
      if (funeral.lead_musician) setLeadMusician(funeral.lead_musician)
      if (funeral.cantor) setCantor(funeral.cantor)
      if (funeral.first_reader) setFirstReader(funeral.first_reader)
      if (funeral.second_reader) setSecondReader(funeral.second_reader)
      if (funeral.psalm_reader) setPsalmReader(funeral.psalm_reader)
      if (funeral.gospel_reader) setGospelReader(funeral.gospel_reader)
      if (funeral.petition_reader) setPetitionReader(funeral.petition_reader)

      // Set readings
      if (funeral.first_reading) setFirstReading(funeral.first_reading)
      if (funeral.psalm) setPsalm(funeral.psalm)
      if (funeral.second_reading) setSecondReading(funeral.second_reading)
      if (funeral.gospel_reading) setGospelReading(funeral.gospel_reading)
    }
  }, [funeral])

  // Handle inserting template petitions
  const handleInsertTemplate = (templateId: string): string[] => {
    const deceasedName = deceased?.first_name || ''

    // Build petitions from selected template
    return buildFuneralPetitions(templateId, deceasedName)
  }

  // Get available templates - convert to PetitionTemplate format
  const petitionTemplates: PetitionTemplate[] = funeralTemplates.map(t => ({
    id: t.id,
    name: t.name,
    description: t.description,
  }))

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      const funeralData: CreateFuneralData = {
        status: status || undefined,
        funeral_event_id: funeralEvent?.id,
        funeral_meal_event_id: funeralMealEvent?.id,
        deceased_id: deceased?.id,
        family_contact_id: familyContact?.id,
        coordinator_id: coordinator?.id,
        presider_id: presider?.id,
        homilist_id: homilist?.id,
        lead_musician_id: leadMusician?.id,
        cantor_id: cantor?.id,
        first_reader_id: firstReader?.id,
        second_reader_id: secondReader?.id,
        psalm_reader_id: psalmReader?.id,
        gospel_reader_id: gospelReader?.id,
        petition_reader_id: petitionReader?.id,
        first_reading_id: firstReading?.id,
        psalm_id: psalm?.id,
        second_reading_id: secondReading?.id,
        gospel_reading_id: gospelReading?.id,
        psalm_is_sung: psalmIsSung,
        petitions_read_by_second_reader: petitionsReadBySecondReader,
        petitions: petitions || undefined,
        announcements: announcements || undefined,
        note: note || undefined,
        funeral_template_id: funeralTemplateId || undefined,
      }

      if (isEditing) {
        await updateFuneral(funeral.id, funeralData)
        toast.success('Funeral updated successfully')
        router.refresh() // Refresh to get updated data
      } else {
        const newFuneral = await createFuneral(funeralData)
        toast.success('Funeral created successfully!')
        router.push(`/funerals/${newFuneral.id}`)
      }
    } catch (error) {
      console.error(`Failed to ${isEditing ? 'update' : 'create'} funeral:`, error)
      toast.error(`Failed to ${isEditing ? 'update' : 'create'} funeral. Please try again.`)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <form id={formId} onSubmit={handleSubmit} className="space-y-6">
      {/* Basic Information */}
      <Card>
        <CardHeader>
          <CardTitle>Basic Information</CardTitle>
          <CardDescription>General details and event time</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
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

          <Separator />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Funeral Service</Label>
              <Button
                type="button"
                variant="outline"
                className="w-full justify-start text-left h-auto py-3"
                onClick={() => setShowFuneralEventPicker(true)}
              >
                <Calendar className="h-4 w-4 mr-2 flex-shrink-0" />
                <EventDisplay event={funeralEvent} placeholder="Add Funeral Service" />
              </Button>
            </div>
            <div className="space-y-2">
              <Label>Funeral Meal / Reception</Label>
              <Button
                type="button"
                variant="outline"
                className="w-full justify-start text-left h-auto py-3"
                onClick={() => setShowFuneralMealEventPicker(true)}
              >
                <Calendar className="h-4 w-4 mr-2 flex-shrink-0" />
                <EventDisplay event={funeralMealEvent} placeholder="Add Funeral Meal" />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Deceased and Family */}
      <Card>
        <CardHeader>
          <CardTitle>Deceased and Family Contact</CardTitle>
          <CardDescription>Information about the deceased and primary family contact</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Deceased</Label>
              <Button
                type="button"
                variant="outline"
                className="w-full justify-start"
                onClick={() => setShowDeceasedPicker(true)}
              >
                <User className="h-4 w-4 mr-2" />
                {deceased ? `${deceased.first_name} ${deceased.last_name}` : 'Select Deceased'}
              </Button>
            </div>
            <div className="space-y-2">
              <Label>Family Contact</Label>
              <Button
                type="button"
                variant="outline"
                className="w-full justify-start"
                onClick={() => setShowFamilyContactPicker(true)}
              >
                <User className="h-4 w-4 mr-2" />
                {familyContact ? `${familyContact.first_name} ${familyContact.last_name}` : 'Select Family Contact'}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Liturgical Roles */}
      <Card>
        <CardHeader>
          <CardTitle>Liturgical Roles</CardTitle>
          <CardDescription>Ministers and liturgical participants</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Presider</Label>
              <Button
                type="button"
                variant="outline"
                className="w-full justify-start"
                onClick={() => setShowPresiderPicker(true)}
              >
                <User className="h-4 w-4 mr-2" />
                {presider ? `${presider.first_name} ${presider.last_name}` : 'Select Presider'}
              </Button>
            </div>
            <div className="space-y-2">
              <Label>Homilist</Label>
              <Button
                type="button"
                variant="outline"
                className="w-full justify-start"
                onClick={() => setShowHomilistPicker(true)}
              >
                <User className="h-4 w-4 mr-2" />
                {homilist ? `${homilist.first_name} ${homilist.last_name}` : 'Select Homilist'}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Music Ministers */}
      <Card>
        <CardHeader>
          <CardTitle>Music Ministers</CardTitle>
          <CardDescription>Musicians and singers</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Lead Musician</Label>
              <Button
                type="button"
                variant="outline"
                className="w-full justify-start"
                onClick={() => setShowLeadMusicianPicker(true)}
              >
                <User className="h-4 w-4 mr-2" />
                {leadMusician ? `${leadMusician.first_name} ${leadMusician.last_name}` : 'Select Lead Musician'}
              </Button>
            </div>
            <div className="space-y-2">
              <Label>Cantor</Label>
              <Button
                type="button"
                variant="outline"
                className="w-full justify-start"
                onClick={() => setShowCantorPicker(true)}
              >
                <User className="h-4 w-4 mr-2" />
                {cantor ? `${cantor.first_name} ${cantor.last_name}` : 'Select Cantor'}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Coordinator */}
      <Card>
        <CardHeader>
          <CardTitle>Coordination</CardTitle>
          <CardDescription>Funeral coordinator</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label>Coordinator</Label>
            <Button
              type="button"
              variant="outline"
              className="w-full justify-start"
              onClick={() => setShowCoordinatorPicker(true)}
            >
              <User className="h-4 w-4 mr-2" />
              {coordinator ? `${coordinator.first_name} ${coordinator.last_name}` : 'Select Coordinator'}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Readings */}
      <Card>
        <CardHeader>
          <CardTitle>Readings</CardTitle>
          <CardDescription>Scripture readings for the funeral liturgy</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
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
            <div className="space-y-2">
              <Label>First Reader</Label>
              <Button
                type="button"
                variant="outline"
                className="w-full justify-start"
                onClick={() => setShowFirstReaderPicker(true)}
              >
                <User className="h-4 w-4 mr-2" />
                {firstReader ? `${firstReader.first_name} ${firstReader.last_name}` : 'Select First Reader'}
              </Button>
            </div>
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
              <div className="space-y-2">
                <Label>Psalm Reader</Label>
                <Button
                  type="button"
                  variant="outline"
                  className="w-full justify-start"
                  onClick={() => setShowPsalmReaderPicker(true)}
                >
                  <User className="h-4 w-4 mr-2" />
                  {psalmReader ? `${psalmReader.first_name} ${psalmReader.last_name}` : 'Select Psalm Reader'}
                </Button>
              </div>
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
            <div className="space-y-2">
              <Label>Second Reader</Label>
              <Button
                type="button"
                variant="outline"
                className="w-full justify-start"
                onClick={() => setShowSecondReaderPicker(true)}
              >
                <User className="h-4 w-4 mr-2" />
                {secondReader ? `${secondReader.first_name} ${secondReader.last_name}` : 'Select Second Reader'}
              </Button>
            </div>
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
            <div className="space-y-2">
              <Label>Gospel Reader</Label>
              <Button
                type="button"
                variant="outline"
                className="w-full justify-start"
                onClick={() => setShowGospelReaderPicker(true)}
              >
                <User className="h-4 w-4 mr-2" />
                {gospelReader ? `${gospelReader.first_name} ${gospelReader.last_name}` : 'Select Gospel Reader'}
              </Button>
            </div>
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

      {/* Petition Reader */}
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
            <div className="space-y-2">
              <Label>Petition Reader</Label>
              <Button
                type="button"
                variant="outline"
                className="w-full justify-start"
                onClick={() => setShowPetitionReaderPicker(true)}
              >
                <User className="h-4 w-4 mr-2" />
                {petitionReader ? `${petitionReader.first_name} ${petitionReader.last_name}` : 'Select Petition Reader'}
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Announcements and Notes */}
      <Card>
        <CardHeader>
          <CardTitle>Additional Information</CardTitle>
          <CardDescription>Announcements and notes</CardDescription>
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

          <FormField
            id="note"
            label="Note"
            description="These notes are just for reference and will not be printed in the script"
            value={note}
            onChange={setNote}
            placeholder="Enter any additional notes..."
            inputType="textarea"
            rows={3}
          />
        </CardContent>
      </Card>

      {/* Template Selection */}
      <Card>
        <CardHeader>
          <CardTitle>Funeral Template</CardTitle>
          <CardDescription>Select the liturgy template for the funeral ceremony script</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="funeral_template_id">Liturgy Template</Label>
            <Select value={funeralTemplateId} onValueChange={setFuneralTemplateId}>
              <SelectTrigger id="funeral_template_id">
                <SelectValue placeholder="Select template" />
              </SelectTrigger>
              <SelectContent>
                {Object.values(FUNERAL_TEMPLATES).map((template) => (
                  <SelectItem key={template.id} value={template.id}>
                    {template.name}
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
        cancelHref={isEditing ? `/funerals/${funeral.id}` : '/funerals'}
        saveLabel={isEditing ? 'Update Funeral' : 'Save Funeral'}
      />

      {/* Event Pickers */}
      <EventPicker
        open={showFuneralEventPicker}
        onOpenChange={setShowFuneralEventPicker}
        onSelect={(event) => setFuneralEvent(event)}
        selectedEventId={funeralEvent?.id}
        selectedEvent={funeralEvent}
        defaultEventType="FUNERAL"
        defaultName={EVENT_TYPE_LABELS.FUNERAL.en}
        openToNewEvent={!isEditing}
        disableSearch={true}
      />
      <EventPicker
        open={showFuneralMealEventPicker}
        onOpenChange={setShowFuneralMealEventPicker}
        onSelect={(event) => setFuneralMealEvent(event)}
        selectedEventId={funeralMealEvent?.id}
        selectedEvent={funeralMealEvent}
        defaultEventType="OTHER"
        defaultName="Funeral Meal"
        openToNewEvent={!isEditing}
        disableSearch={true}
      />

      {/* People Pickers */}
      <PeoplePicker
        open={showDeceasedPicker}
        onOpenChange={setShowDeceasedPicker}
        onSelect={(person) => setDeceased(person)}
        selectedPersonId={deceased?.id}
      />
      <PeoplePicker
        open={showFamilyContactPicker}
        onOpenChange={setShowFamilyContactPicker}
        onSelect={(person) => setFamilyContact(person)}
        selectedPersonId={familyContact?.id}
      />
      <PeoplePicker
        open={showCoordinatorPicker}
        onOpenChange={setShowCoordinatorPicker}
        onSelect={(person) => setCoordinator(person)}
        selectedPersonId={coordinator?.id}
      />
      <PeoplePicker
        open={showPresiderPicker}
        onOpenChange={setShowPresiderPicker}
        onSelect={(person) => setPresider(person)}
        selectedPersonId={presider?.id}
      />
      <PeoplePicker
        open={showHomilistPicker}
        onOpenChange={setShowHomilistPicker}
        onSelect={(person) => setHomilist(person)}
        selectedPersonId={homilist?.id}
      />
      <PeoplePicker
        open={showLeadMusicianPicker}
        onOpenChange={setShowLeadMusicianPicker}
        onSelect={(person) => setLeadMusician(person)}
        selectedPersonId={leadMusician?.id}
      />
      <PeoplePicker
        open={showCantorPicker}
        onOpenChange={setShowCantorPicker}
        onSelect={(person) => setCantor(person)}
        selectedPersonId={cantor?.id}
      />
      <PeoplePicker
        open={showFirstReaderPicker}
        onOpenChange={setShowFirstReaderPicker}
        onSelect={(person) => setFirstReader(person)}
        selectedPersonId={firstReader?.id}
      />
      <PeoplePicker
        open={showSecondReaderPicker}
        onOpenChange={setShowSecondReaderPicker}
        onSelect={(person) => setSecondReader(person)}
        selectedPersonId={secondReader?.id}
      />
      <PeoplePicker
        open={showPsalmReaderPicker}
        onOpenChange={setShowPsalmReaderPicker}
        onSelect={(person) => setPsalmReader(person)}
        selectedPersonId={psalmReader?.id}
      />
      <PeoplePicker
        open={showGospelReaderPicker}
        onOpenChange={setShowGospelReaderPicker}
        onSelect={(person) => setGospelReader(person)}
        selectedPersonId={gospelReader?.id}
      />
      <PeoplePicker
        open={showPetitionReaderPicker}
        onOpenChange={setShowPetitionReaderPicker}
        onSelect={(person) => setPetitionReader(person)}
        selectedPersonId={petitionReader?.id}
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

"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { FormField } from "@/components/ui/form-field"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { User, BookOpen, Calendar } from "lucide-react"
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
import { PeoplePicker } from "@/components/people-picker"
import { ReadingPickerModal } from "@/components/reading-picker-modal"
import { EventPicker } from "@/components/event-picker"
import { EventDisplay } from "@/components/event-display"
import { MODULE_STATUS_VALUES, MODULE_STATUS_LABELS } from "@/lib/constants"
import { FormBottomActions } from "@/components/form-bottom-actions"
import { PetitionEditor, type PetitionTemplate } from "@/components/petition-editor"
import { quinceaneraTemplates, buildQuinceaneraPetitions } from "@/lib/petition-templates/quinceanera"
import { QUINCEANERA_TEMPLATES } from "@/lib/content-builders/quinceanera"

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
  const [quinceaneraTemplateId, setQuinceaneraTemplateId] = useState(quinceanera?.quinceanera_template_id || "")

  // Boolean states
  const [psalmIsSung, setPsalmIsSung] = useState(quinceanera?.psalm_is_sung || false)
  const [petitionsReadBySecondReader, setPetitionsReadBySecondReader] = useState(quinceanera?.petitions_read_by_second_reader || false)

  // Event picker states
  const [showQuinceaneraEventPicker, setShowQuinceaneraEventPicker] = useState(false)
  const [showQuinceaneraReceptionPicker, setShowQuinceaneraReceptionPicker] = useState(false)

  // People picker states
  const [showQuinceaneraPicker, setShowQuinceaneraPicker] = useState(false)
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
  const [quinceaneraEvent, setQuinceaneraEvent] = useState<Event | null>(null)
  const [quinceaneraReception, setQuinceaneraReception] = useState<Event | null>(null)

  // Selected people
  const [quinceaneraGirl, setQuinceaneraGirl] = useState<Person | null>(null)
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

  // Initialize form with quinceanera data when editing
  useEffect(() => {
    if (quinceanera) {
      // Set events
      if (quinceanera.quinceanera_event) setQuinceaneraEvent(quinceanera.quinceanera_event)
      if (quinceanera.quinceanera_reception) setQuinceaneraReception(quinceanera.quinceanera_reception)

      // Set people
      if (quinceanera.quinceanera) setQuinceaneraGirl(quinceanera.quinceanera)
      if (quinceanera.family_contact) setFamilyContact(quinceanera.family_contact)
      if (quinceanera.coordinator) setCoordinator(quinceanera.coordinator)
      if (quinceanera.presider) setPresider(quinceanera.presider)
      if (quinceanera.homilist) setHomilist(quinceanera.homilist)
      if (quinceanera.lead_musician) setLeadMusician(quinceanera.lead_musician)
      if (quinceanera.cantor) setCantor(quinceanera.cantor)
      if (quinceanera.first_reader) setFirstReader(quinceanera.first_reader)
      if (quinceanera.second_reader) setSecondReader(quinceanera.second_reader)
      if (quinceanera.psalm_reader) setPsalmReader(quinceanera.psalm_reader)
      if (quinceanera.gospel_reader) setGospelReader(quinceanera.gospel_reader)
      if (quinceanera.petition_reader) setPetitionReader(quinceanera.petition_reader)

      // Set readings
      if (quinceanera.first_reading) setFirstReading(quinceanera.first_reading)
      if (quinceanera.psalm) setPsalm(quinceanera.psalm)
      if (quinceanera.second_reading) setSecondReading(quinceanera.second_reading)
      if (quinceanera.gospel_reading) setGospelReading(quinceanera.gospel_reading)
    }
  }, [quinceanera])

  // Handle inserting template petitions
  const handleInsertTemplate = (templateId: string): string[] => {
    const quinceaneraName = quinceaneraGirl?.first_name || ''

    // Build petitions from selected template
    return buildQuinceaneraPetitions(templateId, quinceaneraName)
  }

  // Get available templates - convert to PetitionTemplate format
  const petitionTemplates: PetitionTemplate[] = quinceaneraTemplates.map(t => ({
    id: t.id,
    name: t.name,
    description: t.description,
  }))

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      const quinceaneraData: CreateQuinceaneraData = {
        status: status || undefined,
        quinceanera_event_id: quinceaneraEvent?.id,
        quinceanera_reception_id: quinceaneraReception?.id,
        quinceanera_id: quinceaneraGirl?.id,
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
        quinceanera_template_id: quinceaneraTemplateId || undefined,
      }

      if (isEditing) {
        await updateQuinceanera(quinceanera.id, quinceaneraData)
        toast.success('Quinceañera updated successfully')
        router.refresh() // Refresh to get updated data
      } else {
        const newQuinceanera = await createQuinceanera(quinceaneraData)
        toast.success('Quinceañera created successfully!')
        router.push(`/quinceaneras/${newQuinceanera.id}`)
      }
    } catch (error) {
      console.error(`Failed to ${isEditing ? 'update' : 'create'} quinceañera:`, error)
      toast.error(`Failed to ${isEditing ? 'update' : 'create'} quinceañera. Please try again.`)
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
          <CardDescription>General details and event times</CardDescription>
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
              <Label>Quinceañera Ceremony</Label>
              <Button
                type="button"
                variant="outline"
                className="w-full justify-start text-left h-auto py-3"
                onClick={() => setShowQuinceaneraEventPicker(true)}
              >
                <Calendar className="h-4 w-4 mr-2 flex-shrink-0" />
                <EventDisplay event={quinceaneraEvent} placeholder="Add Quinceañera Ceremony" />
              </Button>
            </div>
            <div className="space-y-2">
              <Label>Reception</Label>
              <Button
                type="button"
                variant="outline"
                className="w-full justify-start text-left h-auto py-3"
                onClick={() => setShowQuinceaneraReceptionPicker(true)}
              >
                <Calendar className="h-4 w-4 mr-2 flex-shrink-0" />
                <EventDisplay event={quinceaneraReception} placeholder="Add Reception" />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Participant */}
      <Card>
        <CardHeader>
          <CardTitle>Participant</CardTitle>
          <CardDescription>Quinceañera and family contact information</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Quinceañera</Label>
              <Button
                type="button"
                variant="outline"
                className="w-full justify-start"
                onClick={() => setShowQuinceaneraPicker(true)}
              >
                <User className="h-4 w-4 mr-2" />
                {quinceaneraGirl ? `${quinceaneraGirl.first_name} ${quinceaneraGirl.last_name}` : 'Select Quinceañera'}
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
          <CardDescription>Quinceañera coordinator</CardDescription>
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
          <CardDescription>Scripture readings for the quinceañera liturgy</CardDescription>
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
          <CardTitle>Quinceañera Template</CardTitle>
          <CardDescription>Select the liturgy template for the quinceañera ceremony script</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="quinceanera_template_id">Liturgy Template</Label>
            <Select value={quinceaneraTemplateId} onValueChange={setQuinceaneraTemplateId}>
              <SelectTrigger id="quinceanera_template_id">
                <SelectValue placeholder="Select template" />
              </SelectTrigger>
              <SelectContent>
                {Object.values(QUINCEANERA_TEMPLATES).map((template) => (
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
        cancelHref={isEditing ? `/quinceaneras/${quinceanera.id}` : '/quinceaneras'}
        saveLabel={isEditing ? 'Update Quinceañera' : 'Save Quinceañera'}
      />

      {/* Event Pickers */}
      <EventPicker
        open={showQuinceaneraEventPicker}
        onOpenChange={setShowQuinceaneraEventPicker}
        onSelect={(event) => setQuinceaneraEvent(event)}
        selectedEventId={quinceaneraEvent?.id}
        selectedEvent={quinceaneraEvent}
        defaultEventType="Quinceañera Ceremony"
        defaultName="Quinceañera Ceremony"
        openToNewEvent={!quinceaneraEvent}
        disableSearch={true}
      />
      <EventPicker
        open={showQuinceaneraReceptionPicker}
        onOpenChange={setShowQuinceaneraReceptionPicker}
        onSelect={(event) => setQuinceaneraReception(event)}
        selectedEventId={quinceaneraReception?.id}
        selectedEvent={quinceaneraReception}
        defaultEventType="Reception"
        defaultName="Reception"
        openToNewEvent={!quinceaneraReception}
        disableSearch={true}
      />

      {/* People Pickers */}
      <PeoplePicker
        open={showQuinceaneraPicker}
        onOpenChange={setShowQuinceaneraPicker}
        onSelect={(person) => setQuinceaneraGirl(person)}
        selectedPersonId={quinceaneraGirl?.id}
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

"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { FormField } from "@/components/ui/form-field"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import Link from "next/link"
import { Save, User, BookOpen } from "lucide-react"
import { createWedding, updateWedding, type CreateWeddingData } from "@/lib/actions/weddings"
import { getIndividualReadings } from "@/lib/actions/readings"
import type { Wedding, Person, IndividualReading } from "@/lib/types"
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

interface WeddingFormProps {
  wedding?: Wedding
}

export function WeddingForm({ wedding }: WeddingFormProps) {
  const router = useRouter()
  const isEditing = !!wedding
  const [isLoading, setIsLoading] = useState(false)

  // State for all fields
  const [status, setStatus] = useState(wedding?.status || "Planning")
  const [notes, setNotes] = useState(wedding?.notes || "")
  const [announcements, setAnnouncements] = useState(wedding?.announcements || "")
  const [petitions, setPetitions] = useState(wedding?.petitions || "")

  // Boolean states
  const [psalmIsSung, setPsalmIsSung] = useState(wedding?.psalm_is_sung || false)
  const [petitionsReadBySecondReader, setPetitionsReadBySecondReader] = useState(wedding?.petitions_read_by_second_reader || false)

  // People picker states
  const [showBridePicker, setShowBridePicker] = useState(false)
  const [showGroomPicker, setShowGroomPicker] = useState(false)
  const [showCoordinatorPicker, setShowCoordinatorPicker] = useState(false)
  const [showPresiderPicker, setShowPresiderPicker] = useState(false)
  const [showHomilistPicker, setShowHomilistPicker] = useState(false)
  const [showLeadMusicianPicker, setShowLeadMusicianPicker] = useState(false)
  const [showCantorPicker, setShowCantorPicker] = useState(false)
  const [showWitness1Picker, setShowWitness1Picker] = useState(false)
  const [showWitness2Picker, setShowWitness2Picker] = useState(false)
  const [showFirstReaderPicker, setShowFirstReaderPicker] = useState(false)
  const [showSecondReaderPicker, setShowSecondReaderPicker] = useState(false)
  const [showPsalmReaderPicker, setShowPsalmReaderPicker] = useState(false)
  const [showGospelReaderPicker, setShowGospelReaderPicker] = useState(false)
  const [showPetitionReaderPicker, setShowPetitionReaderPicker] = useState(false)

  // Selected people
  const [bride, setBride] = useState<Person | null>(null)
  const [groom, setGroom] = useState<Person | null>(null)
  const [coordinator, setCoordinator] = useState<Person | null>(null)
  const [presider, setPresider] = useState<Person | null>(null)
  const [homilist, setHomilist] = useState<Person | null>(null)
  const [leadMusician, setLeadMusician] = useState<Person | null>(null)
  const [cantor, setCantor] = useState<Person | null>(null)
  const [witness1, setWitness1] = useState<Person | null>(null)
  const [witness2, setWitness2] = useState<Person | null>(null)
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      const weddingData: CreateWeddingData = {
        status: status || undefined,
        bride_id: bride?.id,
        groom_id: groom?.id,
        coordinator_id: coordinator?.id,
        presider_id: presider?.id,
        homilist_id: homilist?.id,
        lead_musician_id: leadMusician?.id,
        cantor_id: cantor?.id,
        witness_1_id: witness1?.id,
        witness_2_id: witness2?.id,
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
        notes: notes || undefined,
      }

      if (isEditing) {
        await updateWedding(wedding.id, weddingData)
        toast.success('Wedding updated successfully')
        router.push(`/weddings/${wedding.id}`)
      } else {
        const newWedding = await createWedding(weddingData)
        toast.success('Wedding created successfully!')
        router.push(`/weddings/${newWedding.id}`)
      }
    } catch (error) {
      console.error(`Failed to ${isEditing ? 'update' : 'create'} wedding:`, error)
      toast.error(`Failed to ${isEditing ? 'update' : 'create'} wedding. Please try again.`)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Basic Information */}
      <Card>
        <CardHeader>
          <CardTitle>Basic Information</CardTitle>
          <CardDescription>General details about the wedding</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="status">Status</Label>
            <Select value={status} onValueChange={setStatus}>
              <SelectTrigger id="status">
                <SelectValue placeholder="Select status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Planning">Planning</SelectItem>
                <SelectItem value="Scheduled">Scheduled</SelectItem>
                <SelectItem value="Completed">Completed</SelectItem>
                <SelectItem value="Cancelled">Cancelled</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Couple */}
      <Card>
        <CardHeader>
          <CardTitle>Couple</CardTitle>
          <CardDescription>Bride and groom information</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Bride</Label>
              <Button
                type="button"
                variant="outline"
                className="w-full justify-start"
                onClick={() => setShowBridePicker(true)}
              >
                <User className="h-4 w-4 mr-2" />
                {bride ? `${bride.first_name} ${bride.last_name}` : 'Select Bride'}
              </Button>
            </div>
            <div className="space-y-2">
              <Label>Groom</Label>
              <Button
                type="button"
                variant="outline"
                className="w-full justify-start"
                onClick={() => setShowGroomPicker(true)}
              >
                <User className="h-4 w-4 mr-2" />
                {groom ? `${groom.first_name} ${groom.last_name}` : 'Select Groom'}
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

      {/* Witnesses */}
      <Card>
        <CardHeader>
          <CardTitle>Witnesses</CardTitle>
          <CardDescription>Official witnesses for the wedding</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Witness 1</Label>
              <Button
                type="button"
                variant="outline"
                className="w-full justify-start"
                onClick={() => setShowWitness1Picker(true)}
              >
                <User className="h-4 w-4 mr-2" />
                {witness1 ? `${witness1.first_name} ${witness1.last_name}` : 'Select Witness 1'}
              </Button>
            </div>
            <div className="space-y-2">
              <Label>Witness 2</Label>
              <Button
                type="button"
                variant="outline"
                className="w-full justify-start"
                onClick={() => setShowWitness2Picker(true)}
              >
                <User className="h-4 w-4 mr-2" />
                {witness2 ? `${witness2.first_name} ${witness2.last_name}` : 'Select Witness 2'}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Coordinator */}
      <Card>
        <CardHeader>
          <CardTitle>Coordination</CardTitle>
          <CardDescription>Wedding coordinator</CardDescription>
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
          <CardDescription>Scripture readings for the wedding liturgy</CardDescription>
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
      <Card>
        <CardHeader>
          <CardTitle>Petitions</CardTitle>
          <CardDescription>Universal prayers</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <FormField
            id="petitions"
            label="Petitions Text"
            value={petitions}
            onChange={setPetitions}
            placeholder="Enter the petitions text..."
            inputType="textarea"
            rows={5}
          />

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
            value={announcements}
            onChange={setAnnouncements}
            placeholder="Enter any announcements..."
            inputType="textarea"
            rows={3}
          />

          <FormField
            id="notes"
            label="Notes"
            value={notes}
            onChange={setNotes}
            placeholder="Enter any additional notes..."
            inputType="textarea"
            rows={3}
          />
        </CardContent>
      </Card>

      {/* Submit Buttons */}
      <div className="flex gap-4 justify-end">
        <Button type="button" variant="outline" asChild disabled={isLoading}>
          <Link href={isEditing ? `/weddings/${wedding.id}` : '/weddings'}>
            Cancel
          </Link>
        </Button>
        <Button type="submit" disabled={isLoading}>
          <Save className="h-4 w-4 mr-2" />
          {isLoading ? 'Saving...' : isEditing ? 'Update Wedding' : 'Create Wedding'}
        </Button>
      </div>

      {/* People Pickers */}
      <PeoplePicker
        open={showBridePicker}
        onOpenChange={setShowBridePicker}
        onSelect={(person) => setBride(person)}
        selectedPersonId={bride?.id}
      />
      <PeoplePicker
        open={showGroomPicker}
        onOpenChange={setShowGroomPicker}
        onSelect={(person) => setGroom(person)}
        selectedPersonId={groom?.id}
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
        open={showWitness1Picker}
        onOpenChange={setShowWitness1Picker}
        onSelect={(person) => setWitness1(person)}
        selectedPersonId={witness1?.id}
      />
      <PeoplePicker
        open={showWitness2Picker}
        onOpenChange={setShowWitness2Picker}
        onSelect={(person) => setWitness2(person)}
        selectedPersonId={witness2?.id}
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

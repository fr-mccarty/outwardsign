"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/content-card"
import { Button } from "@/components/ui/button"
import { PeoplePicker } from "@/components/people-picker"
import { EventPicker } from "@/components/event-picker"
import { LocationPicker } from "@/components/location-picker"
import type { Person, Event, Location } from "@/lib/types"

export function PickersTestClient() {
  const [selectedPerson, setSelectedPerson] = useState<Person | null>(null)
  const [showPeoplePicker, setShowPeoplePicker] = useState(false)

  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null)
  const [showEventPicker, setShowEventPicker] = useState(false)

  const [selectedLocation, setSelectedLocation] = useState<Location | null>(null)
  const [showLocationPicker, setShowLocationPicker] = useState(false)

  const handlePersonSelect = (person: Person) => {
    setSelectedPerson(person)
    setShowPeoplePicker(false)
  }

  const handleEventSelect = (event: Event) => {
    setSelectedEvent(event)
    setShowEventPicker(false)
  }

  const handleLocationSelect = (location: Location) => {
    setSelectedLocation(location)
    setShowLocationPicker(false)
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>People Picker Test</CardTitle>
          <CardDescription>
            Test the People Picker component
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <h3 className="text-sm font-medium mb-2">Selected Person:</h3>
            {selectedPerson ? (
              <div className="p-4 border rounded-md bg-muted/50">
                <p className="font-semibold">
                  {selectedPerson.first_name} {selectedPerson.last_name}
                </p>
                {selectedPerson.email && (
                  <p className="text-sm text-muted-foreground">{selectedPerson.email}</p>
                )}
                {selectedPerson.phone_number && (
                  <p className="text-sm text-muted-foreground">{selectedPerson.phone_number}</p>
                )}
              </div>
            ) : (
              <p className="text-muted-foreground">No person selected yet</p>
            )}
          </div>

          <Button onClick={() => setShowPeoplePicker(true)}>
            Open People Picker
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Event Picker Test (with CorePicker)</CardTitle>
          <CardDescription>
            Test the refactored Event Picker with nested Location Picker
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <h3 className="text-sm font-medium mb-2">Selected Event:</h3>
            {selectedEvent ? (
              <div className="p-4 border rounded-md bg-muted/50">
                <p className="font-semibold">{selectedEvent.name}</p>
                {selectedEvent.start_date && (
                  <p className="text-sm text-muted-foreground">
                    {new Date(selectedEvent.start_date).toLocaleDateString()}
                    {selectedEvent.start_time && ` at ${selectedEvent.start_time}`}
                  </p>
                )}
              </div>
            ) : (
              <p className="text-muted-foreground">No event selected yet</p>
            )}
          </div>

          <Button onClick={() => setShowEventPicker(true)}>
            Open Event Picker
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Location Picker Test (with CorePicker)</CardTitle>
          <CardDescription>
            Test the refactored Location Picker
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <h3 className="text-sm font-medium mb-2">Selected Location:</h3>
            {selectedLocation ? (
              <div className="p-4 border rounded-md bg-muted/50">
                <p className="font-semibold">{selectedLocation.name}</p>
                {(selectedLocation.street || selectedLocation.city || selectedLocation.state) && (
                  <p className="text-sm text-muted-foreground">
                    {[selectedLocation.street, selectedLocation.city, selectedLocation.state].filter(Boolean).join(', ')}
                  </p>
                )}
              </div>
            ) : (
              <p className="text-muted-foreground">No location selected yet</p>
            )}
          </div>

          <Button onClick={() => setShowLocationPicker(true)}>
            Open Location Picker
          </Button>
        </CardContent>
      </Card>

      <PeoplePicker
        open={showPeoplePicker}
        onOpenChange={setShowPeoplePicker}
        onSelect={handlePersonSelect}
      />

      <EventPicker
        open={showEventPicker}
        onOpenChange={setShowEventPicker}
        onSelect={handleEventSelect}
        autoOpenCreateForm={true}
        defaultCreateFormData={{
          name: "Smith-Jones Wedding",
          timezone: "America/New_York"
        }}
      />

      <LocationPicker
        open={showLocationPicker}
        onOpenChange={setShowLocationPicker}
        onSelect={handleLocationSelect}
      />
    </div>
  )
}

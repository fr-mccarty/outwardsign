"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { PeoplePicker } from "@/components/people-picker"
import type { Person } from "@/lib/types"

export function PickersTestClient() {
  const [selectedPerson, setSelectedPerson] = useState<Person | null>(null)
  const [showPeoplePicker, setShowPeoplePicker] = useState(false)

  // Automatically open the people picker when the component mounts
  useEffect(() => {
    setShowPeoplePicker(true)
  }, [])

  const handlePersonSelect = (person: Person) => {
    setSelectedPerson(person)
    setShowPeoplePicker(false)
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>People Picker Test</CardTitle>
          <CardDescription>
            The People Picker should open automatically when this page loads
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

          <button
            onClick={() => setShowPeoplePicker(true)}
            className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90"
          >
            Open People Picker Again
          </button>
        </CardContent>
      </Card>

      <PeoplePicker
        open={showPeoplePicker}
        onOpenChange={setShowPeoplePicker}
        onSelect={handlePersonSelect}
        openToNewPerson={true}
      />
    </div>
  )
}

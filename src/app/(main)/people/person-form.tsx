"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { FormField } from "@/components/ui/form-field"
import Link from "next/link"
import { Save } from "lucide-react"
import { createPerson, updatePerson, type CreatePersonData } from "@/lib/actions/people"
import type { Person } from "@/lib/types"
import { useRouter } from "next/navigation"
import { toast } from 'sonner'

interface PersonFormProps {
  person?: Person
}

export function PersonForm({ person }: PersonFormProps) {
  const router = useRouter()
  const isEditing = !!person
  const [isLoading, setIsLoading] = useState(false)
  const [firstName, setFirstName] = useState(person?.first_name || "")
  const [lastName, setLastName] = useState(person?.last_name || "")
  const [phoneNumber, setPhoneNumber] = useState(person?.phone_number || "")
  const [email, setEmail] = useState(person?.email || "")
  const [street, setStreet] = useState(person?.street || "")
  const [city, setCity] = useState(person?.city || "")
  const [state, setState] = useState(person?.state || "")
  const [zipcode, setZipcode] = useState(person?.zipcode || "")
  const [notes, setNotes] = useState(person?.notes || "")

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      const personData: CreatePersonData = {
        first_name: firstName,
        last_name: lastName,
        phone_number: phoneNumber || undefined,
        email: email || undefined,
        street: street || undefined,
        city: city || undefined,
        state: state || undefined,
        zipcode: zipcode || undefined,
        notes: notes || undefined,
      }

      if (isEditing) {
        await updatePerson(person.id, personData)
        toast.success('Person updated successfully')
        router.push(`/people/${person.id}`)
      } else {
        const newPerson = await createPerson(personData)
        toast.success('Person created successfully!')
        router.push(`/people/${newPerson.id}`)
      }
    } catch (error) {
      console.error(`Failed to ${isEditing ? 'update' : 'create'} person:`, error)
      toast.error(`Failed to ${isEditing ? 'update' : 'create'} person. Please try again.`)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <FormField
          id="first_name"
          label="First Name"
          value={firstName}
          onChange={setFirstName}
          required
          placeholder="Enter first name"
        />

        <FormField
          id="last_name"
          label="Last Name"
          value={lastName}
          onChange={setLastName}
          required
          placeholder="Enter last name"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <FormField
          id="email"
          label="Email (Optional)"
          inputType="email"
          value={email}
          onChange={setEmail}
          placeholder="Enter email address"
        />

        <FormField
          id="phone_number"
          label="Phone Number (Optional)"
          inputType="tel"
          value={phoneNumber}
          onChange={setPhoneNumber}
          placeholder="Enter phone number"
        />
      </div>

      <FormField
        id="street"
        label="Street Address (Optional)"
        value={street}
        onChange={setStreet}
        placeholder="Enter street address"
      />

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <FormField
          id="city"
          label="City (Optional)"
          value={city}
          onChange={setCity}
          placeholder="Enter city"
        />

        <FormField
          id="state"
          label="State (Optional)"
          value={state}
          onChange={setState}
          placeholder="Enter state"
        />

        <FormField
          id="zipcode"
          label="Zip Code (Optional)"
          value={zipcode}
          onChange={setZipcode}
          placeholder="Enter zip code"
        />
      </div>

      <FormField
        id="notes"
        label="Notes (Optional)"
        inputType="textarea"
        value={notes}
        onChange={setNotes}
        placeholder="Enter any additional notes..."
        rows={4}
      />

      <div className="bg-muted/50 p-4 rounded-lg">
        <h3 className="font-medium mb-2">Person Guidelines</h3>
        <ul className="text-sm text-muted-foreground space-y-1">
          <li>• Enter complete names as they should appear in records</li>
          <li>• Provide contact information for easy communication</li>
          <li>• Include address details for mailings if applicable</li>
          <li>• Add any special notes or considerations</li>
        </ul>
      </div>

      <div className="flex gap-4">
        <Button type="submit" disabled={isLoading}>
          <Save className="h-4 w-4 mr-2" />
          {isLoading ? (isEditing ? "Saving..." : "Creating...") : (isEditing ? "Save Changes" : "Create Person")}
        </Button>
        <Button type="button" variant="outline" asChild>
          <Link href={isEditing ? `/people/${person.id}` : "/people"}>Cancel</Link>
        </Button>
      </div>
    </form>
  )
}

"use client"

import { useState, useEffect } from "react"
import { z } from "zod"
import { FormField } from "@/components/ui/form-field"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { FormBottomActions } from "@/components/form-bottom-actions"
import { createPerson, updatePerson, type CreatePersonData } from "@/lib/actions/people"
import type { Person } from "@/lib/types"
import { useRouter } from "next/navigation"
import { toast } from 'sonner'

// Zod validation schema
const personSchema = z.object({
  first_name: z.string().min(1, 'First name is required'),
  last_name: z.string().min(1, 'Last name is required'),
  phone_number: z.string().optional(),
  email: z.string().email('Invalid email address').optional().or(z.literal('')),
  street: z.string().optional(),
  city: z.string().optional(),
  state: z.string().optional(),
  zipcode: z.string().optional(),
  note: z.string().optional()
})

interface PersonFormProps {
  person?: Person
  formId?: string
  onLoadingChange?: (isLoading: boolean) => void
}

export function PersonForm({ person, formId = 'person-form', onLoadingChange }: PersonFormProps) {
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
  const [note, setNote] = useState(person?.note || "")

  // Sync loading state with parent wrapper
  useEffect(() => {
    if (onLoadingChange) {
      onLoadingChange(isLoading)
    }
  }, [isLoading, onLoadingChange])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      // Validate with Zod
      const personData = personSchema.parse({
        first_name: firstName,
        last_name: lastName,
        phone_number: phoneNumber || undefined,
        email: email || undefined,
        street: street || undefined,
        city: city || undefined,
        state: state || undefined,
        zipcode: zipcode || undefined,
        note: note || undefined,
      })

      if (isEditing) {
        await updatePerson(person.id, personData)
        toast.success('Person updated successfully')
        router.refresh() // Stay on edit page
      } else {
        const newPerson = await createPerson(personData)
        toast.success('Person created successfully!')
        router.push(`/people/${newPerson.id}/edit`)
      }
    } catch (error) {
      if (error instanceof z.ZodError) {
        toast.error(error.issues[0].message)
      } else {
        console.error(`Failed to ${isEditing ? 'update' : 'create'} person:`, error)
        toast.error(`Failed to ${isEditing ? 'update' : 'create'} person. Please try again.`)
      }
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <form id={formId} onSubmit={handleSubmit} className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Person Details</CardTitle>
          <CardDescription>Basic information and contact details</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
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
            id="note"
            label="Notes (Optional)"
            inputType="textarea"
            value={note}
            onChange={setNote}
            placeholder="Enter any additional notes..."
            rows={4}
          />
        </CardContent>
      </Card>

      <FormBottomActions
        isEditing={isEditing}
        isLoading={isLoading}
        cancelHref={isEditing ? `/people/${person.id}` : "/people"}
        saveLabel={isEditing ? "Save Person" : "Create Person"}
      />
    </form>
  )
}

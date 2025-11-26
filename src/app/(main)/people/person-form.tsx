"use client"

import { useState, useEffect } from "react"
import { z } from "zod"
import { FormInput } from "@/components/form-input"
import { FormSectionCard } from "@/components/form-section-card"
import { FormBottomActions } from "@/components/form-bottom-actions"
import { MassAttendanceSelector } from "@/components/mass-attendance-selector"
import { createPerson, updatePerson } from "@/lib/actions/people"
import type { Person } from "@/lib/types"
import { useRouter } from "next/navigation"
import { toast } from 'sonner'

// Zod validation schema
const personSchema = z.object({
  first_name: z.string().min(1, 'First name is required'),
  first_name_pronunciation: z.string().optional(),
  last_name: z.string().min(1, 'Last name is required'),
  last_name_pronunciation: z.string().optional(),
  phone_number: z.string().optional(),
  email: z.string().email('Invalid email address').optional().or(z.literal('')),
  street: z.string().optional(),
  city: z.string().optional(),
  state: z.string().optional(),
  zipcode: z.string().optional(),
  note: z.string().optional(),
  mass_times_template_item_ids: z.array(z.string()).optional()
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
  const [firstNamePronunciation, setFirstNamePronunciation] = useState(person?.first_name_pronunciation || "")
  const [lastName, setLastName] = useState(person?.last_name || "")
  const [lastNamePronunciation, setLastNamePronunciation] = useState(person?.last_name_pronunciation || "")
  const [phoneNumber, setPhoneNumber] = useState(person?.phone_number || "")
  const [email, setEmail] = useState(person?.email || "")
  const [street, setStreet] = useState(person?.street || "")
  const [city, setCity] = useState(person?.city || "")
  const [state, setState] = useState(person?.state || "")
  const [zipcode, setZipcode] = useState(person?.zipcode || "")
  const [note, setNote] = useState(person?.note || "")
  const [massTimeIds, setMassTimeIds] = useState<string[]>(person?.mass_times_template_item_ids || [])

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
        first_name_pronunciation: firstNamePronunciation || undefined,
        last_name: lastName,
        last_name_pronunciation: lastNamePronunciation || undefined,
        phone_number: phoneNumber || undefined,
        email: email || undefined,
        street: street || undefined,
        city: city || undefined,
        state: state || undefined,
        zipcode: zipcode || undefined,
        note: note || undefined,
        mass_times_template_item_ids: massTimeIds.length > 0 ? massTimeIds : undefined,
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
      <FormSectionCard
        title="Person Details"
        description="Basic information and contact details"
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <FormInput
            id="first_name"
            label="First Name"
            value={firstName}
            onChange={setFirstName}
            required
            placeholder="Enter first name"
          />

          <FormInput
            id="last_name"
            label="Last Name"
            value={lastName}
            onChange={setLastName}
            required
            placeholder="Enter last name"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <FormInput
            id="first_name_pronunciation"
            label="First Name Pronunciation (Optional)"
            value={firstNamePronunciation}
            onChange={setFirstNamePronunciation}
            placeholder="How to pronounce first name"
          />

          <FormInput
            id="last_name_pronunciation"
            label="Last Name Pronunciation (Optional)"
            value={lastNamePronunciation}
            onChange={setLastNamePronunciation}
            placeholder="How to pronounce last name"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <FormInput
            id="email"
            label="Email (Optional)"
            inputType="email"
            value={email}
            onChange={setEmail}
            placeholder="Enter email address"
          />

          <FormInput
            id="phone_number"
            label="Phone Number (Optional)"
            inputType="tel"
            value={phoneNumber}
            onChange={setPhoneNumber}
            placeholder="Enter phone number"
          />
        </div>

        <FormInput
          id="street"
          label="Street Address (Optional)"
          value={street}
          onChange={setStreet}
          placeholder="Enter street address"
        />

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <FormInput
            id="city"
            label="City (Optional)"
            value={city}
            onChange={setCity}
            placeholder="Enter city"
          />

          <FormInput
            id="state"
            label="State (Optional)"
            value={state}
            onChange={setState}
            placeholder="Enter state"
          />

          <FormInput
            id="zipcode"
            label="Zip Code (Optional)"
            value={zipcode}
            onChange={setZipcode}
            placeholder="Enter zip code"
          />
        </div>

        <FormInput
          id="note"
          label="Notes (Optional)"
          inputType="textarea"
          value={note}
          onChange={setNote}
          placeholder="Enter any additional notes..."
          rows={4}
        />
      </FormSectionCard>

      <FormSectionCard
        title="Mass Attendance"
        description="Select which masses this person typically attends"
      >
        <MassAttendanceSelector
          selectedIds={massTimeIds}
          onChange={setMassTimeIds}
          disabled={isLoading}
        />
      </FormSectionCard>

      <FormBottomActions
        isEditing={isEditing}
        isLoading={isLoading}
        cancelHref={isEditing ? `/people/${person.id}` : "/people"}
        moduleName="Person"
      />
    </form>
  )
}

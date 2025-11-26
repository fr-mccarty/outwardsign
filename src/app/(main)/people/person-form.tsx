"use client"

import { useEffect } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { FormInput } from "@/components/form-input"
import { FormSectionCard } from "@/components/form-section-card"
import { FormBottomActions } from "@/components/form-bottom-actions"
import { MassAttendanceSelector } from "@/components/mass-attendance-selector"
import { createPerson, updatePerson } from "@/lib/actions/people"
import type { Person } from "@/lib/types"
import { useRouter } from "next/navigation"
import { toast } from 'sonner'
import { createPersonSchema, type CreatePersonData } from "@/lib/schemas/people"

interface PersonFormProps {
  person?: Person
  formId?: string
  onLoadingChange?: (isLoading: boolean) => void
}

export function PersonForm({ person, formId = 'person-form', onLoadingChange }: PersonFormProps) {
  const router = useRouter()
  const isEditing = !!person

  const {
    handleSubmit,
    formState: { errors, isSubmitting },
    setValue,
    watch,
  } = useForm<CreatePersonData>({
    resolver: zodResolver(createPersonSchema),
    defaultValues: {
      first_name: person?.first_name || "",
      first_name_pronunciation: person?.first_name_pronunciation || "",
      last_name: person?.last_name || "",
      last_name_pronunciation: person?.last_name_pronunciation || "",
      phone_number: person?.phone_number || "",
      email: person?.email || "",
      street: person?.street || "",
      city: person?.city || "",
      state: person?.state || "",
      zipcode: person?.zipcode || "",
      note: person?.note || "",
      mass_times_template_item_ids: person?.mass_times_template_item_ids || [],
    },
  })

  // Watch form values
  const firstName = watch("first_name")
  const firstNamePronunciation = watch("first_name_pronunciation")
  const lastName = watch("last_name")
  const lastNamePronunciation = watch("last_name_pronunciation")
  const phoneNumber = watch("phone_number")
  const email = watch("email")
  const street = watch("street")
  const city = watch("city")
  const state = watch("state")
  const zipcode = watch("zipcode")
  const note = watch("note")
  const massTimeIds = watch("mass_times_template_item_ids")

  // Sync loading state with parent wrapper
  useEffect(() => {
    if (onLoadingChange) {
      onLoadingChange(isSubmitting)
    }
  }, [isSubmitting, onLoadingChange])

  const onSubmit = async (data: CreatePersonData) => {
    try {
      // Convert empty strings to undefined
      const personData = {
        ...data,
        first_name_pronunciation: data.first_name_pronunciation || undefined,
        last_name_pronunciation: data.last_name_pronunciation || undefined,
        phone_number: data.phone_number || undefined,
        email: data.email || undefined,
        street: data.street || undefined,
        city: data.city || undefined,
        state: data.state || undefined,
        zipcode: data.zipcode || undefined,
        note: data.note || undefined,
        mass_times_template_item_ids: data.mass_times_template_item_ids && data.mass_times_template_item_ids.length > 0 ? data.mass_times_template_item_ids : undefined,
      }

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
      console.error(`Failed to ${isEditing ? 'update' : 'create'} person:`, error)
      toast.error(`Failed to ${isEditing ? 'update' : 'create'} person. Please try again.`)
    }
  }

  return (
    <form id={formId} onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <FormSectionCard
        title="Person Details"
        description="Basic information and contact details"
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <FormInput
            id="first_name"
            label="First Name"
            value={firstName}
            onChange={(value) => setValue("first_name", value)}
            required
            placeholder="Enter first name"
            error={errors.first_name?.message}
          />

          <FormInput
            id="last_name"
            label="Last Name"
            value={lastName}
            onChange={(value) => setValue("last_name", value)}
            required
            placeholder="Enter last name"
            error={errors.last_name?.message}
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <FormInput
            id="first_name_pronunciation"
            label="First Name Pronunciation (Optional)"
            value={firstNamePronunciation || ""}
            onChange={(value) => setValue("first_name_pronunciation", value)}
            placeholder="How to pronounce first name"
            error={errors.first_name_pronunciation?.message}
          />

          <FormInput
            id="last_name_pronunciation"
            label="Last Name Pronunciation (Optional)"
            value={lastNamePronunciation || ""}
            onChange={(value) => setValue("last_name_pronunciation", value)}
            placeholder="How to pronounce last name"
            error={errors.last_name_pronunciation?.message}
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <FormInput
            id="email"
            label="Email (Optional)"
            inputType="email"
            value={email || ""}
            onChange={(value) => setValue("email", value)}
            placeholder="Enter email address"
            error={errors.email?.message}
          />

          <FormInput
            id="phone_number"
            label="Phone Number (Optional)"
            inputType="tel"
            value={phoneNumber || ""}
            onChange={(value) => setValue("phone_number", value)}
            placeholder="Enter phone number"
            error={errors.phone_number?.message}
          />
        </div>

        <FormInput
          id="street"
          label="Street Address (Optional)"
          value={street || ""}
          onChange={(value) => setValue("street", value)}
          placeholder="Enter street address"
          error={errors.street?.message}
        />

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <FormInput
            id="city"
            label="City (Optional)"
            value={city || ""}
            onChange={(value) => setValue("city", value)}
            placeholder="Enter city"
            error={errors.city?.message}
          />

          <FormInput
            id="state"
            label="State (Optional)"
            value={state || ""}
            onChange={(value) => setValue("state", value)}
            placeholder="Enter state"
            error={errors.state?.message}
          />

          <FormInput
            id="zipcode"
            label="Zip Code (Optional)"
            value={zipcode || ""}
            onChange={(value) => setValue("zipcode", value)}
            placeholder="Enter zip code"
            error={errors.zipcode?.message}
          />
        </div>

        <FormInput
          id="note"
          label="Notes (Optional)"
          inputType="textarea"
          value={note || ""}
          onChange={(value) => setValue("note", value)}
          placeholder="Enter any additional notes..."
          rows={4}
          error={errors.note?.message}
        />
      </FormSectionCard>

      <FormSectionCard
        title="Mass Attendance"
        description="Select which masses this person typically attends"
      >
        <MassAttendanceSelector
          selectedIds={massTimeIds || []}
          onChange={(ids) => setValue("mass_times_template_item_ids", ids)}
          disabled={isSubmitting}
        />
      </FormSectionCard>

      <FormBottomActions
        isEditing={isEditing}
        isLoading={isSubmitting}
        cancelHref={isEditing ? `/people/${person.id}` : "/people"}
        moduleName="Person"
      />
    </form>
  )
}

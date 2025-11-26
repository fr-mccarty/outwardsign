"use client"

import { useState, useEffect } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { FormInput } from "@/components/form-input"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import { FormSectionCard } from "@/components/form-section-card"
import { FormBottomActions } from "@/components/form-bottom-actions"
import { createReading, updateReading, type Reading } from "@/lib/actions/readings"
import { READING_CATEGORIES, READING_CATEGORY_LABELS, LITURGICAL_LANGUAGE_VALUES, type LiturgicalLanguage, LITURGICAL_LANGUAGE_LABELS } from "@/lib/constants"
import { useRouter } from "next/navigation"
import { toast } from 'sonner'
import { createReadingSchema, type CreateReadingData } from "@/lib/schemas/readings"

interface ReadingFormProps {
  reading?: Reading
  formId?: string
  onLoadingChange?: (isLoading: boolean) => void
}

export function ReadingForm({ reading, formId = 'reading-form', onLoadingChange }: ReadingFormProps) {
  const router = useRouter()
  const isEditing = !!reading

  // Initialize React Hook Form with Zod validation
  const {
    handleSubmit,
    formState: { errors, isSubmitting },
    setValue,
    watch,
  } = useForm<CreateReadingData>({
    resolver: zodResolver(createReadingSchema),
    defaultValues: {
      pericope: reading?.pericope || "",
      text: reading?.text || "",
      introduction: reading?.introduction || undefined,
      conclusion: reading?.conclusion || undefined,
      categories: reading?.categories || [],
      language: reading?.language || "en",
    },
  })

  // Watch form values for controlled components
  const pericope = watch("pericope")
  const text = watch("text")
  const introduction = watch("introduction")
  const conclusion = watch("conclusion")
  const language = watch("language")

  // Track selected categories separately for checkbox UI
  const [selectedCategories, setSelectedCategories] = useState<string[]>(reading?.categories || [])

  // Sync categories state with form
  useEffect(() => {
    setValue("categories", selectedCategories)
  }, [selectedCategories, setValue])

  // Sync loading state with parent wrapper
  useEffect(() => {
    if (onLoadingChange) {
      onLoadingChange(isSubmitting)
    }
  }, [isSubmitting, onLoadingChange])

  const onSubmit = async (data: CreateReadingData) => {
    try {
      if (isEditing) {
        await updateReading(reading.id, data)
        toast.success('Reading updated successfully')
        router.refresh() // Stay on edit page
      } else {
        const newReading = await createReading(data)
        toast.success('Reading created successfully!')
        router.push(`/readings/${newReading.id}/edit`)
      }
    } catch (error) {
      console.error(`Failed to ${isEditing ? 'update' : 'create'} reading:`, error)
      toast.error(`Failed to ${isEditing ? 'update' : 'create'} reading. Please try again.`)
    }
  }

  const handleCategoryToggle = (category: string) => {
    setSelectedCategories(prev =>
      prev.includes(category)
        ? prev.filter(c => c !== category)
        : [...prev, category]
    )
  }

  return (
    <form id={formId} onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <FormSectionCard
        title="Reading Details"
        description="Scripture reading or liturgical text information"
      >
        <FormInput
          id="pericope"
          label="Pericope"
          value={pericope}
          onChange={(value) => setValue("pericope", value)}
          required
          placeholder="e.g., Matthew 5:1-12, Genesis 1:1-2:4"
          description="The scripture reference or title of the reading"
          error={errors.pericope?.message}
        />

        <FormInput
          id="language"
          label="Language"
          inputType="select"
          value={language || "en"}
          onChange={(value) => setValue("language", value as LiturgicalLanguage)}
          options={LITURGICAL_LANGUAGE_VALUES.map((lang) => ({
            value: lang,
            label: LITURGICAL_LANGUAGE_LABELS[lang].en
          }))}
          error={errors.language?.message}
        />

        <FormInput
          id="introduction"
          label="Introduction (Optional)"
          inputType="textarea"
          value={introduction || ""}
          onChange={(value) => setValue("introduction", value || undefined)}
          placeholder="Optional introduction text read before the main reading..."
          rows={3}
          description="Text read before the main reading (e.g., &quot;A reading from the Book of Genesis&quot;)"
          error={errors.introduction?.message}
        />

        <FormInput
          id="text"
          label="Reading Text"
          inputType="textarea"
          value={text}
          onChange={(value) => setValue("text", value)}
          placeholder="Enter the full text of the reading..."
          rows={12}
          required
          description="The complete text of the scripture reading or liturgical text"
          error={errors.text?.message}
        />

        <FormInput
          id="conclusion"
          label="Conclusion (Optional)"
          inputType="textarea"
          value={conclusion || ""}
          onChange={(value) => setValue("conclusion", value || undefined)}
          placeholder="Optional conclusion text read after the main reading..."
          rows={2}
          description="Text read after the main reading (e.g., &quot;The Word of the Lord&quot;)"
          error={errors.conclusion?.message}
        />

        <div className="space-y-3">
          <Label>Categories</Label>
          <p className="text-sm text-muted-foreground mb-2">
            Select one or more categories for this reading
          </p>
          <div className="space-y-2">
            {READING_CATEGORIES.map((category) => (
              <div key={category} className="flex items-center space-x-2">
                <Checkbox
                  id={`category-${category}`}
                  checked={selectedCategories.includes(category)}
                  onCheckedChange={() => handleCategoryToggle(category)}
                />
                <label
                  htmlFor={`category-${category}`}
                  className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
                >
                  {READING_CATEGORY_LABELS[category]?.en || category}
                </label>
              </div>
            ))}
          </div>
        </div>
      </FormSectionCard>

      <FormBottomActions
        isEditing={isEditing}
        isLoading={isSubmitting}
        cancelHref={isEditing ? `/readings/${reading.id}` : "/readings"}
        moduleName="Reading"
      />
    </form>
  )
}

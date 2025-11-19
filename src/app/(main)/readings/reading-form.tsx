"use client"

import { useState, useEffect } from "react"
import { z } from "zod"
import { FormField } from "@/components/ui/form-field"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import { FormSectionCard } from "@/components/form-section-card"
import { FormBottomActions } from "@/components/form-bottom-actions"
import { createReading, updateReading, type Reading } from "@/lib/actions/readings"
import { READING_CATEGORIES, READING_CATEGORY_LABELS, LANGUAGE_VALUES, type Language, LANGUAGE_LABELS } from "@/lib/constants"
import { useRouter } from "next/navigation"
import { toast } from 'sonner'

// Zod validation schema
const readingSchema = z.object({
  pericope: z.string().min(1, 'Pericope is required'),
  text: z.string().min(1, 'Reading text is required'),
  introduction: z.string().optional(),
  conclusion: z.string().optional(),
  categories: z.array(z.string()),
  language: z.enum(LANGUAGE_VALUES).optional()
})

interface ReadingFormProps {
  reading?: Reading
  formId?: string
  onLoadingChange?: (isLoading: boolean) => void
}

export function ReadingForm({ reading, formId = 'reading-form', onLoadingChange }: ReadingFormProps) {
  const router = useRouter()
  const isEditing = !!reading
  const [isLoading, setIsLoading] = useState(false)
  const [selectedCategories, setSelectedCategories] = useState<string[]>(reading?.categories || [])
  const [pericope, setPericope] = useState(reading?.pericope || "")
  const [text, setText] = useState(reading?.text || "")
  const [introduction, setIntroduction] = useState(reading?.introduction || "")
  const [conclusion, setConclusion] = useState(reading?.conclusion || "")
  const [language, setLanguage] = useState<Language>(reading?.language || "ENGLISH")

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
      const readingData = readingSchema.parse({
        pericope,
        text,
        introduction: introduction || undefined,
        conclusion: conclusion || undefined,
        categories: selectedCategories,
        language: language || undefined
      })

      if (isEditing) {
        await updateReading(reading.id, readingData)
        toast.success('Reading updated successfully')
        router.refresh() // Stay on edit page
      } else {
        const newReading = await createReading(readingData)
        toast.success('Reading created successfully!')
        router.push(`/readings/${newReading.id}/edit`)
      }
    } catch (error) {
      if (error instanceof z.ZodError) {
        toast.error(error.issues[0].message)
      } else {
        console.error(`Failed to ${isEditing ? 'update' : 'create'} reading:`, error)
        toast.error(`Failed to ${isEditing ? 'update' : 'create'} reading. Please try again.`)
      }
    } finally {
      setIsLoading(false)
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
    <form id={formId} onSubmit={handleSubmit} className="space-y-6">
      <FormSectionCard
        title="Reading Details"
        description="Scripture reading or liturgical text information"
      >
        <FormField
          id="pericope"
          label="Pericope"
          value={pericope}
          onChange={setPericope}
          required
          placeholder="e.g., Matthew 5:1-12, Genesis 1:1-2:4"
          description="The scripture reference or title of the reading"
        />

        <FormField
          id="language"
          label="Language"
          inputType="select"
          value={language}
          onChange={(value) => setLanguage(value as Language)}
          options={LANGUAGE_VALUES.map((lang) => ({
            value: lang,
            label: LANGUAGE_LABELS[lang].en
          }))}
        />

        <FormField
          id="introduction"
          label="Introduction (Optional)"
          inputType="textarea"
          value={introduction}
          onChange={setIntroduction}
          placeholder="Optional introduction text read before the main reading..."
          rows={3}
          description="Text read before the main reading (e.g., &quot;A reading from the Book of Genesis&quot;)"
        />

        <FormField
          id="text"
          label="Reading Text"
          inputType="textarea"
          value={text}
          onChange={setText}
          placeholder="Enter the full text of the reading..."
          rows={12}
          required
          description="The complete text of the scripture reading or liturgical text"
        />

        <FormField
          id="conclusion"
          label="Conclusion (Optional)"
          inputType="textarea"
          value={conclusion}
          onChange={setConclusion}
          placeholder="Optional conclusion text read after the main reading..."
          rows={2}
          description="Text read after the main reading (e.g., &quot;The Word of the Lord&quot;)"
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
        isLoading={isLoading}
        cancelHref={isEditing ? `/readings/${reading.id}` : "/readings"}
        moduleName="Reading"
      />
    </form>
  )
}

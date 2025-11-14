"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { FormField } from "@/components/ui/form-field"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import Link from "next/link"
import { Save } from "lucide-react"
import { createReading, updateReading, type CreateReadingData, type Reading } from "@/lib/actions/readings"
import { READING_CATEGORIES, READING_CATEGORY_LABELS, LANGUAGE_VALUES, LANGUAGE_LABELS } from "@/lib/constants"
import { useRouter } from "next/navigation"
import { toast } from 'sonner'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

interface ReadingFormProps {
  reading?: Reading
}

export function ReadingForm({ reading }: ReadingFormProps) {
  const router = useRouter()
  const isEditing = !!reading
  const [isLoading, setIsLoading] = useState(false)
  const [selectedCategories, setSelectedCategories] = useState<string[]>(reading?.categories || [])
  const [pericope, setPericope] = useState(reading?.pericope || "")
  const [text, setText] = useState(reading?.text || "")
  const [introduction, setIntroduction] = useState(reading?.introduction || "")
  const [conclusion, setConclusion] = useState(reading?.conclusion || "")
  const [language, setLanguage] = useState(reading?.language || "")

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      const readingData: CreateReadingData = {
        pericope,
        text,
        introduction,
        conclusion,
        categories: selectedCategories,
        language
      }

      if (isEditing) {
        await updateReading(reading.id, readingData)
        toast.success('Reading updated successfully')
        router.push(`/readings/${reading.id}`)
      } else {
        const newReading = await createReading(readingData)
        toast.success('Reading created successfully!')
        router.push(`/readings/${newReading.id}`)
      }
    } catch (error) {
      console.error(`Failed to ${isEditing ? 'update' : 'create'} reading:`, error)
      toast.error(`Failed to ${isEditing ? 'update' : 'create'} reading. Please try again.`)
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
    <form onSubmit={handleSubmit} className="space-y-6">
      <FormField
        id="pericope"
        label="Pericope"
        value={pericope}
        onChange={setPericope}
        required
        placeholder="e.g., Matthew 5:1-12, Genesis 1:1-2:4"
        description="The scripture reference or title of the reading"
      />

      <div className="space-y-2">
        <Label htmlFor="language">Language</Label>
        <Select value={language} onValueChange={setLanguage}>
          <SelectTrigger id="language">
            <SelectValue placeholder="Select a language" />
          </SelectTrigger>
          <SelectContent>
            {LANGUAGE_VALUES.map(lang => (
              <SelectItem key={lang} value={lang}>
                {LANGUAGE_LABELS[lang].en}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

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

      <div className="bg-muted/50 p-4 rounded-lg">
        <h3 className="font-medium mb-2">Reading Guidelines</h3>
        <ul className="text-sm text-muted-foreground space-y-1">
          <li>• Use standard biblical references for the pericope (e.g., &quot;John 3:16-21&quot;)</li>
          <li>• Introduction typically includes the source (e.g., &quot;A reading from the Book of Genesis&quot;)</li>
          <li>• Include paragraph breaks and formatting in the main text as needed</li>
          <li>• Conclusion usually includes response cues (e.g., &quot;The Word of the Lord&quot;)</li>
          <li>• Categories help organize readings by type, season, or occasion</li>
        </ul>
      </div>

      <div className="flex gap-4">
        <Button type="submit" disabled={isLoading}>
          <Save className="h-4 w-4 mr-2" />
          {isLoading ? (isEditing ? "Saving..." : "Creating...") : (isEditing ? "Save Changes" : "Create Reading")}
        </Button>
        <Button type="button" variant="outline" asChild>
          <Link href={isEditing ? `/readings/${reading.id}` : "/readings"}>Cancel</Link>
        </Button>
      </div>
    </form>
  )
}

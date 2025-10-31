"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { FormField } from "@/components/ui/form-field"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import Link from "next/link"
import { Save } from "lucide-react"
import { createPresentation, updatePresentation, type CreatePresentationData } from "@/lib/actions/presentations"
import type { Presentation } from "@/lib/types"
import { useRouter } from "next/navigation"
import { toast } from 'sonner'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

interface PresentationFormProps {
  presentation?: Presentation
}

export function PresentationForm({ presentation }: PresentationFormProps) {
  const router = useRouter()
  const isEditing = !!presentation
  const [isLoading, setIsLoading] = useState(false)
  const [childName, setChildName] = useState(presentation?.child_name || "")
  const [childSex, setChildSex] = useState<'Male' | 'Female'>(presentation?.child_sex || 'Male')
  const [motherName, setMotherName] = useState(presentation?.mother_name || "")
  const [fatherName, setFatherName] = useState(presentation?.father_name || "")
  const [godparentsNames, setGodparentsNames] = useState(presentation?.godparents_names || "")
  const [isBaptized, setIsBaptized] = useState(presentation?.is_baptized || false)
  const [language, setLanguage] = useState<'English' | 'Spanish'>(presentation?.language || 'English')
  const [notes, setNotes] = useState(presentation?.notes || "")

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      const presentationData: CreatePresentationData = {
        child_name: childName,
        child_sex: childSex,
        mother_name: motherName,
        father_name: fatherName,
        godparents_names: godparentsNames || undefined,
        is_baptized: isBaptized,
        language: language,
        notes: notes || undefined,
      }

      if (isEditing) {
        await updatePresentation(presentation.id, presentationData)
        toast.success('Presentation updated successfully')
        router.push(`/presentations/${presentation.id}`)
      } else {
        const newPresentation = await createPresentation(presentationData)
        toast.success('Presentation created successfully!')
        router.push(`/presentations/${newPresentation.id}`)
      }
    } catch (error) {
      console.error(`Failed to ${isEditing ? 'update' : 'create'} presentation:`, error)
      toast.error(`Failed to ${isEditing ? 'update' : 'create'} presentation. Please try again.`)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <FormField
          id="child_name"
          label="Child Name"
          value={childName}
          onChange={setChildName}
          required
          placeholder="Enter child's full name"
        />

        <div className="space-y-2">
          <Label htmlFor="child_sex">Child Sex</Label>
          <Select value={childSex} onValueChange={(value) => setChildSex(value as 'Male' | 'Female')}>
            <SelectTrigger id="child_sex">
              <SelectValue placeholder="Select sex" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Male">Male</SelectItem>
              <SelectItem value="Female">Female</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <FormField
          id="mother_name"
          label="Mother Name"
          value={motherName}
          onChange={setMotherName}
          required
          placeholder="Enter mother's full name"
        />

        <FormField
          id="father_name"
          label="Father Name"
          value={fatherName}
          onChange={setFatherName}
          required
          placeholder="Enter father's full name"
        />
      </div>

      <FormField
        id="godparents_names"
        label="Godparents Names (Optional)"
        value={godparentsNames}
        onChange={setGodparentsNames}
        placeholder="Enter godparents' names"
        description="Names of the godparents, if any"
      />

      <div className="space-y-2">
        <Label htmlFor="language">Language</Label>
        <Select value={language} onValueChange={(value) => setLanguage(value as 'English' | 'Spanish')}>
          <SelectTrigger id="language">
            <SelectValue placeholder="Select language" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="English">English</SelectItem>
            <SelectItem value="Spanish">Spanish</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="flex items-center space-x-2">
        <Checkbox
          id="is_baptized"
          checked={isBaptized}
          onCheckedChange={(checked) => setIsBaptized(checked as boolean)}
        />
        <label
          htmlFor="is_baptized"
          className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
        >
          Child is baptized
        </label>
      </div>

      <FormField
        id="notes"
        label="Notes (Optional)"
        inputType="textarea"
        value={notes}
        onChange={setNotes}
        placeholder="Enter any additional notes..."
        rows={4}
        description="Additional information or special considerations"
      />

      <div className="bg-muted/50 p-4 rounded-lg">
        <h3 className="font-medium mb-2">Presentation Guidelines</h3>
        <ul className="text-sm text-muted-foreground space-y-1">
          <li>• Enter complete names as they should appear in records</li>
          <li>• Indicate whether the child has been baptized</li>
          <li>• Include godparents' names if applicable</li>
          <li>• Select the appropriate language for the ceremony</li>
          <li>• Add any special notes or considerations in the notes field</li>
        </ul>
      </div>

      <div className="flex gap-4">
        <Button type="submit" disabled={isLoading}>
          <Save className="h-4 w-4 mr-2" />
          {isLoading ? (isEditing ? "Saving..." : "Creating...") : (isEditing ? "Save Changes" : "Create Presentation")}
        </Button>
        <Button type="button" variant="outline" asChild>
          <Link href={isEditing ? `/presentations/${presentation.id}` : "/presentations"}>Cancel</Link>
        </Button>
      </div>
    </form>
  )
}

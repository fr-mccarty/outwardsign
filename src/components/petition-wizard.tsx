"use client"

import { useState, useEffect } from 'react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { Loader2, Sparkles, Plus, Trash2 } from 'lucide-react'
import { toast } from 'sonner'
import { generatePetitions, type GeneratedPetition } from '@/lib/actions/generate-petitions'
import { getPetitionTemplates, type PetitionContextTemplate } from '@/lib/actions/petition-templates'
import { parsePetitions, formatPetitionsForStorage, type Petition } from '@/lib/utils/petition-parser'
import { Checkbox } from '@/components/ui/checkbox'

interface PetitionWizardProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onApply: (petitionsText: string) => void
  currentPetitions?: string
  contextNames?: string[] // Names from the event (e.g., bride, groom)
  occasion?: string // e.g., "Wedding", "Funeral", "Baptism"
}

export function PetitionWizard({
  open,
  onOpenChange,
  onApply,
  currentPetitions = '',
  contextNames = [],
  occasion = '',
}: PetitionWizardProps) {
  const [templates, setTemplates] = useState<PetitionContextTemplate[]>([])
  const [selectedTemplateId, setSelectedTemplateId] = useState<string>('')
  const [additionalContext, setAdditionalContext] = useState('')
  const [loading, setLoading] = useState(false)
  const [generatedPetitions, setGeneratedPetitions] = useState<Petition[]>([])
  const [selectedPetitions, setSelectedPetitions] = useState<Set<string>>(new Set())
  const [replaceExisting, setReplaceExisting] = useState(false)

  // Load templates
  useEffect(() => {
    if (open) {
      loadTemplates()
    }
  }, [open])

  const loadTemplates = async () => {
    try {
      const data = await getPetitionTemplates()
      setTemplates(data)

      // Auto-select matching template if possible
      if (occasion && data.length > 0) {
        const matchingTemplate = data.find(t =>
          t.title.toLowerCase().includes(occasion.toLowerCase())
        )
        if (matchingTemplate) {
          setSelectedTemplateId(matchingTemplate.id)
        }
      }
    } catch (error) {
      console.error('Failed to load templates:', error)
      toast.error('Failed to load petition templates')
    }
  }

  const handleGenerate = async () => {
    if (!selectedTemplateId) {
      toast.error('Please select a template')
      return
    }

    const template = templates.find(t => t.id === selectedTemplateId)
    if (!template) {
      toast.error('Template not found')
      return
    }

    setLoading(true)
    try {
      const generated = await generatePetitions({
        templateText: template.context,
        context: {
          names: contextNames,
          occasion,
          additionalContext,
        },
        count: 5,
      })

      const petitions: Petition[] = generated.map(g => ({
        id: crypto.randomUUID(),
        text: g.text,
      }))

      setGeneratedPetitions(petitions)
      // Auto-select all generated petitions
      setSelectedPetitions(new Set(petitions.map(p => p.id)))
      toast.success(`Generated ${petitions.length} petitions`)
    } catch (error) {
      console.error('Failed to generate petitions:', error)
      toast.error('Failed to generate petitions. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const togglePetitionSelection = (id: string) => {
    const newSelected = new Set(selectedPetitions)
    if (newSelected.has(id)) {
      newSelected.delete(id)
    } else {
      newSelected.add(id)
    }
    setSelectedPetitions(newSelected)
  }

  const handleApply = () => {
    const selectedPetitionsList = generatedPetitions.filter(p =>
      selectedPetitions.has(p.id)
    )

    if (selectedPetitionsList.length === 0) {
      toast.error('Please select at least one petition')
      return
    }

    let finalPetitions: Petition[]

    if (replaceExisting) {
      finalPetitions = selectedPetitionsList
    } else {
      // Merge with existing petitions
      const existingPetitions = parsePetitions(currentPetitions)
      finalPetitions = [...existingPetitions, ...selectedPetitionsList]
    }

    const petitionsText = formatPetitionsForStorage(finalPetitions)
    onApply(petitionsText)
    toast.success(
      replaceExisting
        ? 'Petitions replaced successfully'
        : 'Petitions added successfully'
    )
    handleClose()
  }

  const handleClose = () => {
    setSelectedTemplateId('')
    setAdditionalContext('')
    setGeneratedPetitions([])
    setSelectedPetitions(new Set())
    setReplaceExisting(false)
    onOpenChange(false)
  }

  const removePetition = (id: string) => {
    setGeneratedPetitions(prev => prev.filter(p => p.id !== id))
    setSelectedPetitions(prev => {
      const newSet = new Set(prev)
      newSet.delete(id)
      return newSet
    })
  }

  const selectedTemplate = templates.find(t => t.id === selectedTemplateId)

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-3xl max-h-[85vh] flex flex-col">
        <DialogHeader className="flex-shrink-0">
          <DialogTitle className="flex items-center gap-2">
            <Sparkles className="h-5 w-5" />
            Petition Wizard
          </DialogTitle>
          <DialogDescription>
            Use AI to generate petitions based on a template. You can customize and select which
            ones to use.
          </DialogDescription>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto -mx-6 px-6">
          <div className="space-y-4 py-1">
          {/* Template Selection */}
          <div className="space-y-2">
            <Label>Select Template</Label>
            <Select value={selectedTemplateId} onValueChange={setSelectedTemplateId}>
              <SelectTrigger>
                <SelectValue placeholder="Choose a petition template..." />
              </SelectTrigger>
              <SelectContent>
                {templates.map(template => (
                  <SelectItem key={template.id} value={template.id}>
                    {template.title}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {selectedTemplate && selectedTemplate.description && (
              <p className="text-sm text-muted-foreground">{selectedTemplate.description}</p>
            )}
          </div>

          {/* Context Information */}
          {(contextNames.length > 0 || occasion) && (
            <div className="bg-muted p-3 rounded-md space-y-1">
              {occasion && (
                <p className="text-sm">
                  <span className="font-medium">Occasion:</span> {occasion}
                </p>
              )}
              {contextNames.length > 0 && (
                <p className="text-sm">
                  <span className="font-medium">Names:</span> {contextNames.join(', ')}
                </p>
              )}
            </div>
          )}

          {/* Additional Context */}
          <div className="space-y-2">
            <Label htmlFor="additional-context">Additional Context (Optional)</Label>
            <Textarea
              id="additional-context"
              value={additionalContext}
              onChange={e => setAdditionalContext(e.target.value)}
              placeholder="Add any specific details you'd like included in the petitions..."
              rows={2}
            />
          </div>

          {/* Generate Button */}
          <Button
            onClick={handleGenerate}
            disabled={loading || !selectedTemplateId}
            className="w-full"
          >
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Generating...
              </>
            ) : (
              <>
                <Sparkles className="mr-2 h-4 w-4" />
                Generate Petitions
              </>
            )}
          </Button>

          {/* Generated Petitions */}
          {generatedPetitions.length > 0 && (
            <div className="space-y-3 border rounded-lg p-4">
              <div className="flex items-center justify-between">
                <Label>Generated Petitions (select to include)</Label>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    if (selectedPetitions.size === generatedPetitions.length) {
                      setSelectedPetitions(new Set())
                    } else {
                      setSelectedPetitions(new Set(generatedPetitions.map(p => p.id)))
                    }
                  }}
                >
                  {selectedPetitions.size === generatedPetitions.length
                    ? 'Deselect All'
                    : 'Select All'}
                </Button>
              </div>
              <div className="space-y-3 max-h-64 overflow-y-auto">
                {generatedPetitions.map(petition => (
                  <div
                    key={petition.id}
                    className="flex items-start gap-3 p-3 border rounded-md hover:bg-muted transition-colors"
                  >
                    <Checkbox
                      checked={selectedPetitions.has(petition.id)}
                      onCheckedChange={() => togglePetitionSelection(petition.id)}
                      className="mt-1"
                    />
                    <p className="flex-1 text-sm">{petition.text}</p>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => removePetition(petition.id)}
                      className="text-destructive hover:text-destructive"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>

              {/* Replace existing option */}
              <div className="flex items-center space-x-2 pt-2 border-t">
                <Checkbox
                  id="replace-existing"
                  checked={replaceExisting}
                  onCheckedChange={checked => setReplaceExisting(checked as boolean)}
                />
                <label
                  htmlFor="replace-existing"
                  className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
                >
                  Replace existing petitions (instead of adding to them)
                </label>
              </div>
            </div>
          )}
          </div>
        </div>

        <DialogFooter className="flex-shrink-0">
          <Button variant="outline" onClick={handleClose}>
            Cancel
          </Button>
          <Button
            onClick={handleApply}
            disabled={generatedPetitions.length === 0 || selectedPetitions.size === 0}
          >
            <Plus className="mr-2 h-4 w-4" />
            Apply Selected ({selectedPetitions.size})
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

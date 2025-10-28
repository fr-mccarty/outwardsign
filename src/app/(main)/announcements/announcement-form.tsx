'use client'

import { useState, useEffect } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Save, X, Calendar, FileText, Sparkles, Wand2 } from "lucide-react"
import { 
  createAnnouncement, 
  updateAnnouncement, 
  getLiturgicalEvents,
  getAnnouncementTemplates,
  Announcement,
  AnnouncementTemplate 
} from '@/lib/actions/announcements'
import { generateAnnouncementWithAI } from '@/lib/actions/ai-announcements'
import { getCurrentParish } from '@/lib/auth/parish'
import { Parish } from '@/lib/types'
import { toast } from 'sonner'
import { Input } from "@/components/ui/input"

interface LiturgicalEvent {
  id: string
  name: string
  event_date: string
  start_time: string
}

interface AnnouncementFormProps {
  isOpen: boolean
  onClose: () => void
  onSuccess: () => void
  announcement?: Announcement | null
}

export function AnnouncementForm({ isOpen, onClose, onSuccess, announcement }: AnnouncementFormProps) {
  const [currentParish, setCurrentParish] = useState<Parish | null>(null)
  const [formData, setFormData] = useState({
    text: '',
    liturgical_event_id: 'none'
  })
  const [liturgicalEvents, setLiturgicalEvents] = useState<LiturgicalEvent[]>([])
  const [templates, setTemplates] = useState<AnnouncementTemplate[]>([])
  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [aiPrompt, setAiPrompt] = useState('')
  const [aiGenerating, setAiGenerating] = useState(false)
  const [showAiInput, setShowAiInput] = useState(false)

  useEffect(() => {
    if (isOpen) {
      loadData()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen])

  useEffect(() => {
    if (announcement) {
      setFormData({
        text: announcement.text || '',
        liturgical_event_id: announcement.liturgical_event_id || 'none'
      })
    } else {
      setFormData({
        text: '',
        liturgical_event_id: 'none'
      })
    }
  }, [announcement])

  async function loadData() {
    try {
      setLoading(true)
      const parish = await getCurrentParish()
      if (parish) {
        setCurrentParish(parish)
        await Promise.all([
          loadLiturgicalEvents(parish.id),
          loadTemplates()
        ])
      }
    } catch (error) {
      console.error('Error loading form data:', error)
      toast.error('Failed to load form data')
    } finally {
      setLoading(false)
    }
  }

  async function loadLiturgicalEvents(parishId: string) {
    try {
      const result = await getLiturgicalEvents(parishId)
      setLiturgicalEvents(result.events || [])
    } catch (error) {
      console.error('Error loading liturgical events:', error)
    }
  }

  async function loadTemplates() {
    try {
      const result = await getAnnouncementTemplates()
      setTemplates(result.templates || [])
    } catch (error) {
      console.error('Error loading templates:', error)
    }
  }

  const handleChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  const handleUseTemplate = (template: AnnouncementTemplate) => {
    setFormData(prev => ({ 
      ...prev, 
      text: prev.text ? `${prev.text}\n\n${template.text}` : template.text 
    }))
    toast.success('Template added to announcement')
  }

  const handleGenerateWithAI = async () => {
    if (!currentParish) {
      toast.error('No parish selected')
      return
    }

    if (!aiPrompt.trim()) {
      toast.error('Please enter a prompt for AI generation')
      return
    }

    setAiGenerating(true)
    try {
      const result = await generateAnnouncementWithAI(aiPrompt, currentParish.id)
      setFormData(prev => ({ 
        ...prev, 
        text: prev.text ? `${prev.text}\n\n${result.text}` : result.text 
      }))
      setAiPrompt('')
      setShowAiInput(false)
      toast.success('AI-generated content added to announcement')
    } catch (error) {
      console.error('Error generating AI content:', error)
      toast.error('Failed to generate AI content. Please try again.')
    } finally {
      setAiGenerating(false)
    }
  }

  const handleSubmit = async () => {
    if (!currentParish) {
      toast.error('No parish selected')
      return
    }

    if (!formData.text.trim()) {
      toast.error('Please enter announcement text')
      return
    }

    setSaving(true)
    try {
      const data = {
        text: formData.text,
        liturgical_event_id: formData.liturgical_event_id === 'none' ? null : formData.liturgical_event_id,
        parish_id: currentParish.id
      }

      if (announcement) {
        await updateAnnouncement(announcement.id, {
          text: data.text,
          liturgical_event_id: data.liturgical_event_id
        })
        toast.success('Announcement updated successfully!')
      } else {
        await createAnnouncement(data)
        toast.success('Announcement created successfully!')
      }

      onSuccess()
      onClose()
    } catch (error) {
      console.error('Error saving announcement:', error)
      toast.error('Failed to save announcement')
    } finally {
      setSaving(false)
    }
  }

  const formatEventDisplay = (event: LiturgicalEvent) => {
    const date = new Date(event.event_date).toLocaleDateString()
    return `${event.name} - ${date}`
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            {announcement ? 'Edit Announcement' : 'Create New Announcement'}
          </DialogTitle>
        </DialogHeader>

        {loading ? (
          <div className="py-8 text-center">Loading form data...</div>
        ) : (
          <div className="space-y-6">
            <div>
              <Label htmlFor="liturgical_event" className="text-sm font-medium">
                Link to Liturgical Event (Optional)
              </Label>
              <Select 
                value={formData.liturgical_event_id} 
                onValueChange={(value) => handleChange('liturgical_event_id', value)}
              >
                <SelectTrigger className="mt-1">
                  <SelectValue placeholder="Select an event (optional)" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">No event</SelectItem>
                  {liturgicalEvents.map((event) => (
                    <SelectItem key={event.id} value={event.id}>
                      {formatEventDisplay(event)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <div className="flex items-center justify-between mb-2">
                <Label htmlFor="text" className="text-sm font-medium">
                  Announcement Text
                </Label>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setShowAiInput(!showAiInput)}
                  disabled={saving}
                >
                  <Wand2 className="h-4 w-4 mr-2" />
                  AI Assistant
                </Button>
              </div>

              {showAiInput && (
                <div className="mb-4 p-4 border rounded-lg bg-muted/50">
                  <Label htmlFor="ai-prompt" className="text-sm font-medium mb-2 block">
                    Describe what you want to announce:
                  </Label>
                  <div className="flex gap-2">
                    <Input
                      id="ai-prompt"
                      value={aiPrompt}
                      onChange={(e) => setAiPrompt(e.target.value)}
                      placeholder="e.g., Upcoming Christmas Mass schedule, Parish picnic on Saturday..."
                      className="flex-1"
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' && !e.shiftKey) {
                          e.preventDefault()
                          handleGenerateWithAI()
                        }
                      }}
                    />
                    <Button
                      type="button"
                      onClick={handleGenerateWithAI}
                      disabled={aiGenerating || !aiPrompt.trim()}
                      size="sm"
                    >
                      {aiGenerating ? (
                        <>
                          <Sparkles className="h-4 w-4 mr-2 animate-spin" />
                          Generating...
                        </>
                      ) : (
                        <>
                          <Sparkles className="h-4 w-4 mr-2" />
                          Generate
                        </>
                      )}
                    </Button>
                  </div>
                  <p className="text-xs text-muted-foreground mt-2">
                    AI will generate professional announcement text based on your description.
                  </p>
                </div>
              )}

              <Textarea
                id="text"
                value={formData.text}
                onChange={(e) => handleChange('text', e.target.value)}
                placeholder="Enter your announcement text here..."
                className="mt-1 min-h-[120px]"
                required
              />
            </div>

            {templates.length > 0 && (
              <div>
                <Label className="text-sm font-medium mb-2 block">
                  Quick Templates
                </Label>
                <div className="flex flex-wrap gap-2">
                  {templates.slice(0, 6).map((template) => (
                    <Badge
                      key={template.id}
                      variant="outline"
                      className="cursor-pointer hover:bg-primary hover:text-primary-foreground transition-colors"
                      onClick={() => handleUseTemplate(template)}
                    >
                      <FileText className="h-3 w-3 mr-1" />
                      {template.title}
                    </Badge>
                  ))}
                </div>
                {templates.length > 6 && (
                  <p className="text-xs text-muted-foreground mt-1">
                    And {templates.length - 6} more templates available
                  </p>
                )}
              </div>
            )}

            <div className="flex justify-end gap-3 pt-4">
              <Button variant="outline" onClick={onClose} disabled={saving}>
                <X className="h-4 w-4 mr-2" />
                Cancel
              </Button>
              <Button onClick={handleSubmit} disabled={saving}>
                <Save className="h-4 w-4 mr-2" />
                {saving ? (announcement ? 'Updating...' : 'Creating...') : (announcement ? 'Update' : 'Create')}
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}
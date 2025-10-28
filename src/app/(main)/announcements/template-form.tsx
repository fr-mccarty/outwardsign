'use client'

import { useState, useEffect } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Save, X, FileText, Sparkles } from "lucide-react"
import { 
  createAnnouncementTemplate, 
  updateAnnouncementTemplate,
  AnnouncementTemplate 
} from '@/lib/actions/announcements'
import { getCurrentParish } from '@/lib/auth/parish'
import { Parish } from '@/lib/types'
import { toast } from 'sonner'
import { 
  SYSTEM_ANNOUNCEMENT_TEMPLATES, 
  TemplateLanguage, 
  TemplateType 
} from '@/lib/constants/announcement-templates'
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
  DropdownMenuLabel
} from '@/components/ui/dropdown-menu'

interface TemplateFormProps {
  isOpen: boolean
  onClose: () => void
  onSuccess: () => void
  template?: AnnouncementTemplate | null
}

export function TemplateForm({ isOpen, onClose, onSuccess, template }: TemplateFormProps) {
  const [currentParish, setCurrentParish] = useState<Parish | null>(null)
  const [formData, setFormData] = useState({
    title: '',
    text: ''
  })
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    if (isOpen) {
      loadParish()
    }
  }, [isOpen])

  useEffect(() => {
    if (template) {
      setFormData({
        title: template.title,
        text: template.text
      })
    } else {
      setFormData({
        title: '',
        text: ''
      })
    }
  }, [template])

  async function loadParish() {
    try {
      const parish = await getCurrentParish()
      setCurrentParish(parish)
    } catch (error) {
      console.error('Error loading parish:', error)
      toast.error('Failed to load parish data')
    }
  }

  const handleChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  const handleSubmit = async () => {
    if (!currentParish) {
      toast.error('No parish selected')
      return
    }

    if (!formData.title.trim() || !formData.text.trim()) {
      toast.error('Please fill in all fields')
      return
    }

    setSaving(true)
    try {
      if (template) {
        await updateAnnouncementTemplate(template.id, {
          title: formData.title,
          text: formData.text
        })
        toast.success('Template updated successfully!')
      } else {
        await createAnnouncementTemplate({
          title: formData.title,
          text: formData.text
        })
        toast.success('Template created successfully!')
      }

      onSuccess()
      onClose()
    } catch (error) {
      console.error('Error saving template:', error)
      toast.error('Failed to save template')
    } finally {
      setSaving(false)
    }
  }

  const handleUseSystemTemplate = (language: TemplateLanguage, templateType: TemplateType) => {
    const systemTemplate = SYSTEM_ANNOUNCEMENT_TEMPLATES[language][templateType]
    setFormData({
      title: systemTemplate.title,
      text: systemTemplate.text
    })
    toast.success('System template loaded')
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            {template ? 'Edit Template' : 'Create New Template'}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          <div className="flex justify-end mb-4">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm">
                  <Sparkles className="h-4 w-4 mr-2" />
                  Use System Template
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuLabel>English Templates</DropdownMenuLabel>
                <DropdownMenuItem 
                  onClick={() => handleUseSystemTemplate('english', 'weekly_bulletin')}
                >
                  Weekly Bulletin
                </DropdownMenuItem>
                <DropdownMenuItem 
                  onClick={() => handleUseSystemTemplate('english', 'special_event')}
                >
                  Special Event
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuLabel>Spanish Templates</DropdownMenuLabel>
                <DropdownMenuItem 
                  onClick={() => handleUseSystemTemplate('spanish', 'weekly_bulletin')}
                >
                  Boletín Semanal
                </DropdownMenuItem>
                <DropdownMenuItem 
                  onClick={() => handleUseSystemTemplate('spanish', 'special_event')}
                >
                  Evento Especial
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          <div>
            <Label htmlFor="title" className="text-sm font-medium">
              Template Title
            </Label>
            <Input
              id="title"
              value={formData.title}
              onChange={(e) => handleChange('title', e.target.value)}
              placeholder="e.g., Weekly Bulletin, Special Event, etc."
              className="mt-1"
              required
            />
          </div>

          <div>
            <Label htmlFor="text" className="text-sm font-medium">
              Template Text
            </Label>
            <Textarea
              id="text"
              value={formData.text}
              onChange={(e) => handleChange('text', e.target.value)}
              placeholder="Enter your template text here..."
              className="mt-1 min-h-[120px]"
              required
            />
            <p className="text-xs text-muted-foreground mt-1">
              This text will be available as a quick template when creating announcements.
            </p>
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <Button variant="outline" onClick={onClose} disabled={saving}>
              <X className="h-4 w-4 mr-2" />
              Cancel
            </Button>
            <Button onClick={handleSubmit} disabled={saving}>
              <Save className="h-4 w-4 mr-2" />
              {saving ? (template ? 'Updating...' : 'Creating...') : (template ? 'Update' : 'Create')}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
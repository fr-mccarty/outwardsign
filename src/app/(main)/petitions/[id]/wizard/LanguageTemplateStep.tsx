'use client'

import { useState, useEffect } from 'react'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { FormField } from '@/components/ui/form-field'
import { Input } from '@/components/ui/input'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { getPetitionTemplates, PetitionContextTemplate, createPetitionTemplate } from '@/lib/actions/petition-templates'
import { parseContextData } from '@/lib/petition-context-utils'
import { updatePetitionLanguage, updatePetitionTemplate } from '@/lib/actions/petitions'
import { getDefaultPetitions } from '@/lib/actions/parish-settings'
import { Petition } from '@/lib/types'
import { useAppContext } from '@/contexts/AppContextProvider'
import { toast } from 'sonner'
import { Plus, Search, ChevronRight, FileText } from 'lucide-react'

interface LanguageTemplateStepProps {
  petition: Petition
  wizardData: {
    language: string
    templateId: string
    templateContent: string
    generatedContent: string
  }
  updateWizardData: (updates: Record<string, unknown>) => void
}

export default function LanguageTemplateStep({ 
  petition, 
  wizardData, 
  updateWizardData
}: LanguageTemplateStepProps) {
  const { userSettings } = useAppContext()
  const [templates, setTemplates] = useState<PetitionContextTemplate[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [templateModalOpen, setTemplateModalOpen] = useState(false)
  const [createModalOpen, setCreateModalOpen] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [creating, setCreating] = useState(false)
  const [newTemplateForm, setNewTemplateForm] = useState({
    title: '',
    description: '',
    content: ''
  })

  useEffect(() => {
    const loadTemplates = async () => {
      try {
        // Just fetch the templates - no cleanup needed
        const data = await getPetitionTemplates()
        setTemplates(data)
        
        // Initialize with user's preferred language if not set
        if (!wizardData.language && userSettings?.language) {
          const mappedLanguage = {
            'en': 'English',
            'es': 'Spanish', 
            'fr': 'French',
            'la': 'Latin'
          }[userSettings.language] || 'English'
          
          updateWizardData({ language: mappedLanguage })
        }
      } catch (error) {
        console.error('Failed to load templates:', error)
      } finally {
        setLoading(false)
      }
    }

    loadTemplates()
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  const handleLanguageChange = (language: string) => {
    updateWizardData({ language })
  }

  const handleTemplateSelect = (templateId: string) => {
    const template = templates.find(t => t.id === templateId)
    if (template) {
      updateWizardData({ 
        templateId,
        templateContent: template.context // Store the actual template content
      })
      setTemplateModalOpen(false)
      toast.success(`Template "${template.title}" selected`)
    }
  }

  const filteredTemplates = templates.filter(template => {
    if (!template.title || template.title.trim() === '') return false
    if (!searchTerm) return true
    return template.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
           (template.description && template.description.toLowerCase().includes(searchTerm.toLowerCase()))
  })

  const selectedTemplate = templates.find(t => t.id === wizardData.templateId)

  const handleLoadDefaultPetitions = async () => {
    try {
      const defaultPetitions = await getDefaultPetitions()
      if (defaultPetitions) {
        setNewTemplateForm(prev => ({
          ...prev,
          content: defaultPetitions
        }))
        toast.success('Default petitions loaded')
      } else {
        toast.info('No default petitions found in parish settings')
      }
    } catch (error) {
      console.error('Failed to load default petitions:', error)
      toast.error('Failed to load default petitions')
    }
  }

  const handleCreateTemplate = async () => {
    setCreating(true)
    try {
      // Try to parse as JSON first, otherwise use as plain text
      let templateData
      try {
        templateData = JSON.parse(newTemplateForm.content)
      } catch {
        // If not JSON, create a default structure with the text as details
        templateData = {
          name: newTemplateForm.title,
          description: newTemplateForm.description,
          details: newTemplateForm.content,
          sacraments_received: [],
          deaths_this_week: [],
          sick_members: [],
          special_petitions: []
        }
      }

      const newTemplate = await createPetitionTemplate({
        title: newTemplateForm.title,
        description: newTemplateForm.description,
        context: typeof templateData === 'string' ? newTemplateForm.content : JSON.stringify(templateData)
      })

      // Refresh templates list
      const updatedTemplates = await getPetitionTemplates()
      setTemplates(updatedTemplates)

      // Auto-select the new template
      updateWizardData({ 
        templateId: newTemplate.id,
        templateContent: newTemplate.context // Store the actual template content
      })

      // Reset form and close dialogs
      setNewTemplateForm({
        title: '',
        description: '',
        content: ''
      })
      setCreateModalOpen(false)
      setTemplateModalOpen(false)
      toast.success('New template created and selected')
    } catch (error) {
      console.error('Failed to create template:', error)
      toast.error('Failed to create new template')
    } finally {
      setCreating(false)
    }
  }

  // Auto-save when data changes
  useEffect(() => {
    const saveData = async () => {
      if (!wizardData.language || !petition?.id) return
      
      setSaving(true)
      try {
        await updatePetitionLanguage(petition.id, wizardData.language)
        // Save template content to petitions.template field if selected
        if (wizardData.templateContent) {
          await updatePetitionTemplate(petition.id, wizardData.templateContent)
        }
      } catch (error) {
        console.error('Failed to save language/template:', error)
      } finally {
        setSaving(false)
      }
    }

    if ((wizardData.language || wizardData.templateContent) && petition?.id) {
      saveData()
    }
  }, [wizardData.language, wizardData.templateContent, petition?.id])

  return (
    <div className="space-y-6">
      {/* Combined Language and Template Selection */}
      <Card>
        <CardHeader>
          <CardTitle>Language & Template Setup</CardTitle>
          <p className="text-muted-foreground">
            Choose your language and select a template for your petitions.
          </p>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Language Selection */}
          <FormField
            id="language"
            label="Language"
            description="The language in which the petitions should be generated"
            inputType="select"
            value={wizardData.language}
            onChange={handleLanguageChange}
            options={[
              { value: 'English', label: 'English' },
              { value: 'Spanish', label: 'Spanish' },
              { value: 'French', label: 'French' },
              { value: 'Latin', label: 'Latin' }
            ]}
          />

          {/* Template Selection Button */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Petition Template</label>
            <p className="text-sm text-muted-foreground">
              Choose a template that matches your liturgical occasion
            </p>
            <Button 
              variant="outline" 
              className="w-full justify-between h-auto p-4"
              onClick={() => setTemplateModalOpen(true)}
            >
              <div className="text-left">
                {selectedTemplate ? (
                  <div>
                    <div className="font-medium">{selectedTemplate.title}</div>
                    {selectedTemplate.description && (
                      <div className="text-sm text-muted-foreground mt-1">
                        {selectedTemplate.description}
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="text-muted-foreground">Select a petition template</div>
                )}
              </div>
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Template Selection Modal */}
      <Dialog open={templateModalOpen} onOpenChange={setTemplateModalOpen}>
        <DialogContent className="sm:max-w-4xl max-h-[90vh] overflow-hidden">
          <DialogHeader>
            <DialogTitle>Select Petition Template</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            {/* Search and Create New Button */}
            <div className="flex gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search templates..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-9"
                />
              </div>
              <Button 
                variant="outline"
                onClick={() => setCreateModalOpen(true)}
              >
                <Plus className="h-4 w-4 mr-2" />
                Create New
              </Button>
            </div>

            {/* Templates List */}
            <div className="max-h-[60vh] overflow-y-auto">
              {loading ? (
                <p className="text-center py-8">Loading templates...</p>
              ) : filteredTemplates.length === 0 ? (
                <p className="text-center py-8 text-muted-foreground">
                  {searchTerm ? 'No templates found matching your search.' : 'No templates available.'}
                </p>
              ) : (
                <div className="grid gap-3">
                  {filteredTemplates.map((template) => {
                    const templateData = parseContextData(template.context)
                    const isSimpleText = !templateData
                    
                    return (
                      <div
                        key={template.id}
                        className={`p-4 border rounded-lg cursor-pointer transition-colors hover:border-gray-300 ${
                          wizardData.templateId === template.id
                            ? 'border-blue-500 bg-blue-50'
                            : 'border-gray-200'
                        }`}
                        onClick={() => handleTemplateSelect(template.id)}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <h3 className="font-medium">{template.title}</h3>
                          </div>
                          {wizardData.templateId === template.id && (
                            <div className="w-4 h-4 bg-blue-500 rounded-full flex items-center justify-center">
                              <div className="w-2 h-2 bg-white rounded-full" />
                            </div>
                          )}
                        </div>
                        {template.description && (
                          <p className="text-sm text-muted-foreground mt-1">
                            {template.description}
                          </p>
                        )}
                        {isSimpleText ? (
                          template.context && (
                            <p className="text-sm text-gray-600 mt-2 font-mono bg-gray-50 p-2 rounded">
                              {template.context.slice(0, 100)}{template.context.length > 100 ? '...' : ''}
                            </p>
                          )
                        ) : (
                          templateData?.details && (
                            <p className="text-sm text-gray-600 mt-2">
                              {templateData.details}
                            </p>
                          )
                        )}
                      </div>
                    )
                  })}
                </div>
              )}
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Create New Template Modal */}
      <Dialog open={createModalOpen} onOpenChange={setCreateModalOpen}>
        <DialogContent className="sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle>Create New Petition Template</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <FormField
              id="new-title"
              label="Title"
              value={newTemplateForm.title}
              onChange={(value) => setNewTemplateForm({ ...newTemplateForm, title: value })}
              placeholder="e.g., Easter Vigil, Funeral Mass"
            />
            <FormField
              id="new-description"
              label="Description"
              value={newTemplateForm.description}
              onChange={(value) => setNewTemplateForm({ ...newTemplateForm, description: value })}
              placeholder="Brief description of when to use this template"
            />
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-sm font-medium">Template Text</label>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={handleLoadDefaultPetitions}
                >
                  <FileText className="h-4 w-4 mr-2" />
                  Insert Default Text
                </Button>
              </div>
              <FormField
                id="new-content"
                label="Template Content"
                inputType="textarea"
                value={newTemplateForm.content}
                onChange={(value) => setNewTemplateForm({ ...newTemplateForm, content: value })}
                placeholder="Describe the liturgical context and community needs for this template. Example: St. Mary's Parish - Sunday Mass with recent baptisms, wedding anniversaries, and prayers for the sick including John Smith recovering from surgery."
                className="min-h-[100px]"
              />
            </div>
            <div className="flex gap-4">
              <Button 
                variant="outline" 
                onClick={() => setCreateModalOpen(false)}
                disabled={creating}
              >
                Cancel
              </Button>
              <Button 
                onClick={handleCreateTemplate}
                disabled={creating || !newTemplateForm.title}
              >
                {creating ? 'Creating...' : 'Create Template'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

    </div>
  )
}
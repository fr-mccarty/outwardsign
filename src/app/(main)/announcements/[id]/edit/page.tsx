'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { PageContainer } from '@/components/page-container'
import { FormField } from '@/components/ui/form-field'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Loading } from '@/components/loading'
import { ArrowLeft, Save, FileText, Plus } from 'lucide-react'
import { useBreadcrumbs } from '@/components/breadcrumb-context'
import { Announcement, getAnnouncement, updateAnnouncement, getAnnouncementTemplates, AnnouncementTemplate } from '@/lib/actions/announcements'
import { toast } from 'sonner'
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger 
} from '@/components/ui/dialog'

export default function EditAnnouncementPage() {
  const params = useParams()
  const router = useRouter()
  const { setBreadcrumbs } = useBreadcrumbs()
  
  const [announcement, setAnnouncement] = useState<Announcement | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  
  const [title, setTitle] = useState('')
  const [date, setDate] = useState('')
  const [text, setText] = useState('')
  
  const [templates, setTemplates] = useState<AnnouncementTemplate[]>([])
  const [templatesLoading, setTemplatesLoading] = useState(false)
  const [templatesDialogOpen, setTemplatesDialogOpen] = useState(false)
  
  const announcementId = parseInt(params.id as string)

  useEffect(() => {
    setBreadcrumbs([
      { label: "Dashboard", href: "/dashboard" },
      { label: "Announcements", href: "/announcements" },
      { label: "Edit Announcement" }
    ])
  }, [setBreadcrumbs])

  useEffect(() => {
    loadAnnouncement()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [announcementId])

  const loadAnnouncement = async () => {
    if (!announcementId || isNaN(announcementId)) {
      setError('Invalid announcement ID')
      setLoading(false)
      return
    }

    try {
      setLoading(true)
      const announcementData = await getAnnouncement(announcementId)
      setAnnouncement(announcementData)
      
      // Set form values
      setTitle(announcementData.title || '')
      setDate(announcementData.date || '')
      setText(announcementData.text || '')
    } catch (err) {
      console.error('Failed to load announcement:', err)
      setError('Failed to load announcement')
    } finally {
      setLoading(false)
    }
  }

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!text.trim()) {
      toast.error('Please enter announcement content')
      return
    }

    try {
      setSaving(true)
      
      await updateAnnouncement(announcementId, {
        title: title.trim(),
        text: text.trim(),
        date: date
      })

      toast.success('Announcement updated successfully!')
    } catch (error) {
      console.error('Failed to update announcement:', error)
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred'
      toast.error(`Failed to update announcement: ${errorMessage}`)
    } finally {
      setSaving(false)
    }
  }

  const handleCancel = () => {
    router.push('/announcements')
  }

  const loadTemplates = async () => {
    try {
      setTemplatesLoading(true)
      const result = await getAnnouncementTemplates()
      setTemplates(result.templates)
    } catch (error) {
      console.error('Failed to load templates:', error)
      toast.error('Failed to load templates')
    } finally {
      setTemplatesLoading(false)
    }
  }

  const handleInsertTemplate = (template: AnnouncementTemplate) => {
    const currentText = text
    const newText = currentText ? `${currentText}\n\n${template.text}` : template.text
    setText(newText)
    setTemplatesDialogOpen(false)
    toast.success('Template inserted successfully')
  }

  const openTemplatesDialog = () => {
    if (templates.length === 0) {
      loadTemplates()
    }
    setTemplatesDialogOpen(true)
  }

  if (loading) {
    return (
      <PageContainer 
        title="Edit Announcement" 
        description="Modify announcement details"
        maxWidth="4xl"
      >
        <Loading centered={false} />
      </PageContainer>
    )
  }

  if (error || !announcement) {
    return (
      <PageContainer 
        title="Edit Announcement" 
        description="Modify announcement details"
        maxWidth="4xl"
      >
        <Card>
          <CardContent className="text-center py-12">
            <h3 className="text-lg font-medium mb-2">Announcement Not Found</h3>
            <p className="text-muted-foreground mb-4">
              {error || 'The announcement you are trying to edit does not exist.'}
            </p>
            <Button onClick={() => router.push('/announcements')}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Announcements
            </Button>
          </CardContent>
        </Card>
      </PageContainer>
    )
  }

  return (
    <PageContainer 
      title="Edit Announcement" 
      description="Modify announcement details and content"
      maxWidth="4xl"
    >
      <div className="space-y-6">
        <form onSubmit={handleSave}>
          <Card>
            <CardHeader>
              <CardTitle>Edit Announcement</CardTitle>
              <CardDescription>
                Update the announcement title, date, and content
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Basic Information */}
              <div className="grid gap-4 md:grid-cols-2">
                <FormField
                  id="title"
                  label="Title"
                  description="A descriptive name for this announcement"
                  value={title}
                  onChange={setTitle}
                  placeholder="Enter announcement title"
                />
                <FormField
                  id="date"
                  label="Date"
                  description="The date when this announcement will be published or used"
                  inputType="date"
                  value={date}
                  onChange={setDate}
                />
              </div>

              {/* Content */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label htmlFor="text" className="text-sm font-medium">
                    Announcement Text *
                  </label>
                  <Dialog open={templatesDialogOpen} onOpenChange={setTemplatesDialogOpen}>
                    <DialogTrigger asChild>
                      <Button 
                        type="button" 
                        variant="outline" 
                        size="sm"
                        onClick={openTemplatesDialog}
                      >
                        <FileText className="h-4 w-4 mr-2" />
                        Insert Template
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-2xl max-h-[80vh] overflow-hidden">
                      <DialogHeader>
                        <DialogTitle>Insert Announcement Template</DialogTitle>
                        <DialogDescription>
                          Select a template to insert into your announcement
                        </DialogDescription>
                      </DialogHeader>
                      <div className="flex-1 overflow-y-auto">
                        {templatesLoading ? (
                          <div className="flex items-center justify-center py-8">
                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
                          </div>
                        ) : templates.length === 0 ? (
                          <div className="text-center py-8">
                            <FileText className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                            <p className="text-muted-foreground mb-4">No templates available</p>
                            <Button asChild variant="outline">
                              <a href="/announcements/templates/create" target="_blank">
                                <Plus className="h-4 w-4 mr-2" />
                                Create Template
                              </a>
                            </Button>
                          </div>
                        ) : (
                          <div className="space-y-2">
                            {templates.map((template) => (
                              <div
                                key={template.id}
                                className="border rounded-lg p-4 hover:bg-muted cursor-pointer transition-colors"
                                onClick={() => handleInsertTemplate(template)}
                              >
                                <h4 className="font-medium mb-2">{template.title}</h4>
                                <p className="text-sm text-muted-foreground line-clamp-3">
                                  {template.text}
                                </p>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    </DialogContent>
                  </Dialog>
                </div>
                <Textarea
                  id="text"
                  placeholder="Enter your announcement content here..."
                  value={text}
                  onChange={(e) => setText(e.target.value)}
                  rows={12}
                  className="min-h-48 resize-y"
                  required
                />
                <p className="text-sm text-muted-foreground">
                  {text.length} characters
                </p>
              </div>
              
              {/* Save Actions */}
              <div className="flex justify-end gap-3 pt-4 border-t">
                <Button type="button" variant="outline" onClick={handleCancel}>
                  Cancel
                </Button>
                <Button 
                  type="submit" 
                  disabled={saving || !text.trim()}
                  size="lg"
                >
                  {saving ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Saving...
                    </>
                  ) : (
                    <>
                      <Save className="h-4 w-4 mr-2" />
                      Save Changes
                    </>
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>
        </form>
      </div>
    </PageContainer>
  )
}
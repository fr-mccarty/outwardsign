'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { PageContainer } from '@/components/page-container'
import { FormField } from '@/components/ui/form-field'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Loading } from '@/components/loading'
import { ArrowLeft, Save } from 'lucide-react'
import { useBreadcrumbs } from '@/components/breadcrumb-context'
import { AnnouncementTemplate, getAnnouncementTemplate, updateAnnouncementTemplate } from '@/lib/actions/announcements'
import { toast } from 'sonner'

export default function EditTemplatePage() {
  const params = useParams()
  const router = useRouter()
  const { setBreadcrumbs } = useBreadcrumbs()
  
  const [template, setTemplate] = useState<AnnouncementTemplate | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  
  const [title, setTitle] = useState('')
  const [text, setText] = useState('')
  
  const templateId = parseInt(params.id as string)

  useEffect(() => {
    setBreadcrumbs([
      { label: "Dashboard", href: "/dashboard" },
      { label: "Announcements", href: "/announcements" },
      { label: "Templates", href: "/announcements/templates" },
      { label: "Edit Template" }
    ])
  }, [setBreadcrumbs])

  useEffect(() => {
    loadTemplate()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [templateId])

  const loadTemplate = async () => {
    if (!templateId || isNaN(templateId)) {
      setError('Invalid template ID')
      setLoading(false)
      return
    }

    try {
      setLoading(true)
      const templateData = await getAnnouncementTemplate(templateId)
      setTemplate(templateData)
      
      // Set form values
      setTitle(templateData.title || '')
      setText(templateData.text || '')
    } catch (err) {
      console.error('Failed to load template:', err)
      setError('Failed to load template')
    } finally {
      setLoading(false)
    }
  }

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!title.trim() || !text.trim()) {
      toast.error('Please fill in both title and text')
      return
    }

    try {
      setSaving(true)
      
      await updateAnnouncementTemplate(templateId, {
        title: title.trim(),
        text: text.trim()
      })

      toast.success('Template updated successfully!')
      router.push('/announcements/templates')
    } catch (error) {
      console.error('Failed to update template:', error)
      toast.error('Failed to update template')
    } finally {
      setSaving(false)
    }
  }

  const handleBack = () => {
    router.push('/announcements/templates')
  }

  if (loading) {
    return (
      <PageContainer 
        title="Edit Template" 
        description="Modify template details"
        maxWidth="4xl"
      >
        <Loading centered={false} />
      </PageContainer>
    )
  }

  if (error || !template) {
    return (
      <PageContainer 
        title="Edit Template" 
        description="Modify template details"
        maxWidth="4xl"
      >
        <Card>
          <CardContent className="text-center py-12">
            <h3 className="text-lg font-medium mb-2">Template Not Found</h3>
            <p className="text-muted-foreground mb-4">
              {error || 'The template you are trying to edit does not exist.'}
            </p>
            <Button onClick={() => router.push('/announcements/templates')}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Templates
            </Button>
          </CardContent>
        </Card>
      </PageContainer>
    )
  }

  return (
    <PageContainer 
      title="Edit Template" 
      description="Modify template details and content"
      maxWidth="4xl"
    >
      <div className="space-y-6">
        <form onSubmit={handleSave} className="space-y-6">
          {/* Basic Information */}
          <Card>
            <CardHeader>
              <CardTitle>Template Information</CardTitle>
              <CardDescription>
                Update the title and content of this template
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <FormField
                id="title"
                label="Title"
                description="A descriptive name for this template"
                value={title}
                onChange={setTitle}
                placeholder="Enter template title"
                required
              />
              
              <div className="space-y-2">
                <label htmlFor="text" className="text-sm font-medium">
                  Template Text *
                </label>
                <Textarea
                  id="text"
                  placeholder="Enter the template content here..."
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
            </CardContent>
          </Card>

          {/* Preview */}
          {text && (
            <Card>
              <CardHeader>
                <CardTitle>Preview</CardTitle>
                <CardDescription>
                  This is how your template will appear when inserted
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="bg-muted p-4 rounded-md">
                  <div className="whitespace-pre-wrap text-sm leading-relaxed">
                    {text}
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Save Actions */}
          <div className="flex justify-end gap-3">
            <Button type="button" variant="outline" onClick={handleBack}>
              Cancel
            </Button>
            <Button 
              type="submit" 
              disabled={saving || !title.trim() || !text.trim()}
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
        </form>
      </div>
    </PageContainer>
  )
}
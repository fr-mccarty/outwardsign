'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { PageContainer } from '@/components/page-container'
import { FormField } from '@/components/ui/form-field'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { ArrowLeft, Save } from 'lucide-react'
import { createAnnouncementTemplate } from '@/lib/actions/announcements'
import { useRouter } from 'next/navigation'
import { useBreadcrumbs } from '@/components/breadcrumb-context'
import { toast } from 'sonner'

export default function CreateTemplateePage() {
  const [title, setTitle] = useState('')
  const [text, setText] = useState('')
  const [saving, setSaving] = useState(false)
  const router = useRouter()
  const { setBreadcrumbs } = useBreadcrumbs()

  useEffect(() => {
    setBreadcrumbs([
      { label: "Dashboard", href: "/dashboard" },
      { label: "Announcements", href: "/announcements" },
      { label: "Templates", href: "/announcements/templates" },
      { label: "Create Template" }
    ])
  }, [setBreadcrumbs])

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!title.trim() || !text.trim()) {
      toast.error('Please fill in both title and text')
      return
    }

    try {
      setSaving(true)
      
      const template = await createAnnouncementTemplate({
        title: title.trim(),
        text: text.trim()
      })

      toast.success('Template created successfully!')
      router.push('/announcements/templates')
    } catch (error) {
      console.error('Failed to create template:', error)
      toast.error('Failed to create template')
    } finally {
      setSaving(false)
    }
  }

  const handleBack = () => {
    router.push('/announcements/templates')
  }

  return (
    <PageContainer 
      title="Create Announcement Template" 
      description="Create a reusable text snippet for announcements"
      maxWidth="4xl"
    >
      <div className="space-y-6">
        {/* Action Buttons */}
        <div className="flex items-center gap-3">
          <Button onClick={handleBack} variant="outline">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Templates
          </Button>
        </div>

        <form onSubmit={handleSave} className="space-y-6">
          {/* Basic Information */}
          <Card>
            <CardHeader>
              <CardTitle>Template Information</CardTitle>
              <CardDescription>
                Create a reusable text snippet that can be inserted into announcements
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
          <Card>
            <CardContent className="pt-6">
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
                      Creating...
                    </>
                  ) : (
                    <>
                      <Save className="h-4 w-4 mr-2" />
                      Create Template
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
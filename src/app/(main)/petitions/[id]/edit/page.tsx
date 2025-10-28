'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { FormField } from '@/components/ui/form-field'
import { PageContainer } from '@/components/page-container'
import { Loading } from '@/components/loading'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { ArrowLeft, RefreshCw, Sparkles, Printer, Edit3 } from 'lucide-react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { getPetitionWithContext, updatePetitionFullDetails, regeneratePetitionContent, updatePetitionTemplate, updatePetitionDetails } from '@/lib/actions/petitions'
import { useBreadcrumbs } from '@/components/breadcrumb-context'
import { toast } from 'sonner'

interface EditPetitionPageProps {
  params: Promise<{ id: string }>
}

export default function EditPetitionPage({ params }: EditPetitionPageProps) {
  const [id, setId] = useState<string>('')
  const [title, setTitle] = useState('')
  const [date, setDate] = useState('')
  const [language, setLanguage] = useState('English')
  const [petitionText, setPetitionText] = useState('')
  const [loading, setLoading] = useState(false)
  const [loadingData, setLoadingData] = useState(true)
  const [error, setError] = useState('')
  const [showRegenerateModal, setShowRegenerateModal] = useState(false)
  const [details, setDetails] = useState('')
  const [regenerating, setRegenerating] = useState(false)
  const [showTemplateModal, setShowTemplateModal] = useState(false)
  const [template, setTemplate] = useState('')
  const [savingTemplate, setSavingTemplate] = useState(false)
  const [savingDetails, setSavingDetails] = useState(false)
  const [showRegenerateConfirmModal, setShowRegenerateConfirmModal] = useState(false)
  const [showDetailsRegenerateConfirmModal, setShowDetailsRegenerateConfirmModal] = useState(false)
  const router = useRouter()
  const { setBreadcrumbs } = useBreadcrumbs()

  useEffect(() => {
    const loadPetition = async () => {
      try {
        const resolvedParams = await params
        setId(resolvedParams.id)
        
        const result = await getPetitionWithContext(resolvedParams.id)
        if (result) {
          const { petition, context } = result
          setTitle(petition.title)
          setDate(petition.date)
          setLanguage(petition.language)
          setPetitionText(petition.text || petition.generated_content || '')
          setDetails(petition.details || '') // Load existing details
          setTemplate(petition.template || '') // Load existing template
          
          // Set breadcrumbs with petition title
          setBreadcrumbs([
            { label: "Dashboard", href: "/dashboard" },
            { label: "Petitions", href: "/petitions" },
            { label: petition.title, href: `/petitions/${resolvedParams.id}` },
            { label: "Edit" }
          ])
        }
      } catch {
        setError('Failed to load petition')
      } finally {
        setLoadingData(false)
      }
    }

    loadPetition()
  }, [params, setBreadcrumbs])


  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      const petitionData = {
        title,
        date,
        language,
        text: petitionText.trim(),
        details: details.trim(),
      }

      await updatePetitionFullDetails(id, petitionData)
      toast.success('Petition updated successfully!')
      setError('')
    } catch (error) {
      console.error('Failed to update petition:', error)
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred'
      setError(`Failed to update petition: ${errorMessage}`)
      toast.error(`Failed to update petition: ${errorMessage}`)
    } finally {
      setLoading(false)
    }
  }

  const handleRegenerate = async () => {

    setRegenerating(true)
    try {
      const regenerationData = {
        title,
        date,
        language,
        details: details.trim()
      }

      console.log('[DEBUG EditPage] Regenerating petition with data:', regenerationData)
      const updatedPetition = await regeneratePetitionContent(id, regenerationData)
      setPetitionText(updatedPetition.text || updatedPetition.generated_content || '')
      setShowRegenerateModal(false)
      setDetails('')
      toast.success('Petition content regenerated successfully!')
    } catch (error) {
      console.error('Failed to regenerate petition:', error)
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred'
      toast.error(`Failed to regenerate petition content: ${errorMessage}`)
    } finally {
      setRegenerating(false)
    }
  }

  const handleDirectRegenerate = async () => {
    setRegenerating(true)
    try {
      const regenerationData = {
        title,
        date,
        language,
        details: details.trim()
      }

      console.log('[DEBUG EditPage] Direct regenerating petition with data:', regenerationData)
      const updatedPetition = await regeneratePetitionContent(id, regenerationData)
      setPetitionText(updatedPetition.text || updatedPetition.generated_content || '')
      toast.success('Petition content regenerated successfully!')
    } catch (error) {
      console.error('Failed to regenerate petition:', error)
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred'
      toast.error(`Failed to regenerate petition content: ${errorMessage}`)
    } finally {
      setRegenerating(false)
    }
  }

  const handleSaveDetails = async () => {
    setSavingDetails(true)
    try {
      await updatePetitionDetails(id, details.trim())
      toast.success('Details saved successfully!')
      setShowRegenerateModal(false)
      // Show regenerate confirmation modal
      setShowDetailsRegenerateConfirmModal(true)
    } catch (error) {
      console.error('Failed to save details:', error)
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred'
      toast.error(`Failed to save details: ${errorMessage}`)
    } finally {
      setSavingDetails(false)
    }
  }

  const handlePrint = () => {
    if (id) {
      const printUrl = `/print/petitions/${id}`
      window.open(printUrl, '_blank')
    }
  }

  const handleSaveTemplate = async () => {
    setSavingTemplate(true)
    try {
      await updatePetitionTemplate(id, template.trim())
      toast.success('Template saved successfully!')
      setShowTemplateModal(false)
      // Show regenerate confirmation modal
      setShowRegenerateConfirmModal(true)
    } catch (error) {
      console.error('Failed to save template:', error)
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred'
      toast.error(`Failed to save template: ${errorMessage}`)
    } finally {
      setSavingTemplate(false)
    }
  }

  const handleRegenerateWithTemplate = async () => {
    setRegenerating(true)
    setShowRegenerateConfirmModal(false)
    try {
      const regenerationData = {
        title,
        date,
        language,
        details: details.trim(),
        template: template.trim()
      }

      console.log('[DEBUG EditPage] Regenerating petition with template:', regenerationData)
      const updatedPetition = await regeneratePetitionContent(id, regenerationData)
      setPetitionText(updatedPetition.text || updatedPetition.generated_content || '')
      toast.success('Petition content regenerated with new template!')
    } catch (error) {
      console.error('Failed to regenerate petition with template:', error)
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred'
      toast.error(`Failed to regenerate petition: ${errorMessage}`)
    } finally {
      setRegenerating(false)
    }
  }

  const handleRegenerateWithDetails = async () => {
    setRegenerating(true)
    setShowDetailsRegenerateConfirmModal(false)
    try {
      const regenerationData = {
        title,
        date,
        language,
        details: details.trim()
      }

      console.log('[DEBUG EditPage] Regenerating petition with saved details:', regenerationData)
      const updatedPetition = await regeneratePetitionContent(id, regenerationData)
      setPetitionText(updatedPetition.text || updatedPetition.generated_content || '')
      toast.success('Petition content regenerated with saved details!')
    } catch (error) {
      console.error('Failed to regenerate petition with details:', error)
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred'
      toast.error(`Failed to regenerate petition: ${errorMessage}`)
    } finally {
      setRegenerating(false)
    }
  }

  if (loadingData) {
    return (
      <PageContainer 
        title="Edit Petition"
        description="Loading petition information..."
        maxWidth="2xl"
      >
        <Loading />
      </PageContainer>
    )
  }

  return (
    <PageContainer 
      title="Edit Petition"
      description="Modify petition details and content"
      maxWidth="2xl"
    >
      
      <Card>
        <CardHeader>
          <CardTitle>Edit Petitions</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                id="title"
                label="Title"
                description="A descriptive name for this set of petitions"
                value={title}
                onChange={setTitle}
                placeholder="Enter title for these petitions"
                required
              />
              <FormField
                id="date"
                label="Date"
                description="The date when these petitions will be used"
                inputType="date"
                value={date}
                onChange={setDate}
                required
              />
            </div>

            <FormField
              id="language"
              label="Language"
              description="Select the language for the petitions"
              inputType="select"
              value={language}
              onChange={setLanguage}
              options={[
                { value: 'English', label: 'English' },
                { value: 'Spanish', label: 'Spanish' },
                { value: 'French', label: 'French' },
                { value: 'Latin', label: 'Latin' }
              ]}
            />

            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <label className="text-sm font-medium">Petition Content</label>
                  <p className="text-xs text-muted-foreground">Edit the petition content directly</p>
                </div>
                <div className="flex gap-2">
                  <Dialog open={showTemplateModal} onOpenChange={setShowTemplateModal}>
                    <DialogTrigger asChild>
                      <Button variant="outline" size="sm">
                        <Edit3 className="h-4 w-4 mr-2" />
                        Edit Template
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-2xl max-h-[80vh] overflow-hidden">
                      <DialogHeader>
                        <DialogTitle>Edit Petition Template</DialogTitle>
                      </DialogHeader>
                      <div className="space-y-4">
                        <div>
                          <p className="text-sm text-muted-foreground mb-2">
                            Edit the template content that will be used for generating petitions. This template will be saved with this petition.
                          </p>
                        </div>
                        <FormField
                          id="template"
                          label="Template Content"
                          description="Enter the petition template content"
                          inputType="textarea"
                          value={template}
                          onChange={setTemplate}
                          placeholder="Enter petition template content..."
                          rows={12}
                        />

                        <div className="flex gap-2 justify-end">
                          <Button
                            variant="outline"
                            onClick={() => setShowTemplateModal(false)}
                            disabled={savingTemplate}
                          >
                            Cancel
                          </Button>
                          <Button
                            onClick={handleSaveTemplate}
                            disabled={savingTemplate}
                          >
                            {savingTemplate ? (
                              <>
                                <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                                Saving...
                              </>
                            ) : (
                              <>
                                <Edit3 className="h-4 w-4 mr-2" />
                                Save Template
                              </>
                            )}
                          </Button>
                        </div>
                      </div>
                    </DialogContent>
                  </Dialog>
                  <Dialog open={showRegenerateModal} onOpenChange={setShowRegenerateModal}>
                    <DialogTrigger asChild>
                      <Button variant="outline" size="sm">
                        <Edit3 className="h-4 w-4 mr-2" />
                        Edit Details
                      </Button>
                    </DialogTrigger>
                  <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                      <DialogTitle>Regenerate Petition Content</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4">
                      <FormField
                        id="details"
                        label="Details (Optional)"
                        description="Additional context about your community this week"
                        inputType="textarea"
                        value={details}
                        onChange={setDetails}
                        placeholder="Enter details..."
                        rows={4}
                      />

                      <div className="flex gap-2 justify-end">
                        <Button
                          variant="outline"
                          onClick={() => setShowRegenerateModal(false)}
                          disabled={savingDetails}
                        >
                          Cancel
                        </Button>
                        <Button
                          onClick={handleSaveDetails}
                          disabled={savingDetails}
                        >
                          {savingDetails ? (
                            <>
                              <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                              Saving...
                            </>
                          ) : (
                            <>
                              <Edit3 className="h-4 w-4 mr-2" />
                              Save Details
                            </>
                          )}
                        </Button>
                      </div>
                    </div>
                  </DialogContent>
                </Dialog>
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={handleDirectRegenerate}
                    disabled={regenerating}
                  >
                    {regenerating ? (
                      <>
                        <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                        Generating...
                      </>
                    ) : (
                      <>
                        <Sparkles className="h-4 w-4 mr-2" />
                        Regenerate
                      </>
                    )}
                  </Button>
              </div>
              </div>
              
              <textarea
                id="petitionText"
                value={petitionText}
                onChange={(e) => setPetitionText(e.target.value)}
                placeholder="Enter your petition content here..."
                rows={12}
                className="min-h-0 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              />
            </div>

            {error && (
              <div className="text-red-500 text-sm">{error}</div>
            )}

            <div className="flex gap-3">
              <Button type="submit" className="flex-1" disabled={loading}>
                {loading ? 'Updating...' : 'Update Petitions'}
              </Button>
              <Button type="button" variant="outline" onClick={handlePrint}>
                <Printer className="h-4 w-4 mr-2" />
                Print
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      {/* Regenerate Confirmation Modal */}
      <Dialog open={showRegenerateConfirmModal} onOpenChange={setShowRegenerateConfirmModal}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Regenerate Petition Content?</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Would you like to regenerate the petition content using the new template you just saved?
            </p>
            <div className="flex gap-2 justify-end">
              <Button
                variant="outline"
                onClick={() => setShowRegenerateConfirmModal(false)}
                disabled={regenerating}
              >
                No, Keep Current Content
              </Button>
              <Button
                onClick={handleRegenerateWithTemplate}
                disabled={regenerating}
              >
                {regenerating ? (
                  <>
                    <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                    Generating...
                  </>
                ) : (
                  <>
                    <Sparkles className="h-4 w-4 mr-2" />
                    Yes, Regenerate
                  </>
                )}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Details Regenerate Confirmation Modal */}
      <Dialog open={showDetailsRegenerateConfirmModal} onOpenChange={setShowDetailsRegenerateConfirmModal}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Regenerate Petition Content?</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Would you like to regenerate the petition content using the details you just saved?
            </p>
            <div className="flex gap-2 justify-end">
              <Button
                variant="outline"
                onClick={() => setShowDetailsRegenerateConfirmModal(false)}
                disabled={regenerating}
              >
                No, Keep Current Content
              </Button>
              <Button
                onClick={handleRegenerateWithDetails}
                disabled={regenerating}
              >
                {regenerating ? (
                  <>
                    <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                    Generating...
                  </>
                ) : (
                  <>
                    <Sparkles className="h-4 w-4 mr-2" />
                    Yes, Regenerate
                  </>
                )}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </PageContainer>
  )
}
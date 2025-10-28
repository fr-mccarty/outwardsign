'use client'

import { useState } from 'react'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { ArrowLeft, Sparkles, RefreshCw } from 'lucide-react'
import { generatePetitionContent, updatePetitionContent } from '@/lib/actions/petitions'
import { Petition } from '@/lib/types'
import { toast } from 'sonner'

interface GenerationStepProps {
  petition: Petition
  wizardData: {
    language: string
    templateId: string
    templateContent: string
    generatedContent: string
  }
  updateWizardData: (updates: Record<string, unknown>) => void
  onNext: () => void
  onPrevious: () => void
}

export default function GenerationStep({ 
  petition, 
  wizardData, 
  updateWizardData, 
  onNext,
  onPrevious 
}: GenerationStepProps) {
  const [generating, setGenerating] = useState(false)


  const handleGenerate = async () => {
    setGenerating(true)
    try {
      toast.loading('Generating petitions...')
      const content = await generatePetitionContent({
        title: petition.title,
        date: petition.date,
        language: wizardData.language,
        details: petition.details || '',
        templateId: wizardData.templateId
      })
      
      // Save generated content to database
      await updatePetitionContent(petition.id, content)
      
      updateWizardData({ generatedContent: content })
      toast.success('Petitions regenerated and saved successfully')
    } catch (error) {
      console.error('Failed to generate petitions:', error)
      toast.error('Failed to generate petitions')
    } finally {
      setGenerating(false)
    }
  }

  const handleRegenerate = () => {
    updateWizardData({ generatedContent: '' })
  }

  return (
    <div className="space-y-6">
      {/* Generation Status */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Sparkles className="h-5 w-5" />
            Generate Petitions
          </CardTitle>
          <p className="text-muted-foreground">
            Generate AI-powered liturgical petitions based on your context and community information.
          </p>
        </CardHeader>
        <CardContent className="space-y-4">
          {!wizardData.generatedContent ? (
            <div className="text-center py-8">
              <Sparkles className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg font-medium mb-2">No Content Generated Yet</h3>
              <p className="text-muted-foreground mb-6">
                Please use the regenerate button below to create petitions in {wizardData.language} based on your selected template.
              </p>
              <Button 
                onClick={handleGenerate} 
                disabled={generating}
                size="lg"
              >
                {generating ? (
                  <>
                    <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                    Generating...
                  </>
                ) : (
                  <>
                    <Sparkles className="h-4 w-4 mr-2" />
                    Generate Petitions
                  </>
                )}
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="text-green-600 flex items-center gap-2">
                  <Sparkles className="h-5 w-5" />
                  <span className="font-medium">Petitions Generated Successfully</span>
                </div>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={handleRegenerate}
                >
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Regenerate
                </Button>
              </div>
              
              <div className="bg-muted p-4 rounded-lg">
                <h4 className="font-medium mb-2">Generated Petitions Preview:</h4>
                <div className="text-sm whitespace-pre-wrap font-mono max-h-60 overflow-y-auto">
                  {wizardData.generatedContent}
                </div>
              </div>
              
              <p className="text-sm text-muted-foreground">
                You can review and edit these petitions in the next step.
              </p>
            </div>
          )}
        </CardContent>
      </Card>


      {/* Context Summary */}
      <Card>
        <CardHeader>
          <CardTitle>Context Summary</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className="font-medium">Language:</span> {wizardData.language}
            </div>
            <div>
              <span className="font-medium">Template:</span> {wizardData.templateId ? 'Selected' : 'Unknown'}
            </div>
            {wizardData.templateContent && (
              <div className="col-span-2">
                <span className="font-medium">Template Content:</span>
                <p className="text-muted-foreground mt-1">
                  {wizardData.templateContent.slice(0, 200)}...
                </p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Navigation */}
      <div className="flex justify-between">
        <Button variant="outline" onClick={onPrevious}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Previous
        </Button>
        <Button 
          onClick={onNext} 
          disabled={!wizardData.generatedContent}
        >
          Next: Edit & Review
        </Button>
      </div>
    </div>
  )
}
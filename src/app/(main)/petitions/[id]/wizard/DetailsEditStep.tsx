'use client'

import { useState, useEffect, useRef } from 'react'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { FormField } from '@/components/ui/form-field'
import { Info } from 'lucide-react'
import { updatePetitionDetails } from '@/lib/actions/petitions'
import { Petition } from '@/lib/types'

interface DetailsEditStepProps {
  petition: Petition
  wizardData: {
    language: string
    templateId: string
    templateContent: string
    generatedContent: string
  }
  updateWizardData: (updates: Record<string, unknown>) => void
}

export default function DetailsEditStep({ 
  petition, 
  wizardData, 
  updateWizardData
}: DetailsEditStepProps) {
  const [petitionDetails, setPetitionDetails] = useState('')
  const [saving, setSaving] = useState(false)
  const [showInfoModal, setShowInfoModal] = useState(false)
  const lastSavedValue = useRef('')

  // Initialize details from existing petition ONLY on component mount
  useEffect(() => {
    // Details starts empty/null and user will input their specific details
    const initialValue = petition.details || ''
    
    setPetitionDetails(initialValue)
    lastSavedValue.current = initialValue // Set the initial saved value to prevent unnecessary saves
  }, [petition.id]) // Only depend on petition.id to initialize once per petition

  // Auto-save when details change
  useEffect(() => {
    const saveData = async () => {
      // Don't save if the value hasn't actually changed
      if (petitionDetails === lastSavedValue.current) {
        return
      }
      
      if (!petition?.id) {
        return
      }
      
      setSaving(true)
      try {
        // Store details as simple text
        await updatePetitionDetails(petition.id, petitionDetails)
        lastSavedValue.current = petitionDetails
        // Don't update wizard data here as it causes reinitialization loops
      } catch (error) {
        console.error('Failed to save petition details:', error)
      } finally {
        setSaving(false)
      }
    }

    // Save even if empty, but still check if value changed
    if (petitionDetails !== lastSavedValue.current) {
      const debounceTimer = setTimeout(saveData, 1000)
      return () => clearTimeout(debounceTimer)
    }
  }, [petitionDetails, petition.id, wizardData.templateId])

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Petition Details</CardTitle>
              <p className="text-muted-foreground">
                Include names, celebrations, prayer requests, and specific community information for this liturgy
              </p>
            </div>
            <Dialog open={showInfoModal} onOpenChange={setShowInfoModal}>
              <DialogTrigger asChild>
                <Button variant="outline" size="sm">
                  <Info className="h-4 w-4 mr-2" />
                  Help
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-lg">
                <DialogHeader>
                  <DialogTitle>What Details to Include</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <p className="text-sm text-muted-foreground">
                    Include specific information about your community and this liturgical celebration to generate personalized petitions:
                  </p>
                  
                  <div className="space-y-3">
                    <div>
                      <h4 className="font-medium text-sm mb-1">🙏 Sacraments Received</h4>
                      <p className="text-sm text-muted-foreground">
                        Names of those who received baptisms, confirmations, marriages, ordinations, first communions, etc.
                      </p>
                    </div>
                    
                    <div>
                      <h4 className="font-medium text-sm mb-1">✝️ Those Who Have Died</h4>
                      <p className="text-sm text-muted-foreground">
                        Names of the deceased who need prayers, especially those who died recently or have anniversaries.
                      </p>
                    </div>
                    
                    <div>
                      <h4 className="font-medium text-sm mb-1">👨‍👩‍👧‍👦 Names of Family Members</h4>
                      <p className="text-sm text-muted-foreground">
                        Specific family names for celebrations, memorials, or special intentions.
                      </p>
                    </div>
                    
                    <div>
                      <h4 className="font-medium text-sm mb-1">🏥 Those Who Are Sick</h4>
                      <p className="text-sm text-muted-foreground">
                        Names of community members who need healing prayers, are in hospitals, or recovering.
                      </p>
                    </div>
                    
                    <div>
                      <h4 className="font-medium text-sm mb-1">🎉 Special Celebrations</h4>
                      <p className="text-sm text-muted-foreground">
                        Anniversaries, milestones, achievements, or special events in the community.
                      </p>
                    </div>
                    
                    <div>
                      <h4 className="font-medium text-sm mb-1">🌍 Community Concerns</h4>
                      <p className="text-sm text-muted-foreground">
                        Local, national, or global issues needing prayer, parish projects, or community needs.
                      </p>
                    </div>
                  </div>
                  
                  <div className="bg-muted p-3 rounded-md">
                    <p className="text-sm text-muted-foreground">
                      <strong>Example:</strong> "This week we celebrate the marriage of John and Mary Smith. We pray for the deceased: Robert Johnson and Maria Garcia. For healing: Father Thomas recovering from surgery, the Wilson family during illness. Special petition for peace in our community and successful fundraising for the parish building project."
                    </p>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </CardHeader>
        <CardContent>
          <FormField
            id="petition-details"
            label=""
            description=""
            inputType="textarea"
            value={petitionDetails}
            onChange={setPetitionDetails}
            placeholder=""
            className="min-h-[200px]"
            rows={10}
          />
          
          {saving && (
            <div className="flex items-center gap-2 text-sm text-muted-foreground mt-2">
              <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-gray-900"></div>
              Saving details...
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
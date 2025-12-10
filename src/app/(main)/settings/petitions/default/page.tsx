'use client'

import { useState, useEffect } from 'react'
import { PageContainer } from '@/components/page-container'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { FormInput } from '@/components/form-input'
import { Badge } from '@/components/ui/badge'
import { Save, Loader2, RefreshCw } from 'lucide-react'
import { toast } from 'sonner'
import { useBreadcrumbs } from '@/components/breadcrumb-context'
import { useRouter } from 'next/navigation'
import { getDefaultPetitions, updateDefaultPetitions } from '@/lib/actions/parish-settings'
import { DEFAULT_PETITIONS } from '@/lib/constants'

export default function DefaultPetitionsPage() {
  const { setBreadcrumbs } = useBreadcrumbs()
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [initialLoading, setInitialLoading] = useState(true)
  const [petitionText, setPetitionText] = useState(DEFAULT_PETITIONS.en)

  useEffect(() => {
    setBreadcrumbs([
      { label: "Dashboard", href: "/dashboard" },
      { label: "Settings", href: "/settings" },
      { label: "Petition Templates", href: "/settings/petitions" },
      { label: "Default Petitions" }
    ])

    // Load saved default petitions from database
    const loadDefaultPetitions = async () => {
      try {
        const savedPetitions = await getDefaultPetitions()
        if (savedPetitions) {
          setPetitionText(savedPetitions)
        }
      } catch (error) {
        console.error('Failed to load default petitions:', error)
        toast.error('Failed to load default petitions')
      } finally {
        setInitialLoading(false)
      }
    }

    loadDefaultPetitions()
  }, [setBreadcrumbs])

  const countPetitions = (text: string) => {
    return text.split('\n').filter(line => line.trim()).length
  }

  const handleResetToDefault = () => {
    setPetitionText(DEFAULT_PETITIONS.en)
    toast.success('Reset to default petitions template')
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      await updateDefaultPetitions(petitionText)
      toast.success('Default petitions saved successfully')
    } catch (error) {
      console.error('Error saving default petitions:', error)
      toast.error('Failed to save default petitions')
    } finally {
      setLoading(false)
    }
  }

  if (initialLoading) {
    return (
      <PageContainer
        title="Default Petitions"
        description="Set default petitions that will be used when no template-specific petitions are defined"
      >
        <div className="flex justify-center items-center py-12">
          <Loader2 className="h-8 w-8 animate-spin" />
        </div>
      </PageContainer>
    )
  }

  return (
    <PageContainer
      title="Default Petitions"
      description="Set default petitions that will be used when no template-specific petitions are defined"
    >
      <form onSubmit={handleSubmit} className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Default Petition Text</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="bg-muted p-4 rounded-md text-sm">
              <p className="font-medium mb-2">Usage:</p>
              <ul className="space-y-1 text-muted-foreground">
                <li>• These petitions will be used as a fallback when no template-specific petitions are defined</li>
                <li>• Enter each petition on a new line</li>
                <li>• You can customize these to match your parish&apos;s common needs</li>
                <li>• These serve as a starting point and can be edited during petition creation</li>
              </ul>
            </div>

            <div className="flex justify-between items-center">
              <div>
                <label>Petition Text</label>
                <p className="text-xs text-muted-foreground">Enter each petition on a new line</p>
              </div>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handleResetToDefault}
                disabled={loading}
              >
                <RefreshCw className="h-4 w-4 mr-2" />
                Reset to Default Template
              </Button>
            </div>

            <FormInput
              id="petitionText"
              label=""
              description=""
              inputType="textarea"
              value={petitionText}
              onChange={setPetitionText}
              placeholder="Enter petitions, one per line..."
              rows={12}
              resize={true}
            />
            
            <div className="flex items-center gap-2">
              <Badge variant="outline">
                {countPetitions(petitionText)} petitions
              </Badge>
              <Badge variant="outline">
                {petitionText.length} characters
              </Badge>
            </div>
          </CardContent>
        </Card>

        <div className="flex gap-4">
          <Button type="submit" disabled={loading} className="flex-1">
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <Save className="mr-2 h-4 w-4" />
                Save Default Petitions
              </>
            )}
          </Button>
          <Button
            type="button"
            variant="outline"
            onClick={() => router.push('/settings/petitions')}
            className="flex-1"
          >
            Cancel
          </Button>
        </div>
      </form>
    </PageContainer>
  )
}
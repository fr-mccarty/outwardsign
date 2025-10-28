'use client'

import { useEffect, useState } from 'react'
import { getPetitionWithContext, duplicatePetition } from '@/lib/actions/petitions'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { PageContainer } from '@/components/page-container'
import { Loading } from '@/components/loading'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { useRouter } from 'next/navigation'
import { Edit, Plus, Copy } from 'lucide-react'
import { CopyButton } from '@/components/copy-button'
import { PrintButton } from '@/components/print-button'
import { useBreadcrumbs } from '@/components/breadcrumb-context'
import { Petition, PetitionContext } from '@/lib/types'
import { toast } from 'sonner'

interface PetitionDetailPageProps {
  params: Promise<{ id: string }>
}

export default function PetitionDetailPage({ params }: PetitionDetailPageProps) {
  const [petition, setPetition] = useState<Petition | null>(null)
  const [context, setContext] = useState<PetitionContext | null>(null)
  const [petitionId, setPetitionId] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [duplicating, setDuplicating] = useState(false)
  const { setBreadcrumbs } = useBreadcrumbs()
  const router = useRouter()


  const handleDuplicate = async () => {
    if (!petitionId) return
    
    setDuplicating(true)
    try {
      const duplicatedPetition = await duplicatePetition(petitionId)
      toast.success('Petition duplicated successfully!')
      router.push(`/petitions/${duplicatedPetition.id}/edit`)
    } catch (error) {
      console.error('Failed to duplicate petition:', error)
      toast.error('Failed to duplicate petition')
    } finally {
      setDuplicating(false)
    }
  }

  useEffect(() => {
    const loadPetition = async () => {
      try {
        const { id } = await params
        setPetitionId(id)
        console.log('Loading petition with ID:', id) // Debug log
        
        const result = await getPetitionWithContext(id)
        console.log('Petition result:', result) // Debug log
        
        if (!result) {
          console.log('No petition result found, calling notFound()') // Debug log
          notFound()
          return
        }

        setPetition(result.petition)
        setContext(result.context)
        
        // Set breadcrumbs
        setBreadcrumbs([
          { label: "Dashboard", href: "/dashboard" },
          { label: "Petitions", href: "/petitions" },
          { label: result.petition.title }
        ])
        
        setLoading(false)
      } catch (error) {
        console.error('Error loading petition:', error) // Debug log
        setLoading(false)
        notFound()
      }
    }

    loadPetition()
  }, [params, setBreadcrumbs])

  if (loading) {
    return (
      <PageContainer 
        title="Petition Details"
        description="View petition content and context."
        maxWidth="4xl"
      >
        <Loading />
      </PageContainer>
    )
  }

  if (!petition || !context) {
    notFound()
    return null
  }

  return (
    <PageContainer 
      title="Petition Details"
      description={`Petition for ${new Date(petition.date).toLocaleDateString()} (${petition.language.charAt(0).toUpperCase() + petition.language.slice(1)})`}
      maxWidth="4xl"
    >

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <CardTitle>Generated Petition</CardTitle>
                <CopyButton content={petition.text || petition.generated_content || ''} />
              </div>
            </CardHeader>
            <CardContent>
              <div className="bg-muted p-6 rounded-md">
                {(petition.text || petition.generated_content) ? (
                  <pre className="whitespace-pre-wrap text-sm font-mono">
                    {petition.text || petition.generated_content}
                  </pre>
                ) : (
                  <div className="text-center text-muted-foreground py-8">
                    <p className="text-sm">No petition content has been generated yet.</p>
                    <p className="text-xs mt-2">Use the wizard to generate petition content.</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button className="w-full" asChild>
                <Link href="/petitions/create">
                  <Plus className="h-4 w-4 mr-2" />
                  Create Petitions
                </Link>
              </Button>
              <Button className="w-full" variant="outline" asChild>
                <Link href={`/petitions/${petitionId}/edit`}>
                  <Edit className="h-4 w-4 mr-2" />
                  Edit Petitions
                </Link>
              </Button>
              <Button 
                className="w-full" 
                variant="outline"
                onClick={handleDuplicate}
                disabled={duplicating}
              >
                <Copy className="h-4 w-4 mr-2" />
                {duplicating ? 'Duplicating...' : 'Duplicate Petitions'}
              </Button>
              <PrintButton 
                itemId={petitionId || ''}
                itemType="petitions"
                fullWidth
              />
              <CopyButton 
                content={petition.text || petition.generated_content || ''} 
                className="w-full"
                variant="outline"
              />
            </CardContent>
          </Card>
        </div>
      </div>
    </PageContainer>
  )
}
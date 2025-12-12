import { createClient } from '@/lib/supabase/server'
import { redirect, notFound } from 'next/navigation'
import { getPetition } from '@/lib/actions/petitions'
import { PRINT_PAGE_STYLES } from '@/lib/print-styles'

interface PageProps {
  params: Promise<{ petitionId: string }>
}

export default async function PrintPetitionPage({ params }: PageProps) {
  const supabase = await createClient()

  // Check authentication server-side
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    redirect('/login')
  }

  const { petitionId } = await params
  const petition = await getPetition(petitionId)

  if (!petition) {
    notFound()
  }

  // Get the response text based on language
  const getResponseText = (language: string) => {
    switch (language.toLowerCase()) {
      case 'spanish':
        return 'Te rogamos, óyenos.'
      case 'french':
        return 'Nous te prions, écoute-nous.'
      case 'latin':
        return 'Te rogamus, audi nos.'
      default:
        return 'Lord, hear our prayer.'
    }
  }

  // Get the header text based on language
  const getHeaderText = (language: string) => {
    switch (language.toLowerCase()) {
      case 'spanish':
        return 'PETICIONES'
      case 'french':
        return 'PRIÈRE UNIVERSELLE'
      case 'latin':
        return 'ORATIO UNIVERSALIS'
      default:
        return 'PETITIONS'
    }
  }

  const petitionContent = petition.text || petition.generated_content
  const petitionLines = petitionContent
    ?.split('\n')
    .filter(line => line.trim())
    .filter((line, index) => {
      // Skip the first line if it matches the petition title
      if (index === 0 && line.trim().toLowerCase() === petition.title.toLowerCase()) {
        return false
      }
      return true
    }) || []

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: PRINT_PAGE_STYLES }} />
      <div className="petitions-print-content font-sans">
        {/* Header - Right Aligned Red Text */}
        <div className="text-right text-xl text-red-500 font-semibold">
          {getHeaderText(petition.language)}
        </div>
        <div className="text-right text-xl text-red-500 font-semibold italic">
          {petition.title}
        </div>
        <div className="text-right text-xl text-red-500 font-bold">
          {new Date(petition.date).toLocaleDateString('en-US', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric'
          })}
        </div>

        {/* Petitions Content */}
        <div className="mt-8">
          {petitionLines.length > 0 ? (
            <div className="whitespace-pre-line">
              {petitionLines.map((petitionText, i) => (
                <div key={i} className="mb-4">
                  <div className="mb-1">
                    {petitionText}
                  </div>
                  <div className="font-semibold text-red-500 italic ml-8">
                    {getResponseText(petition.language)}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="mt-3 italic text-gray-600">
              No petition content generated yet.
            </div>
          )}
        </div>
      </div>
    </>
  )
}

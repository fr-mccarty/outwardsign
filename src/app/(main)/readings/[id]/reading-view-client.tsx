"use client"

import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { BookOpen, Edit, Copy } from "lucide-react"
import { deleteReading, type Reading } from "@/lib/actions/readings"
import { toast } from 'sonner'
import Link from 'next/link'
import { ReadingCategoryLabel } from '@/components/reading-category-label'
import { LITURGICAL_LANGUAGE_LABELS } from '@/lib/constants'
import { ModuleViewContainer } from '@/components/module-view-container'

interface ReadingViewClientProps {
  reading: Reading
}

export function ReadingViewClient({ reading }: ReadingViewClientProps) {
  const handleCopyText = () => {
    const fullText = `${reading.pericope}\n\n${reading.text}`
    navigator.clipboard.writeText(fullText)
    toast.success('Reading text copied to clipboard')
  }

  // Action buttons
  const actionButtons = (
    <>
      <Button asChild className="w-full" variant="default">
        <Link href={`/readings/${reading.id}/edit`}>
          <Edit className="h-4 w-4 mr-2" />
          Edit Reading
        </Link>
      </Button>

      <Button
        className="w-full"
        variant="outline"
        onClick={handleCopyText}
      >
        <Copy className="h-4 w-4 mr-2" />
        Copy Text
      </Button>
    </>
  )

  // Details section content
  const details = (
    <>
      {reading.language && (
        <div>
          <span className="font-medium">Language:</span>{' '}
          {LITURGICAL_LANGUAGE_LABELS[reading.language]?.en || reading.language}
        </div>
      )}
      {reading.categories && reading.categories.length > 0 && (
        <div className={reading.language ? "pt-2 border-t" : ""}>
          <span className="font-medium">Categories:</span>
          <div className="flex flex-wrap gap-2 mt-1">
            {reading.categories.map(category => (
              <ReadingCategoryLabel
                key={category}
                category={category}
                variant="secondary"
              />
            ))}
          </div>
        </div>
      )}
    </>
  )

  return (
    <ModuleViewContainer
      entity={reading}
      entityType="Reading"
      modulePath="readings"
      actionButtons={actionButtons}
      details={details}
      onDelete={deleteReading}
    >
      {/* Reading Text */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BookOpen className="h-5 w-5" />
            Reading Text
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="bg-muted/30 p-6 rounded-lg">
            <div className="space-y-4">
              {reading.pericope && (
                <div className="text-center">
                  <h3 className="text-lg font-semibold text-primary">
                    {reading.pericope}
                  </h3>
                </div>
              )}
              <div className="prose prose-sm max-w-none">
                <p className="whitespace-pre-wrap leading-relaxed text-foreground">
                  {reading.text}
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Reading Information */}
      <Card>
        <CardHeader>
          <CardTitle>Reading Information</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div>
              <h4 className="font-medium text-sm text-muted-foreground uppercase tracking-wide mb-1">
                Word Count
              </h4>
              <p className="text-sm">
                {reading.text ? reading.text.split(' ').length : 0} words
              </p>
            </div>
            <div>
              <h4 className="font-medium text-sm text-muted-foreground uppercase tracking-wide mb-1">
                Character Count
              </h4>
              <p className="text-sm">
                {reading.text ? reading.text.length : 0} characters
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </ModuleViewContainer>
  )
}

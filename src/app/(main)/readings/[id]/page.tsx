import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { PageContainer } from '@/components/page-container'
import { BreadcrumbSetter } from '@/components/breadcrumb-setter'
import { BookOpen } from "lucide-react"
import { getReading } from "@/lib/actions/readings"
import { createClient } from '@/lib/supabase/server'
import { redirect, notFound } from 'next/navigation'
import { ReadingFormActions } from './reading-form-actions'
import { ReadingCategoryLabel } from '@/components/reading-category-label'
import { LanguageLabel } from '@/components/language-label'

interface PageProps {
  params: Promise<{ id: string }>
}

export default async function ReadingDetailPage({ params }: PageProps) {
  const supabase = await createClient()

  // Check authentication server-side
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    redirect('/login')
  }

  const { id } = await params

  // Fetch reading server-side
  const reading = await getReading(id)

  if (!reading) {
    notFound()
  }

  const breadcrumbs = [
    { label: "Dashboard", href: "/dashboard" },
    { label: "Our Readings", href: "/readings" },
    { label: reading.pericope || 'Reading' }
  ]

  return (
    <PageContainer
      title={reading.pericope || 'Reading'}
      description="Scripture reading details"
      actions={<ReadingFormActions reading={reading} />}
      maxWidth="4xl"
    >
      <BreadcrumbSetter breadcrumbs={breadcrumbs} />
      <div className="space-y-6">
        {/* Reading Text */}
        <Card>
            <CardHeader>
              <div className="flex items-center justify-between flex-wrap gap-3">
                <CardTitle className="flex items-center gap-2">
                  <BookOpen className="h-5 w-5" />
                  Reading Text
                </CardTitle>
                <div className="flex flex-wrap gap-2 items-center">
                  {reading.language && (
                    <LanguageLabel language={reading.language} />
                  )}
                  {reading.categories && reading.categories.length > 0 && (
                    <>
                      {reading.categories.map(category => (
                        <ReadingCategoryLabel
                          key={category}
                          category={category}
                          variant="secondary"
                        />
                      ))}
                    </>
                  )}
                </div>
              </div>
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
                <div>
                  <h4 className="font-medium text-sm text-muted-foreground uppercase tracking-wide mb-1">
                    Reading ID
                  </h4>
                  <p className="text-xs font-mono text-muted-foreground">
                    {reading.id}
                  </p>
                </div>
              </div>
            </CardContent>
        </Card>
      </div>
    </PageContainer>
  )
}

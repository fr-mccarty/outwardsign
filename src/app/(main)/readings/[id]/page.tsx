import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { PageContainer } from '@/components/page-container'
import { BreadcrumbSetter } from '@/components/breadcrumb-setter'
import { BookOpen, Calendar } from "lucide-react"
import { getReading } from "@/lib/actions/readings"
import { createClient } from '@/lib/supabase/server'
import { redirect, notFound } from 'next/navigation'
import { ReadingFormActions } from './reading-form-actions'

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
    { label: "My Readings", href: "/readings" },
    { label: reading.pericope || 'Reading' }
  ]

  const getCategoryColor = (category: string) => {
    const colors = [
      'bg-blue-100 text-blue-800',
      'bg-green-100 text-green-800',
      'bg-purple-100 text-purple-800',
      'bg-orange-100 text-orange-800',
      'bg-pink-100 text-pink-800',
      'bg-indigo-100 text-indigo-800',
    ]
    return colors[Math.abs(category.split('').reduce((a, b) => a + b.charCodeAt(0), 0)) % colors.length]
  }

  return (
    <PageContainer
      title={reading.pericope || 'Reading'}
      description={reading.lectionary_id || 'Scripture reading details'}
      maxWidth="4xl"
    >
      <BreadcrumbSetter breadcrumbs={breadcrumbs} />
      <div className="space-y-6">
        {/* Title and badges */}
        <div>
          <h1 className="text-3xl font-bold">{reading.pericope || 'Untitled Reading'}</h1>
          <div className="flex items-center gap-2 mt-2 flex-wrap">
            {reading.language && (
              <Badge variant="outline">
                {reading.language}
              </Badge>
            )}
            {reading.lectionary_id && (
              <Badge variant="secondary">
                {reading.lectionary_id}
              </Badge>
            )}
            <div className="flex items-center gap-1 text-sm text-muted-foreground">
              <Calendar className="h-3 w-3" />
              {new Date(reading.created_at).toLocaleDateString()}
            </div>
          </div>
        </div>

        {/* Action buttons */}
        <ReadingFormActions reading={reading} />

        <div className="space-y-6">
          {/* Reading Text */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between flex-wrap gap-3">
                <CardTitle className="flex items-center gap-2">
                  <BookOpen className="h-5 w-5" />
                  Reading Text
                </CardTitle>
                {reading.categories && reading.categories.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {reading.categories.map(category => (
                      <Badge key={category} className={getCategoryColor(category)}>
                        {category}
                      </Badge>
                    ))}
                  </div>
                )}
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
      </div>
    </PageContainer>
  )
}

import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { PageContainer } from '@/components/page-container'
import { BreadcrumbSetter } from '@/components/breadcrumb-setter'
import { HandHeartIcon, Calendar, User, Users } from "lucide-react"
import { getPresentation } from "@/lib/actions/presentations"
import { createClient } from '@/lib/supabase/server'
import { redirect, notFound } from 'next/navigation'
import { PresentationFormActions } from './presentation-form-actions'

interface PageProps {
  params: Promise<{ id: string }>
}

export default async function PresentationDetailPage({ params }: PageProps) {
  const supabase = await createClient()

  // Check authentication server-side
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    redirect('/login')
  }

  const { id } = await params

  // Fetch presentation server-side
  const presentation = await getPresentation(id)

  if (!presentation) {
    notFound()
  }

  const breadcrumbs = [
    { label: "Dashboard", href: "/dashboard" },
    { label: "Presentations", href: "/presentations" },
    { label: presentation.child_name }
  ]

  return (
    <PageContainer
      title={presentation.child_name}
      description="Child presentation details"
      maxWidth="4xl"
    >
      <BreadcrumbSetter breadcrumbs={breadcrumbs} />
      <div className="space-y-6">
        {/* Title and badges */}
        <div>
          <h1 className="text-3xl font-bold">{presentation.child_name}</h1>
          <div className="flex items-center gap-2 mt-2 flex-wrap">
            <Badge variant="outline">
              {presentation.language}
            </Badge>
            <Badge variant="secondary">
              {presentation.child_sex}
            </Badge>
            {presentation.is_baptized && (
              <Badge className="bg-blue-100 text-blue-800">
                Baptized
              </Badge>
            )}
            <div className="flex items-center gap-1 text-sm text-muted-foreground">
              <Calendar className="h-3 w-3" />
              {new Date(presentation.created_at).toLocaleDateString()}
            </div>
          </div>
        </div>

        {/* Action buttons */}
        <PresentationFormActions presentation={presentation} />

        <div className="space-y-6">
          {/* Family Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                Family Information
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h4 className="font-medium text-sm text-muted-foreground uppercase tracking-wide mb-1">
                    Mother
                  </h4>
                  <p className="text-sm">
                    {presentation.mother_name}
                  </p>
                </div>
                <div>
                  <h4 className="font-medium text-sm text-muted-foreground uppercase tracking-wide mb-1">
                    Father
                  </h4>
                  <p className="text-sm">
                    {presentation.father_name}
                  </p>
                </div>
                {presentation.godparents_names && (
                  <div className="md:col-span-2">
                    <h4 className="font-medium text-sm text-muted-foreground uppercase tracking-wide mb-1">
                      Godparents
                    </h4>
                    <p className="text-sm">
                      {presentation.godparents_names}
                    </p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Child Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5" />
                Child Information
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h4 className="font-medium text-sm text-muted-foreground uppercase tracking-wide mb-1">
                    Full Name
                  </h4>
                  <p className="text-sm">
                    {presentation.child_name}
                  </p>
                </div>
                <div>
                  <h4 className="font-medium text-sm text-muted-foreground uppercase tracking-wide mb-1">
                    Sex
                  </h4>
                  <p className="text-sm">
                    {presentation.child_sex}
                  </p>
                </div>
                <div>
                  <h4 className="font-medium text-sm text-muted-foreground uppercase tracking-wide mb-1">
                    Baptism Status
                  </h4>
                  <p className="text-sm">
                    {presentation.is_baptized ? 'Baptized' : 'Not Baptized'}
                  </p>
                </div>
                <div>
                  <h4 className="font-medium text-sm text-muted-foreground uppercase tracking-wide mb-1">
                    Language
                  </h4>
                  <p className="text-sm">
                    {presentation.language}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Notes */}
          {presentation.notes && (
            <Card>
              <CardHeader>
                <CardTitle>Notes</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm whitespace-pre-wrap">
                  {presentation.notes}
                </p>
              </CardContent>
            </Card>
          )}

          {/* Presentation Information */}
          <Card>
            <CardHeader>
              <CardTitle>Presentation Information</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h4 className="font-medium text-sm text-muted-foreground uppercase tracking-wide mb-1">
                    Created At
                  </h4>
                  <p className="text-sm">
                    {new Date(presentation.created_at).toLocaleString()}
                  </p>
                </div>
                <div>
                  <h4 className="font-medium text-sm text-muted-foreground uppercase tracking-wide mb-1">
                    Last Updated
                  </h4>
                  <p className="text-sm">
                    {new Date(presentation.updated_at).toLocaleString()}
                  </p>
                </div>
                <div className="md:col-span-2">
                  <h4 className="font-medium text-sm text-muted-foreground uppercase tracking-wide mb-1">
                    Presentation ID
                  </h4>
                  <p className="text-xs font-mono text-muted-foreground">
                    {presentation.id}
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

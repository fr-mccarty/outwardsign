import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { PageContainer } from '@/components/page-container'
import { BreadcrumbSetter } from '@/components/breadcrumb-setter'
import { Mail, Phone, MapPin, Calendar } from "lucide-react"
import { getPerson } from "@/lib/actions/people"
import { createClient } from '@/lib/supabase/server'
import { redirect, notFound } from 'next/navigation'
import { PersonFormActions } from './person-form-actions'

interface PageProps {
  params: Promise<{ id: string }>
}

export default async function PersonDetailPage({ params }: PageProps) {
  const supabase = await createClient()

  // Check authentication server-side
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    redirect('/login')
  }

  const { id } = await params

  // Fetch person server-side
  const person = await getPerson(id)

  if (!person) {
    notFound()
  }

  const breadcrumbs = [
    { label: "Dashboard", href: "/dashboard" },
    { label: "Our People", href: "/people" },
    { label: `${person.first_name} ${person.last_name}` }
  ]

  return (
    <PageContainer
      title={`${person.first_name} ${person.last_name}`}
      description="Person details"
    >
      <BreadcrumbSetter breadcrumbs={breadcrumbs} />
      <div className="space-y-6">
        {/* Metadata */}
        <div className="flex items-center gap-1 text-sm text-muted-foreground">
          <Calendar className="h-3 w-3" />
          Added {new Date(person.created_at).toLocaleDateString()}
        </div>

        {/* Action buttons */}
        <PersonFormActions person={person} />

        <div className="space-y-6">
          {/* Contact Information */}
          <Card>
            <CardHeader>
              <CardTitle>Contact Information</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {person.email && (
                  <div>
                    <h4 className="font-medium text-sm text-muted-foreground uppercase tracking-wide mb-1 flex items-center gap-2">
                      <Mail className="h-4 w-4" />
                      Email
                    </h4>
                    <p className="text-sm">
                      {person.email}
                    </p>
                  </div>
                )}
                {person.phone_number && (
                  <div>
                    <h4 className="font-medium text-sm text-muted-foreground uppercase tracking-wide mb-1 flex items-center gap-2">
                      <Phone className="h-4 w-4" />
                      Phone
                    </h4>
                    <p className="text-sm">
                      {person.phone_number}
                    </p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Address Information */}
          {(person.street || person.city || person.state || person.zipcode) && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MapPin className="h-5 w-5" />
                  Address Information
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 text-sm">
                  {person.street && <p>{person.street}</p>}
                  {(person.city || person.state || person.zipcode) && (
                    <p>
                      {person.city}{person.city && (person.state || person.zipcode) ? ', ' : ''}
                      {person.state} {person.zipcode}
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Notes */}
          {person.note && (
            <Card>
              <CardHeader>
                <CardTitle>Notes</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm whitespace-pre-wrap">
                  {person.note}
                </p>
              </CardContent>
            </Card>
          )}

          {/* Person Information */}
          <Card>
            <CardHeader>
              <CardTitle>Person Information</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h4 className="font-medium text-sm text-muted-foreground uppercase tracking-wide mb-1">
                    Created At
                  </h4>
                  <p className="text-sm">
                    {new Date(person.created_at).toLocaleString()}
                  </p>
                </div>
                <div>
                  <h4 className="font-medium text-sm text-muted-foreground uppercase tracking-wide mb-1">
                    Last Updated
                  </h4>
                  <p className="text-sm">
                    {new Date(person.updated_at).toLocaleString()}
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

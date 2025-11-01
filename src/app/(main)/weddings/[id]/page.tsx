import { PageContainer } from '@/components/page-container'
import { BreadcrumbSetter } from '@/components/breadcrumb-setter'
import { createClient } from '@/lib/supabase/server'
import { redirect, notFound } from 'next/navigation'
import { getWedding } from '@/lib/actions/weddings'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { WeddingFormActions } from './wedding-form-actions'

interface PageProps {
  params: Promise<{ id: string }>
}

export default async function ViewWeddingPage({ params }: PageProps) {
  const supabase = await createClient()

  // Check authentication server-side
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    redirect('/login')
  }

  const { id } = await params
  const wedding = await getWedding(id)

  if (!wedding) {
    notFound()
  }

  const breadcrumbs = [
    { label: "Dashboard", href: "/dashboard" },
    { label: "Weddings", href: "/weddings" },
    { label: "View" }
  ]

  return (
    <PageContainer
      title="Wedding Details"
      description="View wedding information."
      maxWidth="4xl"
    >
      <BreadcrumbSetter breadcrumbs={breadcrumbs} />
      <WeddingFormActions wedding={wedding} />

      <div className="space-y-6">
        {/* Basic Information */}
        <Card>
          <CardHeader>
            <CardTitle>Basic Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="flex items-center gap-2">
              <span className="font-medium">Status:</span>
              {wedding.status && <Badge variant="outline">{wedding.status}</Badge>}
            </div>
            <div className="text-sm text-muted-foreground">
              Created: {new Date(wedding.created_at).toLocaleString()}
            </div>
            {wedding.updated_at && (
              <div className="text-sm text-muted-foreground">
                Updated: {new Date(wedding.updated_at).toLocaleString()}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Couple */}
        {(wedding.bride_id || wedding.groom_id) && (
          <Card>
            <CardHeader>
              <CardTitle>Couple</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {wedding.bride_id && (
                <div>
                  <span className="font-medium">Bride ID:</span> {wedding.bride_id}
                </div>
              )}
              {wedding.groom_id && (
                <div>
                  <span className="font-medium">Groom ID:</span> {wedding.groom_id}
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* Liturgical Roles */}
        {(wedding.presider_id || wedding.homilist_id) && (
          <Card>
            <CardHeader>
              <CardTitle>Liturgical Roles</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {wedding.presider_id && (
                <div>
                  <span className="font-medium">Presider ID:</span> {wedding.presider_id}
                </div>
              )}
              {wedding.homilist_id && (
                <div>
                  <span className="font-medium">Homilist ID:</span> {wedding.homilist_id}
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* Music Ministers */}
        {(wedding.lead_musician_id || wedding.cantor_id) && (
          <Card>
            <CardHeader>
              <CardTitle>Music Ministers</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {wedding.lead_musician_id && (
                <div>
                  <span className="font-medium">Lead Musician ID:</span> {wedding.lead_musician_id}
                </div>
              )}
              {wedding.cantor_id && (
                <div>
                  <span className="font-medium">Cantor ID:</span> {wedding.cantor_id}
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* Witnesses */}
        {(wedding.witness_1_id || wedding.witness_2_id) && (
          <Card>
            <CardHeader>
              <CardTitle>Witnesses</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {wedding.witness_1_id && (
                <div>
                  <span className="font-medium">Witness 1 ID:</span> {wedding.witness_1_id}
                </div>
              )}
              {wedding.witness_2_id && (
                <div>
                  <span className="font-medium">Witness 2 ID:</span> {wedding.witness_2_id}
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* Coordinator */}
        {wedding.coordinator_id && (
          <Card>
            <CardHeader>
              <CardTitle>Coordination</CardTitle>
            </CardHeader>
            <CardContent>
              <div>
                <span className="font-medium">Coordinator ID:</span> {wedding.coordinator_id}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Readings */}
        {(wedding.first_reading_id || wedding.psalm_id || wedding.second_reading_id || wedding.gospel_reading_id) && (
          <Card>
            <CardHeader>
              <CardTitle>Readings</CardTitle>
              <CardDescription>Scripture readings for the wedding liturgy</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {wedding.first_reading_id && (
                <div>
                  <span className="font-medium">First Reading ID:</span> {wedding.first_reading_id}
                  {wedding.first_reader_id && (
                    <div className="text-sm text-muted-foreground ml-4">
                      Reader ID: {wedding.first_reader_id}
                    </div>
                  )}
                </div>
              )}
              {wedding.psalm_id && (
                <>
                  <Separator />
                  <div>
                    <span className="font-medium">Psalm ID:</span> {wedding.psalm_id}
                    {wedding.psalm_is_sung && (
                      <Badge variant="secondary" className="ml-2">Sung</Badge>
                    )}
                    {wedding.psalm_reader_id && (
                      <div className="text-sm text-muted-foreground ml-4">
                        Reader ID: {wedding.psalm_reader_id}
                      </div>
                    )}
                  </div>
                </>
              )}
              {wedding.second_reading_id && (
                <>
                  <Separator />
                  <div>
                    <span className="font-medium">Second Reading ID:</span> {wedding.second_reading_id}
                    {wedding.second_reader_id && (
                      <div className="text-sm text-muted-foreground ml-4">
                        Reader ID: {wedding.second_reader_id}
                      </div>
                    )}
                  </div>
                </>
              )}
              {wedding.gospel_reading_id && (
                <>
                  <Separator />
                  <div>
                    <span className="font-medium">Gospel Reading ID:</span> {wedding.gospel_reading_id}
                    {wedding.gospel_reader_id && (
                      <div className="text-sm text-muted-foreground ml-4">
                        Reader ID: {wedding.gospel_reader_id}
                      </div>
                    )}
                  </div>
                </>
              )}
            </CardContent>
          </Card>
        )}

        {/* Petitions */}
        {(wedding.petitions || wedding.petition_reader_id) && (
          <Card>
            <CardHeader>
              <CardTitle>Petitions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {wedding.petitions && (
                <div>
                  <span className="font-medium">Petitions:</span>
                  <p className="mt-2 text-sm whitespace-pre-wrap">{wedding.petitions}</p>
                </div>
              )}
              {wedding.petition_reader_id && (
                <div>
                  <span className="font-medium">Petition Reader ID:</span> {wedding.petition_reader_id}
                </div>
              )}
              {wedding.petitions_read_by_second_reader && (
                <Badge variant="secondary">Read by Second Reader</Badge>
              )}
            </CardContent>
          </Card>
        )}

        {/* Announcements */}
        {wedding.announcements && (
          <Card>
            <CardHeader>
              <CardTitle>Announcements</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm whitespace-pre-wrap">{wedding.announcements}</p>
            </CardContent>
          </Card>
        )}

        {/* Notes */}
        {wedding.notes && (
          <Card>
            <CardHeader>
              <CardTitle>Notes</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm whitespace-pre-wrap">{wedding.notes}</p>
            </CardContent>
          </Card>
        )}
      </div>
    </PageContainer>
  )
}

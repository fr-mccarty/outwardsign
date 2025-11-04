"use client"

import { WeddingWithRelations } from '@/lib/actions/weddings'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { FileText, Edit, Download, Printer } from 'lucide-react'
import Link from 'next/link'
import { formatEventDateTime } from '@/lib/utils/date-format'
import { buildWeddingLiturgy } from '@/lib/content-builders/wedding'
import { renderHTML } from '@/lib/renderers/html-renderer'

interface WeddingViewClientProps {
  wedding: WeddingWithRelations
}

export function WeddingViewClient({ wedding }: WeddingViewClientProps) {
  // Generate filename for downloads
  const generateFilename = (extension: string) => {
    const brideLastName = wedding.bride?.last_name || 'Bride'
    const groomLastName = wedding.groom?.last_name || 'Groom'
    const weddingDate = wedding.wedding_event?.start_date
      ? new Date(wedding.wedding_event.start_date).toISOString().split('T')[0].replace(/-/g, '')
      : 'NoDate'
    return `${brideLastName}-${groomLastName}-${weddingDate}.${extension}`
  }

  // Format date and time for display
  const eventDateTime = wedding.wedding_event?.start_date && wedding.wedding_event?.start_time
    ? formatEventDateTime(wedding.wedding_event.start_date, wedding.wedding_event.start_time)
    : 'Missing Date and Time'

  // Build liturgy content using centralized content builder
  const liturgyDocument = buildWeddingLiturgy(wedding, 'wedding-full-script-english')

  // Render to HTML
  const liturgyContent = renderHTML(liturgyDocument)

  return (
    <div className="flex gap-6">
      {/* Main Content */}
      <div className="flex-1">
        <Card>
          <CardContent className="p-6 space-y-6">
            {liturgyContent}
          </CardContent>
        </Card>
      </div>

      {/* Side Panel */}
      <div className="w-80 space-y-4 print:hidden">
        <Card>
          <CardContent className="p-4 space-y-3">
            <Button asChild className="w-full" variant="default">
              <Link href={`/weddings/${wedding.id}/edit`}>
                <Edit className="h-4 w-4 mr-2" />
                Edit Wedding
              </Link>
            </Button>

            <Button
              className="w-full"
              variant="outline"
              onClick={() => window.open(`/print/wedding/${wedding.id}`, '_blank')}
            >
              <Printer className="h-4 w-4 mr-2" />
              Print View
            </Button>

            <div className="pt-2 border-t">
              <h3 className="font-semibold mb-2">Download Liturgy</h3>
              <div className="space-y-2">
                <Button
                  className="w-full"
                  variant="outline"
                  onClick={() => {
                    const link = document.createElement('a')
                    link.href = `/api/weddings/${wedding.id}/pdf`
                    link.download = generateFilename('pdf')
                    document.body.appendChild(link)
                    link.click()
                    document.body.removeChild(link)
                  }}
                >
                  <Download className="h-4 w-4 mr-2" />
                  PDF
                </Button>
                <Button
                  className="w-full"
                  variant="outline"
                  onClick={() => {
                    const link = document.createElement('a')
                    link.href = `/api/weddings/${wedding.id}/word`
                    link.download = generateFilename('docx')
                    document.body.appendChild(link)
                    link.click()
                    document.body.removeChild(link)
                  }}
                >
                  <FileText className="h-4 w-4 mr-2" />
                  Word Doc
                </Button>
              </div>
            </div>

            <div className="pt-2 border-t">
              <h3 className="font-semibold mb-2">Letters to Church of Baptism</h3>
              <div className="space-y-2">
                <Button className="w-full" variant="outline" disabled>
                  <Download className="h-4 w-4 mr-2" />
                  PDF (Coming Soon)
                </Button>
                <Button className="w-full" variant="outline" disabled>
                  <FileText className="h-4 w-4 mr-2" />
                  Word Doc (Coming Soon)
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Wedding Info Card */}
        <Card>
          <CardContent className="p-4 space-y-2 text-sm">
            <div>
              <span className="font-medium">Status:</span> {wedding.status || 'N/A'}
            </div>
            {wedding.wedding_event?.location && (
              <div>
                <span className="font-medium">Location:</span> {wedding.wedding_event.location}
              </div>
            )}
            <div className="text-xs text-muted-foreground pt-2 border-t">
              Created: {new Date(wedding.created_at).toLocaleDateString()}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

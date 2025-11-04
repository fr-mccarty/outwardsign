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
    <div className="flex flex-col md:flex-row gap-6">
      {/* Side Panel - appears first on mobile, second on desktop */}
      <div className="w-full md:w-80 space-y-4 print:hidden order-1 md:order-2">
        <Card>
          <CardContent className="pt-4 px-4 pb-2 space-y-3">
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

            <div className="pt-4 border-t space-y-2 text-sm">
              <div>
                <span className="font-medium">Status:</span> {wedding.status || 'N/A'}
              </div>
              {wedding.wedding_event?.location && (
                <div>
                  <span className="font-medium">Location:</span> {wedding.wedding_event.location}
                </div>
              )}
              <div className="text-xs text-muted-foreground pt-1 border-t">
                Created: {new Date(wedding.created_at).toLocaleDateString()}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content - appears second on mobile, first on desktop */}
      <div className="flex-1 order-2 md:order-1">
        <Card>
          <CardContent className="p-6 space-y-6">
            {liturgyContent}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

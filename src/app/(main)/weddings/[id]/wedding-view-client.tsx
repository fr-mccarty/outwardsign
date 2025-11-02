"use client"

import { WeddingWithRelations } from '@/lib/actions/weddings'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { FileText, Edit, Download } from 'lucide-react'
import Link from 'next/link'
import { formatEventDateTime } from '@/lib/utils/date-format'
import { liturgyPatterns, htmlStyles, createHtmlStyle } from '@/lib/styles/liturgy-styles'

interface WeddingViewClientProps {
  wedding: WeddingWithRelations
}

// Additional liturgical styles not covered by patterns
const additionalStyles = {
  sectionTitle: createHtmlStyle({
    fontSize: 'sectionTitle',
    bold: true,
    marginTop: 'large',
    marginBottom: 'medium',
  }),
  responseLabel: createHtmlStyle({
    fontSize: 'response',
    bold: true,
  }),
  priestDialogue: createHtmlStyle({
    fontSize: 'priestDialogue',
    marginTop: 'small',
  }),
  petitionText: createHtmlStyle({
    fontSize: 'petition',
    lineHeight: 'normal',
    bold: true,
    marginTop: 'small',
    marginBottom: 'small',
  }),
  petitionReader: createHtmlStyle({
    fontSize: 'petition',
    bold: true,
  }),
  petitionPause: createHtmlStyle({
    fontSize: 'petition',
    bold: true,
    color: htmlStyles.color,
  }),
}

export function WeddingViewClient({ wedding }: WeddingViewClientProps) {
  const brideName = wedding.bride ? wedding.bride.first_name : ''
  const groomName = wedding.groom ? wedding.groom.first_name : ''
  const weddingTitle = wedding.bride && wedding.groom
    ? `${wedding.bride.first_name} ${wedding.bride.last_name} & ${wedding.groom.first_name} ${wedding.groom.last_name}`
    : 'Wedding'

  // Format date and time
  const eventDateTime = wedding.wedding_event?.start_date && wedding.wedding_event?.start_time
    ? formatEventDateTime(wedding.wedding_event.start_date, wedding.wedding_event.start_time)
    : 'Missing Date and Time'

  // Generate filename for downloads
  const generateFilename = (extension: string) => {
    const brideLastName = wedding.bride?.last_name || 'Bride'
    const groomLastName = wedding.groom?.last_name || 'Groom'
    const weddingDate = wedding.wedding_event?.start_date
      ? new Date(wedding.wedding_event.start_date).toISOString().split('T')[0].replace(/-/g, '')
      : 'NoDate'
    return `${brideLastName}-${groomLastName}-${weddingDate}.${extension}`
  }

  // Parse custom petitions from the petitions field
  const customPetitions = wedding.petitions
    ? wedding.petitions.split('\n').filter(p => p.trim())
    : []

  // Determine who reads petitions
  const petitionsReader = wedding.petitions_read_by_second_reader && wedding.second_reader
    ? `${wedding.second_reader.first_name} ${wedding.second_reader.last_name}`
    : wedding.petition_reader
    ? `${wedding.petition_reader.first_name} ${wedding.petition_reader.last_name}`
    : ''

  // Helper function to format person name
  const formatPersonName = (person?: { first_name: string; last_name: string } | null) => {
    return person ? `${person.first_name} ${person.last_name}` : ''
  }

  // Helper function to format person with phone
  const formatPersonWithPhone = (person?: { first_name: string; last_name: string; phone_number?: string } | null) => {
    if (!person) return ''
    const name = `${person.first_name} ${person.last_name}`
    return person.phone_number ? `${name} (${person.phone_number})` : name
  }

  // Helper function to format event datetime
  const formatEventDateTimeString = (event?: { start_date?: string; start_time?: string } | null) => {
    if (!event?.start_date) return ''
    const date = new Date(event.start_date).toLocaleDateString()
    return event.start_time ? `${date} at ${event.start_time}` : date
  }

  return (
    <div className="flex gap-6">
      {/* Main Content */}
      <div className="flex-1">
        <Card>
          <CardContent className="p-6 space-y-6">
            {/* Summary Section */}
            <div className="liturgy-section print:break-after-page">
              <div className="text-center">
                <div style={liturgyPatterns.html.eventTitle}>{weddingTitle}</div>
                <div style={liturgyPatterns.html.eventDateTime}>{eventDateTime}</div>
              </div>

              {(wedding.rehearsal_event || wedding.rehearsal_dinner_event) && (
                <div>
                  <div style={additionalStyles.sectionTitle}>Rehearsal</div>
                  {wedding.rehearsal_event && (
                    <>
                      {wedding.rehearsal_event.start_date && (
                        <div className="liturgy-info-grid">
                          <div className="liturgy-info-label">Rehearsal Date & Time:</div>
                          <div>{formatEventDateTimeString(wedding.rehearsal_event)}</div>
                        </div>
                      )}
                      {wedding.rehearsal_event.location && (
                        <div className="liturgy-info-grid">
                          <div className="liturgy-info-label">Rehearsal Location:</div>
                          <div>{wedding.rehearsal_event.location}</div>
                        </div>
                      )}
                    </>
                  )}
                  {wedding.rehearsal_dinner_event?.location && (
                    <div className="liturgy-info-grid">
                      <div className="liturgy-info-label">Rehearsal Dinner Location:</div>
                      <div>{wedding.rehearsal_dinner_event.location}</div>
                    </div>
                  )}
                </div>
              )}

              <div>
                <div style={additionalStyles.sectionTitle}>Wedding</div>
                {wedding.bride && (
                  <div className="liturgy-info-grid">
                    <div className="liturgy-info-label">Bride:</div>
                    <div>{formatPersonWithPhone(wedding.bride)}</div>
                  </div>
                )}
                {wedding.groom && (
                  <div className="liturgy-info-grid">
                    <div className="liturgy-info-label">Groom:</div>
                    <div>{formatPersonWithPhone(wedding.groom)}</div>
                  </div>
                )}
                {wedding.coordinator && (
                  <div className="liturgy-info-grid">
                    <div className="liturgy-info-label">Coordinator:</div>
                    <div>{formatPersonName(wedding.coordinator)}</div>
                  </div>
                )}
                {wedding.presider && (
                  <div className="liturgy-info-grid">
                    <div className="liturgy-info-label">Presider:</div>
                    <div>{formatPersonName(wedding.presider)}</div>
                  </div>
                )}
                {wedding.lead_musician && (
                  <div className="liturgy-info-grid">
                    <div className="liturgy-info-label">Lead Musician:</div>
                    <div>{formatPersonName(wedding.lead_musician)}</div>
                  </div>
                )}
                {wedding.wedding_event?.location && (
                  <div className="liturgy-info-grid">
                    <div className="liturgy-info-label">Wedding Location:</div>
                    <div>{wedding.wedding_event.location}</div>
                  </div>
                )}
                {wedding.reception_event?.location && (
                  <div className="liturgy-info-grid">
                    <div className="liturgy-info-label">Reception Location:</div>
                    <div>{wedding.reception_event.location}</div>
                  </div>
                )}
                {wedding.witness_1 && (
                  <div className="liturgy-info-grid">
                    <div className="liturgy-info-label">Best Man:</div>
                    <div>{formatPersonName(wedding.witness_1)}</div>
                  </div>
                )}
                {wedding.witness_2 && (
                  <div className="liturgy-info-grid">
                    <div className="liturgy-info-label">Maid/Matron of Honor:</div>
                    <div>{formatPersonName(wedding.witness_2)}</div>
                  </div>
                )}
                {wedding.notes && (
                  <div className="liturgy-info-grid">
                    <div className="liturgy-info-label">Wedding Note:</div>
                    <div>{wedding.notes}</div>
                  </div>
                )}
              </div>

              <div>
                <div style={additionalStyles.sectionTitle}>Sacred Liturgy</div>
                {wedding.first_reading && (
                  <div className="liturgy-info-grid">
                    <div className="liturgy-info-label">First Reading:</div>
                    <div>{wedding.first_reading.pericope}</div>
                  </div>
                )}
                {wedding.first_reader && (
                  <div className="liturgy-info-grid">
                    <div className="liturgy-info-label">First Reading Lector:</div>
                    <div>{formatPersonName(wedding.first_reader)}</div>
                  </div>
                )}
                {wedding.psalm && (
                  <div className="liturgy-info-grid">
                    <div className="liturgy-info-label">Psalm:</div>
                    <div>{wedding.psalm.pericope}</div>
                  </div>
                )}
                {wedding.psalm_is_sung && (
                  <div className="liturgy-info-grid">
                    <div className="liturgy-info-label">Psalm Choice:</div>
                    <div>Sung</div>
                  </div>
                )}
                {wedding.psalm_reader && !wedding.psalm_is_sung && (
                  <div className="liturgy-info-grid">
                    <div className="liturgy-info-label">Psalm Lector:</div>
                    <div>{formatPersonName(wedding.psalm_reader)}</div>
                  </div>
                )}
                {wedding.second_reading && (
                  <div className="liturgy-info-grid">
                    <div className="liturgy-info-label">Second Reading:</div>
                    <div>{wedding.second_reading.pericope}</div>
                  </div>
                )}
                {wedding.second_reader && (
                  <div className="liturgy-info-grid">
                    <div className="liturgy-info-label">Second Reading Lector:</div>
                    <div>{formatPersonName(wedding.second_reader)}</div>
                  </div>
                )}
                {wedding.gospel_reading && (
                  <div className="liturgy-info-grid">
                    <div className="liturgy-info-label">Gospel Reading:</div>
                    <div>{wedding.gospel_reading.pericope}</div>
                  </div>
                )}
                {petitionsReader && (
                  <div className="liturgy-info-grid">
                    <div className="liturgy-info-label">Petitions Read By:</div>
                    <div>{petitionsReader}</div>
                  </div>
                )}
                {wedding.petitions && (
                  <div className="liturgy-info-grid">
                    <div className="liturgy-info-label">Additional Petitions:</div>
                    <div className="whitespace-pre-line">{wedding.petitions}</div>
                  </div>
                )}
              </div>
            </div>

            {/* Readings Section */}
            <div className="space-y-6 print:break-after-page">
              {/* First Reading */}
              <div>
                <div style={liturgyPatterns.html.eventTitle}>{weddingTitle}</div>
                <div style={liturgyPatterns.html.eventDateTime}>{eventDateTime}</div>

                <div style={{...liturgyPatterns.html.readingTitle, marginTop: htmlStyles.spacing.large}}>FIRST READING</div>
                {wedding.first_reading ? (
                  <>
                    <div style={liturgyPatterns.html.pericope}>
                      {wedding.first_reading.pericope || 'No pericope'}
                    </div>
                    {wedding.first_reader && (
                      <div style={liturgyPatterns.html.readerName}>
                        {wedding.first_reader.first_name} {wedding.first_reader.last_name}
                      </div>
                    )}
                    {wedding.first_reading.introduction && (
                      <div style={liturgyPatterns.html.introduction}>{wedding.first_reading.introduction}</div>
                    )}
                    <div style={liturgyPatterns.html.readingText}>
                      {wedding.first_reading.text || 'No reading text'}
                    </div>
                    {wedding.first_reading.conclusion && (
                      <div style={liturgyPatterns.html.conclusion}>{wedding.first_reading.conclusion}</div>
                    )}
                    <div style={liturgyPatterns.html.response}>
                      <span style={additionalStyles.responseLabel}>People:</span> Thanks be to God.
                    </div>
                  </>
                ) : (
                  <div>None Selected</div>
                )}
              </div>

              {/* Psalm */}
              <div>
                <div style={liturgyPatterns.html.readingTitle}>Psalm</div>
                {wedding.psalm ? (
                  <>
                    <div style={liturgyPatterns.html.pericope}>
                      {wedding.psalm.pericope || 'No pericope'}
                    </div>
                    {!wedding.psalm_is_sung && wedding.psalm_reader && (
                      <div style={liturgyPatterns.html.readerName}>
                        {wedding.psalm_reader.first_name} {wedding.psalm_reader.last_name}
                      </div>
                    )}
                    {wedding.psalm_is_sung && (
                      <div style={liturgyPatterns.html.readerName}>Sung</div>
                    )}
                    {wedding.psalm.introduction && (
                      <div style={liturgyPatterns.html.introduction}>{wedding.psalm.introduction}</div>
                    )}
                    <div style={liturgyPatterns.html.readingText}>
                      {wedding.psalm.text || 'No psalm text'}
                    </div>
                    {wedding.psalm.conclusion && (
                      <div style={liturgyPatterns.html.conclusion}>{wedding.psalm.conclusion}</div>
                    )}
                  </>
                ) : (
                  <div>None Selected</div>
                )}
              </div>

              {/* Second Reading */}
              <div>
                <div style={liturgyPatterns.html.readingTitle}>Second Reading</div>
                {wedding.second_reading ? (
                  <>
                    <div style={liturgyPatterns.html.pericope}>
                      {wedding.second_reading.pericope || 'No pericope'}
                    </div>
                    {wedding.second_reader && (
                      <div style={liturgyPatterns.html.readerName}>
                        {wedding.second_reader.first_name} {wedding.second_reader.last_name}
                      </div>
                    )}
                    {wedding.second_reading.introduction && (
                      <div style={liturgyPatterns.html.introduction}>{wedding.second_reading.introduction}</div>
                    )}
                    <div style={liturgyPatterns.html.readingText}>
                      {wedding.second_reading.text || 'No reading text'}
                    </div>
                    {wedding.second_reading.conclusion && (
                      <div style={liturgyPatterns.html.conclusion}>{wedding.second_reading.conclusion}</div>
                    )}
                    <div style={liturgyPatterns.html.response}>
                      <span style={additionalStyles.responseLabel}>People:</span> Thanks be to God.
                    </div>
                  </>
                ) : (
                  <div>None Selected</div>
                )}
              </div>

              {/* Gospel */}
              <div>
                <div style={liturgyPatterns.html.readingTitle}>Gospel</div>
                {wedding.gospel_reading ? (
                  <>
                    <div style={liturgyPatterns.html.pericope}>
                      {wedding.gospel_reading.pericope || 'No pericope'}
                    </div>
                    <div style={additionalStyles.priestDialogue}>
                      <span style={additionalStyles.responseLabel}>Priest:</span> The Lord be with you.
                    </div>
                    <div style={liturgyPatterns.html.response}>
                      <span style={additionalStyles.responseLabel}>People:</span> And with your spirit.
                    </div>
                    {wedding.gospel_reading.introduction && (
                      <div style={liturgyPatterns.html.introduction}>{wedding.gospel_reading.introduction}</div>
                    )}
                    <div style={liturgyPatterns.html.readingText}>
                      {wedding.gospel_reading.text || 'No gospel text'}
                    </div>
                    {wedding.gospel_reading.conclusion && (
                      <div style={liturgyPatterns.html.conclusion}>{wedding.gospel_reading.conclusion}</div>
                    )}
                    <div style={liturgyPatterns.html.response}>
                      <span style={additionalStyles.responseLabel}>People:</span> Praise to you, Lord Jesus Christ.
                    </div>
                  </>
                ) : (
                  <div>None Selected</div>
                )}
              </div>
            </div>

            {/* Petitions Section */}
            <div className="print:break-after-page">
              <div style={liturgyPatterns.html.readingTitle}>Petitions</div>
              {petitionsReader && (
                <div style={liturgyPatterns.html.readerName}>{petitionsReader}</div>
              )}

              <div className="space-y-2 mt-4">
                <div style={additionalStyles.petitionText}>
                  <span style={additionalStyles.petitionReader}>Reader:</span> The response is "Lord, hear our prayer."{' '}
                  <span style={additionalStyles.petitionPause}>[Pause]</span>
                  <br />
                  For {brideName} and {groomName}, joined now in marriage, that their love will grow and
                  their commitment will deepen every day, let us pray to the Lord.
                </div>

                <div style={liturgyPatterns.html.response}>
                  <span style={additionalStyles.responseLabel}>People:</span> Lord, hear our prayer.
                </div>

                <div style={additionalStyles.petitionText}>
                  <span style={additionalStyles.petitionReader}>Reader:</span> For the parents and grandparents of {brideName} and{' '}
                  {groomName}, without whose dedication to God and family we would not be gathered here today,
                  that they will be blessed as they gain a son or daughter, let us pray to the Lord.
                </div>

                <div style={liturgyPatterns.html.response}>
                  <span style={additionalStyles.responseLabel}>People:</span> Lord, hear our prayer.
                </div>

                <div style={additionalStyles.petitionText}>
                  <span style={additionalStyles.petitionReader}>Reader:</span> For the families and friends of {brideName} and{' '}
                  {groomName}, gathered here today, that they continue to enrich each other with love and
                  support through the years, let us pray to the Lord.
                </div>

                <div style={liturgyPatterns.html.response}>
                  <span style={additionalStyles.responseLabel}>People:</span> Lord, hear our prayer.
                </div>

                {customPetitions.map((petition, index) => (
                  <div key={index}>
                    <div style={additionalStyles.petitionText}>
                      <span style={additionalStyles.petitionReader}>Reader:</span> {petition}, let us pray to the Lord.
                    </div>

                    <div style={liturgyPatterns.html.response}>
                      <span style={additionalStyles.responseLabel}>People:</span> Lord, hear our prayer.
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Announcements Section */}
            {wedding.announcements && (
              <div>
                <div style={additionalStyles.sectionTitle}>Announcements</div>
                <div style={liturgyPatterns.html.readingText}>{wedding.announcements}</div>
              </div>
            )}
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

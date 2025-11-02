"use client"

import { WeddingWithRelations } from '@/lib/actions/weddings'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { FileText, Edit, Download } from 'lucide-react'
import Link from 'next/link'
import { formatEventDateTime } from '@/lib/utils/date-format'

interface WeddingViewClientProps {
  wedding: WeddingWithRelations
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

  return (
    <div className="flex gap-6">
      {/* Main Content */}
      <div className="flex-1 space-y-6">
        {/* Page 1: First Reading */}
        <div className="p-6 bg-white rounded-lg shadow print:shadow-none print:break-after-page">
          <div className="text-2xl font-bold text-center">{weddingTitle}</div>
          <div className="text-xl text-center">{eventDateTime}</div>

          <div className="text-right text-xl text-red-500 font-semibold mt-6">FIRST READING</div>
          {wedding.first_reading ? (
            <>
              <div className="text-right text-xl text-red-500 font-semibold italic">
                {wedding.first_reading.pericope || 'No pericope'}
              </div>
              {wedding.first_reader && (
                <div className="text-right text-xl text-red-500 font-bold">
                  {wedding.first_reader.first_name} {wedding.first_reader.last_name}
                </div>
              )}
              {wedding.first_reading.introduction && (
                <div className="mt-3 font-semibold">{wedding.first_reading.introduction}</div>
              )}
              <div className="mt-3 whitespace-pre-line">
                {wedding.first_reading.text || 'No reading text'}
              </div>
              {wedding.first_reading.conclusion && (
                <div className="mt-3 font-semibold">{wedding.first_reading.conclusion}</div>
              )}
              <div className="mt-3 italic">
                <span className="font-semibold">People:</span> Thanks be to God.
              </div>
            </>
          ) : (
            <div>None Selected</div>
          )}
        </div>

        {/* Page 2: Psalm */}
        <div className="p-6 bg-white rounded-lg shadow print:shadow-none print:break-after-page">
          <div className="text-right text-xl text-red-500 font-semibold">Psalm</div>
          {wedding.psalm ? (
            <>
              <div className="text-right text-xl text-red-500 font-semibold italic">
                {wedding.psalm.pericope || 'No pericope'}
              </div>
              {!wedding.psalm_is_sung && wedding.psalm_reader && (
                <div className="text-right text-xl text-red-500 font-bold">
                  {wedding.psalm_reader.first_name} {wedding.psalm_reader.last_name}
                </div>
              )}
              {wedding.psalm_is_sung && (
                <div className="text-right text-xl text-red-500 font-bold">Sung</div>
              )}
              {wedding.psalm.introduction && (
                <div className="mt-3 font-semibold">{wedding.psalm.introduction}</div>
              )}
              <div className="mt-3 whitespace-pre-line space-y-2">
                {wedding.psalm.text || 'No psalm text'}
              </div>
              {wedding.psalm.conclusion && (
                <div className="mt-3 font-semibold">{wedding.psalm.conclusion}</div>
              )}
            </>
          ) : (
            <div>None Selected</div>
          )}
        </div>

        {/* Page 3: Second Reading */}
        <div className="p-6 bg-white rounded-lg shadow print:shadow-none print:break-after-page">
          <div className="text-right text-xl text-red-500 font-semibold">Second Reading</div>
          {wedding.second_reading ? (
            <>
              <div className="text-right text-xl text-red-500 font-semibold italic">
                {wedding.second_reading.pericope || 'No pericope'}
              </div>
              {wedding.second_reader && (
                <div className="text-right text-xl text-red-500 font-bold">
                  {wedding.second_reader.first_name} {wedding.second_reader.last_name}
                </div>
              )}
              {wedding.second_reading.introduction && (
                <div className="mt-3 font-semibold">{wedding.second_reading.introduction}</div>
              )}
              <div className="mt-3 whitespace-pre-line">
                {wedding.second_reading.text || 'No reading text'}
              </div>
              {wedding.second_reading.conclusion && (
                <div className="mt-3 font-semibold">{wedding.second_reading.conclusion}</div>
              )}
              <div className="mt-3 italic">
                <span className="font-semibold">People:</span> Thanks be to God.
              </div>
            </>
          ) : (
            <div>None Selected</div>
          )}
        </div>

        {/* Page 4: Gospel */}
        <div className="p-6 bg-white rounded-lg shadow print:shadow-none print:break-after-page">
          <div className="text-right text-xl text-red-500 font-semibold">Gospel</div>
          {wedding.gospel_reading ? (
            <>
              <div className="text-right text-xl text-red-500 font-semibold italic">
                {wedding.gospel_reading.pericope || 'No pericope'}
              </div>
              <div className="mt-3">
                <span className="font-semibold">Priest:</span> The Lord be with you.
              </div>
              <div className="mt-3 italic">
                <span className="font-semibold">People:</span> And with your spirit.
              </div>
              {wedding.gospel_reading.introduction && (
                <div className="mt-3 font-semibold">{wedding.gospel_reading.introduction}</div>
              )}
              <div className="mt-3 whitespace-pre-line">
                {wedding.gospel_reading.text || 'No gospel text'}
              </div>
              {wedding.gospel_reading.conclusion && (
                <div className="mt-3 font-semibold">{wedding.gospel_reading.conclusion}</div>
              )}
              <div className="mt-3 italic">
                <span className="font-semibold">People:</span> Praise to you, Lord Jesus Christ.
              </div>
            </>
          ) : (
            <div>None Selected</div>
          )}
        </div>

        {/* Page 5: Petitions */}
        <div className="p-6 bg-white rounded-lg shadow print:shadow-none">
          <div className="text-right text-xl text-red-500 font-semibold">Petitions</div>
          {petitionsReader && (
            <div className="text-right text-xl text-red-500 font-bold">{petitionsReader}</div>
          )}

          <div className="space-y-2 mt-4">
            <div className="font-semibold">
              <span className="font-bold">Reader:</span> The response is "Lord, hear our prayer."{' '}
              <span className="font-bold text-red-500">[Pause]</span>
              <br />
              For {brideName} and {groomName}, joined now in marriage, that their love will grow and
              their commitment will deepen every day, let us pray to the Lord.
            </div>

            <div className="italic">
              <span className="font-semibold">People:</span> Lord, hear our prayer.
            </div>

            <div className="font-semibold">
              <span className="font-bold">Reader:</span> For the parents and grandparents of {brideName} and{' '}
              {groomName}, without whose dedication to God and family we would not be gathered here today,
              that they will be blessed as they gain a son or daughter, let us pray to the Lord.
            </div>

            <div className="italic">
              <span className="font-semibold">People:</span> Lord, hear our prayer.
            </div>

            <div className="font-semibold">
              <span className="font-bold">Reader:</span> For the families and friends of {brideName} and{' '}
              {groomName}, gathered here today, that they continue to enrich each other with love and
              support through the years, let us pray to the Lord.
            </div>

            <div className="italic">
              <span className="font-semibold">People:</span> Lord, hear our prayer.
            </div>

            {customPetitions.map((petition, index) => (
              <div key={index}>
                <div className="font-semibold">
                  <span className="font-bold">Reader:</span> {petition}, let us pray to the Lord.
                </div>

                <div className="italic">
                  <span className="font-semibold">People:</span> Lord, hear our prayer.
                </div>
              </div>
            ))}
          </div>
        </div>
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
                <Button className="w-full" variant="outline" onClick={() => window.print()}>
                  <Download className="h-4 w-4 mr-2" />
                  PDF (Print)
                </Button>
                <Button className="w-full" variant="outline" disabled>
                  <FileText className="h-4 w-4 mr-2" />
                  Word Doc (Coming Soon)
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

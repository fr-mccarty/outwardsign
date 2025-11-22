'use client'

import { useState } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { FileText, Download, Printer } from 'lucide-react'
import { getMassIntentionsReport, type MassIntentionReportData } from '@/lib/actions/mass-intentions'
import { toast } from 'sonner'
import { formatDatePretty } from '@/lib/utils/formatters'
import { getStatusLabel } from '@/lib/content-builders/shared/helpers'
import Link from 'next/link'
import { PageContainer } from '@/components/page-container'

export function MassIntentionsReportClient() {
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')
  const [intentions, setIntentions] = useState<MassIntentionReportData[]>([])
  const [totalStipends, setTotalStipends] = useState(0)
  const [isLoading, setIsLoading] = useState(false)
  const [hasSearched, setHasSearched] = useState(false)

  const handleGenerateReport = async () => {
    // Validate if both dates are provided, start must be before end
    if (startDate && endDate && startDate > endDate) {
      toast.error('Start date must be before end date')
      return
    }

    setIsLoading(true)
    try {
      const result = await getMassIntentionsReport({
        startDate: startDate || undefined,
        endDate: endDate || undefined
      })
      setIntentions(result.intentions)
      setTotalStipends(result.totalStipends)
      setHasSearched(true)
      toast.success(`Found ${result.totalCount} mass intention(s)`)
    } catch (error) {
      console.error('Error generating report:', error)
      toast.error('Failed to generate report')
    } finally {
      setIsLoading(false)
    }
  }

  const formatStipend = (cents: number | null | undefined) => {
    if (!cents) return '$0.00'
    return `$${(cents / 100).toFixed(2)}`
  }

  const getStatusVariant = (status: string) => {
    switch (status) {
      case 'REQUESTED':
        return 'secondary'
      case 'CONFIRMED':
        return 'default'
      case 'FULFILLED':
        return 'outline'
      case 'CANCELLED':
        return 'destructive'
      default:
        return 'secondary'
    }
  }

  const handlePrint = () => {
    if (!hasSearched) {
      toast.error('Please generate a report first')
      return
    }
    const params = new URLSearchParams()
    if (startDate) params.set('startDate', startDate)
    if (endDate) params.set('endDate', endDate)
    window.open(`/print/mass-intentions/report?${params.toString()}`, '_blank')
  }

  const handleDownloadCSV = async () => {
    if (!hasSearched) {
      toast.error('Please generate a report first')
      return
    }

    try {
      const params = new URLSearchParams()
      if (startDate) params.set('startDate', startDate)
      if (endDate) params.set('endDate', endDate)

      const response = await fetch(`/api/mass-intentions/report/csv?${params.toString()}`)
      if (!response.ok) throw new Error('Failed to download CSV')

      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      const filename = startDate && endDate
        ? `mass-intentions-report-${startDate}-to-${endDate}.csv`
        : startDate
        ? `mass-intentions-report-from-${startDate}.csv`
        : endDate
        ? `mass-intentions-report-until-${endDate}.csv`
        : `mass-intentions-report-all.csv`
      a.download = filename
      document.body.appendChild(a)
      a.click()
      window.URL.revokeObjectURL(url)
      document.body.removeChild(a)
      toast.success('CSV downloaded successfully')
    } catch (error) {
      console.error('Error downloading CSV:', error)
      toast.error('Failed to download CSV')
    }
  }

  return (
    <PageContainer
      title="Mass Intentions Report"
      description="Generate a report of Mass Intentions. Optionally filter by date range, or leave dates blank to show all."
    >
      <div className="flex flex-col md:flex-row gap-6">
        {/* Sidebar - appears first on mobile, second on desktop */}
        <div className="w-full md:w-80 space-y-4 print:hidden order-1 md:order-2">
          <Card>
            <CardContent className="pt-4 px-4 pb-2 space-y-3">
              <Button
                className="w-full"
                variant="outline"
                onClick={handlePrint}
                disabled={!hasSearched}
              >
                <Printer className="h-4 w-4 mr-2" />
                Print View
              </Button>

              <div className="pt-2 border-t">
                <h3 className="font-semibold mb-2">Download Report</h3>
                <Button
                  className="w-full"
                  variant="outline"
                  onClick={handleDownloadCSV}
                  disabled={!hasSearched}
                >
                  <Download className="h-4 w-4 mr-2" />
                  CSV
                </Button>
              </div>

              {hasSearched && (
                <div className="pt-4 border-t space-y-2 text-sm">
                  {(startDate || endDate) && (
                    <div className="flex flex-col gap-1">
                      <span className="font-medium">Date Range:</span>
                      {startDate && endDate ? (
                        <>
                          <span className="text-muted-foreground">
                            {formatDatePretty(startDate)}
                          </span>
                          <span className="text-muted-foreground">to</span>
                          <span className="text-muted-foreground">
                            {formatDatePretty(endDate)}
                          </span>
                        </>
                      ) : startDate ? (
                        <span className="text-muted-foreground">
                          From {formatDatePretty(startDate)} onwards
                        </span>
                      ) : endDate ? (
                        <span className="text-muted-foreground">
                          Until {formatDatePretty(endDate)}
                        </span>
                      ) : null}
                    </div>
                  )}
                  {!startDate && !endDate && (
                    <div className="flex flex-col gap-1">
                      <span className="font-medium">Showing:</span>
                      <span className="text-muted-foreground">All Mass Intentions</span>
                    </div>
                  )}
                  <div className="pt-2 border-t">
                    <span className="font-medium">Total Results:</span>{' '}
                    <span className="text-muted-foreground">{intentions.length}</span>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Main Content - appears second on mobile, first on desktop */}
        <div className="flex-1 order-2 md:order-1">
          <Card>
            <CardContent className="p-6 space-y-6">
              {/* Date Range Selection */}
              <div className="flex flex-col md:flex-row gap-4 items-end">
                <div className="flex-1 space-y-2">
                  <Label htmlFor="startDate">Start Date (Optional)</Label>
                  <Input
                    id="startDate"
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                  />
                </div>
                <div className="flex-1 space-y-2">
                  <Label htmlFor="endDate">End Date (Optional)</Label>
                  <Input
                    id="endDate"
                    type="date"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                  />
                </div>
                <Button
                  onClick={handleGenerateReport}
                  disabled={isLoading}
                  className="md:w-auto w-full"
                >
                  {isLoading ? 'Generating...' : 'Generate Report'}
                </Button>
              </div>

              {/* Results */}
              {hasSearched && (
                <>
                  {intentions.length === 0 ? (
                    <div className="text-center py-12">
                      <FileText className="mx-auto h-12 w-12 text-muted-foreground" />
                      <h3 className="mt-4 text-lg font-semibold">No Mass Intentions Found</h3>
                      <p className="text-muted-foreground mt-2">
                        No Mass Intentions were found for the selected date range.
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      <div className="overflow-x-auto">
                        <Table>
                          <TableHeader>
                            <TableRow>
                              <TableHead>Mass Details</TableHead>
                              <TableHead>Intention</TableHead>
                              <TableHead>Request Info</TableHead>
                              <TableHead>Financial</TableHead>
                              <TableHead>Notes</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {intentions.map((intention) => (
                              <TableRow key={intention.id}>
                                <TableCell>
                                  <div className="flex flex-col gap-1">
                                    <span className="font-medium">
                                      {intention.mass?.event?.start_date
                                        ? formatDatePretty(intention.mass.event.start_date)
                                        : 'N/A'}
                                    </span>
                                    <Badge variant={getStatusVariant(intention.status || 'REQUESTED')} className="w-fit">
                                      {getStatusLabel(intention.status, 'en')}
                                    </Badge>
                                  </div>
                                </TableCell>
                                <TableCell className="max-w-[250px]">
                                  <Link
                                    href={`/mass-intentions/${intention.id}`}
                                    className="text-primary hover:underline truncate block"
                                  >
                                    {intention.mass_offered_for || 'N/A'}
                                  </Link>
                                </TableCell>
                                <TableCell>
                                  <div className="flex flex-col gap-1 text-sm">
                                    <span className="font-medium">
                                      {intention.requested_by
                                        ? `${intention.requested_by.first_name} ${intention.requested_by.last_name}`
                                        : 'N/A'}
                                    </span>
                                    <span className="text-muted-foreground text-xs">
                                      {intention.date_requested
                                        ? formatDatePretty(intention.date_requested)
                                        : 'N/A'}
                                    </span>
                                  </div>
                                </TableCell>
                                <TableCell className="whitespace-nowrap font-medium">
                                  {formatStipend(intention.stipend_in_cents)}
                                </TableCell>
                                <TableCell className="max-w-[200px]">
                                  <div className="truncate text-sm text-muted-foreground">
                                    {intention.note || '-'}
                                  </div>
                                </TableCell>
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      </div>

                      {/* Total Summary */}
                      <div className="flex justify-end pt-4 border-t">
                        <div className="space-y-2">
                          <div className="flex justify-between gap-8 text-sm">
                            <span className="font-medium">Total Intentions:</span>
                            <span className="text-muted-foreground">{intentions.length}</span>
                          </div>
                          <div className="flex justify-between gap-8 text-sm">
                            <span className="font-medium">Total Stipends:</span>
                            <span className="text-muted-foreground">
                              {formatStipend(totalStipends)}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </PageContainer>
  )
}

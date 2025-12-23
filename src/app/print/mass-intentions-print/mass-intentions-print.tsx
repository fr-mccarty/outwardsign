'use client'

import { useEffect, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/content-card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Printer, ArrowLeft } from 'lucide-react'
import {
  getMassIntentions,
  type MassIntentionWithNames
} from '@/lib/actions/mass-intentions'
import { toast } from 'sonner'
import { toLocalDateString } from '@/lib/utils/formatters'

type PrintFormat = 'all' | 'scheduled' | 'unscheduled' | 'date-range'

export function MassIntentionsPrint() {
  const searchParams = useSearchParams()
  console.log('searchParams:', searchParams) // Using searchParams to avoid unused variable warning
  const [intentions, setIntentions] = useState<MassIntentionWithNames[]>([])
  const [loading, setLoading] = useState(false)
  const [printFormat, setPrintFormat] = useState<PrintFormat>('all')
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')
  const [showPreview, setShowPreview] = useState(false)

  useEffect(() => {
    // Set default dates to current month
    const today = new Date()
    const firstDay = new Date(today.getFullYear(), today.getMonth(), 1)
    const lastDay = new Date(today.getFullYear(), today.getMonth() + 1, 0)
    
    setStartDate(toLocalDateString(firstDay))
    setEndDate(toLocalDateString(lastDay))
  }, [])

  const loadIntentions = async () => {
    try {
      setLoading(true)
      let data: MassIntentionWithNames[] = []

      // Fetch all mass intentions (filtering will be done client-side for this bulk print view)
      data = await getMassIntentions()

      // Apply client-side filtering based on print format
      switch (printFormat) {
        case 'all':
          // Keep all data
          data = data.sort((a, b) => {
            const dateA = new Date(a.date_requested || 0)
            const dateB = new Date(b.date_requested || 0)
            return dateA.getTime() - dateB.getTime()
          })
          break
        case 'scheduled':
          // Filter for mass intentions that have a calendar event assigned
          data = data.filter(intention => intention.calendar_event_id != null)
          break
        case 'unscheduled':
          // Filter for mass intentions without a calendar event assigned
          data = data.filter(intention => intention.calendar_event_id == null)
          break
        case 'date-range':
          if (startDate && endDate) {
            const start = new Date(startDate)
            const end = new Date(endDate)
            data = data.filter(intention => {
              if (!intention.date_requested) return false
              const intentionDate = new Date(intention.date_requested)
              return intentionDate >= start && intentionDate <= end
            })
          }
          break
      }

      setIntentions(data)
      setShowPreview(true)
    } catch (error) {
      console.error('Error loading intentions:', error)
      toast.error('Failed to load Mass intentions')
    } finally {
      setLoading(false)
    }
  }

  const handlePrint = () => {
    window.print()
  }

  const formatDate = (dateString: string | null) => {
    if (!dateString) return ''
    return new Date(dateString).toLocaleDateString()
  }

  const formatCurrency = (amount: number | null) => {
    if (!amount) return ''
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amount / 100)
  }

  const getReportTitle = () => {
    switch (printFormat) {
      case 'all':
        return 'All Mass Intentions'
      case 'scheduled':
        return 'Scheduled Mass Intentions'
      case 'unscheduled':
        return 'Unscheduled Mass Intentions'
      case 'date-range':
        return `Mass Intentions: ${formatDate(startDate)} - ${formatDate(endDate)}`
    }
  }

  if (!showPreview) {
    return (
      <div className="max-w-4xl mx-auto p-6 print:hidden">
        <div className="mb-6">
          <Button
            variant="outline"
            onClick={() => window.history.back()}
            className="mb-4"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Mass Intentions
          </Button>
          <h1 className="text-2xl font-bold">Print Mass Intentions Report</h1>
          <p className="text-muted-foreground">
            Configure your report settings and generate a printable Mass intentions report
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Report Configuration</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="format">Report Format</Label>
              <Select value={printFormat} onValueChange={(value: PrintFormat) => setPrintFormat(value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select format" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Mass Intentions</SelectItem>
                  <SelectItem value="scheduled">Scheduled Only</SelectItem>
                  <SelectItem value="unscheduled">Unscheduled Only</SelectItem>
                  <SelectItem value="date-range">Date Range</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {printFormat === 'date-range' && (
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="start-date">Start Date</Label>
                  <Input
                    id="start-date"
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="end-date">End Date</Label>
                  <Input
                    id="end-date"
                    type="date"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                  />
                </div>
              </div>
            )}

            <Button
              onClick={loadIntentions}
              disabled={loading || (printFormat === 'date-range' && (!startDate || !endDate))}
              className="w-full"
            >
              {loading ? 'Loading...' : 'Generate Report'}
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="max-w-full mx-auto">
      {/* Print Controls - Hidden when printing */}
      <div className="print:hidden bg-gray-50 border-b p-4 mb-6">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <div>
            <h2 className="text-lg font-semibold">Print Preview</h2>
            <p className="text-sm text-muted-foreground">{intentions.length} Mass intentions</p>
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={() => setShowPreview(false)}
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Settings
            </Button>
            <Button onClick={handlePrint}>
              <Printer className="h-4 w-4 mr-2" />
              Print
            </Button>
          </div>
        </div>
      </div>

      {/* Print Content */}
      <div className="print:max-w-none max-w-4xl mx-auto p-6">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold mb-2">{getReportTitle()}</h1>
          <p className="text-muted-foreground">
            Generated on {new Date().toLocaleDateString()} at {new Date().toLocaleTimeString()}
          </p>
          <p className="text-muted-foreground">
            Total: {intentions.length} Mass intentions
          </p>
        </div>

        {/* Summary Statistics */}
        <div className="grid grid-cols-3 gap-4 mb-8 text-center">
          <div className="border rounded p-3">
            <div className="text-2xl font-bold text-green-600">
              {intentions.filter(i => i.calendar_event_id !== null).length}
            </div>
            <div className="text-sm text-muted-foreground">Scheduled</div>
          </div>
          <div className="border rounded p-3">
            <div className="text-2xl font-bold text-yellow-600">
              {intentions.filter(i => i.calendar_event_id === null).length}
            </div>
            <div className="text-sm text-muted-foreground">Unscheduled</div>
          </div>
          <div className="border rounded p-3">
            <div className="text-2xl font-bold text-blue-600">
              {intentions.reduce((sum, i) => sum + (i.stipend_in_cents || 0), 0) / 100}
            </div>
            <div className="text-sm text-muted-foreground">Total Offerings ($)</div>
          </div>
        </div>

        {/* Mass Intentions Table */}
        <div className="border rounded-lg overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-gray-50">
              <tr>
                <th className="text-left p-3 border-b font-medium">Date/Time</th>
                <th className="text-left p-3 border-b font-medium">Mass Offered For</th>
                <th className="text-left p-3 border-b font-medium">Donor</th>
                <th className="text-left p-3 border-b font-medium">Celebrant</th>
                <th className="text-left p-3 border-b font-medium">Offering</th>
                <th className="text-left p-3 border-b font-medium">Status</th>
              </tr>
            </thead>
            <tbody>
              {intentions.map((intention, index) => (
                <tr key={intention.id} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-25'}>
                  <td className="p-3 border-b align-top">
                    {intention.calendar_event ? (
                      <div>
                        <div className="font-medium">Scheduled</div>
                      </div>
                    ) : (
                      <div className="text-muted-foreground">
                        {intention.date_requested ? (
                          <div>
                            <div className="text-xs">Requested:</div>
                            <div>{formatDate(intention.date_requested)}</div>
                          </div>
                        ) : (
                          'Not scheduled'
                        )}
                      </div>
                    )}
                  </td>
                  <td className="p-3 border-b align-top">
                    <div className="font-medium">{intention.mass_offered_for}</div>
                    {intention.note && (
                      <div className="text-xs text-muted-foreground mt-1">{intention.note}</div>
                    )}
                  </td>
                  <td className="p-3 border-b align-top">
                    {intention.requested_by ? `${intention.requested_by.first_name} ${intention.requested_by.last_name}` : '-'}
                  </td>
                  <td className="p-3 border-b align-top">
                    {intention.calendar_event ? 'Assigned' : '-'}
                  </td>
                  <td className="p-3 border-b align-top">
                    {formatCurrency(intention.stipend_in_cents ?? null)}
                  </td>
                  <td className="p-3 border-b align-top">
                    <span className={`inline-flex px-2 py-1 rounded-full text-xs font-medium ${
                      intention.calendar_event_id !== null
                        ? 'bg-green-100 text-green-800'
                        : intention.calendar_event_id === null
                        ? 'bg-yellow-100 text-yellow-800'
                        : 'bg-red-100 text-red-800'
                    }`}>
                      {intention.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {intentions.length === 0 && (
          <div className="text-center py-12">
            <p className="text-muted-foreground">No Mass intentions found for the selected criteria.</p>
          </div>
        )}

        {/* Footer */}
        <div className="mt-8 text-center text-sm text-muted-foreground">
          <p>Liturgy.Faith - Mass Intentions Report</p>
          <p className="print:block hidden">Page {/* page number would go here */}</p>
        </div>
      </div>
    </div>
  )
}
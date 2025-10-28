'use client'

import { useEffect, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Printer, ArrowLeft } from 'lucide-react'
import { 
  getMassIntentionsByDateRange,
  getMassIntentionsByStatus,
  type MassIntentionWithDetails
} from '@/lib/actions/mass-intentions'
import { toast } from 'sonner'

type PrintFormat = 'all' | 'scheduled' | 'unscheduled' | 'date-range'

export function MassIntentionsPrint() {
  const searchParams = useSearchParams()
  console.log('searchParams:', searchParams) // Using searchParams to avoid unused variable warning
  const [intentions, setIntentions] = useState<MassIntentionWithDetails[]>([])
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
    
    setStartDate(firstDay.toISOString().split('T')[0])
    setEndDate(lastDay.toISOString().split('T')[0])
  }, [])

  const loadIntentions = async () => {
    try {
      setLoading(true)
      let data: MassIntentionWithDetails[] = []

      switch (printFormat) {
        case 'all':
          const [scheduled, unscheduled] = await Promise.all([
            getMassIntentionsByStatus('scheduled'),
            getMassIntentionsByStatus('unscheduled')
          ])
          data = [...scheduled, ...unscheduled].sort((a, b) => {
            const dateA = new Date(a.scheduled_at || a.date_requested || 0)
            const dateB = new Date(b.scheduled_at || b.date_requested || 0)
            return dateA.getTime() - dateB.getTime()
          })
          break
        case 'scheduled':
          data = await getMassIntentionsByStatus('scheduled')
          break
        case 'unscheduled':
          data = await getMassIntentionsByStatus('unscheduled')
          break
        case 'date-range':
          if (startDate && endDate) {
            data = await getMassIntentionsByDateRange(startDate, endDate)
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

  const formatTime = (timeString: string | null) => {
    if (!timeString) return ''
    return new Date(`2000-01-01T${timeString}`).toLocaleTimeString([], { 
      hour: 'numeric', 
      minute: '2-digit' 
    })
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
              {intentions.filter(i => i.status === 'scheduled').length}
            </div>
            <div className="text-sm text-muted-foreground">Scheduled</div>
          </div>
          <div className="border rounded p-3">
            <div className="text-2xl font-bold text-yellow-600">
              {intentions.filter(i => i.status === 'unscheduled').length}
            </div>
            <div className="text-sm text-muted-foreground">Unscheduled</div>
          </div>
          <div className="border rounded p-3">
            <div className="text-2xl font-bold text-blue-600">
              {intentions.reduce((sum, i) => sum + (i.amount_donated || 0), 0) / 100}
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
                    {intention.event_date ? (
                      <div>
                        <div className="font-medium">{formatDate(intention.event_date)}</div>
                        <div className="text-muted-foreground">{formatTime(intention.start_time)}</div>
                        {intention.event_name && (
                          <div className="text-xs text-muted-foreground">{intention.event_name}</div>
                        )}
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
                    {intention.donor_name || '-'}
                  </td>
                  <td className="p-3 border-b align-top">
                    {intention.celebrant_name || '-'}
                  </td>
                  <td className="p-3 border-b align-top">
                    {formatCurrency(intention.amount_donated)}
                  </td>
                  <td className="p-3 border-b align-top">
                    <span className={`inline-flex px-2 py-1 rounded-full text-xs font-medium ${
                      intention.status === 'scheduled' 
                        ? 'bg-green-100 text-green-800' 
                        : intention.status === 'unscheduled'
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
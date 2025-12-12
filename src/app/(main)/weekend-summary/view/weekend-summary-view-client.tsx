'use client'

import { WeekendSummaryData, WeekendSummaryParams } from '@/lib/actions/weekend-summary'
import { ModuleViewContainer } from '@/components/module-view-container'
import { buildWeekendSummary } from '@/lib/content-builders/weekend-summary'
import { Button } from '@/components/ui/button'
import { Edit, Printer, FileText, FileDown, File } from 'lucide-react'
import Link from 'next/link'
import { formatDatePretty } from '@/lib/utils/formatters'

interface WeekendSummaryViewClientProps {
  weekendData: WeekendSummaryData
  params: WeekendSummaryParams
}

export function WeekendSummaryViewClient({
  weekendData,
  params
}: WeekendSummaryViewClientProps) {
  // Generate filename for downloads
  const generateFilename = (extension: string) => {
    const dateStr = weekendData.sundayDate.replace(/-/g, '')
    return `Weekend-Summary-${dateStr}.${extension}`
  }

  // Build query params for URLs
  const buildQueryParams = () => {
    const queryParams = new URLSearchParams()
    queryParams.set('date', params.sundayDate)
    if (params.includeSacraments) queryParams.set('sacraments', 'true')
    if (params.includeMasses) queryParams.set('masses', 'true')
    if (params.includeMassRoles) queryParams.set('massRoles', 'true')
    return queryParams.toString()
  }

  // Generate action buttons
  const actionButtons = (
    <>
      <Button asChild className="w-full">
        <Link href="/weekend-summary">
          <Edit className="h-4 w-4 mr-2" />
          Edit Configuration
        </Link>
      </Button>
      <Button asChild variant="outline" className="w-full">
        <Link href={`/print/weekend-summary?${buildQueryParams()}`} target="_blank">
          <Printer className="h-4 w-4 mr-2" />
          Print View
        </Link>
      </Button>
    </>
  )

  // Generate export buttons
  const exportButtons = (
    <>
      <Button asChild variant="default" className="w-full">
        <Link
          href={`/api/weekend-summary/pdf?${buildQueryParams()}&filename=${generateFilename('pdf')}`}
          target="_blank"
        >
          <FileText className="h-4 w-4 mr-2" />
          Download PDF
        </Link>
      </Button>
      <Button asChild variant="default" className="w-full">
        <Link href={`/api/weekend-summary/word?${buildQueryParams()}&filename=${generateFilename('docx')}`}>
          <FileDown className="h-4 w-4 mr-2" />
          Download Word
        </Link>
      </Button>
      <Button asChild variant="default" className="w-full">
        <Link href={`/api/weekend-summary/txt?${buildQueryParams()}&filename=${generateFilename('txt')}`}>
          <File className="h-4 w-4 mr-2" />
          Download Text
        </Link>
      </Button>
    </>
  )

  // Generate details section content
  const details = (
    <div className="space-y-3">
      <div>
        <span className="font-medium">Weekend Dates:</span>
        <div className="text-sm text-muted-foreground mt-1">
          Saturday: {formatDatePretty(weekendData.saturdayDate)}
          <br />
          Sunday: {formatDatePretty(weekendData.sundayDate)}
        </div>
      </div>

      <div className="pt-2 border-t">
        <span className="font-medium">Included Sections:</span>
        <ul className="text-sm text-muted-foreground mt-1 space-y-1">
          {params.includeSacraments && <li>• Sacraments</li>}
          {params.includeMasses && <li>• Masses</li>}
          {params.includeMassRoles && <li>• Mass Roles</li>}
        </ul>
      </div>

      <div className="pt-2 border-t">
        <span className="font-medium">Summary Counts:</span>
        <div className="text-sm text-muted-foreground mt-1 space-y-1">
          {/* TODO: Sacrament counts will be added when dynamic events are integrated */}
          {params.includeMasses && (
            <div>Masses: {weekendData.masses.length}</div>
          )}
        </div>
      </div>
    </div>
  )

  return (
    <ModuleViewContainer
      entity={weekendData}
      entityType="Weekend Summary"
      modulePath="weekend-summary"
      buildLiturgy={(data) => buildWeekendSummary(data, params)}
      getTemplateId={() => 'weekend-summary-default'}
      generateFilename={generateFilename}
      actionButtons={actionButtons}
      exportButtons={exportButtons}
      details={details}
    />
  )
}

'use client'

import { WeekendSummaryData, WeekendSummaryParams } from '@/lib/actions/weekend-summary'
import { ModuleViewContainer } from '@/components/module-view-container'
import { buildWeekendSummary } from '@/lib/content-builders/weekend-summary'
import { LinkButton } from '@/components/link-button'
import { Edit, Printer, FileText, FileDown, File } from 'lucide-react'
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
      <LinkButton href="/weekend-summary" className="w-full">
        <Edit className="h-4 w-4 mr-2" />
        Edit Configuration
      </LinkButton>
      <LinkButton href={`/print/weekend-summary?${buildQueryParams()}`} variant="outline" className="w-full" target="_blank">
        <Printer className="h-4 w-4 mr-2" />
        Print View
      </LinkButton>
    </>
  )

  // Generate export buttons
  const exportButtons = (
    <>
      <LinkButton
        href={`/api/weekend-summary/pdf?${buildQueryParams()}&filename=${generateFilename('pdf')}`}
        variant="default"
        className="w-full"
        target="_blank"
      >
        <FileText className="h-4 w-4 mr-2" />
        Download PDF
      </LinkButton>
      <LinkButton href={`/api/weekend-summary/word?${buildQueryParams()}&filename=${generateFilename('docx')}`} variant="default" className="w-full">
        <FileDown className="h-4 w-4 mr-2" />
        Download Word
      </LinkButton>
      <LinkButton href={`/api/weekend-summary/txt?${buildQueryParams()}&filename=${generateFilename('txt')}`} variant="default" className="w-full">
        <File className="h-4 w-4 mr-2" />
        Download Text
      </LinkButton>
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
          {params.includeMassRoles && <li>• Ministry Assignments</li>}
        </ul>
      </div>

      <div className="pt-2 border-t">
        <span className="font-medium">Summary Counts:</span>
        <div className="text-sm text-muted-foreground mt-1 space-y-1">
          {params.includeSacraments && weekendData.sacraments.length > 0 && (
            <div>Sacraments: {weekendData.sacraments.length}</div>
          )}
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

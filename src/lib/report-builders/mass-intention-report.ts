/**
 * Mass Intention Report Builder
 *
 * Generates tabular reports for mass intentions with aggregations
 */

import { MassIntentionReportData } from '@/lib/actions/mass-intentions'
import { formatDatePretty } from '@/lib/utils/formatters'
import { getStatusLabel } from '@/lib/content-builders/shared/helpers'
import { ReportBuilder } from './types'

export interface MassIntentionReportParams {
  intentions: MassIntentionReportData[]
  totalStipends: number
  dateRangeText: string
  startDate?: string
  endDate?: string
}

/**
 * Format stipend amount in cents to dollar string
 */
function formatStipend(cents: number | null | undefined): string {
  if (!cents) return '$0.00'
  return `$${(cents / 100).toFixed(2)}`
}

/**
 * Build Mass Intention Report HTML
 */
export const buildMassIntentionReport: ReportBuilder<MassIntentionReportParams> = (params) => {
  const { intentions, totalStipends, startDate, endDate } = params

  const tableRows = intentions.map((intention) => `
    <tr>
      <td>
        <div class="cell-stacked">
          <span class="cell-label">
            ${intention.mass?.event?.start_date
              ? formatDatePretty(intention.mass.event.start_date)
              : 'N/A'}
          </span>
          <span class="cell-sublabel">
            ${getStatusLabel(intention.status, 'en')}
          </span>
        </div>
      </td>
      <td>${intention.mass_offered_for || 'N/A'}</td>
      <td>
        <div class="cell-stacked">
          <span class="cell-label">
            ${intention.requested_by
              ? `${intention.requested_by.first_name} ${intention.requested_by.last_name}`
              : 'N/A'}
          </span>
          <span class="cell-sublabel">
            ${intention.date_requested
              ? formatDatePretty(intention.date_requested)
              : 'N/A'}
          </span>
        </div>
      </td>
      <td class="cell-label">${formatStipend(intention.stipend_in_cents)}</td>
      <td>${intention.note || '-'}</td>
    </tr>
  `).join('')

  // Generate subtitle based on date selection
  let subtitle = 'All Mass Intentions'
  if (startDate && endDate) {
    subtitle = `${formatDatePretty(startDate)} to ${formatDatePretty(endDate)}`
  } else if (startDate) {
    subtitle = `From ${formatDatePretty(startDate)} onwards`
  } else if (endDate) {
    subtitle = `Until ${formatDatePretty(endDate)}`
  }

  return `
    <h1 class="report-title">Mass Intentions Report</h1>
    <p class="report-subtitle">${subtitle}</p>

    <div class="report-date-info">
      <p><strong>Start Date:</strong> ${startDate ? formatDatePretty(startDate) : 'none selected'}</p>
      <p><strong>End Date:</strong> ${endDate ? formatDatePretty(endDate) : 'none selected'}</p>
    </div>

    ${intentions.length === 0 ? `
      <p>No Mass Intentions found.</p>
    ` : `
      <table>
        <thead>
          <tr>
            <th>Mass Details</th>
            <th>Intention</th>
            <th>Request Info</th>
            <th>Financial</th>
            <th>Notes</th>
          </tr>
        </thead>
        <tbody>
          ${tableRows}
        </tbody>
      </table>

      <div class="totals-section">
        <div class="totals-row">
          <span class="totals-label">Total Intentions:</span>
          <span>${intentions.length}</span>
        </div>
        <div class="totals-row">
          <span class="totals-label">Total Stipends:</span>
          <span>${formatStipend(totalStipends)}</span>
        </div>
      </div>
    `}
  `
}

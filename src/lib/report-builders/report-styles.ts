/**
 * Report Styles
 *
 * Shared CSS styles for all report types
 * Export as a string to be injected into print pages
 */

export const REPORT_STYLES = `
  /* Report Headers */
  .report-title {
    font-size: 28pt;
    font-weight: 700;
    color: black !important;
    margin-bottom: 0.5rem;
  }

  .report-subtitle {
    font-size: 14pt;
    font-weight: 400;
    color: #666 !important;
    margin-bottom: 1.5rem;
  }

  /* Report Date Info */
  .report-date-info {
    margin-bottom: 1.5rem;
    color: #666 !important;
  }

  .report-date-info p {
    margin: 0.25rem 0;
    font-size: 11pt;
  }

  /* Report Tables */
  table {
    width: 100%;
    border-collapse: collapse;
    margin-top: 1rem;
  }

  th, td {
    border: none;
    padding: 8px;
    text-align: left;
    color: black !important;
    vertical-align: top;
  }

  th {
    font-weight: 700;
    border-bottom: 2px solid #ddd;
    font-size: 11pt;
  }

  td {
    font-size: 10pt;
  }

  /* Report Stacked Cells */
  .cell-stacked {
    display: flex;
    flex-direction: column;
    gap: 0.25rem;
  }

  .cell-label {
    font-weight: 600;
  }

  .cell-sublabel {
    font-size: 0.875rem;
    color: #666;
  }

  /* Report Totals Section */
  .totals-section {
    margin-top: 1.5rem;
    padding-top: 1rem;
    border-top: 2px solid #ddd;
    text-align: right;
  }

  .totals-row {
    display: flex;
    justify-content: flex-end;
    gap: 2rem;
    margin-bottom: 0.5rem;
    font-size: 11pt;
  }

  .totals-label {
    font-weight: 600;
  }
`

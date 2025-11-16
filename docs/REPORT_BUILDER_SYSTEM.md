# REPORT_BUILDER_SYSTEM.md

> **Documentation for the Report Builder System**
>
> This file documents how to create tabular reports with filtering, aggregations, and multiple export formats (HTML/Print, CSV). Reports are different from liturgical scripts in that they display aggregated data across multiple records.

## Table of Contents

1. [Overview](#overview)
2. [Report vs. Liturgical Script](#report-vs-liturgical-script)
3. [Architecture](#architecture)
4. [Implementing a Report](#implementing-a-report)
5. [File Structure](#file-structure)
6. [Server Actions for Reports](#server-actions-for-reports)
7. [Report Builder Functions](#report-builder-functions)
8. [Report UI Components](#report-ui-components)
9. [Print Page](#print-page)
10. [CSV Export](#csv-export)
11. [Testing Reports](#testing-reports)

---

## Overview

The report builder system provides a standardized pattern for creating tabular reports that aggregate data across multiple records. Reports support:

- **Date range filtering** (optional start/end dates, or no dates for "all records")
- **Interactive UI** with generate/filter controls
- **Multiple export formats:**
  - HTML/Print view (browser print/PDF)
  - CSV download
- **Aggregations** (totals, counts, summaries)
- **Side panel** with export actions and metadata

**Current Implementation:** Mass Intentions Report (first module to use this pattern)

---

## Report vs. Liturgical Script

### Liturgical Script System
- **Purpose:** Document generation for single entities (weddings, funerals, etc.)
- **Output:** Formatted liturgy scripts with readings, prayers, rituals
- **Templates:** Multiple templates per module (English, Spanish, variations)
- **Location:** View page (individual entity)
- **Exports:** PDF, Word documents

### Report Builder System
- **Purpose:** Tabular reports aggregating multiple records
- **Output:** Tables with aggregations and summaries
- **Filtering:** Date ranges, status filters, optional parameters
- **Location:** Standalone report page (`/[module]/report`)
- **Exports:** Print view (HTML → PDF via browser), CSV

**Key Difference:** Liturgical scripts are for individual entities (one wedding), reports are for collections of entities (all mass intentions).

---

## Architecture

### Component Flow

```
┌─────────────────────────────────────────────────────────────┐
│                     Report Page (Server)                     │
│                 /[module]/report/page.tsx                    │
│                  - Auth check                                │
│                  - Passes to client                          │
└──────────────────────┬──────────────────────────────────────┘
                       │
                       ▼
┌─────────────────────────────────────────────────────────────┐
│                  Report Client Component                     │
│              /[module]/report/report-client.tsx              │
│  - Filter controls (date range, other params)               │
│  - Generate button → calls server action                    │
│  - Display results in table                                 │
│  - Side panel with export actions                           │
└──────────────────┬───────────────────┬──────────────────────┘
                   │                   │
                   ▼                   ▼
        ┌──────────────────┐  ┌──────────────────┐
        │  Print Button    │  │  CSV Button      │
        │  → Print Page    │  │  → CSV API       │
        └──────────────────┘  └──────────────────┘
```

### Data Flow

1. **User enters filters** (optional date range)
2. **Client calls server action** → `get[Module]Report(params)`
3. **Server action fetches data** from database with filters
4. **Server action aggregates** (totals, counts) and returns
5. **Client displays** results in table
6. **User exports:**
   - **Print:** Opens print page with same filters → uses report builder → generates HTML
   - **CSV:** Calls API route with filters → generates CSV file

---

## Implementing a Report

### Step-by-Step Guide

Follow this checklist when adding a report to a module:

#### 1. Server Action (lib/actions/[module].ts)

Add report-specific interfaces and server action:

```typescript
// Report data interface (extends base entity with relations)
export interface [Module]ReportData extends [Module] {
  // Add any relations needed for the report
  related_entity?: RelatedEntity | null
  // ... other relations
}

export interface [Module]ReportParams {
  startDate?: string
  endDate?: string
  // ... other filter parameters
}

export interface [Module]ReportResult {
  records: [Module]ReportData[]
  totalCount: number
  // ... other aggregations (totalStipends, averageAmount, etc.)
}

export async function get[Module]Report(
  params?: [Module]ReportParams
): Promise<[Module]ReportResult> {
  const selectedParishId = await requireSelectedParish()
  await ensureJWTClaims()
  const supabase = await createClient()

  const { startDate, endDate } = params || {}

  // Build query with filters
  let query = supabase
    .from('[modules]')
    .select('*, related_entity(*)')
    .eq('parish_id', selectedParishId)

  // Apply date filters if provided
  if (startDate) {
    query = query.gte('date_field', startDate)
  }
  if (endDate) {
    query = query.lte('date_field', endDate)
  }

  const { data, error } = await query

  if (error) {
    console.error('Error fetching report:', error)
    throw new Error('Failed to fetch report data')
  }

  // Calculate aggregations
  const totalCount = data.length
  const totalAmount = data.reduce((sum, record) => {
    return sum + (record.amount_field || 0)
  }, 0)

  return {
    records: data,
    totalCount,
    totalAmount,
  }
}
```

#### 2. Report Builder (lib/report-builders/[module]-report.ts)

Create report builder function:

```typescript
/**
 * [Module] Report Builder
 *
 * Generates tabular reports for [module] with aggregations
 */

import { [Module]ReportData } from '@/lib/actions/[module]'
import { formatDatePretty } from '@/lib/utils/date-format'
import { ReportBuilder } from './types'

export interface [Module]ReportParams {
  records: [Module]ReportData[]
  totalAmount: number
  dateRangeText: string
  startDate?: string
  endDate?: string
}

/**
 * Build [Module] Report HTML
 */
export const build[Module]Report: ReportBuilder<[Module]ReportParams> = (params) => {
  const { records, totalAmount, startDate, endDate } = params

  const tableRows = records.map((record) => `
    <tr>
      <td>${record.field1}</td>
      <td>${record.field2}</td>
      <td>${record.field3}</td>
    </tr>
  `).join('')

  return `
    <h1>[Module] Report</h1>
    <div class="report-date-info">
      <p><strong>Start Date:</strong> ${startDate ? formatDatePretty(startDate) : 'none selected'}</p>
      <p><strong>End Date:</strong> ${endDate ? formatDatePretty(endDate) : 'none selected'}</p>
    </div>

    ${records.length === 0 ? `
      <p>No records found.</p>
    ` : `
      <table>
        <thead>
          <tr>
            <th>Column 1</th>
            <th>Column 2</th>
            <th>Column 3</th>
          </tr>
        </thead>
        <tbody>
          ${tableRows}
        </tbody>
      </table>

      <div class="totals-section">
        <div class="totals-row">
          <span class="totals-label">Total Records:</span>
          <span>${records.length}</span>
        </div>
        <div class="totals-row">
          <span class="totals-label">Total Amount:</span>
          <span>$${totalAmount}</span>
        </div>
      </div>
    `}
  `
}
```

#### 3. Export from lib/report-builders/index.ts

```typescript
export * from './[module]-report'
```

#### 4. Report Page (app/(main)/[module]/report/page.tsx)

```typescript
import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { [Module]ReportClient } from './report-client'
import { BreadcrumbSetter } from '@/components/breadcrumb-setter'

export default async function [Module]ReportPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  return (
    <>
      <BreadcrumbSetter
        breadcrumbs={[
          { label: '[Module]', href: '/[module]' },
          { label: 'Report', href: '/[module]/report' }
        ]}
      />
      <[Module]ReportClient />
    </>
  )
}
```

#### 5. Report Client Component (app/(main)/[module]/report/report-client.tsx)

See "Report UI Components" section below for detailed implementation.

#### 6. Print Page (app/print/[module]/report/page.tsx)

```typescript
import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { get[Module]Report } from '@/lib/actions/[module]'
import { formatDatePretty } from '@/lib/utils/date-format'
import { PRINT_PAGE_MARGIN } from '@/lib/print-styles'
import { build[Module]Report } from '@/lib/report-builders'

interface PageProps {
  searchParams: Promise<{ startDate?: string; endDate?: string }>
}

export default async function Print[Module]ReportPage({ searchParams }: PageProps) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const params = await searchParams
  const { startDate, endDate } = params

  // Fetch report data
  const result = await get[Module]Report({
    startDate: startDate || undefined,
    endDate: endDate || undefined
  })

  const { records, totalAmount } = result

  // Generate date range display text
  let dateRangeText = 'All Records'
  if (startDate && endDate) {
    dateRangeText = `${formatDatePretty(startDate)} to ${formatDatePretty(endDate)}`
  } else if (startDate) {
    dateRangeText = `From ${formatDatePretty(startDate)} onwards`
  } else if (endDate) {
    dateRangeText = `Until ${formatDatePretty(endDate)}`
  }

  // Build report HTML
  const reportHTML = build[Module]Report({
    records,
    totalAmount,
    dateRangeText,
    startDate: startDate || undefined,
    endDate: endDate || undefined,
  })

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: `
        @page {
          margin: ${PRINT_PAGE_MARGIN};
        }
        /* ... print styles (see Mass Intentions example) ... */
      `}} />
      <div dangerouslySetInnerHTML={{ __html: reportHTML }} />
    </>
  )
}
```

#### 7. CSV Export API (app/api/[module]/report/csv/route.ts)

```typescript
import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'
import { get[Module]ByDateRange } from '@/lib/actions/[module]'
import { formatDatePretty } from '@/lib/utils/date-format'

export async function GET(request: Request) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return new NextResponse('Unauthorized', { status: 401 })
  }

  const { searchParams } = new URL(request.url)
  const startDate = searchParams.get('startDate')
  const endDate = searchParams.get('endDate')

  if (!startDate || !endDate) {
    return new NextResponse('Start date and end date are required', { status: 400 })
  }

  try {
    const records = await get[Module]ByDateRange(startDate, endDate)

    // Build CSV
    const headers = ['Column 1', 'Column 2', 'Column 3']

    const escapeCSV = (value: string | null | undefined) => {
      if (!value) return ''
      const stringValue = String(value)
      if (stringValue.includes(',') || stringValue.includes('\n') || stringValue.includes('"')) {
        return `"${stringValue.replace(/"/g, '""')}"`
      }
      return stringValue
    }

    const rows = records.map(record => [
      escapeCSV(record.field1),
      escapeCSV(record.field2),
      escapeCSV(record.field3)
    ])

    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.join(','))
    ].join('\n')

    return new NextResponse(csvContent, {
      headers: {
        'Content-Type': 'text/csv',
        'Content-Disposition': `attachment; filename="[module]-report-${startDate}-to-${endDate}.csv"`
      }
    })
  } catch (error) {
    console.error('Error generating CSV:', error)
    return new NextResponse('Failed to generate CSV', { status: 500 })
  }
}
```

---

## File Structure

```
src/
├── app/
│   ├── (main)/
│   │   └── [module]/
│   │       └── report/
│   │           ├── page.tsx              # Server page (auth + breadcrumbs)
│   │           └── report-client.tsx     # Client UI component
│   ├── print/
│   │   └── [module]/
│   │       └── report/
│   │           └── page.tsx              # Print view page
│   └── api/
│       └── [module]/
│           └── report/
│               └── csv/
│                   └── route.ts          # CSV export API
└── lib/
    ├── actions/
    │   └── [module].ts                   # Report server actions
    └── report-builders/
        ├── index.ts                      # Central export
        ├── types.ts                      # Type definitions
        └── [module]-report.ts            # Report builder function
```

---

## Server Actions for Reports

### Report Data Interface Pattern

Reports use a simplified data interface that extends the base entity with only the relations needed for the report:

```typescript
export interface [Module]ReportData extends [Module] {
  // Only include relations needed for the report
  related_entity?: RelatedEntity | null
}
```

**Why not use `WithRelations`?**
- Reports don't need ALL relations, only specific ones
- Keeps queries efficient by only fetching what's displayed
- Reduces payload size for large reports

### Aggregation Pattern

Calculate aggregations in the server action:

```typescript
const totalCount = data.length
const totalAmount = data.reduce((sum, record) => {
  return sum + (record.amount_field || 0)
}, 0)
const averageAmount = totalCount > 0 ? totalAmount / totalCount : 0
```

### Date Filtering Pattern

Apply optional date filters:

```typescript
if (startDate) {
  query = query.gte('date_field', startDate)
}
if (endDate) {
  query = query.lte('date_field', endDate)
}
```

**Date field choice:**
- Use the primary date field that makes sense for filtering
- Mass Intentions: Uses `mass.event.start_date` (when the Mass occurs)
- Could also filter by `date_requested`, `date_received`, depending on requirements

---

## Report Builder Functions

### Purpose

Report builders generate HTML strings for print views. They are similar to liturgical content builders but produce tabular layouts instead of formatted scripts.

### Location

`src/lib/report-builders/[module]-report.ts`

### Function Signature

```typescript
export const build[Module]Report: ReportBuilder<[Module]ReportParams> = (params) => {
  return `<html>...</html>`
}
```

### HTML Generation Pattern

Reports generate simple HTML tables:

```typescript
const tableRows = records.map((record) => `
  <tr>
    <td>${escapeHTML(record.field)}</td>
  </tr>
`).join('')

return `
  <h1>Report Title</h1>
  <table>
    <thead>
      <tr>
        <th>Column Header</th>
      </tr>
    </thead>
    <tbody>
      ${tableRows}
    </tbody>
  </table>

  <div class="totals-section">
    <!-- Aggregations and summaries -->
  </div>
`
```

### Styling Classes

Use these CSS classes (defined in print page):
- `.cell-stacked` - Vertical layout within cell
- `.cell-label` - Bold text (primary)
- `.cell-sublabel` - Lighter text (secondary)
- `.totals-section` - Summary section
- `.totals-row` - Individual total row
- `.totals-label` - Bold label for total

---

## Report UI Components

### Layout Pattern

Reports use a two-column layout matching the module view pattern:

```typescript
<PageContainer title="Report Title" description="Report description">
  <div className="flex flex-col md:flex-row gap-6">
    {/* Side Panel - order-1 md:order-2 */}
    <div className="w-full md:w-80 space-y-4 order-1 md:order-2">
      {/* Export buttons */}
    </div>

    {/* Main Content - order-2 md:order-1 */}
    <div className="flex-1 order-2 md:order-1">
      {/* Filters and table */}
    </div>
  </div>
</PageContainer>
```

### Side Panel Components

**Export Buttons:**
```typescript
<Button onClick={handlePrint} disabled={!hasSearched}>
  <Printer className="h-4 w-4 mr-2" />
  Print View
</Button>

<Button onClick={handleDownloadCSV} disabled={!hasSearched}>
  <Download className="h-4 w-4 mr-2" />
  CSV
</Button>
```

**Metadata Section:**
```typescript
{hasSearched && (
  <div className="pt-4 border-t space-y-2 text-sm">
    <div className="flex flex-col gap-1">
      <span className="font-medium">Date Range:</span>
      <span className="text-muted-foreground">{dateRangeText}</span>
    </div>
    <div className="pt-2 border-t">
      <span className="font-medium">Total Results:</span>{' '}
      <span className="text-muted-foreground">{records.length}</span>
    </div>
  </div>
)}
```

### Filter Controls

**Date Range Inputs:**
```typescript
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
  <Button onClick={handleGenerateReport} disabled={isLoading}>
    {isLoading ? 'Generating...' : 'Generate Report'}
  </Button>
</div>
```

### State Management

```typescript
const [startDate, setStartDate] = useState('')
const [endDate, setEndDate] = useState('')
const [records, setRecords] = useState<ReportData[]>([])
const [totalAmount, setTotalAmount] = useState(0)
const [isLoading, setIsLoading] = useState(false)
const [hasSearched, setHasSearched] = useState(false)
```

**Why `hasSearched`?**
- Disables export buttons until report is generated
- Shows metadata only after generating report
- Prevents exporting empty results

### Results Table

Use shadcn Table component:

```typescript
<Table>
  <TableHeader>
    <TableRow>
      <TableHead>Column 1</TableHead>
      <TableHead>Column 2</TableHead>
    </TableRow>
  </TableHeader>
  <TableBody>
    {records.map((record) => (
      <TableRow key={record.id}>
        <TableCell>{record.field1}</TableCell>
        <TableCell>{record.field2}</TableCell>
      </TableRow>
    ))}
  </TableBody>
</Table>
```

### Empty State

```typescript
{records.length === 0 ? (
  <div className="text-center py-12">
    <FileText className="mx-auto h-12 w-12 text-muted-foreground" />
    <h3 className="mt-4 text-lg font-semibold">No Records Found</h3>
    <p className="text-muted-foreground mt-2">
      No records were found for the selected filters.
    </p>
  </div>
) : (
  <Table>...</Table>
)}
```

---

## Print Page

### Print Styles

Print pages include embedded CSS for print optimization:

```typescript
<style dangerouslySetInnerHTML={{ __html: `
  @page {
    margin: ${PRINT_PAGE_MARGIN};
  }
  body {
    margin: 0 !important;
    background: white !important;
    color: black !important;
    font-family: system-ui, -apple-system, sans-serif;
  }
  table {
    width: 100%;
    border-collapse: collapse;
  }
  th, td {
    border: 1px solid #ddd;
    padding: 8px;
    text-align: left;
    color: black !important;
  }
  th {
    background-color: #f5f5f5;
    font-weight: 600;
  }
  tr:nth-child(even) {
    background-color: #f9f9f9;
  }
`}} />
```

### URL Parameters

Print pages receive filters via URL search params:

```typescript
const params = await searchParams
const { startDate, endDate } = params
```

This allows the print page to regenerate the exact same report that was displayed on the report page.

---

## CSV Export

### CSV Generation Pattern

```typescript
const headers = ['Column 1', 'Column 2']

const escapeCSV = (value: string | null | undefined) => {
  if (!value) return ''
  const stringValue = String(value)
  // Escape double quotes and wrap if contains comma, newline, or quote
  if (stringValue.includes(',') || stringValue.includes('\n') || stringValue.includes('"')) {
    return `"${stringValue.replace(/"/g, '""')}"`
  }
  return stringValue
}

const rows = records.map(record => [
  escapeCSV(record.field1),
  escapeCSV(record.field2)
])

const csvContent = [
  headers.join(','),
  ...rows.map(row => row.join(','))
].join('\n')
```

### CSV Download Response

```typescript
return new NextResponse(csvContent, {
  headers: {
    'Content-Type': 'text/csv',
    'Content-Disposition': `attachment; filename="report-${startDate}-to-${endDate}.csv"`
  }
})
```

### Dynamic Filenames

Generate descriptive filenames based on filters:

```typescript
const filename = startDate && endDate
  ? `report-${startDate}-to-${endDate}.csv`
  : startDate
  ? `report-from-${startDate}.csv`
  : endDate
  ? `report-until-${endDate}.csv`
  : `report-all.csv`
```

---

## Testing Reports

### Test File Location

`tests/[module]-report.spec.ts`

### Test Coverage

Reports should test:

1. **Page loads** without errors
2. **Generate button** triggers report
3. **Results display** in table
4. **Print button** opens print view with correct URL
5. **CSV download** triggers download
6. **Empty state** when no results
7. **Date validation** (start before end)

### Example Test Structure

```typescript
import { test, expect } from '@playwright/test'

test.describe('[Module] Report', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to report page
    await page.goto('/[module]/report')
  })

  test('should load report page', async ({ page }) => {
    await expect(page.getByRole('heading', { name: 'Report' })).toBeVisible()
  })

  test('should generate report with date range', async ({ page }) => {
    // Fill in date range
    await page.fill('input[name="startDate"]', '2024-01-01')
    await page.fill('input[name="endDate"]', '2024-12-31')

    // Generate report
    await page.click('button:has-text("Generate Report")')

    // Verify results
    await expect(page.getByRole('table')).toBeVisible()
  })

  test('should export to CSV', async ({ page }) => {
    // Generate report first
    await page.click('button:has-text("Generate Report")')

    // Trigger CSV download
    const downloadPromise = page.waitForEvent('download')
    await page.click('button:has-text("CSV")')
    const download = await downloadPromise

    // Verify filename
    expect(download.suggestedFilename()).toMatch(/\.csv$/)
  })
})
```

---

## Best Practices

### When to Use Reports vs. Liturgical Scripts

**Use Reports When:**
- Aggregating data across multiple entities
- Displaying tabular data with totals
- Financial summaries (stipends, donations)
- Administrative overviews
- Exporting to spreadsheets (CSV)

**Use Liturgical Scripts When:**
- Generating formatted documents for ceremonies
- Single entity display with liturgical content
- Readings, prayers, rituals
- Print-ready scripts for presiders

### Performance Considerations

**For large datasets:**
- Consider adding pagination to report results
- Implement server-side filtering beyond dates
- Add loading states during data fetch
- Use virtualization for very large tables

**Query optimization:**
- Only fetch relations needed for display
- Use database indexes on date fields
- Consider caching for frequently-run reports

### User Experience

**Filter UX:**
- Make date filters optional (allow "all records" view)
- Validate start date before end date
- Show clear feedback on empty results
- Display metadata (total count, date range) in side panel

**Export UX:**
- Disable export buttons until report is generated
- Use descriptive filenames with date ranges
- Show success/error toasts after exports
- Ensure print view matches web view

---

## Future Enhancements

Potential additions to the report builder system:

- **Additional Export Formats:** Excel (.xlsx), PDF generation
- **Advanced Filters:** Status, category, custom fields
- **Pagination:** For large result sets
- **Chart/Graph Support:** Visual aggregations
- **Scheduled Reports:** Email delivery, recurring reports
- **Custom Columns:** User-selectable columns
- **Sorting/Grouping:** Client-side table sorting, grouping by date/category
- **Report Templates:** Save/load filter configurations

---

## Related Documentation

- [LITURGICAL_SCRIPT_SYSTEM.md](./LITURGICAL_SCRIPT_SYSTEM.md) - Liturgical script documentation system
- [TESTING_GUIDE.md](./TESTING_GUIDE.md) - Testing patterns including report tests
- [MODULE_CHECKLIST.md](./MODULE_CHECKLIST.md) - Complete module creation checklist

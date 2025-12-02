# REPORT_BUILDER_SYSTEM.md

> **Documentation for the Report Builder System**
>
> This file documents how to create tabular reports with filtering, aggregations, and multiple export formats (HTML/Print, CSV). Reports are different from liturgical scripts in that they display aggregated data across multiple records.
>
> **⚠️ File Size Note:** This file is near the 1000-line limit (currently 925 lines). Future additions should consider splitting into subdirectory (e.g., `report-builder/`).

## Table of Contents

1. [Overview](#overview)
2. [Report vs. Liturgical Script](#report-vs-liturgical-script)
3. [Architecture](#architecture)
4. [Quick Start](#quick-start)
5. [Implementation Checklist](#implementation-checklist)
6. [File Structure](#file-structure)
7. [Key Patterns](#key-patterns)
8. [Best Practices](#best-practices)
9. [Future Enhancements](#future-enhancements)

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

## Quick Start

**Reference Implementation:** Mass Intentions Report

**Key Files:**
- **Schema/Types:** `src/lib/actions/mass-intentions.ts` (report interfaces)
- **Server Action:** `src/lib/actions/mass-intentions.ts:getMassIntentionsReport()`
- **Report Builder:** `src/lib/report-builders/mass-intentions-report.ts`
- **Client UI:** `src/app/(main)/mass-intentions/report/report-client.tsx`
- **Print Page:** `src/app/print/mass-intentions/report/page.tsx`
- **CSV API:** `src/app/api/mass-intentions/report/csv/route.ts`

---

## Implementation Checklist

When adding a report to a module, follow these steps:

### 1. Server Action (`lib/actions/[module].ts`)

Define interfaces and server action:

```typescript
export interface [Module]ReportData extends [Module] {
  related_entity?: RelatedEntity | null
}

export interface [Module]ReportParams {
  startDate?: string
  endDate?: string
}

export interface [Module]ReportResult {
  records: [Module]ReportData[]
  totalCount: number
  // Aggregations: totalAmount, averageAmount, etc.
}

export async function get[Module]Report(
  params?: [Module]ReportParams
): Promise<[Module]ReportResult> {
  // 1. Auth checks
  // 2. Build query with date filters
  // 3. Fetch data
  // 4. Calculate aggregations
  // 5. Return result
}
```

**Key Points:**
- Use date filters conditionally (allow "all records" view)
- Calculate aggregations in server action
- Return serializable data only

### 2. Report Builder (`lib/report-builders/[module]-report.ts`)

Create HTML generation function:

```typescript
import { [Module]ReportData } from '@/lib/actions/[module]'
import { formatDatePretty } from '@/lib/utils/formatters'
import { ReportBuilder } from './types'

export interface [Module]ReportParams {
  records: [Module]ReportData[]
  totalAmount: number
  dateRangeText: string
  startDate?: string
  endDate?: string
}

export const build[Module]Report: ReportBuilder<[Module]ReportParams> = (params) => {
  const { records, totalAmount, startDate, endDate } = params

  const tableRows = records.map((record) => `
    <tr>
      <td>${record.field1}</td>
      <td>${record.field2}</td>
    </tr>
  `).join('')

  return `
    <h1>[Module] Report</h1>
    ${records.length === 0 ? `<p>No records found.</p>` : `
      <table>
        <thead>
          <tr><th>Column 1</th><th>Column 2</th></tr>
        </thead>
        <tbody>${tableRows}</tbody>
      </table>
      <div class="totals-section">
        <div class="totals-row">
          <span class="totals-label">Total:</span>
          <span>${totalAmount}</span>
        </div>
      </div>
    `}
  `
}
```

Export from `lib/report-builders/index.ts`:
```typescript
export * from './[module]-report'
```

### 3. Report Page (`app/(main)/[module]/report/page.tsx`)

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

### 4. Report Client Component (`app/(main)/[module]/report/report-client.tsx`)

**Pattern:**
- Layout: Two-column (side panel + main content)
- State: Date filters, records, loading, hasSearched
- Actions: Generate report, print, CSV download
- Use FormInput for date inputs
- Use shadcn Table for results
- Empty state with descriptive text

**Key Elements:**
```typescript
const [startDate, setStartDate] = useState('')
const [endDate, setEndDate] = useState('')
const [records, setRecords] = useState<ReportData[]>([])
const [isLoading, setIsLoading] = useState(false)
const [hasSearched, setHasSearched] = useState(false)

const handleGenerateReport = async () => {
  setIsLoading(true)
  const result = await get[Module]Report({ startDate, endDate })
  setRecords(result.records)
  setHasSearched(true)
  setIsLoading(false)
}

const handlePrint = () => {
  const url = `/print/[module]/report?startDate=${startDate}&endDate=${endDate}`
  window.open(url, '_blank')
}

const handleDownloadCSV = () => {
  const url = `/api/[module]/report/csv?startDate=${startDate}&endDate=${endDate}`
  window.open(url, '_blank')
}
```

### 5. Print Page (`app/print/[module]/report/page.tsx`)

```typescript
import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { get[Module]Report } from '@/lib/actions/[module]'
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

  const result = await get[Module]Report({ startDate, endDate })
  const reportHTML = build[Module]Report({
    records: result.records,
    totalAmount: result.totalAmount,
    startDate, endDate
  })

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: `
        @page { margin: ${PRINT_PAGE_MARGIN}; }
        body { margin: 0 !important; background: white !important; color: black !important; }
        table { width: 100%; border-collapse: collapse; }
        th, td { border: 1px solid #ddd; padding: 8px; }
        th { background-color: #f5f5f5; font-weight: 600; }
      `}} />
      <div dangerouslySetInnerHTML={{ __html: reportHTML }} />
    </>
  )
}
```

### 6. CSV Export API (`app/api/[module]/report/csv/route.ts`)

```typescript
import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'
import { get[Module]ByDateRange } from '@/lib/actions/[module]'

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

  const records = await get[Module]ByDateRange(startDate, endDate)

  const headers = ['Column 1', 'Column 2']
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
    escapeCSV(record.field2)
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

## Key Patterns

### Server Action Pattern

**Report Data Interface:**
```typescript
// Don't use WithRelations - only include relations needed for report
export interface [Module]ReportData extends [Module] {
  related_entity?: RelatedEntity | null
}
```

**Date Filtering:**
```typescript
if (startDate) {
  query = query.gte('date_field', startDate)
}
if (endDate) {
  query = query.lte('date_field', endDate)
}
```

**Aggregations:**
```typescript
const totalCount = data.length
const totalAmount = data.reduce((sum, record) => sum + (record.amount || 0), 0)
const averageAmount = totalCount > 0 ? totalAmount / totalCount : 0
```

### Report Builder Pattern

**HTML Generation:**
```typescript
const tableRows = records.map((record) => `
  <tr>
    <td>${escapeHTML(record.field)}</td>
  </tr>
`).join('')

return `
  <h1>Report Title</h1>
  <table>
    <thead><tr><th>Column Header</th></tr></thead>
    <tbody>${tableRows}</tbody>
  </table>
`
```

**Styling Classes:**
- `.cell-stacked` - Vertical layout within cell
- `.cell-label` - Bold text (primary)
- `.cell-sublabel` - Lighter text (secondary)
- `.totals-section` - Summary section
- `.totals-row` - Individual total row
- `.totals-label` - Bold label for total

### UI Component Pattern

**Layout:**
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

**hasSearched State:**
- Disables export buttons until report is generated
- Shows metadata only after generating report
- Prevents exporting empty results

### CSV Export Pattern

```typescript
const escapeCSV = (value: string | null | undefined) => {
  if (!value) return ''
  const stringValue = String(value)
  if (stringValue.includes(',') || stringValue.includes('\n') || stringValue.includes('"')) {
    return `"${stringValue.replace(/"/g, '""')}"`
  }
  return stringValue
}

const csvContent = [
  headers.join(','),
  ...rows.map(row => row.join(','))
].join('\n')
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

# Weekend Summary Module

> **Purpose:** Generate a comprehensive summary document of all parish activities scheduled for a weekend (Saturday-Sunday).

---

## Table of Contents

- [Overview](#overview)
- [Purpose](#purpose)
- [Architecture](#architecture)
- [User Flow](#user-flow)
- [File Structure](#file-structure)
- [Implementation Details](#implementation-details)
- [Testing](#testing)
- [Future Enhancements](#future-enhancements)

---

## Overview

The Weekend Summary module is a **report-based module** (not entity-based like Weddings or Funerals). It dynamically generates a summary document containing all activities happening during a parish weekend from Saturday morning through Sunday afternoon.

**Key Characteristics:**
- No database table (generates reports from existing data)
- URL-based configuration (date and filters passed via query params)
- Dynamically queries multiple modules (Sacraments, Masses, Mass Roles)
- Provides setup page → view page workflow
- Export capabilities (Print, PDF, Word)

---

## Purpose

The Weekend Summary serves as a **sacristy reference document** for priests, deacons, and parish leaders. It provides an at-a-glance view of everything happening during a weekend, ensuring nothing is missed.

**Primary Use Case:**
- Print the document
- Place it in the sacristy on the counter
- Reference throughout the weekend to stay informed about all scheduled activities

**Activities Included:**
1. **Sacraments** - Weddings, Baptisms, Funerals, Presentations, Quinceañeras
2. **Masses** - All scheduled masses with presiders
3. **Mass Roles** - Lectors, servers, musicians, and other liturgical ministers

---

## Architecture

### No Database Table

Unlike other modules, Weekend Summary does NOT have a dedicated database table. Instead, it:
- Accepts configuration via URL query parameters
- Dynamically fetches data from existing modules
- Generates content on-the-fly using a content builder
- Returns read-only view (no CRUD operations)

### URL-Based Configuration

All configuration is passed via URL query parameters:

```
/weekend-summary/view?date=2025-11-24&sacraments=true&masses=true&massRoles=true
```

**Parameters:**
- `date` (required) - Sunday date in ISO format (YYYY-MM-DD)
- `sacraments` (optional) - Include sacraments section (true/false)
- `masses` (optional) - Include masses section (true/false)
- `massRoles` (optional) - Include mass roles section (true/false)

---

## User Flow

### Step 1: Setup Page (`/weekend-summary`)

User selects:
1. **Sunday date** - Calendar picker (only Sundays selectable)
2. **Checkboxes** - Which sections to include:
   - Sacraments (Weddings, Baptisms, Funerals, etc.)
   - Masses
   - Mass Roles (Lectors, Servers, Musicians, etc.)

All checkboxes are selected by default.

### Step 2: Generate

User clicks "Generate Weekend Summary" button.

Navigates to: `/weekend-summary/view?date={date}&sacraments=true&masses=true&massRoles=true`

### Step 3: View Page

Displays:
- **Main content area** - Dynamically generated weekend summary document
- **Sidebar panel** - Actions and metadata
  - Edit Configuration (back to setup)
  - Print View
  - Download PDF
  - Download Word
  - Weekend dates
  - Included sections
  - Summary counts

### Step 4: Export

User can:
- **Print** - Opens print view in new tab (`/print/weekend-summary?{params}`)
- **PDF** - Downloads PDF via API route (`/api/weekend-summary/pdf?{params}`)
- **Word** - Downloads Word document via API route (`/api/weekend-summary/word?{params}`)

---

## File Structure

```
src/
├── app/
│   ├── (main)/
│   │   └── weekend-summary/
│   │       ├── page.tsx                                    # Setup page (server)
│   │       ├── weekend-summary-setup.tsx                   # Setup form (client)
│   │       └── view/
│   │           ├── page.tsx                                # View page (server)
│   │           └── weekend-summary-view-client.tsx         # View client
│   ├── print/
│   │   └── weekend-summary/
│   │       └── page.tsx                                    # Print page (server)
│   └── api/
│       └── weekend-summary/
│           ├── pdf/
│           │   └── route.ts                                # PDF export API
│           └── word/
│               └── route.ts                                # Word export API
└── lib/
    ├── actions/
    │   └── weekend-summary.ts                              # Server action to fetch data
    └── content-builders/
        └── weekend-summary/
            └── index.ts                                     # Content builder

tests/
└── weekend-summary.spec.ts                                  # End-to-end tests
```

---

## Implementation Details

### Server Action (`src/lib/actions/weekend-summary.ts`)

**Purpose:** Fetch all weekend data from multiple modules.

**Key Function:**
```typescript
export async function getWeekendSummaryData(
  params: WeekendSummaryParams
): Promise<WeekendSummaryData>
```

**Process:**
1. Calculates Saturday date (day before selected Sunday)
2. Fetches all sacraments (Weddings, Baptisms, Funerals, etc.)
3. Filters to only include events on Saturday or Sunday
4. Fetches masses for the weekend
5. Fetches mass roles for each mass
6. Returns structured data object

### Content Builder (`src/lib/content-builders/weekend-summary/index.ts`)

**Purpose:** Transform weekend data into liturgical document structure.

**Key Function:**
```typescript
export function buildWeekendSummary(
  data: WeekendSummaryData,
  params: WeekendSummaryParams
): LiturgyDocument
```

**Output Structure:**
- Cover Page (weekend dates)
- Sacraments Section (if requested)
  - Weddings, Baptisms, Funerals, Presentations, Quinceañeras
- Masses Section (if requested)
  - Date, time, location, presider, language
- Mass Roles Section (if requested)
  - Grouped by mass with role assignments
- Empty state (if no activities)

### View Client (`weekend-summary-view-client.tsx`)

**Purpose:** Display weekend summary using ModuleViewContainer pattern.

**Key Features:**
- Generates filenames for downloads (`Weekend-Summary-YYYYMMDD.{pdf|docx}`)
- Builds query params for print/export URLs
- Displays action buttons (Edit, Print, Download)
- Shows metadata (dates, sections, counts)

---

## Testing

**Test File:** `tests/weekend-summary.spec.ts`

**Test Coverage:**
1. Display setup page with date picker and checkboxes
2. Allow selecting a Sunday date and generating summary
3. Toggle checkboxes and verify URL params
4. Display view page with correct sections
5. Navigate back to setup page via Edit Configuration
6. Verify all checkboxes are checked by default

**Run Tests:**
```bash
npm test -- weekend-summary
```

---

## Future Enhancements

### Potential Features:
1. **Save Configurations** - Save frequently used configurations for quick access
2. **Email Distribution** - Email weekend summary to staff list
3. **Additional Filters** - Filter by location, presider, or liturgical season
4. **Weekly View** - Expand to show entire week instead of just weekend
5. **Historical Archive** - Browse past weekend summaries
6. **Template Selection** - Multiple output templates (brief vs. detailed)
7. **Auto-generation** - Automatically generate for upcoming weekends

### Performance Considerations:
- Current implementation fetches ALL entities and filters in memory
- For parishes with large datasets, consider database-level filtering
- Add pagination if weekend has many activities
- Cache frequently accessed weekends

---

## Related Documentation

- **[REPORT_BUILDER_SYSTEM.md](./REPORT_BUILDER_SYSTEM.md)** - Report builder architecture patterns
- **[CONTENT_BUILDER_STRUCTURE.md](./CONTENT_BUILDER_STRUCTURE.md)** - Liturgical document structure
- **[MODULE_VIEW_CONTAINER_PATTERN.md](./MODULE_VIEW_CONTAINER_PATTERN.md)** - View page pattern

---

## Sidebar Navigation

The Weekend Summary module appears as a top-level item in the main sidebar (no children):

**Icon:** `CalendarDays` from lucide-react
**Label:** "Weekend Summary"
**Route:** `/weekend-summary`
**Position:** After Quinceañeras, before Settings section

---

## Key Differences from Other Modules

| Feature | Standard Module (Weddings) | Weekend Summary |
|---------|---------------------------|-----------------|
| Database Table | ✅ Yes (`weddings`) | ❌ No |
| CRUD Operations | ✅ Create, Read, Update, Delete | ❌ Read-only |
| List Page | ✅ Shows all entities | ❌ Setup page instead |
| Entity ID in URL | ✅ `/weddings/[id]` | ❌ Query params only |
| Data Storage | ✅ Persisted in database | ❌ Generated on-the-fly |
| Relations | ✅ Fetches related entities | ✅ Aggregates multiple modules |
| Template Selection | ✅ Stored in entity record | ❌ Single default template |

---

## Design Philosophy

The Weekend Summary module follows the principle of **zero data duplication**. Rather than storing snapshot data, it:

1. **Queries source of truth** - Fetches live data from sacrament and mass modules
2. **Dynamic generation** - Builds document at request time
3. **URL-based state** - Configuration lives in URL, not database
4. **Stateless** - No persistent records to maintain or update

This ensures:
- Always shows current data (no stale snapshots)
- No synchronization issues
- Minimal database overhead
- Simpler maintenance

---

## Common Use Cases

### Weekly Planning Meeting
"Let's review what's happening this weekend."
→ Generate summary for upcoming Sunday
→ Share print view or PDF with staff

### Sacristy Reference
"What time is the funeral on Saturday?"
→ Print weekend summary
→ Place on sacristy counter
→ Quick reference throughout weekend

### Post-Weekend Review
"How many baptisms did we have last weekend?"
→ Generate summary for past Sunday
→ Review activity counts

### Schedule Coordination
"Are there any conflicts with the wedding and baptism times?"
→ Generate summary
→ Review all Saturday/Sunday events
→ Identify timing conflicts

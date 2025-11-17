# Helper & Formatting Functions

**Location:** `src/lib/utils/`

This document describes all helper and formatting functions used throughout the application. These centralized utilities ensure consistency, maintainability, and type safety across all modules.

---

## Table of Contents

- [Overview](#overview)
- [Critical Rules](#critical-rules)
- [Date Formatting Functions](#date-formatting-functions)
- [Person Formatting Functions](#person-formatting-functions)
- [Location Formatting Functions](#location-formatting-functions)
- [Page Title Generator Functions](#page-title-generator-functions)
- [Filename Generator Functions](#filename-generator-functions)
- [Creating New Helper Functions](#creating-new-helper-functions)

---

## Overview

**Files:**
- `src/lib/utils/formatters.ts` - Person, location, event, page title, and filename formatters
- `src/lib/utils/date-format.ts` - Comprehensive date and time formatting functions

**Purpose:**
- Centralize all formatting logic in one location
- Ensure consistency across all modules
- Provide type-safe, reusable utilities
- Prepare for future bilingual support
- Simplify maintenance and testing

---

## Critical Rules

### 🔴 ALWAYS Use Helper Functions

**NEVER write inline formatting code.** Always check if a helper function exists first.

```typescript
// ❌ WRONG - inline formatting
const name = person ? `${person.first_name} ${person.last_name}` : ''
const date = new Date(event.start_date).toLocaleDateString()

// ✅ CORRECT - use helper functions
import { formatPersonName, formatDatePretty } from '@/lib/utils/formatters'
import { formatDatePretty } from '@/lib/utils/date-format'

const name = formatPersonName(person)
const date = formatDatePretty(event.start_date)
```

### 🔴 ALWAYS Format Dates

**NEVER display raw date strings.** Raw database dates (e.g., "2025-07-15") must always be formatted before display.

```typescript
// ❌ WRONG - displaying raw date
<p>{event.start_date}</p>  // Shows: "2025-07-15"

// ✅ CORRECT - formatted date
import { formatDatePretty } from '@/lib/utils/date-format'
<p>{formatDatePretty(event.start_date)}</p>  // Shows: "July 15, 2025"
```

**This applies everywhere:**
- UI components (cards, lists, details)
- View pages
- Forms (display mode)
- **Content builders and templates** (liturgical documents)
- Print views
- Exports (PDF, Word)

### 🔴 Format Dates in Content Builders

**Content builders and templates MUST use date formatters.** When building liturgical documents, always format dates for readability.

```typescript
// In content builders (src/lib/content-builders/[module]/build-[entity]-liturgy.ts)
import { formatDateLong } from '@/lib/utils/date-format'

const liturgyContent = {
  sections: [
    {
      title: 'Wedding Celebration',
      content: `
        <p>Date: ${formatDateLong(wedding.wedding_event.start_date)}</p>
      `
    }
  ]
}
```

### 🔴 Request Permission Before Creating New Helpers

**Agents MUST ask permission before creating new helper functions.**

When you need a formatter that doesn't exist:
1. Check if an existing helper can be adapted
2. Ask the user: "Should I add a new helper function to [file] for [specific need]?"
3. Wait for approval before creating the new helper
4. Follow the guidelines in [Creating New Helper Functions](#creating-new-helper-functions)

---

## Date Formatting Functions

**Location:** `src/lib/utils/date-format.ts`

All date formatting functions accept either a string or Date object and handle errors gracefully.

### formatDateNumeric()

Returns numeric format: **"7/15/2025"**

```typescript
import { formatDateNumeric } from '@/lib/utils/date-format'

formatDateNumeric('2025-07-15')  // "7/15/2025"
formatDateNumeric(new Date())     // "7/15/2025"
```

**Use for:** Compact date displays, tables, lists

### formatDateShort()

Returns short format: **"Jul 15, 2025"**

```typescript
import { formatDateShort } from '@/lib/utils/date-format'

formatDateShort('2025-07-15')  // "Jul 15, 2025"
```

**Use for:** Medium-length displays, cards, summaries

### formatDatePretty()

Returns pretty format: **"July 15, 2025"**

```typescript
import { formatDatePretty } from '@/lib/utils/date-format'

formatDatePretty('2025-07-15')  // "July 15, 2025"
```

**Use for:** User-facing displays, detail pages, most common use case

### formatDateLong()

Returns long format with weekday: **"Tuesday, July 15, 2025"**

```typescript
import { formatDateLong } from '@/lib/utils/date-format'

formatDateLong('2025-07-15')  // "Tuesday, July 15, 2025"
```

**Use for:** Formal displays, liturgical documents, content builders, templates

### formatDateRelative()

Returns relative time: **"in 2 months"**, **"3 days ago"**, **"today"**

```typescript
import { formatDateRelative } from '@/lib/utils/date-format'

formatDateRelative('2025-07-15')  // "in 2 months"
formatDateRelative('2025-05-13')  // "yesterday"
formatDateRelative('2025-05-14')  // "today"
```

**Use for:** Dashboard, upcoming events, notifications

### formatEventDateTime()

Returns date and time: **"Tuesday, July 15, 2025 at 11:00 AM"**

```typescript
// In formatters.ts (accepts event object)
import { formatEventDateTime } from '@/lib/utils/formatters'

formatEventDateTime(event)
// "Tuesday, July 15, 2025 at 11:00 AM"

formatEventDateTime({ start_date: '2025-07-15' })
// "Tuesday, July 15, 2025" (no time)

// In date-format.ts (accepts date and time strings)
import { formatEventDateTime } from '@/lib/utils/date-format'

formatEventDateTime('2025-07-15', '11:00')
// "Tuesday, July 15, 2025 at 11:00 AM"
```

**Use for:** Event displays, calendars, schedules

### formatTime()

Returns time: **"2:30 PM"**

```typescript
import { formatTime } from '@/lib/utils/date-format'

formatTime('14:30')  // "2:30 PM"
formatTime('09:00')  // "9:00 AM"
```

**Use for:** Time-only displays

### formatDateForFilename()

Returns YYYYMMDD format: **"20250715"** (or **"NoDate"** if null)

```typescript
import { formatDateForFilename } from '@/lib/utils/formatters'

formatDateForFilename('2025-07-15')  // "20250715"
formatDateForFilename(null)          // "NoDate"
```

**Use for:** Filename generation ONLY (not for display)

---

## Person Formatting Functions

**Location:** `src/lib/utils/formatters.ts`

### formatPersonName()

Returns full name: **"John Smith"**

```typescript
import { formatPersonName } from '@/lib/utils/formatters'

formatPersonName(person)  // "John Smith"
formatPersonName(null)    // ""
```

**Use for:** Most person name displays

### formatPersonWithPhone()

Returns name with phone: **"John Smith (555-1234)"**

```typescript
import { formatPersonWithPhone } from '@/lib/utils/formatters'

formatPersonWithPhone(person)  // "John Smith (555-1234)"
formatPersonWithPhone({ ...person, phone_number: null })  // "John Smith"
```

**Use for:** Contact lists, forms with phone display

---

## Location Formatting Functions

**Location:** `src/lib/utils/formatters.ts`

### formatLocationWithAddress()

Returns name with address: **"St. Mary Church (123 Main St, Springfield, IL)"**

```typescript
import { formatLocationWithAddress } from '@/lib/utils/formatters'

formatLocationWithAddress(location)
// "St. Mary Church (123 Main St, Springfield, IL)"

formatLocationWithAddress({ name: 'St. Mary Church' })
// "St. Mary Church" (no address details)
```

**Use for:** Location details with full information

### formatLocationName()

Returns name only: **"St. Mary Church"**

```typescript
import { formatLocationName } from '@/lib/utils/formatters'

formatLocationName(location)  // "St. Mary Church"
```

**Use for:** Simple location displays

### formatAddress()

Returns address without name: **"123 Main St, Springfield, IL"**

```typescript
import { formatAddress } from '@/lib/utils/formatters'

formatAddress(location)  // "123 Main St, Springfield, IL"
formatAddress(null)      // ""
```

**Use for:** Address-only displays

---

## Page Title Generator Functions

**Location:** `src/lib/utils/formatters.ts`

These functions generate page titles following the standard format: `[Dynamic Content]-[Module Name]`

### getWeddingPageTitle()

Format: **"Smith-Jones-Wedding"** or **"Wedding"**

```typescript
import { getWeddingPageTitle } from '@/lib/utils/formatters'

getWeddingPageTitle(wedding)  // "Smith-Jones-Wedding"
getWeddingPageTitle({ bride: { last_name: 'Smith' } })  // "Smith-Wedding"
getWeddingPageTitle({})  // "Wedding"
```

### getFuneralPageTitle()

Format: **"John Doe-Funeral"** or **"Funeral"**

```typescript
import { getFuneralPageTitle } from '@/lib/utils/formatters'

getFuneralPageTitle(funeral)  // "John Smith-Funeral"
getFuneralPageTitle({})  // "Funeral"
```

### getBaptismPageTitle()

Format: **"Jane Smith-Baptism"** or **"Baptism"**

```typescript
import { getBaptismPageTitle } from '@/lib/utils/formatters'

getBaptismPageTitle(baptism)  // "Jane Smith-Baptism"
getBaptismPageTitle({ child: { first_name: 'Jane' } })  // "Jane-Baptism"
getBaptismPageTitle({})  // "Baptism"
```

### getMassPageTitle()

Format: **"Fr. John Smith-12/25/2024-Mass"** or **"Mass"**

```typescript
import { getMassPageTitle } from '@/lib/utils/formatters'

getMassPageTitle(mass)  // "Fr. John Smith-12/25/2024-Mass"
getMassPageTitle({ presider })  // "Fr. John Smith-Mass"
getMassPageTitle({ event })  // "12/25/2024-Mass"
getMassPageTitle({})  // "Mass"
```

### getQuinceaneraPageTitle()

Format: **"Garcia-Quinceañera"** or **"Quinceañera"**

```typescript
import { getQuinceaneraPageTitle } from '@/lib/utils/formatters'

getQuinceaneraPageTitle(quinceanera)  // "Garcia-Quinceañera"
getQuinceaneraPageTitle({})  // "Quinceañera"
```

### getPresentationPageTitle()

Format: **"Martinez-Presentation"** or **"Presentation"**

```typescript
import { getPresentationPageTitle } from '@/lib/utils/formatters'

getPresentationPageTitle(presentation)  // "Martinez-Presentation"
getPresentationPageTitle({})  // "Presentation"
```

### getMassIntentionPageTitle()

Format: **"For John Doe-Mass Intention"** or **"Mass Intention"**

```typescript
import { getMassIntentionPageTitle } from '@/lib/utils/formatters'

getMassIntentionPageTitle(intention)
// "For John Doe-Mass Intention"

getMassIntentionPageTitle({ mass_offered_for: 'Very long text...' })
// "Very long text (truncated to 50 chars)...-Mass Intention"

getMassIntentionPageTitle({})  // "Mass Intention"
```

### getEventPageTitle()

Format: **"Christmas Mass"** or **"Event"**

```typescript
import { getEventPageTitle } from '@/lib/utils/formatters'

getEventPageTitle(event)  // "Christmas Mass"
getEventPageTitle({})  // "Event"
```

---

## Filename Generator Functions

**Location:** `src/lib/utils/formatters.ts`

These functions generate standardized filenames for PDF and Word exports.

**Common Pattern:**
- All filenames include date in YYYYMMDD format
- Uses dashes for separation (no spaces)
- Falls back to generic names if data is missing

### getWeddingFilename()

Format: **"Smith-Jones-20251225.pdf"**

```typescript
import { getWeddingFilename } from '@/lib/utils/formatters'

getWeddingFilename(wedding, 'pdf')   // "Smith-Jones-20251225.pdf"
getWeddingFilename(wedding, 'docx')  // "Smith-Jones-20251225.docx"
getWeddingFilename({}, 'pdf')        // "Bride-Groom-NoDate.pdf"
```

### getFuneralFilename()

Format: **"Smith-Funeral-20251225.pdf"**

```typescript
import { getFuneralFilename } from '@/lib/utils/formatters'

getFuneralFilename(funeral, 'pdf')  // "Smith-Funeral-20251225.pdf"
```

### getBaptismFilename()

Format: **"Martinez-Baptism-20251225.pdf"**

```typescript
import { getBaptismFilename } from '@/lib/utils/formatters'

getBaptismFilename(baptism, 'pdf')  // "Martinez-Baptism-20251225.pdf"
```

### getMassFilename()

Format: **"Mass-John-Smith-20251225.pdf"**

```typescript
import { getMassFilename } from '@/lib/utils/formatters'

getMassFilename(mass, 'pdf')  // "Mass-John-Smith-20251225.pdf"
```

### getQuinceaneraFilename()

Format: **"Garcia-Quinceanera-20251225.pdf"**

```typescript
import { getQuinceaneraFilename } from '@/lib/utils/formatters'

getQuinceaneraFilename(quinceanera, 'pdf')  // "Garcia-Quinceanera-20251225.pdf"
```

### getPresentationFilename()

Format: **"presentation-Martinez-20251225.pdf"**

```typescript
import { getPresentationFilename } from '@/lib/utils/formatters'

getPresentationFilename(presentation, 'pdf')  // "presentation-Martinez-20251225.pdf"
```

### getMassIntentionFilename()

Format: **"MassIntention-For-John-Doe-20251225.pdf"**

```typescript
import { getMassIntentionFilename } from '@/lib/utils/formatters'

getMassIntentionFilename(intention, 'pdf')
// "MassIntention-For-John-Doe-20251225.pdf"
```

### getEventFilename()

Format: **"Event-Christmas-Mass-20251225.pdf"**

```typescript
import { getEventFilename } from '@/lib/utils/formatters'

getEventFilename(event, 'pdf')  // "Event-Christmas-Mass-20251225.pdf"
```

---

## Creating New Helper Functions

### Before Creating a New Helper

1. **Check if it already exists** - Search both `formatters.ts` and `date-format.ts`
2. **Check if existing helper can be adapted** - Can current helpers meet your needs?
3. **Request permission from user** - Ask: "Should I add a new helper function to [file] for [specific need]?"
4. **Wait for approval** - Do not create new helpers without permission

### Guidelines for New Helpers

If approved to create a new helper function:

**1. Choose the correct file:**
- Date/time formatting → `date-format.ts`
- Person, location, event, titles, filenames → `formatters.ts`

**2. Follow naming conventions:**
- Formatters: `format[Thing]()` (e.g., `formatPersonName`)
- Generators: `get[Thing]()` (e.g., `getWeddingPageTitle`)
- Be specific and descriptive

**3. Add JSDoc comments:**
```typescript
/**
 * Brief description of what the function does
 *
 * @param paramName - Description of parameter
 * @returns Description of return value
 * @example
 * functionName(example) // "Expected Output"
 * functionName(null) // "" (show fallback behavior)
 */
export function functionName(param: Type): string {
  // Implementation
}
```

**4. Make functions pure:**
- No side effects
- Same input always produces same output
- No external state dependencies

**5. Handle null/undefined gracefully:**
```typescript
export function formatExample(data?: { field?: string } | null): string {
  if (!data?.field) return ''
  // Format logic
}
```

**6. Use proper TypeScript types:**
```typescript
export function formatExample(
  data?: {
    field1: string
    field2?: string | null
  } | null
): string {
  // Implementation
}
```

**7. Add to appropriate section:**
- Group related functions together
- Add comment headers for new sections
- Maintain alphabetical order within sections

**8. Update documentation:**
- Add to this file (FORMATTERS.md)
- Update CLAUDE.md reference if it's a critical new category

### Example: Adding a New Helper

```typescript
// In src/lib/utils/formatters.ts

// ============================================================================
// MINISTRY FORMATTING FUNCTIONS (New Section)
// ============================================================================

/**
 * Format ministry name with member count
 *
 * @param ministry - Ministry object with name and members
 * @returns Formatted string like "Choir (15 members)"
 * @example
 * formatMinistryWithCount(ministry) // "Choir (15 members)"
 * formatMinistryWithCount({ name: 'Choir' }) // "Choir"
 * formatMinistryWithCount(null) // ""
 */
export function formatMinistryWithCount(
  ministry?: {
    name: string
    member_count?: number
  } | null
): string {
  if (!ministry) return ''

  if (ministry.member_count) {
    const plural = ministry.member_count !== 1 ? 's' : ''
    return `${ministry.name} (${ministry.member_count} member${plural})`
  }

  return ministry.name
}
```

---

## When NOT to Use Formatters

**Exceptions where inline formatting is acceptable:**

1. **One-off formatting unique to a single component** - Follow the Rule of Three (don't abstract until 3 uses)
2. **Template builders with specialized liturgical formatting** - May require custom layouts
3. **Print-specific styling** - Print views may need special formatting for PDF generation
4. **Database/API operations** - When you need raw values for queries or storage

**Rule:** If you're writing the same formatting logic twice, consider using or creating a helper. At three uses, you MUST use a helper.

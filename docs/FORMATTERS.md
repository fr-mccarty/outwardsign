# Helper & Formatting Functions

**Location:** `src/lib/utils/formatters.ts`

This is the main navigation hub for all helper and formatting functions used throughout the application. These centralized utilities ensure consistency, maintainability, and type safety across all modules.

---

## Table of Contents

- [Overview](#overview)
- [Critical Rules](#critical-rules)
- [Formatter Categories](#formatter-categories)
- [Quick Reference Table](#quick-reference-table)
- [Creating New Helpers](#creating-new-helpers)
- [Related Documentation](#related-documentation)

---

## Overview

**All formatters are located in:** `src/lib/utils/formatters.ts`

**Purpose:**
- Centralize all formatting logic in one location
- Ensure consistency across all modules
- Provide type-safe, reusable utilities
- Prepare for future bilingual support
- Simplify maintenance and testing

**Key Principles:**
- Always use helper functions instead of inline formatting
- Never display raw database values (dates, status fields, etc.)
- Handle null/undefined gracefully
- Support bilingual formatting where applicable

---

## Critical Rules

### 🔴 ALWAYS Use Helper Functions

**NEVER write inline formatting code.** Always check if a helper function exists first.

```typescript
// ❌ WRONG - inline formatting
const name = person ? `${person.first_name} ${person.last_name}` : ''
const date = new Date(event.start_date).toLocaleDateString()

// ✅ CORRECT - use database field or helper functions
const name = person.full_name  // Database-generated full_name
const date = formatDatePretty(event.start_date)
```

**Exception for Person Names:** The `people` table has a database-generated `full_name` column. Use `person.full_name` directly instead of a helper function.

### 🔴 ALWAYS Format Dates

**NEVER display raw date strings.** Raw database dates (e.g., "2025-07-15") must always be formatted before display.

```typescript
// ❌ WRONG - displaying raw date
<p>{event.start_date}</p>  // Shows: "2025-07-15"

// ✅ CORRECT - formatted date
import { formatDatePretty } from '@/lib/utils/formatters'
<p>{formatDatePretty(event.start_date)}</p>  // Shows: "July 15, 2025"
```

**See [Date & Time Formatters](./formatters/DATE_TIME_FORMATTERS.md) for complete date formatting rules and functions.**

### 🔴 NEVER Display Raw Database Values

**CRITICAL: Database values should NEVER be displayed directly to users.**

This applies to all enumerated database fields:
- Status fields (`status`, `ACTIVE`, `PLANNING`, etc.)
- Event types (`event_type`, `WEDDING`, `FUNERAL`, etc.)
- Language fields (`language`, `en`, `es`, `la`, etc.)
- Sex fields (`sex`, `MALE`, `FEMALE`)

**Always use the helper function to get the localized label:**

```typescript
// ❌ WRONG - displaying raw database value
if (presentation.status) {
  presentationRows.push({ label: 'Status:', value: presentation.status })
  // Shows: "ACTIVE" or "PLANNING" (ugly, database value)
}

// ✅ CORRECT - use getStatusLabel helper
import { getStatusLabel } from '@/lib/content-builders/shared/helpers'

if (presentation.status) {
  presentationRows.push({
    label: 'Status:',
    value: getStatusLabel(presentation.status, 'en')
    // Shows: "Active" or "Planning" (human-readable, localized)
  })
}
```

**See [Entity Formatters - Status Label Helpers](./formatters/ENTITY_FORMATTERS.md#status-label-helpers) for complete details.**

### 🔴 Request Permission Before Creating New Helpers

**Agents MUST ask permission before creating new helper functions.**

When you need a formatter that doesn't exist:
1. Check if an existing helper can be adapted
2. Ask the user: "Should I add a new helper function to formatters.ts for [specific need]?"
3. Wait for approval before creating the new helper
4. Follow the guidelines in [Creating New Helpers](#creating-new-helpers)

---

## Formatter Categories

The formatter documentation is organized into five categories:

### 1. Date & Time Formatters

**File:** [formatters/DATE_TIME_FORMATTERS.md](./formatters/DATE_TIME_FORMATTERS.md)

Comprehensive date and time formatting functions including:
- Date conversion (toLocalDateString)
- Display formatters (pretty, long, short, numeric, relative)
- Event datetime formatters
- Filename date formatters

**Most commonly used:**
- `formatDatePretty()` - "July 15, 2025"
- `formatDateLong()` - "Tuesday, July 15, 2025"
- `toLocalDateString()` - Convert Date to "2025-07-15" (local timezone)

### 2. Person Formatters

**File:** [formatters/PERSON_FORMATTERS.md](./formatters/PERSON_FORMATTERS.md)

Person name and contact formatting functions including:
- Database-generated fields (full_name, full_name_pronunciation)
- Name formatters (first, last)
- Contact formatters (with phone, with email)
- Pronunciation formatters
- Role formatters

**Most commonly used:**
- `person.full_name` - Database field (preferred)
- `formatPersonWithPhone()` - "John Smith — 555-1234"
- `formatPersonWithPronunciation()` - "John Smith (jawn smith)"

### 3. Entity Formatters

**File:** [formatters/ENTITY_FORMATTERS.md](./formatters/ENTITY_FORMATTERS.md)

Event, reading, and location formatting functions including:
- Event formatters
- Reading formatters
- Location formatters
- Status label helpers

**Most commonly used:**
- `formatEventWithLocation()` - "Wedding Ceremony at St. Mary Church"
- `getStatusLabel()` - Convert "ACTIVE" to "Active" or "Activo"
- `formatLocationWithAddress()` - "St. Mary Church (123 Main St...)"

### 4. Page Title Formatters

**File:** [formatters/PAGE_TITLE_FORMATTERS.md](./formatters/PAGE_TITLE_FORMATTERS.md)

Module-specific page title generators following the format: `[Dynamic Content]-[Module Name]`

**All modules:**
- `getWeddingPageTitle()` - "Smith-Jones-Wedding"
- `getFuneralPageTitle()` - "John Doe-Funeral"
- `getBaptismPageTitle()` - "Jane Smith-Baptism"
- `getMassPageTitle()` - "Fr. Smith-12/25/2024-Mass"
- Plus: Quinceañera, Presentation, Mass Intention, Event

### 5. Filename Formatters

**File:** [formatters/FILENAME_FORMATTERS.md](./formatters/FILENAME_FORMATTERS.md)

Export filename generators for PDF and Word documents.

**All modules:**
- `getWeddingFilename()` - "Smith-Jones-20251225.pdf"
- `getFuneralFilename()` - "Smith-Funeral-20251225.pdf"
- `getBaptismFilename()` - "Martinez-Baptism-20251225.pdf"
- Plus: Mass, Quinceañera, Presentation, Mass Intention, Event

---

## Quick Reference Table

**Find the right formatter for your use case:**

| What do you need? | Function | Category | Output Example |
|------------------|----------|----------|----------------|
| **Dates** |
| Pretty date | `formatDatePretty()` | [Date & Time](./formatters/DATE_TIME_FORMATTERS.md) | "July 15, 2025" |
| Long date with day | `formatDateLong()` | [Date & Time](./formatters/DATE_TIME_FORMATTERS.md) | "Tuesday, July 15, 2025" |
| Short date | `formatDateShort()` | [Date & Time](./formatters/DATE_TIME_FORMATTERS.md) | "Jul 15, 2025" |
| Numeric date | `formatDateNumeric()` | [Date & Time](./formatters/DATE_TIME_FORMATTERS.md) | "7/15/2025" |
| Relative date | `formatDateRelative()` | [Date & Time](./formatters/DATE_TIME_FORMATTERS.md) | "in 2 months" |
| Date to YYYY-MM-DD | `toLocalDateString()` | [Date & Time](./formatters/DATE_TIME_FORMATTERS.md) | "2025-07-15" |
| Time only | `formatTime()` | [Date & Time](./formatters/DATE_TIME_FORMATTERS.md) | "2:30 PM" |
| Event date/time | `formatEventDateTime()` | [Date & Time](./formatters/DATE_TIME_FORMATTERS.md) | "Tuesday, July 15, 2025 at 11:00 AM" |
| **People** |
| Full name | `person.full_name` | [Person](./formatters/PERSON_FORMATTERS.md) | "John Smith" |
| First name only | `formatPersonFirstName()` | [Person](./formatters/PERSON_FORMATTERS.md) | "John" |
| Last name only | `formatPersonLastName()` | [Person](./formatters/PERSON_FORMATTERS.md) | "Smith" |
| Name with phone | `formatPersonWithPhone()` | [Person](./formatters/PERSON_FORMATTERS.md) | "John Smith — 555-1234" |
| Name with email | `formatPersonWithEmail()` | [Person](./formatters/PERSON_FORMATTERS.md) | "John Smith - john@example.com" |
| Name with pronunciation | `formatPersonWithPronunciation()` | [Person](./formatters/PERSON_FORMATTERS.md) | "John Smith (jawn smith)" |
| Name with role | `formatPersonWithRole()` | [Person](./formatters/PERSON_FORMATTERS.md) | "John Smith (Lector)" |
| **Events** |
| Event name | `getEventName()` | [Entity](./formatters/ENTITY_FORMATTERS.md) | "Christmas Mass" |
| Event with location | `formatEventWithLocation()` | [Entity](./formatters/ENTITY_FORMATTERS.md) | "Wedding Ceremony at St. Mary Church" |
| Compact event datetime | `formatEventDateTimeCompact()` | [Date & Time](./formatters/DATE_TIME_FORMATTERS.md) | "Mon, Jul 15, 2025 at 11:00 AM" |
| **Readings** |
| Reading citation | `getReadingPericope()` | [Entity](./formatters/ENTITY_FORMATTERS.md) | "Genesis 1:1-5" |
| Reading title | `getReadingTitle()` | [Entity](./formatters/ENTITY_FORMATTERS.md) | "First Reading" |
| Reading with lector | `formatReadingWithLector()` | [Entity](./formatters/ENTITY_FORMATTERS.md) | "Genesis 1:1-5 (John Smith)" |
| **Locations** |
| Location name only | `formatLocationName()` | [Entity](./formatters/ENTITY_FORMATTERS.md) | "St. Mary Church" |
| Location with address | `formatLocationWithAddress()` | [Entity](./formatters/ENTITY_FORMATTERS.md) | "St. Mary Church (123 Main St...)" |
| Address only | `formatAddress()` | [Entity](./formatters/ENTITY_FORMATTERS.md) | "123 Main St, Springfield, IL" |
| **Status Labels** |
| Convert status to label | `getStatusLabel()` | [Entity](./formatters/ENTITY_FORMATTERS.md) | "Active", "Activo" |
| **Page Titles** |
| Wedding page title | `getWeddingPageTitle()` | [Page Title](./formatters/PAGE_TITLE_FORMATTERS.md) | "Smith-Jones-Wedding" |
| Funeral page title | `getFuneralPageTitle()` | [Page Title](./formatters/PAGE_TITLE_FORMATTERS.md) | "John Doe-Funeral" |
| Baptism page title | `getBaptismPageTitle()` | [Page Title](./formatters/PAGE_TITLE_FORMATTERS.md) | "Jane Smith-Baptism" |
| Mass page title | `getMassPageTitle()` | [Page Title](./formatters/PAGE_TITLE_FORMATTERS.md) | "Fr. Smith-12/25/2024-Mass" |
| Other modules | See category file | [Page Title](./formatters/PAGE_TITLE_FORMATTERS.md) | Various |
| **Filenames** |
| Wedding filename | `getWeddingFilename()` | [Filename](./formatters/FILENAME_FORMATTERS.md) | "Smith-Jones-20251225.pdf" |
| Funeral filename | `getFuneralFilename()` | [Filename](./formatters/FILENAME_FORMATTERS.md) | "Smith-Funeral-20251225.pdf" |
| Baptism filename | `getBaptismFilename()` | [Filename](./formatters/FILENAME_FORMATTERS.md) | "Martinez-Baptism-20251225.pdf" |
| Mass filename | `getMassFilename()` | [Filename](./formatters/FILENAME_FORMATTERS.md) | "Mass-John-Smith-20251225.pdf" |
| Other modules | See category file | [Filename](./formatters/FILENAME_FORMATTERS.md) | Various |

---

## Creating New Helpers

### Before Creating a New Helper

1. **Check if it already exists** - Search `formatters.ts` and this documentation
2. **Check if existing helper can be adapted** - Can current helpers meet your needs?
3. **Request permission from user** - Ask: "Should I add a new helper function to formatters.ts for [specific need]?"
4. **Wait for approval** - Do not create new helpers without permission

### Guidelines for New Helpers

If approved to create a new helper function:

**1. Add to the correct file:**
- All formatters → `src/lib/utils/formatters.ts`

**2. Follow naming conventions:**
- Formatters: `format[Thing]()` (e.g., `formatPersonWithPhone`)
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

**6. Update documentation:**
- Add to the appropriate category file in `docs/formatters/`
- Update the Quick Reference Table in this file
- Update CLAUDE.md reference if it's a critical new pattern

### When NOT to Use Formatters

**Exceptions where inline formatting is acceptable:**

1. **One-off formatting unique to a single component** - Follow the Rule of Three (don't abstract until 3 uses)
2. **Template builders with specialized liturgical formatting** - May require custom layouts
3. **Print-specific styling** - Print views may need special formatting for PDF generation
4. **Database/API operations** - When you need raw values for queries or storage

**Rule:** If you're writing the same formatting logic twice, consider using or creating a helper. At three uses, you MUST use a helper.

---

## Related Documentation

- [CODE_CONVENTIONS.md](./CODE_CONVENTIONS.md) - General coding standards, bilingual implementation, page title formatting
- [MODULE_REGISTRY.md](./MODULE_REGISTRY.md) - Module status constants reference
- [CONTENT_BUILDER_SECTIONS.md](./CONTENT_BUILDER_SECTIONS.md) - Using formatters in content builders
- [LITURGICAL_SCRIPT_SYSTEM.md](./LITURGICAL_SCRIPT_SYSTEM.md) - Using formatters in liturgical documents

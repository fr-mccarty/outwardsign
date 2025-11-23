# Helper & Formatting Functions

**Location:** `src/lib/utils/`

This document describes all helper and formatting functions used throughout the application. These centralized utilities ensure consistency, maintainability, and type safety across all modules.

---

## Table of Contents

- [Overview](#overview)
- [Critical Rules](#critical-rules)
  - [ALWAYS Use Helper Functions](#-always-use-helper-functions)
  - [ALWAYS Format Dates](#-always-format-dates)
  - [Format Dates in Content Builders](#-format-dates-in-content-builders)
  - [NEVER Display Raw Database Values](#-never-display-raw-database-values)
  - [Helper Functions Enforce Consistency](#-helper-functions-enforce-consistency)
  - [Request Permission Before Creating New Helpers](#-request-permission-before-creating-new-helpers)
- [Date Formatting Functions](#date-formatting-functions)
- [Person Formatting Functions](#person-formatting-functions)
- [Event Formatting Functions](#event-formatting-functions)
- [Reading Formatting Functions](#reading-formatting-functions)
- [Location Formatting Functions](#location-formatting-functions)
- [Page Title Generator Functions](#page-title-generator-functions)
- [Filename Generator Functions](#filename-generator-functions)
- [Creating New Helper Functions](#creating-new-helper-functions)

---

## Overview

**File:** `src/lib/utils/formatters.ts` - Single source of truth for all formatters

**Contains:**
- Date and time formatting functions
- Person formatting functions
- Location formatting functions
- Event formatting functions
- Reading formatting functions
- Page title generator functions
- Filename generator functions

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
import { formatDateLong } from '@/lib/utils/formatters'

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

### 🔴 NEVER Display Raw Database Values

**CRITICAL: Database values should NEVER be displayed directly to users.**

This applies to all enumerated database fields with corresponding label constants:
- **Status fields** (`status`, `ACTIVE`, `PLANNING`, `COMPLETED`, etc.)
- **Event types** (`event_type`, `WEDDING`, `FUNERAL`, etc.)
- **Reading categories** (`category`, `WEDDING`, `FUNERAL`, etc.)
- **Language fields** (`language`, `en`, `es`, `la`, etc.)
- **Sex fields** (`sex`, `MALE`, `FEMALE`)

**Always use the helper function to get the localized label:**

```typescript
// ❌ WRONG - displaying raw database value
if (presentation.status) {
  presentationRows.push({ label: 'Estado:', value: presentation.status })
  // Shows: "ACTIVE" or "PLANNING" (ugly, database value)
}

// ✅ CORRECT - use getStatusLabel helper
import { getStatusLabel } from '@/lib/content-builders/shared/helpers'

if (presentation.status) {
  presentationRows.push({
    label: 'Estado:',
    value: getStatusLabel(presentation.status, 'es')
    // Shows: "Activo" or "Planificación" (human-readable, localized)
  })
}
```

**Status Label Helper:**

```typescript
import { getStatusLabel } from '@/lib/content-builders/shared/helpers'

// Automatically finds the right label in all status constants
getStatusLabel('ACTIVE', 'en')      // Returns: "Active"
getStatusLabel('PLANNING', 'es')    // Returns: "Planificación"
getStatusLabel('REQUESTED', 'en')   // Returns: "Requested"
getStatusLabel('SCHEDULED', 'es')   // Returns: "Programado"
getStatusLabel('CONFIRMED', 'en')   // Returns: "Confirmed"
getStatusLabel('FULFILLED', 'es')   // Returns: "Cumplido"
```

**Module-Specific Status Constants:**

**Important:** Each module has its own status values and TypeScript interface defined in `src/lib/constants.ts`.

**For a complete registry of which modules use which status constants, see [Module Status Constants](./MODULE_REGISTRY.md#module-status-constants).**

**Summary:**

- **Module Status** (presentations, weddings, funerals, baptisms, quinceañeras):
  - Constants: `MODULE_STATUS_VALUES`, `MODULE_STATUS_LABELS`
  - Values: `PLANNING`, `ACTIVE`, `INACTIVE`, `COMPLETED`, `CANCELLED`
  - Used by: Most sacrament/sacramental modules

- **Mass Status** (Mass module):
  - Constants: `MASS_STATUS_VALUES`, `MASS_STATUS_LABELS`
  - Type: `MassStatus`
  - Values: `ACTIVE`, `PLANNING`, `SCHEDULED`, `COMPLETED`, `CANCELLED`
  - Used by: Mass module only

- **Mass Intention Status** (Mass Intentions module):
  - Constants: `MASS_INTENTION_STATUS_VALUES`, `MASS_INTENTION_STATUS_LABELS`
  - Type: `MassIntentionStatus`
  - Values: `REQUESTED`, `CONFIRMED`, `FULFILLED`, `CANCELLED`
  - Used by: Mass Intentions module only

- **Combined Constant** (for display/formatting):
  - Constant: `ALL_STATUS_LABELS`
  - Purpose: Used by helper functions to display any status value
  - Contains: All status labels from all modules combined

**When to use which constant:**
- **Database columns & TypeScript types:** Use module-specific constants (`MODULE_STATUS_VALUES`, `MassStatus`, etc.)
- **Form dropdowns:** Use module-specific constants for type safety
- **Display/formatting:** Use `getStatusLabel()` helper which references `ALL_STATUS_LABELS`

**Where this applies:**
- Content builders (liturgical documents, PDFs)
- UI components (cards, lists, forms in display mode)
- View pages
- Print views
- Any user-facing display

**Why this matters:**
- Database values like "ACTIVE" look unprofessional
- Users need human-readable text like "Active" or "Activo"
- Supports bilingual display (English and Spanish)
- Maintains consistency across the application

### 🔴 Helper Functions Enforce Consistency

**Helper functions serve a dual purpose in this codebase:**

1. **Code Standardization** - Centralizes logic, reduces duplication, makes maintenance easier
2. **AI Agent Enforcement** - Provides clear, documented patterns that AI agents must follow, preventing inconsistent implementations

**Example:** The `getStatusLabel()` helper not only standardizes status display across the app, but also enforces that AI agents ALWAYS convert database values to human-readable labels. Without the helper, an AI agent might inconsistently display raw values in some places and formatted values in others.

**When creating helpers:**
- Document them thoroughly with examples
- Mark critical patterns with 🔴 CRITICAL
- Implement the helper in all applicable locations
- Update documentation to reference the helper
- This creates a "single source of truth" that both humans and AI agents follow

**Benefits for AI agents:**
- Clear, discoverable patterns (import statements show what's available)
- Reduced decision-making (no need to choose between multiple approaches)
- Enforced consistency (helper exists = must use it)
- Better maintainability (changes to one helper propagate everywhere)

### 🔴 Request Permission Before Creating New Helpers

**Agents MUST ask permission before creating new helper functions.**

When you need a formatter that doesn't exist:
1. Check if an existing helper can be adapted
2. Ask the user: "Should I add a new helper function to [file] for [specific need]?"
3. Wait for approval before creating the new helper
4. Follow the guidelines in [Creating New Helper Functions](#creating-new-helper-functions)

---

## Date Formatting Functions

**Location:** `src/lib/utils/formatters.ts` and `src/lib/utils/formatters.ts`

All date formatting functions accept either a string or Date object and handle errors gracefully.

### formatDate() ✨ Enhanced

Returns formatted date with flexible options: **"December 25, 2025"**

```typescript
import { formatDate } from '@/lib/utils/formatters'

// Default: long format
formatDate('2025-12-25', 'en')
// "December 25, 2025"

// With weekday
formatDate('2025-12-25', 'en', { includeWeekday: true })
// "Thursday, December 25, 2025"

// Short format
formatDate('2025-12-25', 'en', { format: 'short' })
// "Dec 25, 2025"

// Numeric format
formatDate('2025-12-25', 'en', { format: 'numeric' })
// "12/25/2025"

// Spanish locale
formatDate('2025-12-25', 'es')
// "25 de diciembre de 2025"

formatDate('2025-12-25', 'es', { includeWeekday: true })
// "jueves, 25 de diciembre de 2025"
```

**Use for:** All date displays with configurable formatting
**Bilingual:** Full support for English and Spanish locales
**Options:**
- `includeWeekday`: Add day of week (default: false)
- `format`: 'long' (default), 'short', or 'numeric'

### formatTime() ✨ Enhanced

Returns time in 12-hour format: **"2:30 PM"**

```typescript
import { formatTime } from '@/lib/utils/formatters'

formatTime('14:30:00')  // "2:30 PM"
formatTime('09:15')     // "9:15 AM"
formatTime('14:30:00', 'es')  // "2:30 PM" (AM/PM is international)
```

**Use for:** Time-only displays
**Bilingual:** Accepts language parameter (AM/PM is international standard)

### formatDateNumeric()

Returns numeric format: **"7/15/2025"**

```typescript
import { formatDateNumeric } from '@/lib/utils/formatters'

formatDateNumeric('2025-07-15')  // "7/15/2025"
formatDateNumeric(new Date())     // "7/15/2025"
```

**Use for:** Compact date displays, tables, lists

### formatDateShort()

Returns short format: **"Jul 15, 2025"**

```typescript
import { formatDateShort } from '@/lib/utils/formatters'

formatDateShort('2025-07-15')  // "Jul 15, 2025"
```

**Use for:** Medium-length displays, cards, summaries

### formatDatePretty()

Returns pretty format: **"July 15, 2025"**

```typescript
import { formatDatePretty } from '@/lib/utils/formatters'

formatDatePretty('2025-07-15')  // "July 15, 2025"
```

**Use for:** User-facing displays, detail pages, most common use case

### formatDateLong()

Returns long format with weekday: **"Tuesday, July 15, 2025"**

```typescript
import { formatDateLong } from '@/lib/utils/formatters'

formatDateLong('2025-07-15')  // "Tuesday, July 15, 2025"
```

**Use for:** Formal displays, liturgical documents, content builders, templates

### formatDateRelative()

Returns relative time: **"in 2 months"**, **"3 days ago"**, **"today"**

```typescript
import { formatDateRelative } from '@/lib/utils/formatters'

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

// REMOVED - Use formatEventDateTime(event) instead
import { formatEventDateTime } from '@/lib/utils/formatters'

formatEventDateTime('2025-07-15', '11:00')
// "Tuesday, July 15, 2025 at 11:00 AM"
```

**Use for:** Event displays, calendars, schedules

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

### 🔴 IMPORTANT: Use `person.full_name` Directly

**The `people` table has database-generated `full_name` and `full_name_pronunciation` columns.** Always use these fields directly instead of manually concatenating.

```typescript
// ✅ CORRECT - Use database-generated fields
const name = person.full_name
const pronunciation = person.full_name_pronunciation
const nameOrEmpty = person?.full_name || ''

// ❌ WRONG - Don't concatenate manually
const name = `${person.first_name} ${person.last_name}`
const pronunciation = `${person.first_name_pronunciation} ${person.last_name_pronunciation}`
```

**Why:**
- `full_name` is auto-generated by the database: `first_name || ' ' || last_name`
- `full_name_pronunciation` is auto-generated: `COALESCE(first_name_pronunciation, first_name) || ' ' || COALESCE(last_name_pronunciation, last_name)`
- Always available on the `Person` type
- Consistent across the entire application
- No helper function needed

**Migration:** `supabase/migrations/20251031000001_create_people_table.sql`

**Pronunciation Fields:**
- `first_name_pronunciation` - Optional pronunciation guide for first name
- `last_name_pronunciation` - Optional pronunciation guide for last name
- `full_name_pronunciation` - Auto-generated, falls back to actual name if pronunciation not provided

### formatPersonLastName()

Returns last name only: **"Smith"**

```typescript
import { formatPersonLastName } from '@/lib/utils/formatters'

formatPersonLastName(person)  // "Smith"
formatPersonLastName(null)    // ""
```

**Use for:** When only last name is needed (titles, summaries)

### formatPersonFirstName()

Returns first name only: **"John"**

```typescript
import { formatPersonFirstName } from '@/lib/utils/formatters'

formatPersonFirstName(person)  // "John"
formatPersonFirstName(null)    // ""
```

**Use for:** Informal displays, casual references

### formatPersonWithPhone()

Returns name with phone: **"John Smith — 555-1234"**

Uses database-generated `full_name` field.

```typescript
import { formatPersonWithPhone } from '@/lib/utils/formatters'

formatPersonWithPhone(person)  // "John Smith — 555-1234"
formatPersonWithPhone(person)  // "John Smith" (no phone)
```

**Use for:** Contact lists, forms with phone display, general person displays (coordinators, presiders, readers, family contacts, etc.)

### formatPersonWithPronunciation()

Returns name with pronunciation: **"John Smith (jawn smith)"**

Uses database-generated `full_name` and `full_name_pronunciation` fields.

```typescript
import { formatPersonWithPronunciation } from '@/lib/utils/formatters'

formatPersonWithPronunciation(person)  // "John Smith (jawn smith)" (with pronunciation)
formatPersonWithPronunciation(person)  // "John Smith" (no pronunciation)
```

**Use for:** Primary participants in liturgical ceremonies where pronunciation guidance helps presiders (liturgy document titles and ceremony scripts):
- Wedding: bride and groom (in title functions)
- Funeral: deceased (in title functions and ceremony scripts)
- Baptism: child (in ceremony scripts)
- Quinceañera: quinceañera (in title functions and ceremony scripts)
- Presentation: child (in ceremony scripts)

**Note:** Pronunciation is only shown if it differs from the person's actual name. If `full_name_pronunciation` equals `full_name`, pronunciation is omitted.

### formatPersonWithPronunciationWithPhone()

Returns name with pronunciation and phone: **"John Smith (jawn smith) — 555-1234"**

Uses database-generated `full_name` and `full_name_pronunciation` fields.

```typescript
import { formatPersonWithPronunciationWithPhone } from '@/lib/utils/formatters'

formatPersonWithPronunciationWithPhone(person)  // "John Smith (jawn smith) — 555-1234" (with pronunciation and phone)
formatPersonWithPronunciationWithPhone(person)  // "John Smith (jawn smith)" (pronunciation only, no phone)
formatPersonWithPronunciationWithPhone(person)  // "John Smith — 555-1234" (phone only, no pronunciation)
formatPersonWithPronunciationWithPhone(person)  // "John Smith" (no pronunciation or phone)
```

**Use for:** Primary participants in liturgical ceremonies where pronunciation guidance helps presiders:
- Wedding: bride and groom
- Funeral: deceased
- Baptism: child
- Quinceañera: quinceañera
- Presentation: child

**Note:** Pronunciation is only shown if it differs from the person's actual name. If `full_name_pronunciation` equals `full_name`, pronunciation is omitted.

### formatPersonWithRole()

Returns name with role: **"John Smith (Lector)"**

Uses database-generated `full_name` field.

```typescript
import { formatPersonWithRole } from '@/lib/utils/formatters'

formatPersonWithRole(person, 'Lector')     // "John Smith (Lector)"
formatPersonWithRole(person, 'Best Man')   // "John Smith (Best Man)"
formatPersonWithRole(person, null)         // "John Smith"
```

**Use for:** Liturgical roles, ministry assignments, participant lists

### formatPersonWithEmail()

Returns name with email: **"John Smith - john@example.com"**

Uses database-generated `full_name` field.

```typescript
import { formatPersonWithEmail } from '@/lib/utils/formatters'

formatPersonWithEmail(person)  // "John Smith - john@example.com"
formatPersonWithEmail({ ...person, email: null })  // "John Smith"
```

**Use for:** Contact lists with email, participant communications

---

## Event Formatting Functions

**Location:** `src/lib/utils/formatters.ts`

Event formatters handle event names, locations, and date/time subtitles for liturgical documents.

### getEventName()

Returns event name with fallback to event type: **"Christmas Mass"**

```typescript
import { getEventName } from '@/lib/utils/formatters'

getEventName({ name: 'Christmas Mass' })  // "Christmas Mass"
getEventName({ event_type: 'WEDDING_CEREMONY' }, 'en')  // Uses event_type
getEventName({}, 'en')  // "Event"
```

**Use for:** Event displays when name may not be set

**Note:** Returns raw event_type if no name. You may need to use EVENT_TYPE_LABELS for user-friendly display.

### formatEventWithLocation()

Returns event with location: **"Wedding Ceremony at St. Mary Church"**

```typescript
import { formatEventWithLocation } from '@/lib/utils/formatters'

formatEventWithLocation(event, location, 'en')
// "Wedding Ceremony at St. Mary Church"

formatEventWithLocation(event, location, 'es')
// "Ceremonia de Boda en Iglesia Santa María"

formatEventWithLocation(event, null, 'en')
// "Wedding Ceremony" (no location)
```

**Use for:** Event summaries with location context
**Bilingual:** Supports English ('at') and Spanish ('en') connectors

### formatEventSubtitleEnglish()

Returns subtitle for English templates: **"Tuesday, July 15, 2025 at 11:00 AM"**

```typescript
import { formatEventSubtitleEnglish } from '@/lib/utils/formatters'

formatEventSubtitleEnglish(event)
// "Tuesday, July 15, 2025 at 11:00 AM"

formatEventSubtitleEnglish({})
// "Missing Date and Time"
```

**Use for:** Liturgical document headers (English templates)
**Fallback:** Returns "Missing Date and Time" if date/time not set

### formatEventSubtitleSpanish()

Returns subtitle for Spanish templates: **"martes, 15 de julio de 2025 a las 11:00 AM"**

```typescript
import { formatEventSubtitleSpanish } from '@/lib/utils/formatters'

formatEventSubtitleSpanish(event)
// "martes, 15 de julio de 2025 a las 11:00 AM"

formatEventSubtitleSpanish({})
// "Falta Fecha y Hora"
```

**Use for:** Liturgical document headers (Spanish templates)
**Fallback:** Returns "Falta Fecha y Hora" if date/time not set

### formatEventDateTimeCompact()

Returns compact format for lists: **"Mon, Jul 15, 2025 at 11:00 AM"**

```typescript
import { formatEventDateTimeCompact } from '@/lib/utils/formatters'

formatEventDateTimeCompact(event)
// "Mon, Jul 15, 2025 at 11:00 AM"

formatEventDateTimeCompact(event, 'es')
// "lun, 15 jul 2025 a las 11:00 AM"

formatEventDateTimeCompact({ start_date: '2025-07-15' })
// "Mon, Jul 15, 2025" (no time)
```

**Use for:** Event lists, calendars, compact displays
**Bilingual:** Supports English and Spanish formats

---

## Reading Formatting Functions

**Location:** `src/lib/utils/formatters.ts`

Reading formatters handle liturgical readings (First Reading, Psalm, Gospel, etc.) used across sacramental modules.

### getReadingPericope()

Returns reading citation: **"Genesis 1:1-5"**

```typescript
import { getReadingPericope } from '@/lib/utils/formatters'

getReadingPericope(reading)  // "Genesis 1:1-5"
getReadingPericope(null)     // ""
```

**Use for:** Displaying scripture references in templates, summaries

### getReadingTitle()

Returns reading title: **"First Reading"**

```typescript
import { getReadingTitle } from '@/lib/utils/formatters'

getReadingTitle(reading)  // "First Reading"
getReadingTitle(null)     // ""
```

**Use for:** Displaying reading labels in templates

### formatReadingWithLector()

Returns reading with lector: **"Genesis 1:1-5 (John Smith)"**

```typescript
import { formatReadingWithLector } from '@/lib/utils/formatters'

formatReadingWithLector(reading, lector)
// "Genesis 1:1-5 (John Smith)"

formatReadingWithLector(reading, null)
// "Genesis 1:1-5" (no lector)

formatReadingWithLector(null, lector)
// "" (no reading)
```

**Use for:** Summaries showing who reads which scripture passage

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

1. **Check if it already exists** - Search both `formatters.ts`
2. **Check if existing helper can be adapted** - Can current helpers meet your needs?
3. **Request permission from user** - Ask: "Should I add a new helper function to [file] for [specific need]?"
4. **Wait for approval** - Do not create new helpers without permission

### Guidelines for New Helpers

If approved to create a new helper function:

**1. Choose the correct file:**
- All formatters → `formatters.ts`
- Person, location, event, titles, filenames → `formatters.ts`

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

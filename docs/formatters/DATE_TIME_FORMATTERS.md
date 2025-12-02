# Date & Time Formatters

**Location:** `src/lib/utils/formatters.ts`

This document describes all date and time formatting functions used throughout the application.

---

## Table of Contents

- [Overview](#overview)
- [Critical Rules](#critical-rules)
- [Date Conversion Functions](#date-conversion-functions)
- [Display Formatters](#display-formatters)
- [Event DateTime Formatters](#event-datetime-formatters)
- [Filename Date Formatters](#filename-date-formatters)
- [Related Documentation](#related-documentation)

---

## Overview

**Purpose:**
- Ensure consistent date and time formatting across the application
- Handle timezone conversions properly
- Provide bilingual date formatting (English/Spanish)
- Support multiple date formats (long, short, numeric, relative)

**Key Principles:**
- All date formatting functions accept either a string or Date object
- Handle errors gracefully (return empty string or fallback)
- Use local timezone for date conversions
- Never display raw date strings (e.g., "2025-07-15")

---

## Critical Rules

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
- Content builders and templates (liturgical documents)
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

---

## Date Conversion Functions

### toLocalDateString() - 🔴 CRITICAL FOR DATE CONVERSION

**Purpose:** Convert a Date object to a YYYY-MM-DD string using LOCAL timezone.

**CRITICAL:** Use this instead of `date.toISOString().split('T')[0]`

The `toISOString()` method converts to UTC, which can shift the date by a day in western timezones. For example, if you're in EST (UTC-5) at 10 PM on January 15th, `toISOString()` returns a UTC time that could be January 16th.

This function uses local date methods (`getFullYear`, `getMonth`, `getDate`) to ensure the date string matches what the user sees on their calendar.

```typescript
import { toLocalDateString } from '@/lib/utils/formatters'

// User in EST timezone at 10 PM on January 15th
const date = new Date('2025-01-15T22:00:00-05:00')

// ❌ WRONG - May return "2025-01-16" (UTC shifted the date)
date.toISOString().split('T')[0]

// ✅ CORRECT - Returns "2025-01-15" (local date preserved)
toLocalDateString(date)
```

**Use for:**
- Converting Date objects to YYYY-MM-DD strings for URLs
- Converting Date objects to YYYY-MM-DD strings for API calls
- Any time you need to convert a Date object to a date-only string
- When working with date pickers that return Date objects

**Do NOT use for:**
- Display purposes (use `formatDatePretty`, `formatDateLong`, etc.)
- Strings that are already in YYYY-MM-DD format

---

## Display Formatters

### formatDate() - Enhanced Base Formatter

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

### formatTime()

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

---

## Event DateTime Formatters

### formatEventDateTime()

Returns date and time: **"Tuesday, July 15, 2025 at 11:00 AM"**

```typescript
import { formatEventDateTime } from '@/lib/utils/formatters'

formatEventDateTime(event)
// "Tuesday, July 15, 2025 at 11:00 AM"

formatEventDateTime({ start_date: '2025-07-15' })
// "Tuesday, July 15, 2025" (no time)
```

**Use for:** Event displays, calendars, schedules

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

## Filename Date Formatters

### formatDateForFilename()

Returns YYYYMMDD format: **"20250715"** (or **"NoDate"** if null)

```typescript
import { formatDateForFilename } from '@/lib/utils/formatters'

formatDateForFilename('2025-07-15')  // "20250715"
formatDateForFilename(null)          // "NoDate"
```

**Use for:** Filename generation ONLY (not for display)

**See also:** [Filename Formatters](./FILENAME_FORMATTERS.md) for complete filename generation patterns

---

## Related Documentation

- [Person Formatters](./PERSON_FORMATTERS.md) - Person name formatting
- [Entity Formatters](./ENTITY_FORMATTERS.md) - Event, reading, location formatting
- [Page Title Formatters](./PAGE_TITLE_FORMATTERS.md) - Module-specific title generators
- [Filename Formatters](./FILENAME_FORMATTERS.md) - Export filename generators
- [Main Formatters Index](../FORMATTERS.md) - Complete formatter overview
- [CODE_CONVENTIONS.md](../CODE_CONVENTIONS.md) - General coding standards

# Formatting and Helper Utilities

This document covers page title formatting, helper utilities pattern, and formatting conventions used throughout the application.

---

## Table of Contents

- [🔴 Page Title Formatting](#-page-title-formatting)
- [🔴 Helper Utilities Pattern](#-helper-utilities-pattern)
- [Date/Time Formatting](#datetime-formatting)
- [Person Formatting](#person-formatting)
- [Location Formatting](#location-formatting)
- [Page Title Generators](#page-title-generators)
- [Filename Generators](#filename-generators)
- [Creating New Helpers](#creating-new-helpers)

---

## 🔴 Page Title Formatting

**All module view and edit pages MUST follow this title format.**

### Format

```
[Dynamic Content]-[Module Name]
```

### Rules

1. **Module name ALWAYS comes at the END**
2. **Use dashes with NO SPACES around them**
3. **Dynamic content comes BEFORE the module name**
4. **Default fallback is just the module name** if no dynamic content exists

### Examples by Module

**Weddings:**
```typescript
title = "Smith-Jones-Wedding"        // Bride and groom last names
title = "Smith-Wedding"              // Single last name
title = "Wedding"                    // Fallback
```

**Funerals:**
```typescript
title = "John Doe-Funeral"          // Full name (spaces allowed in name, not around dash)
title = "Funeral"                    // Fallback
```

**Baptisms:**
```typescript
title = "Jane Smith-Baptism"        // Full name
title = "Jane-Baptism"              // First name only
title = "Baptism"                    // Fallback
```

**Quinceaneras:**
```typescript
title = "Maria Garcia-Quinceañera"  // Full name (note: ñ in display, not code)
title = "Maria-Quinceañera"         // First name only
title = "Quinceañera"               // Fallback
```

**Masses:**
```typescript
title = "Fr. John Smith-12/25/2024-Mass"  // Presider and date
title = "Fr. John Smith-Mass"             // Presider only
title = "12/25/2024-Mass"                 // Date only
title = "Mass"                            // Fallback
```

**Mass Intentions:**
```typescript
title = "For John Doe-Mass Intention"     // Intention text
title = "Mass Intention"                  // Fallback
```

**Templates:**
```typescript
title = "Sunday Mass-Template"            // Template name
title = "Template"                        // Fallback
```

**Presentations:**
```typescript
title = "Baby Lopez-Presentation"        // Baby name
title = "Presentation"                   // Fallback
```

### Implementation Pattern

```typescript
// In view and edit page.tsx files
export default async function WeddingPage({ params }: PageProps) {
  const wedding = await getWeddingWithRelations(params.id)

  // Set fallback first
  let title = "Wedding"

  // Add dynamic content if available
  if (wedding.bride?.last_name && wedding.groom?.last_name) {
    title = `${wedding.bride.last_name}-${wedding.groom.last_name}-Wedding`
  } else if (wedding.bride?.last_name) {
    title = `${wedding.bride.last_name}-Wedding`
  } else if (wedding.groom?.last_name) {
    title = `${wedding.groom.last_name}-Wedding`
  }
  // NO SPACES around dashes!

  return (
    <PageContainer title={title}>
      {/* Page content */}
    </PageContainer>
  )
}
```

### Where This Applies

- All module view pages (`[id]/page.tsx`)
- All module edit pages (`[id]/edit/page.tsx`)
- Any other page showing a specific module entity
- Print views (for PDF/Word export filenames)

---

## 🔴 Helper Utilities Pattern

**For comprehensive helper function documentation, see [FORMATTERS.md](../FORMATTERS.md).**

### Overview

**Location:**
- `src/lib/utils/formatters.ts` - Person, location, page title, filename formatters

**STRONGLY PREFER using helper functions** for all formatting needs. These centralized utilities ensure consistency across the application.

### 🔴 Critical Rules

1. **ALWAYS use helper functions** - Never write inline formatting code

2. **🔴 ALWAYS format dates** - Never display raw date strings (e.g., "2025-07-15")
   - Use `formatDatePretty()`, `formatDateLong()`, etc. from `formatters.ts`
   - This applies to UI, view pages, forms, **content builders**, **templates**, print views, and exports

3. **Request permission before creating new helpers** - Ask user before adding new functions

4. **Check existing helpers first** - Search `formatters.ts` before creating new functions

---

## Date/Time Formatting

```typescript
import { formatDatePretty, formatDateLong, formatEventDateTime } from '@/lib/utils/formatters'

formatDatePretty('2025-07-15')        // "Jul 15, 2025"
formatDateLong('2025-07-15')          // "July 15, 2025"
formatEventDateTime(event)            // "July 15, 2025 at 2:00 PM"
```

### Available Functions

- `formatDatePretty(date)` - Short format with abbreviated month
- `formatDateLong(date)` - Full format with spelled-out month
- `formatEventDateTime(event)` - Date with time
- `formatTime(time)` - 12-hour time format

**See [FORMATTERS.md](../FORMATTERS.md) for complete list.**

---

## Person Formatting

```typescript
// Use database-generated full_name directly
person.full_name                      // "John Doe"
person?.full_name || ''               // "John Doe" (null-safe)

// Use helpers for complex formatting
import { formatPersonWithPhone } from '@/lib/utils/formatters'
formatPersonWithPhone(person)         // "John Doe (555-1234)"
```

### Why Use full_name

The `full_name` field is generated by the database and automatically handles:
- First name + last name concatenation
- Null handling
- Consistent formatting

**No helper function needed for basic person names - use `person.full_name` directly.**

---

## Location Formatting

```typescript
import { formatLocationWithAddress, formatLocationName } from '@/lib/utils/formatters'

formatLocationWithAddress(location)   // "St. Mary's Church, 123 Main St"
formatLocationName(location)          // "St. Mary's Church"
```

### Available Functions

- `formatLocationWithAddress(location)` - Location name with full address
- `formatLocationName(location)` - Location name only
- `formatLocationCity(location)` - City, State format

**See [FORMATTERS.md](../FORMATTERS.md) for complete list.**

---

## Page Title Generators

**Use helper functions from `formatters.ts`:**

```typescript
import { getWeddingPageTitle, getFuneralPageTitle } from '@/lib/utils/formatters'

// Instead of manual title construction
const title = getWeddingPageTitle(wedding)          // "Smith-Jones-Wedding"
const title = getFuneralPageTitle(funeral)          // "John Doe-Funeral"
```

### Why Use Helper Functions

- Consistent title format across all modules
- Handles edge cases (null values, missing data)
- Single source of truth for title logic
- Easy to update format in one place

---

## Filename Generators

```typescript
import { getWeddingFilename, getFuneralFilename } from '@/lib/utils/formatters'

getWeddingFilename(wedding)           // "smith-jones-wedding"
getFuneralFilename(funeral)           // "john-doe-funeral"
```

### Filename vs. Page Title

- **Page titles** - Display in UI, proper capitalization
- **Filenames** - Used for exports, lowercase with dashes

---

## Creating New Helpers

**Before creating a new helper function:**

1. **Check existing helpers** - Search `formatters.ts`
2. **Ask permission** - Request user approval before adding
3. **Follow Rule of Three** - Wait for 3 uses before abstracting
4. **Document it** - Add to [FORMATTERS.md](../FORMATTERS.md)

### Helper Function Guidelines

**DO create helpers for:**
- Complex formatting logic
- Multi-step transformations
- Format that appears 3+ times
- Date/time formatting
- Business logic formatting (titles, filenames)

**DON'T create helpers for:**
- Simple property access (`person.full_name`)
- One-time formatting
- Format that only appears once or twice
- Trivial string concatenation

---

## Usage Pattern

```typescript
import { getWeddingPageTitle } from '@/lib/utils/formatters'
import { formatDatePretty } from '@/lib/utils/formatters'

export function WeddingViewClient({ wedding }: Props) {
  const brideName = wedding.bride?.full_name || ''
  const eventDate = formatDatePretty(wedding.wedding_event.start_date)
  const pageTitle = getWeddingPageTitle(wedding)

  return (
    <div>
      <h1>{pageTitle}</h1>
      <p>Bride: {brideName}</p>
      <p>Date: {eventDate}</p>
    </div>
  )
}
```

---

## Examples of What NOT to Do

```typescript
// ❌ BAD - Raw date display
<p>{wedding.wedding_event.start_date}</p>  // Shows "2025-07-15"

// ❌ BAD - Inline formatting
<p>{new Date(wedding.wedding_event.start_date).toLocaleDateString()}</p>

// ❌ BAD - Manual name construction
<p>{person.first_name} {person.last_name}</p>

// ✅ GOOD - Use database-generated full_name and helpers
<p>{formatDatePretty(wedding.wedding_event.start_date)}</p>
<p>{person.full_name}</p>
```

---

## Related Documentation

- [GENERAL.md](./GENERAL.md) - General code conventions (no inline functions)
- [UI_PATTERNS.md](./UI_PATTERNS.md) - UI component patterns
- [DEVELOPMENT.md](./DEVELOPMENT.md) - Development guidelines and abstraction principles
- [FORMATTERS.md](../FORMATTERS.md) - Complete helper function reference with all available functions

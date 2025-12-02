# Entity Formatters

**Location:** `src/lib/utils/formatters.ts`

This document describes formatting functions for events, readings, and locations used across all modules.

---

## Table of Contents

- [Overview](#overview)
- [Event Formatters](#event-formatters)
- [Reading Formatters](#reading-formatters)
- [Location Formatters](#location-formatters)
- [Status Label Helpers](#status-label-helpers)
- [Related Documentation](#related-documentation)

---

## Overview

**Purpose:**
- Format events with names, locations, and date/time
- Format liturgical readings with citations and lectors
- Format location names and addresses
- Convert database status values to human-readable labels

**Key Principles:**
- Handle null/undefined values gracefully
- Support bilingual formatting (English/Spanish)
- Combine entity data with related data (event + location, reading + lector)
- Always convert raw database values to localized labels

---

## Event Formatters

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

---

## Reading Formatters

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

## Location Formatters

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

## Status Label Helpers

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

### getStatusLabel()

**Location:** `src/lib/content-builders/shared/helpers.ts`

Automatically finds the right label in all status constants.

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

**Use for:**
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

### Module-Specific Status Constants

**Important:** Each module has its own status values and TypeScript interface defined in `src/lib/constants.ts`.

**For a complete registry of which modules use which status constants, see [Module Status Constants](../MODULE_REGISTRY.md#module-status-constants).**

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

---

## Related Documentation

- [Date & Time Formatters](./DATE_TIME_FORMATTERS.md) - Date and time formatting
- [Person Formatters](./PERSON_FORMATTERS.md) - Person name formatting
- [Page Title Formatters](./PAGE_TITLE_FORMATTERS.md) - Module-specific title generators
- [Filename Formatters](./FILENAME_FORMATTERS.md) - Export filename generators
- [Main Formatters Index](../FORMATTERS.md) - Complete formatter overview
- [MODULE_REGISTRY.md](../MODULE_REGISTRY.md) - Module status constants reference
- [CODE_CONVENTIONS.md](../CODE_CONVENTIONS.md) - General coding standards

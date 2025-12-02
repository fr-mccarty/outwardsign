# Filename Formatters

**Location:** `src/lib/utils/formatters.ts`

This document describes filename generator functions used to create standardized filenames for PDF and Word exports.

---

## Table of Contents

- [Overview](#overview)
- [Filename Format](#filename-format)
- [Module Filename Functions](#module-filename-functions)
  - [Wedding](#wedding)
  - [Funeral](#funeral)
  - [Baptism](#baptism)
  - [Mass](#mass)
  - [Quinceañera](#quinceañera)
  - [Presentation](#presentation)
  - [Mass Intention](#mass-intention)
  - [Event](#event)
- [Related Documentation](#related-documentation)

---

## Overview

**Purpose:**
- Generate standardized filenames for PDF and Word exports
- Include identifying information (names, dates)
- Use consistent, filesystem-safe formatting
- Provide meaningful fallbacks when entity data is missing

**Key Principles:**
- Use dashes for separation (no spaces)
- Include date in YYYYMMDD format
- Support both PDF and DOCX extensions
- Provide fallback filenames for missing data

---

## Filename Format

**Common Pattern:**
- All filenames include date in YYYYMMDD format
- Uses dashes for separation (no spaces)
- Falls back to generic names if data is missing
- Format: `[Identifier]-[Context]-[Date].[extension]`

**Examples:**
- `"Smith-Jones-20251225.pdf"`
- `"Martinez-Funeral-20251225.docx"`
- `"Mass-John-Smith-20251225.pdf"`
- `"Bride-Groom-NoDate.pdf"` (fallback)

---

## Module Filename Functions

### Wedding

#### getWeddingFilename()

Format: **"Smith-Jones-20251225.pdf"**

```typescript
import { getWeddingFilename } from '@/lib/utils/formatters'

getWeddingFilename(wedding, 'pdf')   // "Smith-Jones-20251225.pdf"
getWeddingFilename(wedding, 'docx')  // "Smith-Jones-20251225.docx"
getWeddingFilename({}, 'pdf')        // "Bride-Groom-NoDate.pdf"
```

**Pattern:**
- With bride and groom: `"[BrideLastName]-[GroomLastName]-[Date].[ext]"`
- With bride only: `"[BrideLastName]-Groom-[Date].[ext]"`
- With groom only: `"Bride-[GroomLastName]-[Date].[ext]"`
- Neither: `"Bride-Groom-[Date].[ext]"`
- No date: `"...-NoDate.[ext]"`

---

### Funeral

#### getFuneralFilename()

Format: **"Smith-Funeral-20251225.pdf"**

```typescript
import { getFuneralFilename } from '@/lib/utils/formatters'

getFuneralFilename(funeral, 'pdf')  // "Smith-Funeral-20251225.pdf"
getFuneralFilename(funeral, 'docx')  // "Smith-Funeral-20251225.docx"
getFuneralFilename({}, 'pdf')        // "Deceased-Funeral-NoDate.pdf"
```

**Pattern:**
- With deceased: `"[DeceasedLastName]-Funeral-[Date].[ext]"`
- Without deceased: `"Deceased-Funeral-[Date].[ext]"`
- No date: `"...-NoDate.[ext]"`

---

### Baptism

#### getBaptismFilename()

Format: **"Martinez-Baptism-20251225.pdf"**

```typescript
import { getBaptismFilename } from '@/lib/utils/formatters'

getBaptismFilename(baptism, 'pdf')  // "Martinez-Baptism-20251225.pdf"
getBaptismFilename(baptism, 'docx')  // "Martinez-Baptism-20251225.docx"
getBaptismFilename({}, 'pdf')        // "Child-Baptism-NoDate.pdf"
```

**Pattern:**
- With child: `"[ChildLastName]-Baptism-[Date].[ext]"`
- Without child: `"Child-Baptism-[Date].[ext]"`
- No date: `"...-NoDate.[ext]"`

---

### Mass

#### getMassFilename()

Format: **"Mass-John-Smith-20251225.pdf"**

```typescript
import { getMassFilename } from '@/lib/utils/formatters'

getMassFilename(mass, 'pdf')  // "Mass-John-Smith-20251225.pdf"
getMassFilename(mass, 'docx')  // "Mass-John-Smith-20251225.docx"
getMassFilename({}, 'pdf')     // "Mass-NoDate.pdf"
```

**Pattern:**
- With presider and date: `"Mass-[PresiderFirstName]-[PresiderLastName]-[Date].[ext]"`
- With presider only: `"Mass-[PresiderFirstName]-[PresiderLastName]-NoDate.[ext]"`
- With date only: `"Mass-[Date].[ext]"`
- Neither: `"Mass-NoDate.[ext]"`

**Note:** Uses presider's first and last name separately, not full_name.

---

### Quinceañera

#### getQuinceaneraFilename()

Format: **"Garcia-Quinceanera-20251225.pdf"**

```typescript
import { getQuinceaneraFilename } from '@/lib/utils/formatters'

getQuinceaneraFilename(quinceanera, 'pdf')  // "Garcia-Quinceanera-20251225.pdf"
getQuinceaneraFilename(quinceanera, 'docx')  // "Garcia-Quinceanera-20251225.docx"
getQuinceaneraFilename({}, 'pdf')            // "Quinceanera-NoDate.pdf"
```

**Pattern:**
- With quinceañera: `"[QuinceañeraLastName]-Quinceanera-[Date].[ext]"`
- Without quinceañera: `"Quinceanera-[Date].[ext]"`
- No date: `"...-NoDate.[ext]"`

**Note:** Uses "Quinceanera" (no tilde) in filename for filesystem compatibility.

---

### Presentation

#### getPresentationFilename()

Format: **"presentation-Martinez-20251225.pdf"**

```typescript
import { getPresentationFilename } from '@/lib/utils/formatters'

getPresentationFilename(presentation, 'pdf')  // "presentation-Martinez-20251225.pdf"
getPresentationFilename(presentation, 'docx')  // "presentation-Martinez-20251225.docx"
getPresentationFilename({}, 'pdf')             // "presentation-NoDate.pdf"
```

**Pattern:**
- With child: `"presentation-[ChildLastName]-[Date].[ext]"`
- Without child: `"presentation-[Date].[ext]"`
- No date: `"presentation-NoDate.[ext]"`

**Note:** Uses lowercase "presentation" prefix.

---

### Mass Intention

#### getMassIntentionFilename()

Format: **"MassIntention-For-John-Doe-20251225.pdf"**

```typescript
import { getMassIntentionFilename } from '@/lib/utils/formatters'

getMassIntentionFilename(intention, 'pdf')
// "MassIntention-For-John-Doe-20251225.pdf"

getMassIntentionFilename(intention, 'docx')
// "MassIntention-For-John-Doe-20251225.docx"

getMassIntentionFilename({}, 'pdf')
// "MassIntention-NoDate.pdf"
```

**Pattern:**
- With mass_offered_for: `"MassIntention-For-[MassOfferedFor]-[Date].[ext]"`
- Without mass_offered_for: `"MassIntention-[Date].[ext]"`
- No date: `"MassIntention-NoDate.[ext]"`

**Note:**
- Replaces spaces with dashes in mass_offered_for
- Truncates long text to 50 characters

---

### Event

#### getEventFilename()

Format: **"Event-Christmas-Mass-20251225.pdf"**

```typescript
import { getEventFilename } from '@/lib/utils/formatters'

getEventFilename(event, 'pdf')  // "Event-Christmas-Mass-20251225.pdf"
getEventFilename(event, 'docx')  // "Event-Christmas-Mass-20251225.docx"
getEventFilename({}, 'pdf')      // "Event-NoDate.pdf"
```

**Pattern:**
- With event name: `"Event-[EventName]-[Date].[ext]"`
- Without event name: `"Event-[Date].[ext]"`
- No date: `"Event-NoDate.[ext]"`

**Note:** Replaces spaces with dashes in event name.

---

## Related Documentation

- [Date & Time Formatters](./DATE_TIME_FORMATTERS.md) - Date formatting (including `formatDateForFilename()`)
- [Person Formatters](./PERSON_FORMATTERS.md) - Person name formatting
- [Entity Formatters](./ENTITY_FORMATTERS.md) - Event, reading, location formatting
- [Page Title Formatters](./PAGE_TITLE_FORMATTERS.md) - Module-specific title generators
- [Main Formatters Index](../FORMATTERS.md) - Complete formatter overview
- [CODE_CONVENTIONS.md](../CODE_CONVENTIONS.md) - General coding standards

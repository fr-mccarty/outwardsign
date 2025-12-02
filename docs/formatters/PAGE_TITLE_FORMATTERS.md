# Page Title Formatters

**Location:** `src/lib/utils/formatters.ts`

This document describes page title generator functions used to create standardized browser page titles for all modules.

---

## Table of Contents

- [Overview](#overview)
- [Page Title Format](#page-title-format)
- [Module Title Functions](#module-title-functions)
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
- Generate consistent browser page titles across all modules
- Follow standardized format: `[Dynamic Content]-[Module Name]`
- Provide meaningful fallbacks when entity data is missing
- Support pronunciation guidance for primary participants

**Key Principles:**
- Module name ALWAYS at the end
- Dynamic content based on primary participants or entity identifiers
- Graceful fallbacks to module name only
- Use pronunciation when available for primary participants

---

## Page Title Format

**Standard Format:** `[Dynamic Content]-[Module Name]`

**Examples:**
- `"Smith-Jones-Wedding"` - Wedding with bride and groom last names
- `"John Doe-Funeral"` - Funeral with deceased name
- `"Fr. Smith-12/25/2024-Mass"` - Mass with presider and date
- `"Wedding"` - Fallback when no entity data available

**Rules:**
- Module name is ALWAYS at the end
- Use dashes (`-`) to separate components
- Primary participants come first
- Fallback to just module name if no data

---

## Module Title Functions

### Wedding

#### getWeddingPageTitle()

Format: **"Smith-Jones-Wedding"** or **"Wedding"**

```typescript
import { getWeddingPageTitle } from '@/lib/utils/formatters'

getWeddingPageTitle(wedding)  // "Smith-Jones-Wedding"
getWeddingPageTitle({ bride: { last_name: 'Smith' } })  // "Smith-Wedding"
getWeddingPageTitle({})  // "Wedding"
```

**Dynamic Content:**
- Both bride and groom: `"[BrideLastName]-[GroomLastName]-Wedding"`
- Bride only: `"[BrideLastName]-Wedding"`
- Groom only: `"[GroomLastName]-Wedding"`
- Neither: `"Wedding"`

**Pronunciation:**
Uses `formatPersonWithPronunciation()` for bride and groom in title functions.

**Example with Pronunciation:**
```typescript
// If bride has pronunciation: "María González (mah-REE-ah gon-SAH-lez)"
// Title: "González (gon-SAH-lez)-Smith-Wedding"
```

---

### Funeral

#### getFuneralPageTitle()

Format: **"John Doe-Funeral"** or **"Funeral"**

```typescript
import { getFuneralPageTitle } from '@/lib/utils/formatters'

getFuneralPageTitle(funeral)  // "John Smith-Funeral"
getFuneralPageTitle({})  // "Funeral"
```

**Dynamic Content:**
- With deceased: `"[DeceasedFullName]-Funeral"`
- Without deceased: `"Funeral"`

**Pronunciation:**
Uses `formatPersonWithPronunciation()` for deceased in title functions.

---

### Baptism

#### getBaptismPageTitle()

Format: **"Jane Smith-Baptism"** or **"Baptism"**

```typescript
import { getBaptismPageTitle } from '@/lib/utils/formatters'

getBaptismPageTitle(baptism)  // "Jane Smith-Baptism"
getBaptismPageTitle({ child: { first_name: 'Jane' } })  // "Jane-Baptism"
getBaptismPageTitle({})  // "Baptism"
```

**Dynamic Content:**
- With child full name: `"[ChildFullName]-Baptism"`
- With child first name only: `"[ChildFirstName]-Baptism"`
- Without child: `"Baptism"`

---

### Mass

#### getMassPageTitle()

Format: **"Fr. John Smith-12/25/2024-Mass"** or **"Mass"**

```typescript
import { getMassPageTitle } from '@/lib/utils/formatters'

getMassPageTitle(mass)  // "Fr. John Smith-12/25/2024-Mass"
getMassPageTitle({ presider })  // "Fr. John Smith-Mass"
getMassPageTitle({ event })  // "12/25/2024-Mass"
getMassPageTitle({})  // "Mass"
```

**Dynamic Content:**
- With presider and date: `"[PresiderName]-[Date]-Mass"`
- With presider only: `"[PresiderName]-Mass"`
- With date only: `"[Date]-Mass"`
- Neither: `"Mass"`

---

### Quinceañera

#### getQuinceaneraPageTitle()

Format: **"Garcia-Quinceañera"** or **"Quinceañera"**

```typescript
import { getQuinceaneraPageTitle } from '@/lib/utils/formatters'

getQuinceaneraPageTitle(quinceanera)  // "Garcia-Quinceañera"
getQuinceaneraPageTitle({})  // "Quinceañera"
```

**Dynamic Content:**
- With quinceañera: `"[QuinceañeraLastName]-Quinceañera"`
- Without quinceañera: `"Quinceañera"`

**Pronunciation:**
Uses `formatPersonWithPronunciation()` for quinceañera in title functions.

---

### Presentation

#### getPresentationPageTitle()

Format: **"Martinez-Presentation"** or **"Presentation"**

```typescript
import { getPresentationPageTitle } from '@/lib/utils/formatters'

getPresentationPageTitle(presentation)  // "Martinez-Presentation"
getPresentationPageTitle({})  // "Presentation"
```

**Dynamic Content:**
- With child: `"[ChildLastName]-Presentation"`
- Without child: `"Presentation"`

---

### Mass Intention

#### getMassIntentionPageTitle()

Format: **"For John Doe-Mass Intention"** or **"Mass Intention"**

```typescript
import { getMassIntentionPageTitle } from '@/lib/utils/formatters'

getMassIntentionPageTitle(intention)
// "For John Doe-Mass Intention"

getMassIntentionPageTitle({ mass_offered_for: 'Very long text...' })
// "Very long text (truncated to 50 chars)...-Mass Intention"

getMassIntentionPageTitle({})  // "Mass Intention"
```

**Dynamic Content:**
- With mass_offered_for: `"For [MassOfferedFor]-Mass Intention"`
- Without mass_offered_for: `"Mass Intention"`

**Note:** Truncates long `mass_offered_for` text to 50 characters.

---

### Event

#### getEventPageTitle()

Format: **"Christmas Mass"** or **"Event"**

```typescript
import { getEventPageTitle } from '@/lib/utils/formatters'

getEventPageTitle(event)  // "Christmas Mass"
getEventPageTitle({})  // "Event"
```

**Dynamic Content:**
- With event name: `"[EventName]"`
- Without event name: `"Event"`

---

## Related Documentation

- [Date & Time Formatters](./DATE_TIME_FORMATTERS.md) - Date and time formatting
- [Person Formatters](./PERSON_FORMATTERS.md) - Person name formatting
- [Entity Formatters](./ENTITY_FORMATTERS.md) - Event, reading, location formatting
- [Filename Formatters](./FILENAME_FORMATTERS.md) - Export filename generators
- [Main Formatters Index](../FORMATTERS.md) - Complete formatter overview
- [CODE_CONVENTIONS.md](../CODE_CONVENTIONS.md#page-title-formatting) - Page title format rules

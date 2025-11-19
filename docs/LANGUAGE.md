# Language System

**Status:** ✅ Implemented
**Created:** 2025-11-19
**Last Updated:** 2025-11-19

## Overview

Outward Sign uses two distinct language systems for different purposes:

1. **Liturgical Language** - For liturgical events, masses, and readings (lowercase ISO codes: `en`, `es`, `la`)
2. **User Interface Language** - For user settings, petition templates, and UI (lowercase ISO codes: `en`, `es`)

## Table of Contents

- [Liturgical Language System](#liturgical-language-system)
- [User Interface Language System](#user-interface-language-system)
- [Database Schema](#database-schema)
- [Constants Reference](#constants-reference)
- [Usage Patterns](#usage-patterns)
- [Migration Guide](#migration-guide)

---

## Liturgical Language System

### Purpose

Used to specify the language of liturgical celebrations (Masses, weddings, funerals, etc.) and liturgical readings.

### Values

- `en` - English language liturgy
- `es` - Spanish language liturgy
- `la` - Latin language liturgy (Traditional Latin Mass, etc.)

### Storage

**Database:** Stored as lowercase ISO codes (TEXT) in the following tables:

- `events.language` - Language of the liturgical event
- `mass_times.language` - Language of recurring Mass times
- `readings.language` - Language of scripture readings

**Format:** `TEXT NOT NULL DEFAULT 'en'`

### Constants

```typescript
// src/lib/constants.ts

// Liturgical Language values (lowercase ISO codes in database)
// Used for events, masses, and readings
// Lowercase ISO codes: en, es, la (Latin)
export const LITURGICAL_LANGUAGE_VALUES = ['en', 'es', 'la'] as const
export type LiturgicalLanguage = typeof LITURGICAL_LANGUAGE_VALUES[number]

// Liturgical Language labels for display
export const LITURGICAL_LANGUAGE_LABELS: Record<string, { en: string; es: string }> = {
  en: {
    en: 'English',
    es: 'Inglés'
  },
  es: {
    en: 'Spanish',
    es: 'Español'
  },
  la: {
    en: 'Latin',
    es: 'Latín'
  }
}
```

### Display

Use `LITURGICAL_LANGUAGE_LABELS` to get localized display names:

```typescript
const displayName = LITURGICAL_LANGUAGE_LABELS[event.language].en  // "English"
const displayNameEs = LITURGICAL_LANGUAGE_LABELS[event.language].es  // "Inglés"
```

### When to Use

- Event language field (`events.language`)
- Mass times language field (`mass_times.language`)
- Reading language field (`readings.language`)
- Any liturgical ceremony language designation

---

## User Interface Language System

### Purpose

Used for user interface localization and content language preferences (petition templates, user settings).

### Values

- `en` - English UI/content
- `es` - Spanish UI/content
- `bilingual` - Bilingual content (petition templates only)

### Storage

**Database:** Stored as lowercase TEXT in the following tables:

- `user_settings.language` - User's preferred UI language
- `petition_templates.language` - Language of petition template content

**Format:** `TEXT NOT NULL DEFAULT 'en'` (user_settings) or `TEXT DEFAULT 'en'` (petition_templates)

### Constants

```typescript
// src/lib/constants.ts

// User settings language
export const HOME_LANGUAGES = ['en', 'es'] as const
export type HomeLanguage = typeof HOME_LANGUAGES[number]
export const DEFAULT_HOME_LANGUAGE: HomeLanguage = 'en'

// Petition template language
export const PETITION_LANGUAGE_VALUES = ['en', 'es', 'bilingual'] as const
export type PetitionLanguage = typeof PETITION_LANGUAGE_VALUES[number]

export const PETITION_LANGUAGE_LABELS: Record<PetitionLanguage, { en: string; es: string }> = {
  'en': { en: 'English', es: 'Inglés' },
  'es': { en: 'Spanish', es: 'Español' },
  'bilingual': { en: 'Bilingual', es: 'Bilingüe' }
}
```

### When to Use

- User settings language preference
- Petition template language designation
- UI language selection
- Content localization

---

## Database Schema

### Liturgical Language Fields

**events table:**
```sql
CREATE TABLE events (
  -- ...
  language TEXT NOT NULL DEFAULT 'en',  -- Lowercase ISO codes: en, es, la (Latin)
  -- ...
);

CREATE INDEX idx_events_language ON events(language);
```

**mass_times table:**
```sql
CREATE TABLE mass_times (
  -- ...
  language TEXT NOT NULL DEFAULT 'en',  -- Lowercase ISO codes: en, es, la (Latin)
  -- ...
);
```

**readings table:**
```sql
CREATE TABLE readings (
  -- ...
  language TEXT NOT NULL DEFAULT 'en',  -- Lowercase ISO codes: en, es, la (Latin)
  -- ...
);

CREATE INDEX idx_readings_language ON readings(language);
```

### User Interface Language Fields

**user_settings table:**
```sql
CREATE TABLE user_settings (
  -- ...
  language TEXT NOT NULL DEFAULT 'en',  -- en, es
  -- ...
);
```

**petition_templates table:**
```sql
CREATE TABLE petition_templates (
  -- ...
  language TEXT DEFAULT 'en',  -- en, es, bilingual
  -- ...
);

CREATE INDEX idx_petition_templates_language ON petition_templates(language);

COMMENT ON COLUMN petition_templates.language IS 'Language of the template: en (English), es (Spanish), or bilingual';
```

---

## Constants Reference

### Liturgical Language

**File:** `src/lib/constants.ts`

```typescript
// Liturgical Language values (lowercase ISO codes in database)
// Used for events, masses, and readings
// Lowercase ISO codes: en, es, la (Latin)
export const LITURGICAL_LANGUAGE_VALUES = ['en', 'es', 'la'] as const
export type LiturgicalLanguage = typeof LITURGICAL_LANGUAGE_VALUES[number]

// Liturgical Language labels for display
export const LITURGICAL_LANGUAGE_LABELS: Record<string, { en: string; es: string }> = {
  en: { en: 'English', es: 'Inglés' },
  es: { en: 'Spanish', es: 'Español' },
  la: { en: 'Latin', es: 'Latín' }
}
```

### User Interface Language

**File:** `src/lib/constants.ts`

```typescript
// Homepage/UI language support
export const HOME_LANGUAGES = ['en', 'es'] as const
export type HomeLanguage = typeof HOME_LANGUAGES[number]
export const DEFAULT_HOME_LANGUAGE: HomeLanguage = 'en'

// Petition Template Language
export const PETITION_LANGUAGE_VALUES = ['en', 'es', 'bilingual'] as const
export type PetitionLanguage = typeof PETITION_LANGUAGE_VALUES[number]

export const PETITION_LANGUAGE_LABELS: Record<PetitionLanguage, { en: string; es: string }> = {
  'en': { en: 'English', es: 'Inglés' },
  'es': { en: 'Spanish', es: 'Español' },
  'bilingual': { en: 'Bilingual', es: 'Bilingüe' }
}
```

---

## Usage Patterns

### Form Fields - Liturgical Language

Use `Select` with `LITURGICAL_LANGUAGE_VALUES` for liturgical language fields:

```tsx
import { LITURGICAL_LANGUAGE_VALUES, LITURGICAL_LANGUAGE_LABELS } from '@/lib/constants'

<FormField
  control={form.control}
  name="language"
  render={({ field }) => (
    <FormItem>
      <FormLabel>Language</FormLabel>
      <Select onValueChange={field.onChange} defaultValue={field.value}>
        <FormControl>
          <SelectTrigger>
            <SelectValue placeholder="Select language" />
          </SelectTrigger>
        </FormControl>
        <SelectContent>
          {LITURGICAL_LANGUAGE_VALUES.map((language) => (
            <SelectItem key={language} value={language}>
              {LITURGICAL_LANGUAGE_LABELS[language].en}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      <FormMessage />
    </FormItem>
  )}
/>
```

### Form Fields - Petition Language

Use `Select` with `PETITION_LANGUAGE_VALUES` for petition templates:

```tsx
import { PETITION_LANGUAGE_VALUES, PETITION_LANGUAGE_LABELS } from '@/lib/constants'

<FormField
  control={form.control}
  name="language"
  render={({ field }) => (
    <FormItem>
      <FormLabel>Template Language</FormLabel>
      <Select onValueChange={field.onChange} defaultValue={field.value}>
        <FormControl>
          <SelectTrigger>
            <SelectValue placeholder="Select language" />
          </SelectTrigger>
        </FormControl>
        <SelectContent>
          {PETITION_LANGUAGE_VALUES.map((language) => (
            <SelectItem key={language} value={language}>
              {PETITION_LANGUAGE_LABELS[language].en}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      <FormMessage />
    </FormItem>
  )}
/>
```

### Display in List Views

Liturgical language displays in ListViewCard via the `language` prop:

```tsx
<ListViewCard
  title={entity.name}
  href={`/events/${entity.id}`}
  editHref={`/events/${entity.id}/edit`}
  language={entity.event?.language || undefined}
>
  {/* Card content */}
</ListViewCard>
```

The `language` prop automatically renders using `LITURGICAL_LANGUAGE_LABELS` for localized display.

### Validation

**Liturgical Language:**
```typescript
import { z } from 'zod'
import { LITURGICAL_LANGUAGE_VALUES } from '@/lib/constants'

const schema = z.object({
  language: z.enum(LITURGICAL_LANGUAGE_VALUES)
})
```

**Petition Language:**
```typescript
import { z } from 'zod'
import { PETITION_LANGUAGE_VALUES } from '@/lib/constants'

const schema = z.object({
  language: z.enum(PETITION_LANGUAGE_VALUES).optional()
})
```

---

## Migration Guide

### Fixing Language Inconsistencies

If you encounter language fields stored with incorrect casing:

**Step 1: Create Migration**

```sql
-- Fix events.language field to use lowercase ISO codes with default
ALTER TABLE events
  ALTER COLUMN language SET DEFAULT 'en';

-- Update any existing uppercase values to lowercase
UPDATE events
SET language = LOWER(language)
WHERE language IS NOT NULL;

-- Make field non-nullable
ALTER TABLE events
  ALTER COLUMN language SET NOT NULL;
```

**Step 2: Update Application Code**

Search for any code using uppercase language values:

```bash
# Find files using uppercase language values
grep -r "language.*=.*'ENGLISH'" src/
grep -r "language.*=.*'SPANISH'" src/
```

Update to use lowercase ISO codes:

```typescript
// Before
const event = { language: 'ENGLISH' }

// After
import { LITURGICAL_LANGUAGE_VALUES } from '@/lib/constants'
const event = { language: 'en' }
```

**Step 3: Update Forms**

Ensure form default values use lowercase ISO codes:

```typescript
// Before
const form = useForm({
  defaultValues: {
    language: entity?.language || 'ENGLISH'
  }
})

// After
const form = useForm({
  defaultValues: {
    language: entity?.language || 'en'
  }
})
```

---

## Related Documentation

- [DEFINITIONS.md](./DEFINITIONS.md) - Liturgical terminology
- [CODE_CONVENTIONS.md](./CODE_CONVENTIONS.md) - Bilingual implementation patterns
- [MODULE_DEVELOPMENT.md](./MODULE_DEVELOPMENT.md) - Constants pattern

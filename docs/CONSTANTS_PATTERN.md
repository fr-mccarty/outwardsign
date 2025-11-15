# Constants Pattern

**Location:** `src/lib/constants.ts`

The application uses a **dual-constant pattern** for all dropdown values, status fields, and enumerated types. This pattern separates database storage from UI display and enables bilingual support.

## Pattern Structure

Every constant follows this three-part structure:

1. **VALUES array** - Uppercase keys stored in database
2. **Type definition** - TypeScript type for type safety
3. **LABELS object** - Bilingual display labels (English + Spanish)

## Example: Module Status

```typescript
// 1. VALUES array - what gets stored in the database
export const MODULE_STATUS_VALUES = ['ACTIVE', 'INACTIVE', 'COMPLETED'] as const

// 2. TypeScript type derived from VALUES
export type ModuleStatus = typeof MODULE_STATUS_VALUES[number]

// 3. LABELS object - what users see in the UI
export const MODULE_STATUS_LABELS: Record<ModuleStatus, { en: string; es: string }> = {
  ACTIVE: {
    en: 'Active',
    es: 'Activo'
  },
  INACTIVE: {
    en: 'Inactive',
    es: 'Inactivo'
  },
  COMPLETED: {
    en: 'Completed',
    es: 'Completado'
  }
}
```

## Usage in Forms

```tsx
// Render dropdown options
<Select value={status} onValueChange={setStatus}>
  <SelectTrigger>
    <SelectValue placeholder="Select status" />
  </SelectTrigger>
  <SelectContent>
    {MODULE_STATUS_VALUES.map((statusOption) => (
      <SelectItem key={statusOption} value={statusOption}>
        {MODULE_STATUS_LABELS[statusOption].en}
      </SelectItem>
    ))}
  </SelectContent>
</Select>
```

## Usage in Display/View Components

```tsx
// Display the label in the current language
<p>Status: {MODULE_STATUS_LABELS[entity.status].en}</p>
```

## Why This Pattern?

1. **Database Consistency**: Uppercase keys (`ACTIVE`, `INACTIVE`) stored in database are stable and language-independent
2. **Bilingual Support**: Labels support both English (`.en`) and Spanish (`.es`) without changing database values
3. **Type Safety**: TypeScript ensures only valid values can be used
4. **Centralized**: All constants in one file (`constants.ts`) for easy maintenance
5. **Future-Proof**: Easy to add new languages by adding properties to label objects

## Standard Constant Types

All constants in `src/lib/constants.ts` follow this pattern:

- **Module Status**: `MODULE_STATUS_VALUES` + `MODULE_STATUS_LABELS`
- **Event Types**: `EVENT_TYPE_VALUES` + `EVENT_TYPE_LABELS`
- **Reading Categories**: `READING_CATEGORIES` + `READING_CATEGORY_LABELS`
- **Languages**: `LANGUAGE_VALUES` + `LANGUAGE_LABELS`
- **Template IDs** (All Primary Modules):
  - `WEDDING_TEMPLATE_VALUES` + `WEDDING_TEMPLATE_LABELS`
  - `QUINCEANERA_TEMPLATE_VALUES` + `QUINCEANERA_TEMPLATE_LABELS`
  - `FUNERAL_TEMPLATE_VALUES` + `FUNERAL_TEMPLATE_LABELS`
  - `BAPTISM_TEMPLATE_VALUES` + `BAPTISM_TEMPLATE_LABELS`
  - `PRESENTATION_TEMPLATE_VALUES` + `PRESENTATION_TEMPLATE_LABELS`
  - `MASS_TEMPLATE_VALUES` + `MASS_TEMPLATE_LABELS`
  - `MASS_INTENTION_TEMPLATE_VALUES` + `MASS_INTENTION_TEMPLATE_LABELS`
- **Mass-specific Status**:
  - `MASS_STATUS_VALUES` + `MASS_STATUS_LABELS`
  - `MASS_INTENTION_STATUS_VALUES` + `MASS_INTENTION_STATUS_LABELS`

## Adding New Constants

When adding a new constant type, follow this checklist:

1. **Create VALUES array** with uppercase keys (what goes in database)
2. **Create TypeScript type** using `typeof VALUES[number]`
3. **Create LABELS object** with bilingual labels for each value
4. **Export all three** from `src/lib/constants.ts`
5. **Update forms** to use `VALUES` for options and `LABELS` for display
6. **Update database migration** if creating new columns

### Example: Adding a new constant type

```typescript
// Step 1: VALUES array
export const CEREMONY_TYPE_VALUES = ['MASS', 'LITURGY', 'BLESSING'] as const

// Step 2: TypeScript type
export type CeremonyType = typeof CEREMONY_TYPE_VALUES[number]

// Step 3: LABELS object
export const CEREMONY_TYPE_LABELS: Record<CeremonyType, { en: string; es: string }> = {
  MASS: { en: 'Mass', es: 'Misa' },
  LITURGY: { en: 'Liturgy of the Word', es: 'Liturgia de la Palabra' },
  BLESSING: { en: 'Blessing', es: 'Bendición' }
}
```

## Important Notes

- **Always use UPPERCASE** for database values (e.g., `ACTIVE`, not `active`)
- **Always provide both `.en` and `.es`** labels, even if the Spanish translation is the same
- **Use descriptive constant names** that indicate the domain (e.g., `MASS_STATUS`, not just `STATUS`)
- **Group related constants** together in `constants.ts` with comment headers
- **Never hardcode status strings** in components - always use constants

## 🔴 Critical Display Rule: Event Types

**NEVER display event type values directly from the database.** Always filter through `EVENT_TYPE_LABELS` from constants.

**Why this matters:**
- Database stores uppercase keys like `WEDDING_RECEPTION`, `FUNERAL_MEAL`
- Users should see friendly, localized labels like "Wedding Reception" or "Recepción de Boda"
- Ensures consistency across all event displays in the application

**Incorrect (shows raw database value):**
```tsx
// ❌ WRONG - displays "WEDDING_RECEPTION" to users
<p>Event Type: {event.event_type}</p>
```

**Correct (shows localized label):**
```tsx
// ✅ CORRECT - displays "Wedding Reception" or "Recepción de Boda"
import { EVENT_TYPE_LABELS } from '@/lib/constants'

<p>Event Type: {EVENT_TYPE_LABELS[event.event_type].en}</p>
```

**In form dropdowns:**
```tsx
import { EVENT_TYPE_VALUES, EVENT_TYPE_LABELS } from '@/lib/constants'

<Select value={eventType} onValueChange={setEventType}>
  <SelectContent>
    {EVENT_TYPE_VALUES.map((type) => (
      <SelectItem key={type} value={type}>
        {EVENT_TYPE_LABELS[type].en}
      </SelectItem>
    ))}
  </SelectContent>
</Select>
```

This pattern standardizes database storage while enabling multilingual UI display across all modules.

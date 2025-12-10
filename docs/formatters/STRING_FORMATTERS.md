# String Formatters

**Location:** `src/lib/utils/formatters.ts`

General string manipulation and transformation utilities for consistent text processing across the application.

---

## Table of Contents

- [generateSlug](#generateslug)
- [capitalizeFirstLetter](#capitalizefirstletter)

---

## generateSlug

Convert text to a URL-safe slug. Used for creating URL-friendly identifiers from human-readable names.

### Signature

```typescript
function generateSlug(text: string): string
```

### Parameters

| Parameter | Type | Description |
|-----------|------|-------------|
| `text` | `string` | The text to convert to a slug |

### Returns

A lowercase, hyphen-separated string safe for use in URLs.

### Transformations Applied

1. Convert to lowercase
2. Trim whitespace from start/end
3. Remove special characters (keeps letters, numbers, spaces, hyphens)
4. Replace spaces with hyphens
5. Collapse multiple hyphens into single hyphen
6. Remove leading/trailing hyphens

### Examples

```typescript
import { generateSlug } from '@/lib/utils/formatters'

// Basic usage
generateSlug('Wedding Songs')           // "wedding-songs"
generateSlug('Wedding Ceremony')        // "wedding-ceremony"

// Handles multiple spaces
generateSlug('   Multiple   Spaces   ') // "multiple-spaces"

// Removes special characters
generateSlug('Special @#$ Characters!') // "special-characters"

// Handles numbers
generateSlug('Event Type 123')          // "event-type-123"

// Handles hyphens in input
generateSlug('Pre-Cana Sessions')       // "pre-cana-sessions"
```

### Use Cases

| Use Case | Example |
|----------|---------|
| Event type slugs | "Wedding Ceremony" → "wedding-ceremony" |
| Custom list slugs | "Wedding Songs" → "wedding-songs" |
| URL paths | Create URL-safe identifiers for routing |
| File identifiers | Generate consistent keys from names |

### Current Usage

- **Event Types** (`src/lib/actions/event-types.ts`) - Generate slugs for dynamic event types
- **Custom Lists** (`src/lib/actions/custom-lists.ts`) - Generate slugs for custom list URLs
- **Event Type Form** (`src/app/(main)/settings/event-types/event-type-form-dialog.tsx`) - Auto-generate slug from name input

### Related

- For filename generation (different rules), see [FILENAME_FORMATTERS.md](./FILENAME_FORMATTERS.md)

---

## capitalizeFirstLetter

Capitalize the first letter of a string while leaving the rest unchanged.

### Signature

```typescript
function capitalizeFirstLetter(str: string): string
```

### Parameters

| Parameter | Type | Description |
|-----------|------|-------------|
| `str` | `string` | The string to capitalize |

### Returns

The input string with the first character converted to uppercase.

### Examples

```typescript
import { capitalizeFirstLetter } from '@/lib/utils/formatters'

capitalizeFirstLetter('person')     // "Person"
capitalizeFirstLetter('mass role')  // "Mass role"
capitalizeFirstLetter('')           // ""
capitalizeFirstLetter('UPPERCASE')  // "UPPERCASE" (only first letter affected)
```

### Use Cases

| Use Case | Example |
|----------|---------|
| Display labels | "wedding" → "Wedding" |
| Entity type display | "person" → "Person" |
| Dynamic text | Capitalize user-provided text |

---

## Best Practices

### When to Use generateSlug

**Use for:**
- Creating URL paths from names
- Generating database slugs for entities with human-readable URLs
- Creating consistent identifiers from variable text

**Do NOT use for:**
- Filenames (use [filename formatters](./FILENAME_FORMATTERS.md) instead)
- Display text (slugs are for URLs, not user display)
- IDs that need to be globally unique (slugs may collide)

### Slug Uniqueness

The `generateSlug` function does NOT guarantee uniqueness. When storing slugs in the database:

```typescript
// In server actions, check for uniqueness and append counter if needed
const baseSlug = generateSlug(data.name)
let slug = baseSlug
let counter = 1

while (await slugExists(slug, parishId)) {
  slug = `${baseSlug}-${counter}`
  counter++
}
```

See the custom-lists and event-types server actions for complete uniqueness handling examples.

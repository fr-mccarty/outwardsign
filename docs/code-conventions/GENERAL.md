# General Code Conventions

This document covers general coding standards including code style, TypeScript usage, import patterns, and component types.

---

## Table of Contents

- [Code Style](#code-style)
- [🔴 No Inline/Bespoke Functions (CRITICAL)](#-no-inlinebespoke-functions-critical)
- [Import Order](#import-order)
- [TypeScript](#typescript)
- [🔴 Data Model Interfaces vs. Filter Interfaces](#-data-model-interfaces-vs-filter-interfaces)
- [Server vs Client Components](#server-vs-client-components)
- [Project Organization](#project-organization)
- [File Naming](#file-naming)
- [Spelling and Typos](#spelling-and-typos)

---

## Code Style

- **Indentation:** 2 spaces (no tabs)
- **Language:** TypeScript for all new files
- **Component type:** Server Components by default, Client Components only when needed ('use client')
- **Quotes:** Single quotes for strings unless JSON requires double quotes
- **Semicolons:** Use semicolons at the end of statements
- **Trailing commas:** Use trailing commas in multi-line objects and arrays

---

## 🔴 No Inline/Bespoke Functions (CRITICAL)

**NEVER create inline or bespoke utility functions within components, actions, or other files.**

All utility functions MUST be:
1. Defined in `/src/lib/utils/formatters.ts` (for formatting functions)
2. Defined in `/src/lib/utils/*.ts` (for other utility functions)
3. Imported at the top of the file where they're used

### Examples

**❌ BAD - Inline function creation:**
```typescript
// DON'T DO THIS
function MyComponent({ entityName }) {
  const capitalize = (str: string) => str.charAt(0).toUpperCase() + str.slice(1)
  return <div>{capitalize(entityName)}</div>
}
```

**✅ GOOD - Use existing helper:**
```typescript
// DO THIS
import { capitalizeFirstLetter } from '@/lib/utils/formatters'

function MyComponent({ entityName }) {
  return <div>{capitalizeFirstLetter(entityName)}</div>
}
```

### Why This Matters

- **Reusability:** Functions can be used across the entire application
- **Consistency:** Same behavior everywhere, easier to test
- **Performance:** No function recreation on each render
- **Maintainability:** Single source of truth for utility logic
- **Discoverability:** Developers know where to find utility functions

### When You Need a New Utility Function

1. Check if it already exists in `formatters.ts` or other utility files
2. If not, add it to the appropriate utility file
3. Document it with JSDoc comments and examples
4. Import and use it

---

## Import Order

**Import order is completely flexible** - arrange imports however you prefer. There are no enforced ordering rules in this codebase.

Import statements can be organized in any way that makes sense to you:

```typescript
// ✅ All of these are acceptable - choose what works for you

// Option 1: Group by type (external, internal, components)
import { useState } from 'react'
import Link from 'next/link'
import { getWeddings } from '@/lib/actions/weddings'
import { formatDate } from '@/lib/utils/formatters'
import { Button } from '@/components/ui/button'
import { WeddingCard } from './wedding-card'

// Option 2: Alphabetical
import { Button } from '@/components/ui/button'
import { formatDate } from '@/lib/utils/formatters'
import { getWeddings } from '@/lib/actions/weddings'
import Link from 'next/link'
import { useState } from 'react'
import { WeddingCard } from './wedding-card'

// Option 3: By usage/importance
import { getWeddings } from '@/lib/actions/weddings'
import { WeddingCard } from './wedding-card'
import { formatDate } from '@/lib/utils/formatters'
import { Button } from '@/components/ui/button'
import { useState } from 'react'
import Link from 'next/link'

// All are valid - use whatever makes the most sense for the file
```

---

## TypeScript

```typescript
// ✅ GOOD - Proper TypeScript usage
interface Wedding {
  id: string
  bride_id: string | null
  groom_id: string | null
  status: WeddingStatus
}

// Use type inference when possible
const weddings = await getWeddings()  // Type inferred

// Explicit types for function parameters and returns
export async function getWedding(id: string): Promise<Wedding | null> {
  // ...
}

// ❌ BAD - Avoid 'any' type
const data: any = await fetchData()  // Don't do this!
```

### Best Practices

- Use type inference when the type is obvious
- Provide explicit types for function parameters and return values
- Avoid `any` type - use `unknown` if you must, and narrow the type
- Use interfaces for object shapes
- Use type aliases for unions and complex types

---

## 🔴 Data Model Interfaces vs. Filter Interfaces

**CRITICAL: Database model interfaces must use strict types, never `| 'all'`**

Interfaces representing actual database records should use strict enumerated types without the `'all'` option. The `'all'` option is ONLY for UI filter states, never for database records.

### Examples

```typescript
// ✅ CORRECT - Data model interface (represents actual database record)
interface MassIntention {
  id: string
  status: MassIntentionStatus        // Strict type, no | 'all'
  type: MassIntentionType            // Strict type, no | 'all'
  mass_offered_for: string
  // ... other fields
}

// ✅ CORRECT - Filter interface (represents UI filter state)
interface MassIntentionFilters {
  status?: MassIntentionStatus | 'all'  // Can include 'all' for "show all" option
  type?: MassIntentionType | 'all'      // Can include 'all' for "show all" option
  search?: string
}

// ❌ WRONG - Data model with 'all' option
interface MassIntention {
  status: MassIntentionStatus | 'all'   // NEVER do this!
  // A database record cannot have status 'all'
}
```

### Why This Matters

- **Data integrity:** Database records must have valid status/type values, never 'all'
- **Type safety:** TypeScript will catch attempts to save invalid values to the database
- **Clear separation:** Data models vs. UI state are different concerns

### Where to Use `| 'all'`

- ✅ Filter state interfaces
- ✅ Dropdown component props for filtering
- ✅ Search/filter form values

### Where NOT to Use `| 'all'`

- ❌ Database model interfaces (entities from `src/lib/types.ts`)
- ❌ Server action parameters that save to database
- ❌ Database schema types

---

## Server vs Client Components

```typescript
// ✅ Server Component (default) - no 'use client'
export default async function WeddingsPage() {
  const weddings = await getWeddings()  // Can use async/await
  return <WeddingsListClient initialData={weddings} />
}

// ✅ Client Component - needs 'use client'
'use client'
import { useState } from 'react'

export function WeddingForm() {
  const [name, setName] = useState('')  // Uses React hooks
  // ...
}
```

### When to Use Client Components

- React hooks (useState, useEffect, etc.)
- Event handlers (onClick, onChange, etc.)
- Browser APIs (localStorage, window, etc.)
- Third-party libraries that require client-side rendering

### When to Use Server Components

- Data fetching
- Direct database access
- Reading environment variables
- Heavy computations
- Anything that doesn't need interactivity

---

## Project Organization

### Directory Structure

**Task storage:**
- Use the `/tasks` directory to store task files and documentation
- **DO NOT use a `/todos` directory** - agents commonly misunderstand the spelling (todos vs to-dos)
- **Naming convention:** All task-related files should be stored in `/tasks/[task-name].md`

**Why:** Consistent spelling and directory naming prevents confusion and makes task management more reliable.

---

## File Naming

### Components

```
kebab-case for files
PascalCase for component names

wedding-form.tsx       → export function WeddingForm()
people-picker.tsx      → export function PeoplePicker()
```

### Server Actions

```
lib/actions/weddings.ts    → Wedding module actions
lib/actions/people.ts      → Person actions
```

### Types

```
Defined in Server Action files, exported for reuse

// lib/actions/weddings.ts
export interface Wedding { }
export interface WeddingWithRelations extends Wedding { }
```

---

## Spelling and Typos

### Proactive Corrections

**ALWAYS suggest spelling corrections** when you notice:
- Typos in code comments
- Misspellings in documentation
- Grammatical errors in user-facing text
- Incorrect variable names

### Scope

- Code comments and docstrings
- User-facing strings and messages
- Documentation files (README, CLAUDE.md, docs/, etc.)
- Identifiers (where appropriate and safe to rename)

**Why:** The user wants to maintain high-quality, professional text throughout the codebase.

### Examples

```typescript
// ❌ BAD
// Retrive the wedding from databse
const weding = await getWedding(id)

// ✅ GOOD
// Retrieve the wedding from database
const wedding = await getWedding(id)
```

---

## Related Documentation

- [BILINGUAL.md](./BILINGUAL.md) - Bilingual implementation patterns
- [UI_PATTERNS.md](./UI_PATTERNS.md) - UI component patterns
- [FORMATTING.md](./FORMATTING.md) - Helper utilities and formatting
- [DEVELOPMENT.md](./DEVELOPMENT.md) - Development guidelines and abstraction principles
- [FORMATTERS.md](../FORMATTERS.md) - Complete helper function reference

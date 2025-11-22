# Code Conventions

This document provides comprehensive coding standards and conventions for Outward Sign. Following these conventions ensures consistency, maintainability, and quality across the codebase.

---

## Table of Contents

- [General Conventions](#general-conventions)
  - [Code Style](#code-style)
  - [🔴 No Inline/Bespoke Functions (CRITICAL)](#-no-inlinebespoke-functions-critical)
  - [Import Order](#import-order)
  - [TypeScript](#typescript)
  - [🔴 Data Model Interfaces vs. Filter Interfaces](#-data-model-interfaces-vs-filter-interfaces)
  - [Server vs Client Components](#server-vs-client-components)
- [Project Organization](#project-organization)
- [Spelling and Typos](#spelling-and-typos)
- [🔴 Bilingual Implementation (English & Spanish)](#-bilingual-implementation-english--spanish)
- [UI Patterns](#ui-patterns)
  - [Dialog and Modal Standards](#dialog-and-modal-standards)
  - [🔴 DialogButton Component](#-dialogbutton-component-critical)
  - [Empty States](#empty-states)
  - [Tables](#tables)
  - [Scrollable Modals](#scrollable-modals)
- [🔴 Page Title Formatting](#-page-title-formatting)
- [Development Guidelines](#development-guidelines)
- [Abstraction Principle (Rule of Three)](#abstraction-principle-rule-of-three)
- [🔴 Helper Utilities Pattern](#-helper-utilities-pattern)

---

## General Conventions

### Code Style

- **Indentation:** 2 spaces (no tabs)
- **Language:** TypeScript for all new files
- **Component type:** Server Components by default, Client Components only when needed ('use client')
- **Quotes:** Single quotes for strings unless JSON requires double quotes
- **Semicolons:** Use semicolons at the end of statements
- **Trailing commas:** Use trailing commas in multi-line objects and arrays

### 🔴 No Inline/Bespoke Functions (CRITICAL)

**NEVER create inline or bespoke utility functions within components, actions, or other files.**

All utility functions MUST be:
1. Defined in `/src/lib/utils/formatters.ts` (for formatting functions)
2. Defined in `/src/lib/utils/*.ts` (for other utility functions)
3. Imported at the top of the file where they're used

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

**Why this matters:**
- **Reusability:** Functions can be used across the entire application
- **Consistency:** Same behavior everywhere, easier to test
- **Performance:** No function recreation on each render
- **Maintainability:** Single source of truth for utility logic
- **Discoverability:** Developers know where to find utility functions

**When you need a new utility function:**
1. Check if it already exists in `formatters.ts` or other utility files
2. If not, add it to the appropriate utility file
3. Document it with JSDoc comments and examples
4. Import and use it

### Import Order

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

### TypeScript

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

### 🔴 Data Model Interfaces vs. Filter Interfaces

**CRITICAL: Database model interfaces must use strict types, never `| 'all'`**

Interfaces representing actual database records should use strict enumerated types without the `'all'` option. The `'all'` option is ONLY for UI filter states, never for database records.

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

**Why this matters:**
- **Data integrity:** Database records must have valid status/type values, never 'all'
- **Type safety:** TypeScript will catch attempts to save invalid values to the database
- **Clear separation:** Data models vs. UI state are different concerns

**Where to use `| 'all'`:**
- ✅ Filter state interfaces
- ✅ Dropdown component props for filtering
- ✅ Search/filter form values

**Where NOT to use `| 'all'`:**
- ❌ Database model interfaces (entities from `src/lib/types.ts`)
- ❌ Server action parameters that save to database
- ❌ Database schema types

### Server vs Client Components

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

**When to use Client Components:**
- React hooks (useState, useEffect, etc.)
- Event handlers (onClick, onChange, etc.)
- Browser APIs (localStorage, window, etc.)
- Third-party libraries that require client-side rendering

**When to use Server Components:**
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

### File Naming

**Components:**
```
kebab-case for files
PascalCase for component names

wedding-form.tsx       → export function WeddingForm()
people-picker.tsx      → export function PeoplePicker()
```

**Server Actions:**
```
lib/actions/weddings.ts    → Wedding module actions
lib/actions/people.ts      → Person actions
```

**Types:**
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

**Scope:**
- Code comments and docstrings
- User-facing strings and messages
- Documentation files (README, CLAUDE.md, docs/, etc.)
- Identifiers (where appropriate and safe to rename)

**Why:** The user wants to maintain high-quality, professional text throughout the codebase.

**Examples:**

```typescript
// ❌ BAD
// Retrive the wedding from databse
const weding = await getWedding(id)

// ✅ GOOD
// Retrieve the wedding from database
const wedding = await getWedding(id)
```

---

## 🔴 Bilingual Implementation (English & Spanish)

**CRITICAL:** Most content in the application is bilingual (English and Spanish). Always check the language implementation of each change.

### Homepage

All text must be in both English and Spanish in the translations object:

```typescript
// src/app/page.tsx
const translations = {
  en: {
    title: 'Sacrament Management for Catholic Parishes',
    subtitle: 'Plan, communicate, and celebrate with beauty',
    getStarted: 'Get Started',
    // ... more translations
  },
  es: {
    title: 'Gestión de Sacramentos para Parroquias Católicas',
    subtitle: 'Planificar, comunicar y celebrar con belleza',
    getStarted: 'Comenzar',
    // ... more translations
  }
}

// Usage
<h1>{translations[language].title}</h1>
```

### User-Facing Content

Forms, labels, messages, and UI text should support both languages where applicable:

```typescript
// ✅ GOOD - Bilingual labels
const buttonText = {
  en: 'Save Changes',
  es: 'Guardar Cambios'
}

// Form labels with bilingual support
<Label>{language === 'en' ? 'Bride Name' : 'Nombre de la Novia'}</Label>
```

### Constants Pattern

All constants include bilingual labels:

```typescript
// lib/constants.ts
export const WEDDING_STATUS_VALUES = ['PLANNING', 'CONFIRMED', 'COMPLETED'] as const
export type WeddingStatus = typeof WEDDING_STATUS_VALUES[number]

export const WEDDING_STATUS_LABELS: Record<WeddingStatus, { en: string; es: string }> = {
  PLANNING: { en: 'Planning', es: 'Planificación' },
  CONFIRMED: { en: 'Confirmed', es: 'Confirmado' },
  COMPLETED: { en: 'Completed', es: 'Completado' }
}

// Usage
<p>{WEDDING_STATUS_LABELS[wedding.status].en}</p>  // Currently hard-coded to .en
```

### 🔴 TEMPORARY: Hard-Coded English in Constants

**Current state:**
- All constant label usage (status labels, event type labels, etc.) currently hard-codes `.en` throughout the application
- Example: `MODULE_STATUS_LABELS[status].en` instead of dynamic language selection

**Why:**
- Temporary approach while full language selector system is being implemented
- Infrastructure exists: All labels have both `.en` and `.es` properties ready for use

**Coming soon:**
- See [ROADMAP.md](./ROADMAP.md) Phase I - Multilingual Support for planned language selector implementation
- See [CONSTANTS_PATTERN.md](./CONSTANTS_PATTERN.md) for detailed documentation

### Verification Checklist

After making changes to user-facing text:
- [ ] Both English and Spanish translations are complete
- [ ] Translations are accurate and natural (not literal)
- [ ] Both languages tested in UI (if applicable)
- [ ] Constants follow the bilingual pattern
- [ ] No hard-coded English text in user-facing components

**When in doubt:** Check existing bilingual implementations (homepage, constants file) for the correct pattern.

---

## UI Patterns

### Dialog and Modal Standards

**Use shadcn components, not system dialogs:**
```typescript
// ❌ BAD - system dialog
alert('Wedding saved!')
const confirmed = confirm('Delete this wedding?')

// ✅ GOOD - shadcn components
import { toast } from 'sonner'
toast.success('Wedding saved!')

// Use Dialog component for confirmations
<AlertDialog>
  <AlertDialogContent>
    <AlertDialogHeader>
      <AlertDialogTitle>Delete Wedding?</AlertDialogTitle>
      <AlertDialogDescription>
        This action cannot be undone.
      </AlertDialogDescription>
    </AlertDialogHeader>
    <AlertDialogFooter>
      <AlertDialogCancel>Cancel</AlertDialogCancel>
      <AlertDialogAction onClick={handleDelete}>Delete</AlertDialogAction>
    </AlertDialogFooter>
  </AlertDialogContent>
</AlertDialog>
```

**🔴 DialogButton Component (CRITICAL):**

When creating buttons that trigger dialogs, **ALWAYS use the `DialogButton` component** instead of manually wrapping Button with DialogTrigger. This component automatically handles cursor styling and ensures consistent behavior.

```typescript
// ❌ BAD - Manual DialogTrigger wrapping
<Dialog open={isOpen} onOpenChange={setIsOpen}>
  <DialogTrigger asChild>
    <Button>
      <Plus className="h-4 w-4 mr-2" />
      Create New
    </Button>
  </DialogTrigger>
  {/* ... */}
</Dialog>

// ✅ GOOD - Use DialogButton component
import { DialogButton } from '@/components/dialog-button'

<Dialog open={isOpen} onOpenChange={setIsOpen}>
  <DialogButton>
    <Plus className="h-4 w-4 mr-2" />
    Create New
  </DialogButton>
  {/* ... */}
</Dialog>

// ✅ GOOD - DialogButton accepts all Button props
<Dialog open={isOpen} onOpenChange={setIsOpen}>
  <DialogButton variant="destructive" className="w-full">
    <Trash2 className="h-4 w-4 mr-2" />
    Delete
  </DialogButton>
  {/* ... */}
</Dialog>
```

**Why use DialogButton:**
- Automatically applies `cursor-pointer` to prevent CSS specificity issues
- Handles Radix UI's `asChild` prop merging correctly
- Reduces boilerplate and ensures consistency
- Accepts all standard Button props (variant, size, className, onClick, etc.)

**When `DialogTrigger` uses `asChild`**, Radix UI merges props with the child component through polymorphism. This can cause CSS specificity issues that override the browser's default button cursor, resulting in inconsistent hover states. The DialogButton component solves this automatically.

### Empty States

**Always provide a button to create new records:**

```typescript
// ✅ GOOD - Empty state with action button
{weddings.length === 0 ? (
  <div className="text-center py-12">
    <Heart className="mx-auto h-12 w-12 text-muted-foreground" />
    <h3 className="mt-4 text-lg font-semibold">No weddings yet</h3>
    <p className="mt-2 text-sm text-muted-foreground">
      Get started by creating your first wedding.
    </p>
    <Button asChild className="mt-6">
      <Link href="/weddings/create">
        <Plus className="mr-2 h-4 w-4" />
        Create Wedding
      </Link>
    </Button>
  </div>
) : (
  // Show weddings list
)}
```

**Use the same icon as in the main sidebar** for consistency.

### Tables

**Standards:**
- Content should always be fetched server-side
- Pagination should always be available
- Use shadcn components (Table, TableHeader, TableBody, etc.)

```typescript
// Server page
export default async function WeddingsPage({ searchParams }: PageProps) {
  const params = await searchParams
  const page = parseInt(params.page || '1')
  const perPage = 20

  const { weddings, total } = await getWeddings({ page, perPage })

  return <WeddingsTable weddings={weddings} total={total} currentPage={page} />
}
```

### Scrollable Modals

**When creating modals with content that may overflow:**

```typescript
// ✅ GOOD - Scrollable modal pattern
<DialogContent className="flex flex-col max-h-[90vh]">
  <DialogHeader className="flex-shrink-0">
    <DialogTitle>Select a Person</DialogTitle>
    <DialogDescription>Choose from existing people or create new</DialogDescription>
  </DialogHeader>

  {/* Scrollable content area */}
  <div className="overflow-y-auto flex-1">
    {/* Long list of people */}
  </div>

  <DialogFooter className="flex-shrink-0">
    <Button onClick={handleClose}>Close</Button>
  </DialogFooter>
</DialogContent>
```

**Structure:**
- `DialogContent` with `flex flex-col` and `max-h-[90vh]`
- `DialogHeader` with `flex-shrink-0` (fixed header)
- Content wrapper with `overflow-y-auto flex-1` (scrollable)
- `DialogFooter` with `flex-shrink-0` (fixed footer)

**Reference implementation:** `src/components/calendar/day-events-modal.tsx`

### Language Selector Placement

Ordinarily, the language selector should be positioned in the **upper right-hand corner** of the interface.

### 🔴 Click Hierarchy (CRITICAL)

**NEVER nest clickable elements inside other clickable elements.**

This causes:
- User confusion (which element will be clicked?)
- Accessibility problems (screen readers can't determine intent)
- Unpredictable behavior (event bubbling issues)

**Examples of violations:**

```typescript
// ❌ BAD - Button inside clickable card
<Card onClick={handleCardClick} className="cursor-pointer">
  <CardContent>
    <h3>Wedding Title</h3>
    <Button onClick={handleEdit}>Edit</Button>  // Nested clickable!
  </CardContent>
</Card>

// ❌ BAD - Link inside button
<Button>
  <Link href="/weddings">View Weddings</Link>  // Nested clickable!
</Button>
```

**Solution patterns:**

```typescript
// ✅ GOOD - Separate clickable areas
<Card>
  <CardContent>
    <div onClick={handleCardClick} className="cursor-pointer">
      <h3>Wedding Title</h3>
    </div>
    <Button onClick={handleEdit}>Edit</Button>  // Separate clickable area
  </CardContent>
</Card>

// ✅ GOOD - Use Link with button styling instead
<Link href="/weddings">
  <Button asChild>
    <span>View Weddings</span>
  </Button>
</Link>

// ✅ GOOD - Stop propagation if absolutely necessary
<Card onClick={handleCardClick} className="cursor-pointer">
  <CardContent>
    <h3>Wedding Title</h3>
    <Button onClick={(e) => {
      e.stopPropagation()  // Prevents card click
      handleEdit()
    }}>
      Edit
    </Button>
  </CardContent>
</Card>
```

**See [DESIGN_PRINCIPLES.md](./DESIGN_PRINCIPLES.md) Click Hierarchy section for more solution patterns.**

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

### Helper Functions

**Use helper functions from `formatters.ts`:**

```typescript
import { getWeddingPageTitle, getFuneralPageTitle } from '@/lib/utils/formatters'

// Instead of manual title construction
const title = getWeddingPageTitle(wedding)
const title = getFuneralPageTitle(funeral)
```

**See [FORMATTERS.md](./FORMATTERS.md) for complete helper function reference.**

---

## Development Guidelines

### Component Usage Hierarchy

1. **Always use custom components first** before falling back to shadcn/ui components
   - Example: Use `<SaveButton>` instead of creating a new styled Button for forms

2. **Always use shadcn/ui components** before creating something completely new
   - Example: Use `<Dialog>` instead of building a custom modal from scratch

3. **Ask before creating new components**
   - Prevents duplication
   - Maintains consistency
   - Ensures new components are truly reusable

### TypeScript Patterns

**Follow established patterns:**

```typescript
// ✅ GOOD - Consistent with codebase
export interface Wedding {
  id: string
  bride_id: string | null
  groom_id: string | null
  status: WeddingStatus
  created_at: string
  updated_at: string
}

// Server action with proper types
export async function getWedding(id: string): Promise<Wedding | null> {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('weddings')
    .select('*')
    .eq('id', id)
    .single()

  if (error) return null
  return data
}
```

### Responsive Design

**Mobile-first approach with Tailwind:**

```typescript
// ✅ GOOD - Mobile first, then larger screens
<div className="flex flex-col md:flex-row gap-4 md:gap-6">
  <div className="w-full md:w-1/2">
    {/* Content */}
  </div>
</div>

// Default styles apply to mobile, then override for larger screens
className="text-sm md:text-base lg:text-lg"
```

### Supabase Auth Integration

**All user-facing features should respect authentication:**

```typescript
// Server component
export default async function Page() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  // Continue with authenticated logic
}

// Server action
export async function createWedding(data: CreateWeddingData) {
  const selectedParishId = await requireSelectedParish()
  await ensureJWTClaims()  // Ensures auth token is valid

  // Database operations
}
```

### Consistent Design Patterns

**Follow the existing component library:**

- Use `<PageContainer>` for all main pages
- Use `<FormField>` for all form inputs
- Use `<SaveButton>` and `<CancelButton>` for forms
- Use picker components (`PeoplePicker`, `EventPicker`, etc.)
- Follow the 9-file module pattern for new modules

**See [COMPONENT_REGISTRY.md](./COMPONENT_REGISTRY.md) for complete component documentation.**

---

## Abstraction Principle (Rule of Three)

### When to Abstract Code

**Wait for three uses** - Don't create abstractions (helper functions, components, utilities) until a pattern appears at least three times.

**Abstract at three uses** - Once something is used three times, it SHOULD be abstracted into a reusable component, function, or utility.

### Why This Matters

1. **Premature abstraction creates unnecessary complexity**
   - First use: Solve the problem directly
   - Second use: Notice the pattern, but still copy-paste
   - Third use: Now you understand the pattern → abstract it

2. **Waiting reveals the actual pattern and variation points**
   - First two uses might seem similar but have subtle differences
   - Third use clarifies what should be configurable

3. **Three instances provide enough data to design a good abstraction**
   - You can see what varies and what stays the same
   - You understand edge cases better

4. **Prevents "one-off" abstractions that only serve a single use case**
   - Abstractions should be truly reusable
   - Not just moving code to a different file

### Examples

**Components:**
```typescript
// First use: Inline in WeddingForm
<div className="flex gap-2">
  <Button type="submit">Save</Button>
  <Button variant="outline" onClick={() => router.back()}>Cancel</Button>
</div>

// Second use: Copy-paste to FuneralForm (notice the pattern)
<div className="flex gap-2">
  <Button type="submit">Save</Button>
  <Button variant="outline" onClick={() => router.back()}>Cancel</Button>
</div>

// Third use: Time to abstract! Create SaveButton and CancelButton components
import { SaveButton, CancelButton } from '@/components/forms/form-buttons'
<div className="flex gap-2">
  <SaveButton />
  <CancelButton />
</div>
```

**Utilities:**
```typescript
// First use: Format date inline
const formattedDate = new Date(wedding.date).toLocaleDateString('en-US', {
  year: 'numeric',
  month: 'long',
  day: 'numeric'
})

// Second use: Copy-paste (pattern emerging)
const formattedDate = new Date(funeral.date).toLocaleDateString('en-US', {
  year: 'numeric',
  month: 'long',
  day: 'numeric'
})

// Third use: Abstract to utility!
// lib/utils/date-format.ts
export function formatDateLong(date: string | Date): string {
  return new Date(date).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  })
}

// Usage
const formattedDate = formatDateLong(wedding.date)
```

**Hooks:**
```typescript
// After three components manage picker state the same way → create usePickerState
export function usePickerState() {
  const [isOpen, setIsOpen] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')

  return {
    isOpen,
    setIsOpen,
    searchTerm,
    setSearchTerm,
    openPicker: () => setIsOpen(true),
    closePicker: () => {
      setIsOpen(false)
      setSearchTerm('')
    }
  }
}
```

**Server Actions:**
```typescript
// After three modules have identical CRUD patterns → create generic helper
// (Though we typically keep server actions module-specific for clarity)
```

### Exception

**Copy-paste is acceptable for 1-2 uses.**

At 3 uses, refactor to remove duplication.

This is a guideline, not a hard rule. Use judgment:
- Very simple code might not need abstraction even at 3+ uses
- Very complex patterns might benefit from abstraction at 2 uses
- Mission-critical code might warrant earlier abstraction

---

## 🔴 Helper Utilities Pattern

**For comprehensive helper function documentation, see [FORMATTERS.md](./FORMATTERS.md).**

### Overview

**Location:**
- `src/lib/utils/formatters.ts` - Person, location, page title, filename formatters
- `src/lib/utils/date-format.ts` - Date and time formatting functions

**STRONGLY PREFER using helper functions** for all formatting needs. These centralized utilities ensure consistency across the application.

### 🔴 Critical Rules

1. **ALWAYS use helper functions** - Never write inline formatting code

2. **🔴 ALWAYS format dates** - Never display raw date strings (e.g., "2025-07-15")
   - Use `formatDatePretty()`, `formatDateLong()`, etc. from `date-format.ts`
   - This applies to UI, view pages, forms, **content builders**, **templates**, print views, and exports

3. **Request permission before creating new helpers** - Ask user before adding new functions

4. **Check existing helpers first** - Search both `formatters.ts` and `date-format.ts`

### Available Helper Categories

**Date/Time Formatting:**
```typescript
import { formatDatePretty, formatDateLong, formatEventDateTime } from '@/lib/utils/date-format'

formatDatePretty('2025-07-15')        // "Jul 15, 2025"
formatDateLong('2025-07-15')          // "July 15, 2025"
formatEventDateTime(event)            // "July 15, 2025 at 2:00 PM"
```

**Person Formatting:**
```typescript
// Use database-generated full_name directly
person.full_name                      // "John Doe"
person?.full_name || ''               // "John Doe" (null-safe)

// Use helpers for complex formatting
import { formatPersonWithPhone } from '@/lib/utils/formatters'
formatPersonWithPhone(person)         // "John Doe (555-1234)"
```

**Location Formatting:**
```typescript
import { formatLocationWithAddress, formatLocationName } from '@/lib/utils/formatters'

formatLocationWithAddress(location)   // "St. Mary's Church, 123 Main St"
formatLocationName(location)          // "St. Mary's Church"
```

**Page Title Generators:**
```typescript
import { getWeddingPageTitle, getFuneralPageTitle } from '@/lib/utils/formatters'

getWeddingPageTitle(wedding)          // "Smith-Jones-Wedding"
getFuneralPageTitle(funeral)          // "John Doe-Funeral"
```

**Filename Generators:**
```typescript
import { getWeddingFilename, getFuneralFilename } from '@/lib/utils/formatters'

getWeddingFilename(wedding)           // "smith-jones-wedding"
getFuneralFilename(funeral)           // "john-doe-funeral"
```

### Usage Pattern

```typescript
import { getWeddingPageTitle } from '@/lib/utils/formatters'
import { formatDatePretty } from '@/lib/utils/date-format'

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

### Examples of What NOT to Do

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

### Creating New Helpers

**Before creating a new helper function:**

1. **Check existing helpers** - Search `formatters.ts` and `date-format.ts`
2. **Ask permission** - Request user approval before adding
3. **Follow Rule of Three** - Wait for 3 uses before abstracting
4. **Document it** - Add to [FORMATTERS.md](./FORMATTERS.md)

**See [FORMATTERS.md](./FORMATTERS.md) for:**
- Complete function reference with examples
- Guidelines for creating new helpers
- When NOT to use formatters

---

## Summary

Following these conventions ensures:
- **Consistency** across the entire codebase
- **Quality** through proactive corrections and bilingual support
- **Maintainability** via the Rule of Three and helper utilities
- **Accessibility** through proper UI patterns and click hierarchy
- **User experience** with proper page titles and formatting

For related documentation, see:
- [ARCHITECTURE.md](./ARCHITECTURE.md) - Data architecture and flow patterns
- [FORMATTERS.md](./FORMATTERS.md) - Complete helper function reference
- [DESIGN_PRINCIPLES.md](./DESIGN_PRINCIPLES.md) - UI/UX design principles
- [FORMS.md](./FORMS.md) - Form patterns and validation

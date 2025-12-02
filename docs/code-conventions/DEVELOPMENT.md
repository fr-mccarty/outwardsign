# Development Guidelines

This document covers development patterns including component usage, TypeScript patterns, responsive design, authentication integration, and the abstraction principle.

---

## Table of Contents

- [Component Usage Hierarchy](#component-usage-hierarchy)
- [TypeScript Patterns](#typescript-patterns)
- [Responsive Design](#responsive-design)
- [Supabase Auth Integration](#supabase-auth-integration)
- [Consistent Design Patterns](#consistent-design-patterns)
- [Abstraction Principle (Rule of Three)](#abstraction-principle-rule-of-three)

---

## Component Usage Hierarchy

### Order of Preference

1. **Always use custom components first** before falling back to shadcn/ui components
   - Example: Use `<SaveButton>` instead of creating a new styled Button for forms

2. **Always use shadcn/ui components** before creating something completely new
   - Example: Use `<Dialog>` instead of building a custom modal from scratch

3. **Ask before creating new components**
   - Prevents duplication
   - Maintains consistency
   - Ensures new components are truly reusable

### Why This Matters

- Reduces code duplication
- Maintains consistent styling and behavior
- Makes codebase easier to navigate and understand
- Ensures components are well-tested and accessible

**See [COMPONENT_REGISTRY.md](../COMPONENT_REGISTRY.md) for complete component documentation.**

---

## TypeScript Patterns

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

### Best Practices

- Use interface for object shapes
- Use type alias for unions and complex types
- Export interfaces from server action files
- Include proper null handling
- Return typed promises from async functions
- Use strict type checking (no `any`)

### Example: WithRelations Pattern

```typescript
// Base interface
export interface Wedding {
  id: string
  bride_id: string | null
  groom_id: string | null
  status: WeddingStatus
}

// Extended interface with relations
export interface WeddingWithRelations extends Wedding {
  bride: Person | null
  groom: Person | null
  wedding_event: Event
}

// Server action with relations
export async function getWeddingWithRelations(
  id: string
): Promise<WeddingWithRelations | null> {
  // ... fetch with joins
}
```

**See [ARCHITECTURE.md](../ARCHITECTURE.md) for complete WithRelations pattern documentation.**

---

## Responsive Design

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

### Breakpoints

- `sm:` - 640px and up
- `md:` - 768px and up
- `lg:` - 1024px and up
- `xl:` - 1280px and up
- `2xl:` - 1536px and up

### Best Practices

- Start with mobile styles (no prefix)
- Add larger screen styles with breakpoint prefixes
- Test on multiple screen sizes
- Use responsive utilities for layout, typography, and spacing
- Consider touch targets on mobile (buttons should be large enough)

### Example

```typescript
// Mobile: Stack vertically, full width buttons
// Tablet+: Two columns, normal buttons
<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
  <Button className="w-full md:w-auto">Action 1</Button>
  <Button className="w-full md:w-auto">Action 2</Button>
</div>
```

---

## Supabase Auth Integration

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

### Authentication Patterns

**Server pages:**
1. Create Supabase client
2. Get user
3. Redirect if not authenticated
4. Continue with page logic

**Server actions:**
1. Require selected parish
2. Ensure JWT claims are valid
3. Perform database operations with RLS

### Best Practices

- Always check authentication in server components
- Use RLS policies to enforce permissions
- Never trust client-side authentication checks
- Include parish scope in all queries
- Use `requireSelectedParish()` in server actions

**See [ARCHITECTURE.md](../ARCHITECTURE.md) for complete authentication documentation.**

---

## Consistent Design Patterns

**Follow the existing component library:**

- Use `<PageContainer>` for all main pages
- Use `<FormField>` for all form inputs
- Use `<SaveButton>` and `<CancelButton>` for forms
- Use picker components (`PeoplePicker`, `EventPicker`, etc.)
- Follow the 8-file module pattern for new modules

### Example: Form Pattern

```typescript
import { FormField } from '@/components/form-field'
import { SaveButton, CancelButton } from '@/components/forms/form-buttons'

export function WeddingForm() {
  return (
    <form onSubmit={handleSubmit}>
      <FormField
        control={form.control}
        name="status"
        label="Status"
        render={({ field }) => (
          <Select {...field}>
            {/* options */}
          </Select>
        )}
      />

      <div className="flex gap-2">
        <SaveButton />
        <CancelButton />
      </div>
    </form>
  )
}
```

**See [COMPONENT_REGISTRY.md](../COMPONENT_REGISTRY.md) for complete component documentation.**

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

### Anti-Patterns to Avoid

```typescript
// ❌ BAD - Premature abstraction (only used once)
function ButtonWithIconAndText({ icon, text, onClick }) {
  return (
    <Button onClick={onClick}>
      {icon} {text}
    </Button>
  )
}

// ✅ GOOD - Wait until it's used 3 times, then abstract if still beneficial
<Button onClick={handleClick}>
  <Plus className="mr-2 h-4 w-4" />
  Create New
</Button>
```

### When to Break the Rule

You can abstract earlier than 3 uses if:
- The pattern is extremely complex
- The abstraction is obvious and well-understood
- The use case is mission-critical and needs centralized logic
- The pattern matches existing abstractions in the codebase

**When in doubt, wait for the third use.**

---

## Related Documentation

- [GENERAL.md](./GENERAL.md) - General code conventions
- [UI_PATTERNS.md](./UI_PATTERNS.md) - UI component patterns
- [FORMATTING.md](./FORMATTING.md) - Helper utilities and formatting
- [ARCHITECTURE.md](../ARCHITECTURE.md) - Data architecture and authentication
- [COMPONENT_REGISTRY.md](../COMPONENT_REGISTRY.md) - Complete component library reference

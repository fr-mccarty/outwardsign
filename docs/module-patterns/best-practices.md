# Module Patterns: Best Practices & Troubleshooting

> **Part of:** [Module Component Patterns](../MODULE_COMPONENT_PATTERNS.md)
>
> This document covers common patterns, best practices, error handling, and troubleshooting tips for module development.

> **Architecture Note:** Outward Sign uses a **unified Event Types system**. Sacraments are Event Types, not separate modules. Code examples may use older patterns for illustration. **Reference Implementation:** Masses module (`src/app/(main)/masses/`).

## Table of Contents

- [File Location Summary](#file-location-summary)
- [Common Patterns](#common-patterns)
  - [Server vs Client Components](#server-vs-client-components)
  - [Type Safety](#type-safety)
  - [Error Handling](#error-handling)
  - [Redirection Pattern](#redirection-pattern)
- [Best Practices](#best-practices)
  - [Authentication](#authentication)
  - [Data Fetching](#data-fetching)
  - [Form State Management](#form-state-management)
  - [Loading States](#loading-states)
- [Troubleshooting](#troubleshooting)
  - [searchParams is undefined](#searchparams-is-undefined)
  - [Entity not found](#entity-not-found)
  - [Form not submitting](#form-not-submitting)
  - [Loading state not syncing](#loading-state-not-syncing)
  - [Breadcrumbs not updating](#breadcrumbs-not-updating)
- [Common Mistakes](#common-mistakes)
- [Related Documentation](#related-documentation)

---

## File Location Summary

Understanding the module directory structure is critical for maintaining consistency:

```
app/(main)/[entity-plural]/
├── page.tsx                              # 1. List Page (Server)
├── [entities]-list-client.tsx            # 2. List Client
├── [entity]-form-wrapper.tsx             # 5. Form Wrapper (Client)
├── [entity]-form.tsx                     # 6. Unified Form (Client)
├── create/
│   └── page.tsx                         # 3. Create Page (Server)
└── [id]/
    ├── page.tsx                         # 4. View Page (Server)
    ├── [entity]-view-client.tsx         # 7. View Client (with actions via ModuleViewContainer)
    └── edit/
        └── page.tsx                     # 5. Edit Page (Server)
```

**Naming conventions:**
- **Server pages:** Always `page.tsx` (no 'use client')
- **List client:** PLURAL name (`weddings-list-client.tsx`, not `wedding-list-client.tsx`)
- **Form wrapper:** SINGULAR name (`wedding-form-wrapper.tsx`)
- **Unified form:** SINGULAR name (`wedding-form.tsx`)
- **View client:** SINGULAR name in `[id]/` directory (`wedding-view-client.tsx`)

---

## Common Patterns

### Server vs Client Components

**Server Components (no 'use client'):**
- All `page.tsx` files
- Handle authentication
- Fetch data
- Pass serializable props to client components

**Why server components?**
- Better performance (less JavaScript sent to client)
- SEO-friendly (rendered on server)
- Direct database access
- Secure (API keys stay on server)

**Client Components ('use client'):**
- All interactive components
- Forms with state
- Action buttons
- URL state management
- Event handlers (onClick, onChange, etc.)

**Why client components?**
- React hooks (useState, useEffect, useRouter)
- User interactions
- Browser APIs
- Real-time updates

**Rule of thumb:** Start with server components. Add 'use client' only when you need:
- React hooks
- Event handlers
- Browser APIs
- State management

### Type Safety

**Always use the correct type for each component:**

**Use `[Entity]WithRelations` for:**
- Edit form props (needs related data for editing)
- View client props (displays comprehensive entity info)
- Any component that accesses nested relations

**Example:**
```tsx
interface [Entity]ViewClientProps {
  entity: [Entity]WithRelations  // ✅ Needs relations for display
}
```

**Use base `[Entity]` type for:**
- Form wrapper props (only checks if entity exists)
- Components that don't access relations
- Simple prop passing

**Example:**
```tsx
interface [Entity]FormWrapperProps {
  entity?: [Entity]  // ✅ Only needs to check existence
}
```

**Why this matters:**
- Type safety prevents runtime errors
- TypeScript catches missing fields at compile time
- IntelliSense shows available properties
- Easier refactoring

### Error Handling

**Server-side errors:**

**Not Found (404):**
```tsx
const entity = await get[Entity]WithRelations(id)
if (!entity) notFound()  // Returns Next.js 404 page
```

**Authentication:**
```tsx
const { data: { user } } = await supabase.auth.getUser()
if (!user) redirect('/login')  // Redirect to login page
```

**Client-side errors:**

**Delete confirmation:**
```tsx
const handleDeleteConfirm = async () => {
  if (!entityToDelete) return

  try {
    await delete[Entity](entityToDelete.id)
    toast.success('[Entity] deleted successfully')
    router.refresh()
  } catch (error) {
    console.error('Failed to delete [entity]:', error)
    toast.error('Failed to delete [entity]. Please try again.')
    throw error  // Re-throw for error boundary
  }
}
```

**Form submission:**
```tsx
try {
  const values = schema.parse({ field1, field2 })
  await create[Entity](values)
  toast.success('[Entity] created successfully')
  router.push(`/[entities]/${newEntity.id}/edit`)
} catch (error) {
  if (error instanceof z.ZodError) {
    toast.error(error.issues[0].message)
  } else {
    console.error('Error saving [entity]:', error)
    toast.error(`Failed to ${isEditing ? 'update' : 'create'} [entity]`)
  }
}
```

**Best practices:**
- Always log errors to console for debugging
- Show user-friendly messages with toast
- Re-throw errors for error boundaries to catch
- Handle validation errors separately from server errors

### Redirection Pattern

**After successful operations:**

**Create:**
```tsx
const newEntity = await create[Entity](values)
router.push(`/[entities]/${newEntity.id}/edit`)  // → Edit page
```
- User can continue editing
- Natural workflow: create → refine

**Update:**
```tsx
await update[Entity](entity.id, values)
router.refresh()  // → Stay on edit page, refresh data
```
- Shows updated data immediately
- No navigation confusion

**Delete:**
```tsx
await delete[Entity](entity.id)
router.push('/[entities]')  // → List page
```
- Entity no longer exists, can't stay on page
- Return to list of entities

**Cancel button:**
```tsx
<Button variant="outline" asChild>
  <Link href={isEditing ? `/[entities]/${entity.id}` : '/[entities]'}>
    Cancel
  </Link>
</Button>
```
- Edit mode: Go to view page
- Create mode: Go to list page

---

## Best Practices

### Authentication

**Always authenticate in server pages:**
```tsx
export default async function Page() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  // Rest of page logic...
}
```

**Why first?**
- No wasted computation if user not authenticated
- Immediate redirect (better UX)
- Security (no data fetched before auth check)

### Data Fetching

**Fetch data server-side when possible:**
```tsx
// ✅ Good: Server-side fetch
export default async function Page({ params }: PageProps) {
  const { id } = await params
  const entity = await get[Entity]WithRelations(id)
  return <ViewClient entity={entity} />
}

// ❌ Bad: Client-side fetch
'use client'
export default function Page() {
  const [entity, setEntity] = useState(null)
  useEffect(() => {
    fetchEntity().then(setEntity)
  }, [])
  return <ViewClient entity={entity} />
}
```

**Why server-side?**
- Better performance (no loading spinner)
- SEO-friendly (content rendered on server)
- Simpler code (no loading states)
- Secure (no exposing API keys)

### Form State Management

**Use controlled inputs with FormField:**
```tsx
const [name, setName] = useState(entity?.name || '')

<FormField
  id="name"
  label="Name"
  value={name}
  onChange={setName}
  required
/>
```

**Use Zod for validation:**
```tsx
const schema = z.object({
  name: z.string().min(1, 'Name is required')
})

const values = schema.parse({ name })
```

**Sync form state with entity props:**
```tsx
const [name, setName] = useState(entity?.name || '')

// If entity changes (e.g., router.refresh()), reset form
useEffect(() => {
  if (entity?.name) setName(entity.name)
}, [entity?.name])
```

### Loading States

**Two-way loading state sync:**

**Form wrapper:**
```tsx
const [isLoading, setIsLoading] = useState(false)

<Form
  formId={formId}
  onLoadingChange={setIsLoading}  // ← Receives loading state from form
/>

<SaveButton isLoading={isLoading} form={formId}>
  Save
</SaveButton>
```

**Form component:**
```tsx
const [isLoading, setIsLoading] = useState(false)

useEffect(() => {
  if (onLoadingChange) {
    onLoadingChange(isLoading)  // ← Sends loading state to wrapper
  }
}, [isLoading, onLoadingChange])
```

**Why this pattern?**
- SaveButton in wrapper needs loading state
- Form manages its own loading state
- useEffect keeps them in sync

---

## Troubleshooting

### searchParams is undefined

**Problem:** Accessing `searchParams` properties directly in Next.js 15 causes error.

**❌ Incorrect:**
```tsx
export default async function Page({ searchParams }: PageProps) {
  const filters = { search: searchParams.search }  // Error!
}
```

**✅ Correct:**
```tsx
export default async function Page({ searchParams }: PageProps) {
  const params = await searchParams  // Must await
  const filters = { search: params.search }
}
```

**Why?** Next.js 15 changed `searchParams` to be a Promise for better streaming support.

### Entity not found

**Problem:** Edit or view page returns 404.

**Check:**
1. Entity exists in database
2. Using correct ID in URL
3. `get[Entity]WithRelations()` returns data
4. RLS policies allow access

**Debug:**
```tsx
const entity = await get[Entity]WithRelations(id)
console.log('Entity:', entity)  // Log to see what's returned
if (!entity) notFound()
```

### Form not submitting

**Problem:** Form submit doesn't trigger handler.

**Check:**
1. Form has `id` attribute: `<form id="[entity]-form">`
2. SaveButton has matching `form` prop: `<SaveButton form="[entity]-form">`
3. Form has `onSubmit` handler
4. No JavaScript errors in console

**Debug:**
```tsx
const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault()
  console.log('Form submitted')  // Should log when form submits
  // ... rest of handler
}
```

### Loading state not syncing

**Problem:** SaveButton doesn't show loading state when form is submitting.

**Check:**
1. Form calls `onLoadingChange` in useEffect
2. Wrapper passes `onLoadingChange` to form
3. Loading state variable name matches

**Debug:**
```tsx
// In form
useEffect(() => {
  console.log('Loading changed:', isLoading)
  if (onLoadingChange) {
    onLoadingChange(isLoading)
  }
}, [isLoading, onLoadingChange])

// In wrapper
<SaveButton isLoading={isLoading}>
  {console.log('Wrapper loading:', isLoading)}
  Save
</SaveButton>
```

### Breadcrumbs not updating

**Problem:** Breadcrumbs show wrong path or don't update.

**Check:**
1. `BreadcrumbSetter` is rendered in page
2. Breadcrumbs array has correct structure
3. Current page has no `href` (only label)

**Correct:**
```tsx
const breadcrumbs = [
  { label: 'Dashboard', href: '/dashboard' },
  { label: '[Entities]', href: '/[entities]' },
  { label: 'View' }  // ✅ No href for current page
]
```

---

## Common Mistakes

**1. Forgetting to await searchParams**
```tsx
// ❌ Wrong
const filters = { search: searchParams.search }

// ✅ Right
const params = await searchParams
const filters = { search: params.search }
```

**2. Using wrong type for entity prop**
```tsx
// ❌ Wrong: Wrapper doesn't need relations
interface WrapperProps {
  entity?: WeddingWithRelations
}

// ✅ Right: Use base type
interface WrapperProps {
  entity?: Wedding
}
```

**3. Not wrapping server pages in PageContainer**
```tsx
// ❌ Wrong
return <ViewClient entity={entity} />

// ✅ Right
return (
  <PageContainer title={title} description={description}>
    <ViewClient entity={entity} />
  </PageContainer>
)
```

**4. Forgetting to pass formId to form**
```tsx
// ❌ Wrong: SaveButton won't connect to form
<Form entity={entity} />

// ✅ Right: Pass formId to connect SaveButton
<Form entity={entity} formId={formId} />
```

**5. Using client components for pages**
```tsx
// ❌ Wrong
'use client'
export default function Page() { }

// ✅ Right: Pages are server components
export default async function Page() { }
```

**6. Not handling 404 for missing entities**
```tsx
// ❌ Wrong: Will error if entity is null
const entity = await get[Entity]WithRelations(id)
return <ViewClient entity={entity} />

// ✅ Right: Handle not found
const entity = await get[Entity]WithRelations(id)
if (!entity) notFound()
return <ViewClient entity={entity} />
```

**7. Wrong redirect after create**
```tsx
// ❌ Wrong: Goes to view page
router.push(`/[entities]/${newEntity.id}`)

// ✅ Right: Goes to edit page
router.push(`/[entities]/${newEntity.id}/edit`)
```

---

## Related Documentation

- **[list-page.md](./list-page.md)** - List Page and List Client patterns
- **[create-edit.md](./create-edit.md)** - Create and Edit page patterns
- **[form-view.md](./form-view.md)** - Unified Form and View Client patterns
- **[FORMS.md](../FORMS.md)** - 🔴 CRITICAL - Complete form patterns and validation
- **[MODULE_CHECKLIST.md](../MODULE_CHECKLIST.md)** - Step-by-step module creation checklist
- **[TESTING_GUIDE.md](../TESTING_GUIDE.md)** - Testing patterns and debugging

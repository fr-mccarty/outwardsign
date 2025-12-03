# MODULE PATTERNS - Critical Rules Only

> **Auto-injected for module development tasks. For complete details, see [MODULE_COMPONENT_PATTERNS.md](./MODULE_COMPONENT_PATTERNS.md)**

## The 8 Required Files

Every module MUST have these 8 files (follow wedding module exactly):

1. **List Page (Server)** - `page.tsx`
2. **List Client** - `[entities]-list-client.tsx` (PLURAL name)
3. **Create Page (Server)** - `create/page.tsx`
4. **View Page (Server)** - `[id]/page.tsx`
5. **Edit Page (Server)** - `[id]/edit/page.tsx`
6. **Form Wrapper (Client)** - `[entity]-form-wrapper.tsx`
7. **Unified Form (Client)** - `[entity]-form.tsx`
8. **View Client** - `[entity]-view-client.tsx`

## Critical Patterns

### Next.js 15 searchParams (REQUIRED)
```tsx
interface PageProps {
  searchParams: Promise<{ search?: string }>
}

export default async function Page({ searchParams }: PageProps) {
  const params = await searchParams  // MUST await
}
```

### List Page Pattern (Server Component)
```tsx
export default async function Page({ searchParams }: PageProps) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const params = await searchParams
  const entities = await getEntitiesWithRelations(/* filters */)

  return <EntitiesListClient entities={entities} />
}
```

### Unified Form Pattern
```tsx
export function EntityForm({ entity }: { entity?: EntityWithRelations }) {
  const isEditing = !!entity  // Detects mode
  const router = useRouter()

  const onSubmit = async (data) => {
    const result = isEditing
      ? await updateEntity(entity.id, data)
      : await createEntity(data)

    if (result.success) {
      router.push(`/module/${result.data.id}`)  // Redirect to view
    }
  }
}
```

### WithRelations Pattern (REQUIRED)
Always create `EntityWithRelations` interface for fetched data:

```tsx
export interface WeddingWithRelations extends Wedding {
  event: Event | null
  person1: Person
  person2: Person
  liturgy_content?: LiturgyContent | null
}
```

## Reference
- Complete patterns: [MODULE_COMPONENT_PATTERNS.md](./MODULE_COMPONENT_PATTERNS.md)
- Module checklist: [MODULE_CHECKLIST.md](./MODULE_CHECKLIST.md)
- Wedding reference: `src/app/(main)/weddings/`

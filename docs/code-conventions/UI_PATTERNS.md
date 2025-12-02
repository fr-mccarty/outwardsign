# UI Patterns

This document covers UI component patterns including dialogs, empty states, tables, scrollable modals, and click hierarchy rules.

---

## Table of Contents

- [Dialog and Modal Standards](#dialog-and-modal-standards)
- [🔴 DialogButton Component (CRITICAL)](#-dialogbutton-component-critical)
- [Empty States](#empty-states)
- [Tables](#tables)
- [Scrollable Modals](#scrollable-modals)
- [🔴 Click Hierarchy (CRITICAL)](#-click-hierarchy-critical)
- [Component Usage Hierarchy](#component-usage-hierarchy)
- [Responsive Design](#responsive-design)

---

## Dialog and Modal Standards

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

### Why Shadcn Components

- Consistent styling with the rest of the application
- Better accessibility (keyboard navigation, screen reader support)
- More flexible (can customize appearance and behavior)
- Better UX (non-blocking, can be dismissed multiple ways)

---

## 🔴 DialogButton Component (CRITICAL)

When creating buttons that trigger dialogs, **ALWAYS use the `DialogButton` component** instead of manually wrapping Button with DialogTrigger. This component automatically handles cursor styling and ensures consistent behavior.

### Examples

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

### Why Use DialogButton

- Automatically applies `cursor-pointer` to prevent CSS specificity issues
- Handles Radix UI's `asChild` prop merging correctly
- Reduces boilerplate and ensures consistency
- Accepts all standard Button props (variant, size, className, onClick, etc.)

### Technical Background

**When `DialogTrigger` uses `asChild`**, Radix UI merges props with the child component through polymorphism. This can cause CSS specificity issues that override the browser's default button cursor, resulting in inconsistent hover states. The DialogButton component solves this automatically.

---

## Empty States

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

### Empty State Pattern

1. **Icon** - Use the same icon as in the main sidebar for consistency
2. **Heading** - Clear, descriptive heading (e.g., "No weddings yet")
3. **Description** - Brief explanation or call to action
4. **Action Button** - Link to create new record

### Why Empty States Matter

- Guides users on what to do next
- Reduces confusion when first using the application
- Provides clear path to add first record
- Maintains consistent UI patterns

---

## Tables

### Standards

- Content should always be fetched server-side
- Pagination should always be available
- Use shadcn components (Table, TableHeader, TableBody, etc.)

### Example

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

### Best Practices

- Always include pagination for lists with many items
- Show loading states during server-side data fetching
- Use consistent column widths and spacing
- Include sorting and filtering when appropriate
- Provide clear column headers

---

## Scrollable Modals

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

### Structure

- `DialogContent` with `flex flex-col` and `max-h-[90vh]`
- `DialogHeader` with `flex-shrink-0` (fixed header)
- Content wrapper with `overflow-y-auto flex-1` (scrollable)
- `DialogFooter` with `flex-shrink-0` (fixed footer)

**Reference implementation:** `src/components/calendar/day-events-modal.tsx`

### Why This Pattern

- Prevents modals from exceeding viewport height
- Keeps header and footer visible while scrolling content
- Provides clear visual boundaries
- Works on all screen sizes

---

## 🔴 Click Hierarchy (CRITICAL)

**NEVER nest clickable elements inside other clickable elements.**

This causes:
- User confusion (which element will be clicked?)
- Accessibility problems (screen readers can't determine intent)
- Unpredictable behavior (event bubbling issues)

### Examples of Violations

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

### Solution Patterns

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

**See [DESIGN_PRINCIPLES.md](../DESIGN_PRINCIPLES.md) Click Hierarchy section for more solution patterns.**

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

---

## Related Documentation

- [GENERAL.md](./GENERAL.md) - General code conventions
- [BILINGUAL.md](./BILINGUAL.md) - Bilingual implementation patterns
- [FORMATTING.md](./FORMATTING.md) - Helper utilities and formatting
- [DESIGN_PRINCIPLES.md](../DESIGN_PRINCIPLES.md) - UI/UX design principles
- [COMPONENT_REGISTRY.md](../COMPONENT_REGISTRY.md) - Complete component library reference

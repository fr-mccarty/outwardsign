# Edit Form Pattern

> **Purpose:** Complete, repeatable pattern for implementing edit functionality in modules. This is the navigation hub for all edit form documentation.

## Quick Navigation

**Start Here:**
- **[OVERVIEW](./edit-form-pattern/OVERVIEW.md)** - Understand the 3-layer architecture that powers all edit forms

**Implementation Guides:**
- **[EDIT_PAGE](./edit-form-pattern/EDIT_PAGE.md)** - Layer 1: Server component (auth, data fetching, breadcrumbs)
- **[FORM_WRAPPER](./edit-form-pattern/FORM_WRAPPER.md)** - Layer 2: Client wrapper (loading state, action buttons)
- **[UNIFIED_FORM](./edit-form-pattern/UNIFIED_FORM.md)** - Layer 3: Form component (state, submission, redirection)

**Patterns and Examples:**
- **[COMMON_PATTERNS](./edit-form-pattern/COMMON_PATTERNS.md)** - Reusable patterns, advanced techniques, module-specific examples

---

## What is the Edit Form Pattern?

The edit form pattern is a **consistent 3-layer architecture** used across all modules in Outward Sign to handle both create and edit modes in a unified way.

### The Three Layers

```
Layer 1: Edit Page (Server)
├─ Authenticates user
├─ Fetches entity with relations
├─ Builds dynamic page title
└─ Passes data to Layer 2

Layer 2: Form Wrapper (Client)
├─ Manages loading state
├─ Provides action buttons
├─ Wraps form in PageContainer
└─ Passes state to Layer 3

Layer 3: Unified Form (Client)
├─ Detects create vs edit mode
├─ Initializes form from entity
├─ Handles submission
└─ Redirects appropriately
```

### Key Benefits

- **Consistent** - Same pattern across all modules (weddings, funerals, baptisms, etc.)
- **Maintainable** - Each layer has a single, clear responsibility
- **Predictable** - Developers know exactly where to find specific logic
- **Unified** - Single form handles both create and edit modes
- **Type-Safe** - Clear interfaces between layers

---

## When to Use This Pattern

Use this pattern when:
- ✅ Creating a new module's create/edit functionality
- ✅ Adding edit capability to an existing module
- ✅ Refactoring legacy forms to follow current standards
- ✅ Building forms that need both create and edit modes

**Reference Implementation:** Wedding module (`src/app/(main)/weddings/`)

---

## File Structure

Every module following this pattern has these files:

```
app/(main)/[entities]/
├── [id]/
│   └── edit/
│       └── page.tsx                      # Layer 1: Edit Page (Server)
├── create/
│   └── page.tsx                          # Create page (uses Layer 2 directly)
├── [entity]-form-wrapper.tsx             # Layer 2: Form Wrapper (Client)
└── [entity]-form.tsx                     # Layer 3: Unified Form (Client)
```

---

## Quick Start Guide

### 1. Read the Overview

Start with **[OVERVIEW.md](./edit-form-pattern/OVERVIEW.md)** to understand:
- The 3-layer architecture
- Design principles
- Props flow between layers
- Mode detection pattern

### 2. Implement Each Layer

Follow the implementation guides in order:

1. **[EDIT_PAGE.md](./edit-form-pattern/EDIT_PAGE.md)** - Set up Layer 1
   - Authentication check
   - Fetch entity with `get[Entity]WithRelations()`
   - Build dynamic page title
   - Set breadcrumbs
   - Render form wrapper

2. **[FORM_WRAPPER.md](./edit-form-pattern/FORM_WRAPPER.md)** - Set up Layer 2
   - Create form ID constant
   - Manage loading state
   - Detect edit mode
   - Provide action buttons
   - Wrap in PageContainer

3. **[UNIFIED_FORM.md](./edit-form-pattern/UNIFIED_FORM.md)** - Set up Layer 3
   - Declare form state (simple fields, pickers)
   - Initialize from entity data (edit mode)
   - Handle submission (create or update)
   - Redirect appropriately
   - Organize fields in Card sections

### 3. Reference Common Patterns

Consult **[COMMON_PATTERNS.md](./edit-form-pattern/COMMON_PATTERNS.md)** for:
- Type casting for relations
- Object.fromEntries pattern for updates
- Conditional form fields
- Loading readings (weddings, funerals, baptisms)
- Suggested event names
- Module-specific examples

---

## Key Patterns at a Glance

### Mode Detection

```tsx
// Same pattern across all three layers
const isEditing = !!entity
```

### Redirection Pattern

```tsx
if (isEditing) {
  await updateEntity(entity.id, data)
  router.refresh()  // Stay on edit page
} else {
  const newEntity = await createEntity(data)
  router.push(`/entities/${newEntity.id}/edit`)  // Go to edit page
}
```

### Props Flow

```
Edit Page → Form Wrapper:
  entity, title, description, saveButtonLabel

Form Wrapper → Unified Form:
  entity, formId, onLoadingChange
```

### State Management

```tsx
// Simple fields
const [notes, setNotes] = useState(entity?.notes || "")

// Booleans
const [isActive, setIsActive] = useState(entity?.is_active || false)

// Pickers
const person = usePickerState<Person>()

// Initialize from entity
useEffect(() => {
  if (entity?.person) person.setValue(entity.person)
}, [entity])
```

---

## Implementation Checklist

### Quick Checklist (Expand Each Section for Details)

**Layer 1: Edit Page (Server)**
- [ ] File at `[id]/edit/page.tsx`
- [ ] Authentication check
- [ ] Fetch entity with relations
- [ ] Build dynamic title
- [ ] Set breadcrumbs
- [ ] Render form wrapper

**Layer 2: Form Wrapper (Client)**
- [ ] File at `[entity]-form-wrapper.tsx`
- [ ] 'use client' directive
- [ ] Form ID constant
- [ ] Loading state management
- [ ] Edit mode detection
- [ ] Action buttons (View + Save)
- [ ] PageContainer wrapper

**Layer 3: Unified Form (Client)**
- [ ] File at `[entity]-form.tsx`
- [ ] 'use client' directive
- [ ] Mode detection (isEditing)
- [ ] Form state declarations
- [ ] Initialize from entity (useEffect)
- [ ] Submit handler (create/update)
- [ ] Proper redirection
- [ ] Card sections for organization
- [ ] FormBottomActions

**For complete checklists with detailed steps, see each layer's documentation.**

---

## Common Tasks

### "I need to add a new field to an existing form"

1. Add field to database schema (migration)
2. Update `Create[Entity]Data` type in actions file
3. In **Layer 3 (Unified Form)**:
   - Declare state: `const [newField, setNewField] = useState(entity?.new_field || "")`
   - Add to JSX: `<FormField label="New Field" value={newField} onChange={setNewField} />`
   - Include in submission: `new_field: newField || undefined`

### "I need to create a new module's edit functionality"

Follow the implementation guides in order:
1. [EDIT_PAGE.md](./edit-form-pattern/EDIT_PAGE.md)
2. [FORM_WRAPPER.md](./edit-form-pattern/FORM_WRAPPER.md)
3. [UNIFIED_FORM.md](./edit-form-pattern/UNIFIED_FORM.md)

Reference the wedding module as the canonical example.

### "I need to add a person/event picker to a form"

See [UNIFIED_FORM.md - State Management Patterns](./edit-form-pattern/UNIFIED_FORM.md#state-management-patterns) for picker implementation.

### "I need to customize the page title based on entity data"

See [EDIT_PAGE.md - Dynamic Title Patterns](./edit-form-pattern/EDIT_PAGE.md#dynamic-title-patterns) for module-specific examples.

### "I need to load scripture readings for my form"

See [COMMON_PATTERNS.md - Loading Readings](./edit-form-pattern/COMMON_PATTERNS.md#loading-readings) for the pattern.

---

## Related Documentation

**Core Documentation:**
- **[FORMS.md](./FORMS.md)** - Form input styling, FormField usage, validation rules
- **[MODULE_COMPONENT_PATTERNS.md](./MODULE_COMPONENT_PATTERNS.md)** - Complete module structure (8 files)
- **[COMPONENT_REGISTRY.md](./COMPONENT_REGISTRY.md)** - Picker components and shared components
- **[PICKERS.md](./PICKERS.md)** - Picker modal patterns and behavior

**Related Patterns:**
- **[VALIDATION.md](./VALIDATION.md)** - Zod validation with React Hook Form
- **[ARCHITECTURE.md](./ARCHITECTURE.md)** - Data flow, authentication, role permissions
- **[CODE_CONVENTIONS.md](./CODE_CONVENTIONS.md)** - Coding standards and UI patterns

---

## Need Help?

**For questions about:**
- Overall architecture → [OVERVIEW.md](./edit-form-pattern/OVERVIEW.md)
- Server page setup → [EDIT_PAGE.md](./edit-form-pattern/EDIT_PAGE.md)
- Client wrapper → [FORM_WRAPPER.md](./edit-form-pattern/FORM_WRAPPER.md)
- Form implementation → [UNIFIED_FORM.md](./edit-form-pattern/UNIFIED_FORM.md)
- Specific patterns → [COMMON_PATTERNS.md](./edit-form-pattern/COMMON_PATTERNS.md)

**Reference Implementation:**
- Wedding module: `src/app/(main)/weddings/`
- Contains all three layers with full functionality
